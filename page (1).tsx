import { desc, eq, inArray } from "drizzle-orm";

import { deleteOrderAction, updateOrderStatusAction } from "@/app/actions/admin";
import { db } from "@/db";
import { orderItems, orders, users } from "@/db/schema";
import { ORDER_STATUS, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statuses = ["pending", "contacted", "paid", "completed", "cancelled"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status && statuses.includes(params.status) ? params.status : "";

  const rows = await db
    .select({ order: orders, username: users.username, email: users.email })
    .from(orders)
    .leftJoin(users, eq(users.id, orders.userId))
    .where(statusFilter ? eq(orders.status, statusFilter) : undefined)
    .orderBy(desc(orders.createdAt));

  const items = rows.length
    ? await db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, rows.map((row) => row.order.id)))
    : [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white">Užsakymų valdymas</h2>
        <p className="text-sm text-slate-400">
          Keisk užsakymų būsenas. Atšaukus užsakymą, prekės grąžinamos į sandėlį.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href="/admin/orders"
          className={`rounded-xl border px-3.5 py-2 text-sm font-medium ${
            !statusFilter
              ? "border-indigo-400/50 bg-indigo-500/20 text-white"
              : "border-white/10 bg-white/5 text-slate-300"
          }`}
        >
          Visi
        </a>
        {statuses.map((status) => (
          <a
            key={status}
            href={`/admin/orders?status=${status}`}
            className={`rounded-xl border px-3.5 py-2 text-sm font-medium ${
              statusFilter === status
                ? "border-indigo-400/50 bg-indigo-500/20 text-white"
                : "border-white/10 bg-white/5 text-slate-300"
            }`}
          >
            {ORDER_STATUS[status].label}
          </a>
        ))}
      </div>

      <div className="space-y-4">
        {rows.map(({ order, username, email }) => {
          const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending;
          const lines = items.filter((item) => item.orderId === order.id);
          return (
            <article key={order.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-white">Užsakymas #{order.id}</h3>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">
                    {username ?? "Ištrintas vartotojas"} · {email ?? "—"}
                  </p>
                  <p className="text-xs text-slate-400">
                    Discord: <strong className="text-indigo-300">{order.discordTag || "—"}</strong> ·{" "}
                    {new Date(order.createdAt).toLocaleString("lt-LT")}
                  </p>
                </div>
                <p className="text-2xl font-black text-white">{formatPrice(order.totalCents)}</p>
              </div>

              <ul className="mt-4 space-y-1 rounded-2xl bg-slate-950/50 p-4 text-sm text-slate-300">
                {lines.map((line) => (
                  <li key={line.id} className="flex justify-between gap-3">
                    <span>
                      {line.productName} × {line.quantity}
                    </span>
                    <span className="tabular-nums">
                      {formatPrice(line.unitPriceCents * line.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              {order.note ? (
                <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                  Kliento pastaba: {order.note}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                {statuses.map((value) => (
                  <form key={value} action={updateOrderStatusAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="status" value={value} />
                    <button
                      type="submit"
                      disabled={order.status === value}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                        order.status === value
                          ? "cursor-default border-white/20 bg-white/15 text-white"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {ORDER_STATUS[value].label}
                    </button>
                  </form>
                ))}
                <form action={deleteOrderAction} className="ml-auto">
                  <input type="hidden" name="orderId" value={order.id} />
                  <button
                    type="submit"
                    className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/20"
                  >
                    🗑️ Ištrinti
                  </button>
                </form>
              </div>
            </article>
          );
        })}

        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center text-slate-400">
            Užsakymų nėra.
          </div>
        ) : null}
      </div>
    </div>
  );
}
