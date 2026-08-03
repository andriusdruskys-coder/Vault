import "server-only";

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";

import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";

export const SESSION_COOKIE = "snowshop_session";
const SESSION_DAYS = 30;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = (stored ?? "").split(":");
  if (!salt || !key) return false;
  const derived = scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");
  if (keyBuffer.length !== derived.length) return false;
  return timingSafeEqual(derived, keyBuffer);
}

export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ token, userId, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export type SafeUser = Omit<User, "passwordHash">;

export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      discordTag: users.discordTag,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return rows[0] ?? null;
});

export async function requireUser(redirectTo = "/login"): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  return user;
}

/* ------------------------------------------------------------------ */
/*  Administratoriaus panelės kodas                                    */
/* ------------------------------------------------------------------ */

export const ADMIN_PANEL_CODE = process.env.ADMIN_PANEL_CODE ?? "stonegrillo";
export const ADMIN_UNLOCK_COOKIE = "snowshop_panel";

function adminUnlockToken(): string {
  return createHmac("sha256", process.env.ADMIN_SECRET ?? "snowshop-panel-secret-2026")
    .update(ADMIN_PANEL_CODE)
    .digest("hex");
}

export function isValidPanelCode(code: string): boolean {
  return code.trim().toLowerCase() === ADMIN_PANEL_CODE.toLowerCase();
}

export async function grantAdminUnlock(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_UNLOCK_COOKIE, adminUnlockToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
}

export async function revokeAdminUnlock(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_UNLOCK_COOKIE);
}

export async function hasAdminUnlock(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_UNLOCK_COOKIE)?.value;
  return Boolean(value && value === adminUnlockToken());
}

export type AdminSession = {
  id: number | null;
  username: string;
  email: string | null;
  viaCode: boolean;
};

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const user = await getCurrentUser();
  if (user?.role === "admin") {
    return { id: user.id, username: user.username, email: user.email, viaCode: false };
  }
  if (await hasAdminUnlock()) {
    return {
      id: user?.id ?? null,
      username: user?.username ?? "Savininkas",
      email: user?.email ?? null,
      viaCode: true,
    };
  }
  return null;
});

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin-login?next=/admin");
  return session;
}
