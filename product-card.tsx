import Link from "next/link";

import { AddToCartButton } from "@/components/add-to-cart";
import { ProductImage } from "@/components/product-image";
import type { Product } from "@/db/schema";
import { finalPriceCents, formatPrice, stockLabel } from "@/lib/utils";

export function ProductCard({
  product,
  categoryName,
  discord,
}: {
  product: Product;
  categoryName?: string | null;
  discord: string;
}) {
  const price = finalPriceCents(product.priceCents, product.discountPercent);
  const stock = stockLabel(product.stock);

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-xl shadow-black/20 transition hover:border-indigo-400/40 hover:bg-white/[0.06]">
      <Link href={`/products/${product.slug}`} className="relative block">
        <ProductImage
          imageUrl={product.imageUrl}
          emoji={product.emoji}
          name={product.name}
          className="h-44 w-full"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.discountPercent > 0 ? (
            <span className="rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white shadow">
              -{product.discountPercent}%
            </span>
          ) : null}
          {product.featured ? (
            <span className="rounded-full bg-amber-400/90 px-2.5 py-1 text-xs font-bold text-slate-900 shadow">
              ⭐ TOP
            </span>
          ) : null}
        </div>
        <span
          className={`absolute bottom-3 right-3 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${stock.className}`}
        >
          {stock.label}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          {categoryName ? (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
              {categoryName}
            </span>
          ) : null}
          <h3 className="mt-0.5 text-base font-bold text-white">
            <Link href={`/products/${product.slug}`} className="hover:text-indigo-300">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-400">
            {product.shortDescription || product.description}
          </p>
        </div>

        <div className="mt-auto flex items-end gap-2">
          <span className="text-2xl font-extrabold text-white">{formatPrice(price)}</span>
          {product.discountPercent > 0 ? (
            <span className="mb-1 text-sm text-slate-500 line-through">
              {formatPrice(product.priceCents)}
            </span>
          ) : null}
        </div>

        <p className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-[12px] leading-relaxed text-indigo-200">
          💬 Norint įsigyti šią prekę, susisiek per Discord: <strong>{discord}</strong>
        </p>

        <AddToCartButton
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
    </article>
  );
}
