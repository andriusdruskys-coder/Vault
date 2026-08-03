import { desc, eq, sql } from "drizzle-orm";

import { deleteUserAction, updateUserRoleAction } from "@/app/actions/admin";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      discordTag: users.discordTag,
      role: users.role,
      createdAt: users.createdAt,
      orderCount: sql<number>`count(${orders.id})::int`,
      spent: sql<number>`coalesce(sum(${orders.totalCents}) filter (where ${orders.status} <> 'cancelled'), 0)::int`,
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white">Vartotojai</h2>
        <p className="text-sm text-slate-400">
          Suteik administratoriaus teises arba pašalink paskyras. Savo paskyros pakeisti negalima.
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.03]">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3">Vartotojas</th>
              <th className="px-5 py-3">Discord</th>
              <th className="px-5 py-3">Užsakymai</th>
              <th className="px-5 py-3">Išleista</th>
              <th className="px-5 py-3">Rolė</th>
              <th className="px-5 py-3">Veiksmai</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-4">
                  <p className="font-semibold text-white">{user.username}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <p className="text-xs text-slate-500">
                    Nuo {new Date(user.createdAt).toLocaleDateString("lt-LT")}
                  </p>
                </td>
                <td className="px-5 py-4 text-slate-300">{user.discordTag || "—"}</td>
                <td className="px-5 py-4 text-slate-300">{user.orderCount}</td>
                <td className="px-5 py-4 font-semibold text-white">{formatPrice(user.spent)}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                      user.role === "admin"
                        ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
                        : "border-white/15 bg-white/5 text-slate-300"
                    }`}
                  >
                    {user.role === "admin" ? "👑 Admin" : "Vartotojas"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {user.id === admin.id ? (
                    <span className="text-xs text-slate-500">Tai tavo paskyra</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <form action={updateUserRoleAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input
                          type="hidden"
                          name="role"
                          value={user.role === "admin" ? "user" : "admin"}
                        />
                        <button
                          type="submit"
                          className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                        >
                          {user.role === "admin" ? "Nuimti admin" : "Padaryti admin"}
                        </button>
                      </form>
                      <form action={deleteUserAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                          type="submit"
                          className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/20"
                        >
                          Ištrinti
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
