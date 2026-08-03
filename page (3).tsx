import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";

import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { finalPriceCents, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();

  const [allCategories, found] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.name)),
    db.select().from(products).where(eq(products.id, productId)).limit(1),
  ]);

  const product = found[0];
  if (!product) notFound();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <h2 className="text-2xl font-black text-white">
            {product.emoji} {product.name}
          </h2>
          <p className="text-sm text-slate-400">
            Dabartinė kaina:{" "}
            <strong className="text-white">
              {formatPrice(finalPriceCents(product.priceCents, product.discountPercent))}
            </strong>{" "}
            · Likutis: <strong className="text-white">{product.stock} vnt.</strong>
          </p>
        </div>
        <Link
          href={`/products/${product.slug}`}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          Peržiūrėti parduotuvėje →
        </Link>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <ProductForm mode="edit" product={product} categories={allCategories} />
      </div>
    </div>
  );
}
