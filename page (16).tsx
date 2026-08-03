import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";

import { cancelOwnOrderAction } from "@/app/actions/orders";
import { ProfileForm } from "@/components/auth-forms";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { ORDER_STATUS, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser("/login?next=/profile");
  const params = await searchParams;
  const settings = await getSettings();

  const myOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt));

  const items = myOrders.length
    ? await db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, myOrders.map((order) => order.id)))
    : [];

  const spent = myOrders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.totalCents, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {params.error === "no-access" ? (
        <p className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          Neturite administratoriaus teisių šiam puslapiui pasiekti.
        </p>
      ) : null}

      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600/20 via-slate-900 to-sky-600/10 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-sky-400 to-indigo-600 text-3xl font-black text-white">
            {user.username.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-black text-white">{user.username}</h1>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  user.role === "admin"
                    ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
                    : "border-white/15 bg-white/5 text-slate-300"
                }`}
              >
                {user.role === "admin" ? "👑 Administratorius" : "Vartotojas"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-300">{user.email}</p>
            <p className="text-sm text-slate-400">
              Discord: {user.discordTag ? user.discordTag : "nenurodyta"} · Narys nuo{" "}
              {new Date(user.createdAt).toLocaleDateString("lt-LT")}
            </p>
          </div>
          {user.role === "admin" ? (
            <Link
              href="/admin"
              className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-bold text-slate-900"
            >
              Atidaryti admin panelę →
            </Link>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Užsakymų", value: myOrders.length },
            { label: "Bendra suma", value: formatPrice(spent) },
            { label: "Aktyvūs", value: myOrders.filter((o) => ["pending", "contacted", "paid"].includes(o.status)).length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
              <p className="text-xl font-extrabold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <h2 className="text-xl font-bold text-white">Mano užsakymai</h2>
          {myOrders.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-dashed border-white/15 p-10 text-center text-slate-400">
              Užsakymų dar nėra.{" "}
              <Link href="/products" className="text-indigo-300 hover:text-indigo-200">
                Peržiūrėk prekes →
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {myOrders.map((order) => {
                const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending;
                const orderLines = items.filter((item) => item.orderId === order.id);
                return (
                  <article
                    key={order.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-white">Užsakymas #{order.id}</h3>
                        <p className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleString("lt-LT")}
                        </p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>

                    <ul className="mt-4 space-y-1.5 text-sm text-slate-300">
                      {orderLines.map((line) => (
                        <li key={line.id} className="flex justify-between gap-3">
                          <span>
                            {line.productName} × {line.quantity}
                          </span>
                          <span className="tabular-nums text-slate-200">
                            {formatPrice(line.unitPriceCents * line.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <p className="text-sm text-slate-400">
                        Discord: <span className="text-white">{order.discordTag || "—"}</span>
                      </p>
                      <p className="text-lg font-black text-white">{formatPrice(order.totalCents)}</p>
                    </div>

                    {order.note ? (
                      <p className="mt-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-300">
                        Pastaba: {order.note}
                      </p>
                    ) : null}

                    {["pending", "contacted"].includes(order.status) ? (
                      <form action={cancelOwnOrderAction} className="mt-3">
                        <input type="hidden" name="orderId" value={order.id} />
                        <button
                          type="submit"
                          className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/20"
                        >
                          Atšaukti užsakymą
                        </button>
                      </form>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-indigo-400/30 bg-indigo-500/10 p-6">
            <h2 className="text-base font-bold text-white">💬 Kaip užbaigti pirkimą?</h2>
            <p className="mt-2 text-sm text-indigo-100">
              Parašyk savininkui per Discord <strong>{settings.discord}</strong> ir nurodyk savo
              užsakymo numerį. Prekė bus pristatyta patvirtinus mokėjimą.
            </p>
            <p className="mt-2 text-xs text-indigo-200/80">Darbo laikas: {settings.supportHours}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-base font-bold text-white">Profilio nustatymai</h2>
            <div className="mt-4">
              <ProfileForm username={user.username} discordTag={user.discordTag ?? ""} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
