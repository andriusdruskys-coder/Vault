import Link from "next/link";
import { and, asc, desc, eq, gt, ilike, or, type SQL } from "drizzle-orm";

import { ProductCard } from "@/components/product-card";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; category?: string; sort?: string; stock?: string }>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const settings = await getSettings();
  const q = (params.q ?? "").trim();
  const categorySlug = params.category ?? "";
  const sort = params.sort ?? "new";
  const onlyInStock = params.stock === "in";

  const allCategories = await db.select().from(categories).orderBy(asc(categories.name));
  const activeCategory = allCategories.find((category) => category.slug === categorySlug) ?? null;

  const filters: SQL[] = [eq(products.active, true)];
  if (q) {
    const like = `%${q}%`;
    const search = or(ilike(products.name, like), ilike(products.shortDescription, like), ilike(products.description, like));
    if (search) filters.push(search);
  }
  if (activeCategory) filters.push(eq(products.categoryId, activeCategory.id));
  if (onlyInStock) filters.push(gt(products.stock, 0));

  const orderBy =
    sort === "price-asc"
      ? asc(products.priceCents)
      : sort === "price-desc"
        ? desc(products.priceCents)
        : sort === "discount"
          ? desc(products.discountPercent)
          : desc(products.createdAt);

  const rows = await db
    .select({ product: products, categoryName: categories.name })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(and(...filters))
    .orderBy(orderBy);

  const chipHref = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const base = { q, category: categorySlug, sort, stock: onlyInStock ? "in" : "", ...patch };
    Object.entries(base).forEach(([key, value]) => {
      if (value) next.set(key, value);
    });
    const query = next.toString();
    return query ? `/products?${query}` : "/products";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600/20 via-slate-900 to-sky-600/10 p-6 sm:p-8">
        <h1 className="text-3xl font-black text-white sm:text-4xl">Prekių katalogas</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Rask tinkamą prekę, įsidėk į krepšelį ir pateik užsakymą. Pirkimą užbaigsime per Discord:{" "}
          <strong className="text-white">{settings.discord}</strong>.
        </p>

        <form action="/products" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Ieškoti prekės..."
            className="flex-1 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
          {categorySlug ? <input type="hidden" name="category" value={categorySlug} /> : null}
          <select
            name="sort"
            defaultValue={sort}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
          >
            <option value="new">Naujausios</option>
            <option value="price-asc">Kaina: nuo mažiausios</option>
            <option value="price-desc">Kaina: nuo didžiausios</option>
            <option value="discount">Didžiausia nuolaida</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white"
          >
            Ieškoti
          </button>
        </form>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link
          href={chipHref({ category: undefined })}
          className={cn(
            "rounded-xl border px-3.5 py-2 text-sm font-medium transition",
            !categorySlug
              ? "border-indigo-400/50 bg-indigo-500/20 text-white"
              : "border-white/10 bg-white/5 text-slate-300 hover:text-white",
          )}
        >
          Visos
        </Link>
        {allCategories.map((category) => (
          <Link
            key={category.id}
            href={chipHref({ category: category.slug })}
            className={cn(
              "rounded-xl border px-3.5 py-2 text-sm font-medium transition",
              categorySlug === category.slug
                ? "border-indigo-400/50 bg-indigo-500/20 text-white"
                : "border-white/10 bg-white/5 text-slate-300 hover:text-white",
            )}
          >
            {category.emoji} {category.name}
          </Link>
        ))}
        <Link
          href={chipHref({ stock: onlyInStock ? undefined : "in" })}
          className={cn(
            "rounded-xl border px-3.5 py-2 text-sm font-medium transition",
            onlyInStock
              ? "border-emerald-400/50 bg-emerald-500/20 text-white"
              : "border-white/10 bg-white/5 text-slate-300 hover:text-white",
          )}
        >
          ✅ Tik turimos sandėlyje
        </Link>
      </div>

      <p className="mt-4 text-sm text-slate-400">Rasta prekių: {rows.length}</p>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-white/15 p-12 text-center text-slate-400">
          Pagal pasirinktus filtrus prekių nerasta.
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((row) => (
            <ProductCard
              key={row.product.id}
              product={row.product}
              categoryName={row.categoryName}
              discord={settings.discord}
            />
          ))}
        </div>
      )}
    </div>
  );
}
