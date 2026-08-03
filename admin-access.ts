"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users } from "@/db/schema";
import {
  getCurrentUser,
  grantAdminUnlock,
  isValidPanelCode,
  revokeAdminUnlock,
} from "@/lib/auth";

export type PanelState = { error?: string };

export async function unlockPanelAction(
  _prev: PanelState,
  formData: FormData,
): Promise<PanelState> {
  const code = String(formData.get("code") ?? "");
  if (!code.trim()) return { error: "Įveskite panelės kodą." };
  if (!isValidPanelCode(code)) return { error: "Neteisingas panelės prisijungimo kodas." };

  await grantAdminUnlock();

  // Jei vartotojas prisijungęs — jam suteikiamos nuolatinės admin teisės.
  const user = await getCurrentUser();
  if (user && user.role !== "admin") {
    await db.update(users).set({ role: "admin" }).where(eq(users.id, user.id));
  }

  revalidatePath("/", "layout");

  const nextRaw = String(formData.get("next") ?? "");
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/admin";
  redirect(next);
}

export async function lockPanelAction(): Promise<void> {
  await revokeAdminUnlock();
  revalidatePath("/", "layout");
  redirect("/");
}
