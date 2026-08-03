"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { categories, orderItems, orders, products, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { saveSettings, type SiteSettings } from "@/lib/settings";
import { parsePriceToCents, slugify } from "@/lib/utils";

export type AdminState = { error?: string; success?: string };

function revalidateShop() {
  revalidatePath("/", "layout");
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
}

async function uniqueSlug(base: string, ignoreId?: number): Promise<string> {
  const root = slugify(base) || `preke-${Date.now()}`;
  let candidate = root;
  let counter = 2;
  for (;;) {
    const rows = await db
      .select({ id: products.id })
      .from(products)
      .where(
        ignoreId
          ? and(eq(products.slug, candidate), ne(products.id, ignoreId))
          : eq(products.slug, candidate),
      )
      .limit(1);
    if (rows.length === 0) return candidate;
    candidate = `${root}-${counter++}`;
  }
}

function readProductForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const categoryRaw = String(formData.get("categoryId") ?? "");
  const categoryId = categoryRaw && categoryRaw !== "none" ? Number(categoryRaw) : null;
  return {
    name,
    shortDescription: String(formData.get("shortDescription") ?? "").trim().slice(0, 180),
    description: String(formData.get("description") ?? "").trim(),
    priceCents: parsePriceToCents(String(formData.get("price") ?? "0")),
    discountPercent: Math.min(Math.max(Number(formData.get("discountPercent") ?? 0) || 0, 0), 95),
    stock: Math.max(Math.floor(Number(formData.get("stock") ?? 0) || 0), 0),
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
    emoji: String(formData.get("emoji") ?? "").trim().slice(0, 4) || "📦",
    categoryId: categoryId && Number.isFinite(categoryId) ? categoryId : null,
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
  };
}

export async function createProductAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const data = readProductForm(formData);
  if (data.name.length < 2) return { error: "Prekės pavadinimas per trumpas." };
  if (data.priceCents <= 0) return { error: "Nurodykite kainą, didesnę už 0." };

  const slug = await uniqueSlug(data.name);
  await db.insert(products).values({ ...data, slug });
  revalidateShop();
  redirect("/admin/products?created=1");
}

export async function updateProductAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return { error: "Neteisingas prekės ID." };
  const data = readProductForm(formData);
  if (data.name.length < 2) return { error: "Prekės pavadinimas per trumpas." };
  if (data.priceCents <= 0) return { error: "Nurodykite kainą, didesnę už 0." };

  const slug = await uniqueSlug(data.name, id);
  await db
    .update(products)
    .set({ ...data, slug, updatedAt: new Date() })
    .where(eq(products.id, id));
  revalidateShop();
  revalidatePath(`/products/${slug}`);
  return { success: "Prekė atnaujinta!" };
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await db.delete(products).where(eq(products.id, id));
  revalidateShop();
}

export async function quickUpdateProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  const patch: Record<string, unknown> = { updatedAt: new Date() };

  const stockRaw = formData.get("stock");
  if (typeof stockRaw === "string" && stockRaw !== "") {
    patch.stock = Math.max(Math.floor(Number(stockRaw) || 0), 0);
  }
  const discountRaw = formData.get("discountPercent");
  if (typeof discountRaw === "string" && discountRaw !== "") {
    patch.discountPercent = Math.min(Math.max(Number(discountRaw) || 0, 0), 95);
  }
  const toggleActive = formData.get("toggleActive");
  if (typeof toggleActive === "string") {
    patch.active = toggleActive === "true";
  }
  const toggleFeatured = formData.get("toggleFeatured");
  if (typeof toggleFeatured === "string") {
    patch.featured = toggleFeatured === "true";
  }

  await db.update(products).set(patch).where(eq(products.id, id));
  revalidateShop();
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim().slice(0, 4) || "📦";
  if (name.length < 2) return;
  const slug = slugify(name) || `kategorija-${Date.now()}`;
  await db.insert(categories).values({ name, slug, emoji }).onConflictDoNothing();
  revalidateShop();
  revalidatePath("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await db.delete(categories).where(eq(categories.id, id));
  revalidateShop();
  revalidatePath("/admin/categories");
}

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("orderId"));
  const status = String(formData.get("status") ?? "");
  const allowed = ["pending", "contacted", "paid", "completed", "cancelled"];
  if (!Number.isFinite(id) || !allowed.includes(status)) return;

  const current = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  const order = current[0];
  if (!order) return;

  if (status === "cancelled" && order.status !== "cancelled") {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    for (const item of items) {
      if (item.productId) {
        await db
          .update(products)
          .set({ stock: sql`${products.stock} + ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }
    }
  }

  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/profile");
}

export async function deleteOrderAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("orderId"));
  if (!Number.isFinite(id)) return;
  await db.delete(orders).where(eq(orders.id, id));
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = Number(formData.get("userId"));
  const role = String(formData.get("role") ?? "");
  if (!Number.isFinite(id) || !["user", "admin"].includes(role)) return;
  if (id === admin.id) return;
  await db.update(users).set({ role }).where(eq(users.id, id));
  revalidatePath("/admin/users");
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = Number(formData.get("userId"));
  if (!Number.isFinite(id) || id === admin.id) return;
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin/users");
}

export async function saveSettingsAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const values: Partial<SiteSettings> = {
    siteName: String(formData.get("siteName") ?? "").trim(),
    discord: String(formData.get("discord") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    heroTitle: String(formData.get("heroTitle") ?? "").trim(),
    heroSubtitle: String(formData.get("heroSubtitle") ?? "").trim(),
    announcement: String(formData.get("announcement") ?? "").trim(),
    supportHours: String(formData.get("supportHours") ?? "").trim(),
  };
  if (!values.siteName || !values.discord) {
    return { error: "Svetainės pavadinimas ir Discord kontaktas yra privalomi." };
  }
  await saveSettings(values);
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { success: "Nustatymai išsaugoti!" };
}
