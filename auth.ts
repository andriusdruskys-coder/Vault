"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users } from "@/db/schema";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

export type AuthState = { error?: string; success?: string };

function safeNext(next: FormDataEntryValue | null): string {
  const value = typeof next === "string" ? next : "";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "";
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const username = String(formData.get("username") ?? "").trim();
  const discordTag = String(formData.get("discordTag") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email.includes("@") || email.length < 5) return { error: "Įveskite teisingą el. pašto adresą." };
  if (username.length < 3) return { error: "Vartotojo vardas turi būti bent 3 simbolių." };
  if (password.length < 6) return { error: "Slaptažodis turi būti bent 6 simbolių." };
  if (password !== confirm) return { error: "Slaptažodžiai nesutampa." };

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) return { error: "Toks el. paštas jau užregistruotas." };

  const totalUsers = await db.select({ id: users.id }).from(users).limit(1);
  const role = totalUsers.length === 0 ? "admin" : "user";

  const inserted = await db
    .insert(users)
    .values({
      email,
      username,
      discordTag: discordTag || null,
      passwordHash: hashPassword(password),
      role,
    })
    .returning({ id: users.id });

  await createSession(inserted[0].id);
  revalidatePath("/", "layout");
  redirect(next || "/profile");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) return { error: "Užpildykite visus laukus." };

  const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = found[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Neteisingas el. paštas arba slaptažodis." };
  }

  await createSession(user.id);
  revalidatePath("/", "layout");
  redirect(next || (user.role === "admin" ? "/admin" : "/profile"));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfileAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Turite būti prisijungę." };

  const username = String(formData.get("username") ?? "").trim();
  const discordTag = String(formData.get("discordTag") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");

  if (username.length < 3) return { error: "Vartotojo vardas turi būti bent 3 simbolių." };

  const patch: { username: string; discordTag: string | null; passwordHash?: string } = {
    username,
    discordTag: discordTag || null,
  };

  if (newPassword) {
    if (newPassword.length < 6) return { error: "Naujas slaptažodis turi būti bent 6 simbolių." };
    patch.passwordHash = hashPassword(newPassword);
  }

  await db.update(users).set(patch).where(eq(users.id, user.id));
  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { success: "Profilis atnaujintas!" };
}
