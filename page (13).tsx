import Link from "next/link";
import { desc, eq, gt, sql } from "drizzle-orm";

import { LiveClock } from "@/components/live-clock";
import { ProductCard } from "@/components/product-card";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();

  const [featured, allCategories, stats] = await Promise.all([
    db
      .select({ product: products, categoryName: categories.name })
      .from(products)
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .where(eq(products.active, true))
      .orderBy(desc(products.featured), desc(products.createdAt))
      .limit(6),
    db.select().from(categories).limit(12),
    db
      .select({
        total: sql<number>`count(*)::int`,
        inStock: sql<number>`count(*) filter (where ${products.stock} > 0)::int`,
        discounted: sql<number>`count(*) filter (where ${products.discountPercent} > 0)::int`,
      })
      .from(products)
      .where(eq(products.active, true)),
  ]);

  const counts = stats[0] ?? { total: 0, inStock: 0, discounted: 0 };
  const deals = await db
    .select()
    .from(products)
    .where(gt(products.discountPercent, 0))
    .orderBy(desc(products.discountPercent))
    .limit(3);

  return (
    <div>
      {/* HERO */}
      <section className="glow-grid relative overflow-hidden border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Prekės pristatomos rankiniu būdu per Discord
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {settings.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {settings.heroSubtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition hover:opacity-90"
              >
                Peržiūrėti prekes →
              </Link>
              <Link
                href="/signup"
                className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Sukurti paskyrą
              </Link>
              <span className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-200">
                💬 Discord: {settings.discord}
              </span>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[
                { label: "Prekių kataloge", value: counts.total },
                { label: "Yra sandėlyje", value: counts.inStock },
                { label: "Su nuolaida", value: counts.discounted },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center"
                >
                  <dt className="text-[11px] uppercase tracking-wide text-slate-400">
                    {item.label}
                  </dt>
                  <dd className="text-2xl font-extrabold text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col justify-center gap-4">
            <div className="animate-float rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/30 via-slate-900 to-sky-600/20 p-6 shadow-2xl">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-200">
                Kaip veikia pirkimas
              </h2>
              <ol className="mt-4 space-y-3 text-sm text-slate-200">
                {[
                  "Susikuri nemokamą paskyrą ir prisijungi.",
                  "Išsirenki prekes ir įdedi jas į krepšelį.",
                  "Pateiki užsakymą – jis atsiranda tavo profilyje.",
                  `Parašai savininkui per Discord (${settings.discord}) ir gauni prekę.`,
                ].map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <LiveClock />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {allCategories.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {allCategories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-indigo-400/40 hover:text-white"
              >
                {category.emoji} {category.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* DEALS */}
      {deals.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-rose-400/20 bg-gradient-to-r from-rose-500/10 via-slate-900 to-indigo-500/10 p-6">
            <h2 className="text-lg font-bold text-white">🔥 Aktyvios nuolaidos</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {deals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/products/${deal.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-rose-400/40"
                >
                  <span className="text-2xl">{deal.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{deal.name}</p>
                    <p className="text-xs text-rose-300">-{deal.discountPercent}% nuolaida</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Populiariausios prekės</h2>
            <p className="mt-1 text-sm text-slate-400">
              Visos prekės perkamos susisiekus per Discord: <strong>{settings.discord}</strong>
            </p>
          </div>
          <Link
            href="/products"
            className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 sm:block"
          >
            Visos prekės →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-white/15 p-12 text-center text-slate-400">
            Prekių dar nėra. Administratorius gali jas pridėti admin panelėje.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((row) => (
              <ProductCard
                key={row.product.id}
                product={row.product}
                categoryName={row.categoryName}
                discord={settings.discord}
              />
            ))}
          </div>
        )}
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: "⚡", title: "Greitas pristatymas", text: "Užsakymai apdorojami per kelias minutes darbo metu." },
            { icon: "🔒", title: "Saugu ir patikima", text: "Užsakymo istorija matoma tavo profilyje bet kada." },
            { icon: "💬", title: "Asmeninis kontaktas", text: `Tiesioginis ryšys su savininku per Discord: ${settings.discord}` },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <span className="text-3xl">{item.icon}</span>
              <h3 className="mt-3 text-base font-bold text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
