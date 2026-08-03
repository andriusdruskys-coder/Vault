import { asc, eq, sql } from "drizzle-orm";

import { createCategoryAction, deleteCategoryAction } from "@/app/actions/admin";
import { db } from "@/db";
import { categories, products } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      emoji: categories.emoji,
      productCount: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black text-white">Kategorijos</h2>
          <p className="text-sm text-slate-400">
            Kategorijos padeda pirkėjams greičiau surasti prekes.
          </p>
        </div>

        <div className="space-y-3">
          {rows.map((category) => (
            <div
              key={category.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
            >
              <div>
                <p className="font-bold text-white">
                  {category.emoji} {category.name}
                </p>
                <p className="text-xs text-slate-400">
                  /{category.slug} · {category.productCount} prekės
                </p>
              </div>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={category.id} />
                <button
                  type="submit"
                  className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/20"
                >
                  🗑️ Ištrinti
                </button>
              </form>
            </div>
          ))}
          {rows.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-slate-400">
              Kategorijų dar nėra.
            </div>
          ) : null}
        </div>
      </div>

      <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-lg font-bold text-white">Nauja kategorija</h3>
        <form action={createCategoryAction} className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Pavadinimas
            <input
              name="name"
              required
              minLength={2}
              placeholder="pvz. Žaidimų paskyros"
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium text-slate-300">
            Emoji
            <input
              name="emoji"
              defaultValue="🎮"
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white"
          >
            Pridėti kategoriją
          </button>
        </form>
      </aside>
    </div>
  );
}
