import Link from "next/link";
import { asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { orders, products, users } from "@/db/schema";
import { ORDER_STATUS, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [productStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where ${products.active})::int`,
      outOfStock: sql<number>`count(*) filter (where ${products.stock} = 0)::int`,
      lowStock: sql<number>`count(*) filter (where ${products.stock} > 0 and ${products.stock} <= 3)::int`,
      discounted: sql<number>`count(*) filter (where ${products.discountPercent} > 0)::int`,
      unitsInStock: sql<number>`coalesce(sum(${products.stock}), 0)::int`,
    })
    .from(products);

  const [orderStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where ${orders.status} = 'pending')::int`,
      completed: sql<number>`count(*) filter (where ${orders.status} = 'completed')::int`,
      revenue: sql<number>`coalesce(sum(${orders.totalCents}) filter (where ${orders.status} in ('paid','completed')), 0)::int`,
    })
    .from(orders);

  const [userStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      admins: sql<number>`count(*) filter (where ${users.role} = 'admin')::int`,
    })
    .from(users);

  const recentOrders = await db
    .select({ order: orders, username: users.username })
    .from(orders)
    .leftJoin(users, eq(users.id, orders.userId))
    .orderBy(desc(orders.createdAt))
    .limit(6);

  const stockWatch = await db
    .select()
    .from(products)
    .orderBy(asc(products.stock), asc(products.name))
    .limit(8);

  const cards = [
    { label: "Prekės kataloge", value: productStats?.total ?? 0, sub: `${productStats?.active ?? 0} aktyvios`, icon: "📦", tone: "from-sky-500/20" },
    { label: "Nėra sandėlyje", value: productStats?.outOfStock ?? 0, sub: `${productStats?.lowStock ?? 0} mažas likutis`, icon: "⚠️", tone: "from-rose-500/20" },
    { label: "Užsakymai", value: orderStats?.total ?? 0, sub: `${orderStats?.pending ?? 0} laukia kontakto`, icon: "🧾", tone: "from-violet-500/20" },
    { label: "Pajamos", value: formatPrice(orderStats?.revenue ?? 0), sub: `${orderStats?.completed ?? 0} įvykdyta`, icon: "💰", tone: "from-emerald-500/20" },
    { label: "Vartotojai", value: userStats?.total ?? 0, sub: `${userStats?.admins ?? 0} administratoriai`, icon: "👥", tone: "from-indigo-500/20" },
    { label: "Vienetų sandėlyje", value: productStats?.unitsInStock ?? 0, sub: `${productStats?.discounted ?? 0} su nuolaida`, icon: "🏬", tone: "from-amber-500/20" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-3xl border border-white/10 bg-gradient-to-br ${card.tone} to-slate-900 p-5`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                {card.label}
              </p>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="mt-2 text-3xl font-black text-white">{card.value}</p>
            <p className="text-xs text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Sandėlio stebėjimas</h2>
            <Link href="/admin/products" className="text-sm text-indigo-300 hover:text-indigo-200">
              Valdyti prekes →
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="pb-2">Prekė</th>
                  <th className="pb-2">Likutis</th>
                  <th className="pb-2">Būsena</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stockWatch.map((product) => (
                  <tr key={product.id}>
                    <td className="py-2.5 pr-3 text-slate-200">
                      {product.emoji} {product.name}
                    </td>
                    <td className="py-2.5 pr-3 font-semibold tabular-nums text-white">
                      {product.stock}
                    </td>
                    <td className="py-2.5">
                      {product.stock === 0 ? (
                        <span className="rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-300">
                          Nėra sandėlyje
                        </span>
                      ) : product.stock <= 3 ? (
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
                          Baigiasi
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                          Yra
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {stockWatch.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      Prekių dar nėra.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Naujausi užsakymai</h2>
            <Link href="/admin/orders" className="text-sm text-indigo-300 hover:text-indigo-200">
              Visi užsakymai →
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {recentOrders.map(({ order, username }) => {
              const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending;
              return (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      #{order.id} · {username ?? "—"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Discord: {order.discordTag || "—"} ·{" "}
                      {new Date(order.createdAt).toLocaleString("lt-LT")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                    <span className="font-bold text-white">{formatPrice(order.totalCents)}</span>
                  </div>
                </div>
              );
            })}
            {recentOrders.length === 0 ? (
              <p className="py-6 text-center text-slate-400">Užsakymų dar nėra.</p>
            ) : null}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-lg font-bold text-white">Greiti veiksmai</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/admin/products/new", label: "➕ Pridėti prekę" },
            { href: "/admin/products", label: "🏷️ Nustatyti nuolaidas" },
            { href: "/admin/orders", label: "🧾 Tvarkyti užsakymus" },
            { href: "/admin/settings", label: "⚙️ Svetainės nustatymai" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4 text-center text-sm font-semibold text-white transition hover:border-indigo-400/40"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
