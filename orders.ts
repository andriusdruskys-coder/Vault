"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { orderItems, orders, products, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { finalPriceCents } from "@/lib/utils";

export type CheckoutInput = {
  items: Array<{ productId: number; quantity: number }>;
  discordTag: string;
  note: string;
};

export type CheckoutResult = { ok: true; orderId: number } | { ok: false; error: string };

export async function createOrderAction(input: CheckoutInput): Promise<CheckoutResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Prieš pateikiant užsakymą reikia prisijungti." };

  const cleanItems = (input.items ?? [])
    .map((item) => ({
      productId: Number(item.productId),
      quantity: Math.max(1, Math.min(50, Math.floor(Number(item.quantity) || 1))),
    }))
    .filter((item) => Number.isFinite(item.productId) && item.productId > 0);

  if (cleanItems.length === 0) return { ok: false, error: "Krepšelis tuščias." };

  const ids = cleanItems.map((item) => item.productId);
  const found = await db.select().from(products).where(inArray(products.id, ids));
  if (found.length === 0) return { ok: false, error: "Prekės nerastos." };

  const discordTag = (input.discordTag ?? "").trim();
  if (discordTag.length < 2) return { ok: false, error: "Nurodykite savo Discord vardą." };

  let total = 0;
  const rows: Array<{
    productId: number;
    productName: string;
    unitPriceCents: number;
    quantity: number;
  }> = [];

  for (const item of cleanItems) {
    const product = found.find((p) => p.id === item.productId);
    if (!product || !product.active) {
      return { ok: false, error: `Prekė nebepasiekiama (ID ${item.productId}).` };
    }
    if (product.stock < item.quantity) {
      return {
        ok: false,
        error: `Nepakanka atsargų: „${product.name}" (liko ${product.stock} vnt.).`,
      };
    }
    const unit = finalPriceCents(product.priceCents, product.discountPercent);
    total += unit * item.quantity;
    rows.push({
      productId: product.id,
      productName: product.name,
      unitPriceCents: unit,
      quantity: item.quantity,
    });
  }

  const inserted = await db
    .insert(orders)
    .values({
      userId: user.id,
      status: "pending",
      totalCents: total,
      discordTag,
      note: (input.note ?? "").slice(0, 500),
    })
    .returning({ id: orders.id });

  const orderId = inserted[0].id;
  await db.insert(orderItems).values(rows.map((row) => ({ ...row, orderId })));

  for (const row of rows) {
    await db
      .update(products)
      .set({ stock: sql`GREATEST(${products.stock} - ${row.quantity}, 0)`, updatedAt: new Date() })
      .where(eq(products.id, row.productId));
  }

  if (!user.discordTag) {
    await db.update(users).set({ discordTag }).where(eq(users.id, user.id));
  }

  revalidatePath("/profile");
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  return { ok: true, orderId };
}

export async function cancelOwnOrderAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const orderId = Number(formData.get("orderId"));
  if (!Number.isFinite(orderId)) return;

  const found = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  const order = found[0];
  if (!order || order.userId !== user.id || order.status === "cancelled") return;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const item of items) {
    if (item.productId) {
      await db
        .update(products)
        .set({ stock: sql`${products.stock} + ${item.quantity}` })
        .where(eq(products.id, item.productId));
    }
  }

  await db
    .update(orders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath("/profile");
  revalidatePath("/admin/orders");
}
