import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, ne } from "drizzle-orm";

import { AddToCartButton } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { finalPriceCents, formatPrice, stockLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const settings = await getSettings();

  const rows = await db
    .select({ product: products, categoryName: categories.name, categorySlug: categories.slug })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.slug, slug))
    .limit(1);

  const row = rows[0];
  if (!row || !row.product.active) notFound();

  const product = row.product;
  const price = finalPriceCents(product.priceCents, product.discountPercent);
  const stock = stockLabel(product.stock);
  const saving = product.priceCents - price;

  const related = await db
    .select({ product: products, categoryName: categories.name })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(and(eq(products.active, true), ne(products.id, product.id)))
    .orderBy(desc(products.featured), desc(products.createdAt))
    .limit(3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-slate-400">
        <Link href="/" className="hover:text-white">Pradžia</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-white">Prekės</Link>
        {row.categoryName ? (
          <>
            <span className="mx-2">/</span>
            <Link href={`/products?category=${row.categorySlug}`} className="hover:text-white">
              {row.categoryName}
            </Link>
          </>
        ) : null}
        <span className="mx-2">/</span>
        <span className="text-slate-200">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <ProductImage
            imageUrl={product.imageUrl}
            emoji={product.emoji}
            name={product.name}
            className="h-72 w-full sm:h-96"
            emojiClassName="text-8xl"
          />
          <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 text-center text-xs">
            <div className="px-3 py-4">
              <p className="text-slate-400">Būsena</p>
              <p className="mt-1 font-semibold text-white">
                {product.stock > 0 ? "Yra sandėlyje" : "Laikinai nėra"}
              </p>
            </div>
            <div className="px-3 py-4">
              <p className="text-slate-400">Likutis</p>
              <p className="mt-1 font-semibold text-white">{product.stock} vnt.</p>
            </div>
            <div className="px-3 py-4">
              <p className="text-slate-400">Pristatymas</p>
              <p className="mt-1 font-semibold text-white">Per Discord</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {row.categoryName ? (
              <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-200">
                {row.categoryName}
              </span>
            ) : null}
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${stock.className}`}>
              {stock.label}
            </span>
            {product.discountPercent > 0 ? (
              <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white">
                -{product.discountPercent}% NUOLAIDA
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-base leading-relaxed text-slate-300">
            {product.shortDescription}
          </p>

          <div className="mt-6 flex items-end gap-3">
            <span className="text-4xl font-black text-white">{formatPrice(price)}</span>
            {product.discountPercent > 0 ? (
              <>
                <span className="mb-1.5 text-lg text-slate-500 line-through">
                  {formatPrice(product.priceCents)}
                </span>
                <span className="mb-2 rounded-lg bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-300">
                  Sutaupai {formatPrice(saving)}
                </span>
              </>
            ) : null}
          </div>

          <div className="mt-6 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-4">
            <p className="text-sm font-semibold text-white">
              💬 Norint įsigyti šią prekę, būtina susisiekti per Discord: {settings.discord}
            </p>
            <p className="mt-1 text-xs text-indigo-200/90">
              Pateik užsakymą svetainėje ir parašyk savininkui — jis patvirtins mokėjimą bei
              pristatys prekę. Darbo laikas: {settings.supportHours}
            </p>
          </div>

          <div className="mt-6">
            <AddToCartButton
              withQuantity
              label="Pridėti į krepšelį"
              item={{
                productId: product.id,
                name: product.name,
                slug: product.slug,
                priceCents: price,
                emoji: product.emoji,
                imageUrl: product.imageUrl,
                maxStock: product.stock,
              }}
            />
          </div>

          <Link
            href="/cart"
            className="mt-3 block rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Eiti į krepšelį →
          </Link>

          {product.description ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-bold text-white">Aprašymas</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                {product.description}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-white">Kitos prekės</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard
                key={item.product.id}
                product={item.product}
                categoryName={item.categoryName}
                discord={settings.discord}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
