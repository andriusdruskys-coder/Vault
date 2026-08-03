import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";

import { deleteProductAction, quickUpdateProductAction } from "@/app/actions/admin";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { finalPriceCents, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter ?? "all";

  const rows = await db
    .select({ product: products, categoryName: categories.name })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .orderBy(asc(products.stock), desc(products.createdAt));

  const filtered = rows.filter(({ product }) => {
    if (filter === "out") return product.stock === 0;
    if (filter === "low") return product.stock > 0 && product.stock <= 3;
    if (filter === "sale") return product.discountPercent > 0;
    if (filter === "hidden") return !product.active;
    return true;
  });

  const filters = [
    { key: "all", label: `Visos (${rows.length})` },
    { key: "out", label: `Nėra sandėlyje (${rows.filter((r) => r.product.stock === 0).length})` },
    { key: "low", label: `Baigiasi (${rows.filter((r) => r.product.stock > 0 && r.product.stock <= 3).length})` },
    { key: "sale", label: `Su nuolaida (${rows.filter((r) => r.product.discountPercent > 0).length})` },
    { key: "hidden", label: `Paslėptos (${rows.filter((r) => !r.product.active).length})` },
  ];

  return (
    <div className="space-y-5">
      {params.created ? (
        <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Prekė sėkmingai sukurta!
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">Prekių valdymas</h2>
          <p className="text-sm text-slate-400">
            Redaguok informaciją, keisk kainas, nuolaidas ir likučius sandėlyje.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25"
        >
          ➕ Pridėti prekę
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Link
            key={item.key}
            href={`/admin/products?filter=${item.key}`}
            className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
              filter === item.key
                ? "border-indigo-400/50 bg-indigo-500/20 text-white"
                : "border-white/10 bg-white/5 text-slate-300 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(({ product, categoryName }) => (
          <div
            key={product.id}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-slate-800 to-indigo-950 text-2xl">
                  {product.emoji}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-bold text-white">{product.name}</h3>
                    {!product.active ? (
                      <span className="rounded-full border border-slate-500/40 bg-slate-500/10 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                        Paslėpta
                      </span>
                    ) : null}
                    {product.featured ? (
                      <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                        TOP
                      </span>
                    ) : null}
                    {product.stock === 0 ? (
                      <span className="rounded-full border border-rose-400/40 bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-300">
                        Nėra sandėlyje
                      </span>
                    ) : product.stock <= 3 ? (
                      <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                        Liko {product.stock}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {categoryName ? `${categoryName} · ` : ""}/{product.slug}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-bold text-white">
                      {formatPrice(finalPriceCents(product.priceCents, product.discountPercent))}
                    </span>
                    {product.discountPercent > 0 ? (
                      <span className="ml-2 text-xs text-slate-500 line-through">
                        {formatPrice(product.priceCents)}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10"
                >
                  ✏️ Redaguoti
                </Link>
                <form action={quickUpdateProductAction}>
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="toggleActive" value={product.active ? "false" : "true"} />
                  <button
                    type="submit"
                    className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10"
                  >
                    {product.active ? "🙈 Slėpti" : "👁️ Rodyti"}
                  </button>
                </form>
                <form action={quickUpdateProductAction}>
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="toggleFeatured" value={product.featured ? "false" : "true"} />
                  <button
                    type="submit"
                    className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10"
                  >
                    {product.featured ? "☆ Nuimti TOP" : "⭐ TOP"}
                  </button>
                </form>
                <form action={deleteProductAction}>
                  <input type="hidden" name="id" value={product.id} />
                  <button
                    type="submit"
                    className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/20"
                  >
                    🗑️ Ištrinti
                  </button>
                </form>
              </div>
            </div>

            <form
              action={quickUpdateProductAction}
              className="mt-4 flex flex-wrap items-end gap-3 border-t border-white/10 pt-4"
            >
              <input type="hidden" name="id" value={product.id} />
              <label className="text-xs font-medium text-slate-400">
                Likutis sandėlyje
                <input
                  name="stock"
                  type="number"
                  min={0}
                  defaultValue={product.stock}
                  className="mt-1 w-28 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                />
              </label>
              <label className="text-xs font-medium text-slate-400">
                Nuolaida (%)
                <input
                  name="discountPercent"
                  type="number"
                  min={0}
                  max={95}
                  defaultValue={product.discountPercent}
                  className="mt-1 w-28 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                />
              </label>
              <button
                type="submit"
                className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
              >
                💾 Išsaugoti greitus pakeitimus
              </button>
            </form>
          </div>
        ))}

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center text-slate-400">
            Prekių pagal šį filtrą nėra.
          </div>
        ) : null}
      </div>
    </div>
  );
}
