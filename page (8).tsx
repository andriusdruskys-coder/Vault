import Link from "next/link";
import { redirect } from "next/navigation";

import { PanelCodeForm } from "@/components/admin/panel-code-form";
import { getAdminSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const params = await searchParams;
  const settings = await getSettings();
  const next = params.next && params.next.startsWith("/") ? params.next : "/admin";

  return (
    <div className="glow-grid">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div className="hidden lg:block">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300">
            👑 Tik savininkui
          </span>
          <h1 className="mt-5 text-4xl font-black text-white">Administratoriaus panelė</h1>
          <p className="mt-4 max-w-md text-slate-300">
            Įvesk panelės prisijungimo kodą ir gauk pilnus leidimus valdyti visą {settings.siteName}{" "}
            turinį.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-slate-300">
            {[
              "Įkelti, redaguoti ir šalinti prekes",
              "Nustatyti nuolaidas bet kuriai prekei",
              "Matyti sandėlio likučius ir ko nebėra",
              "Valdyti užsakymus, vartotojus ir nustatymus",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-amber-400/25 bg-white/[0.04] p-7 shadow-2xl sm:p-9">
          <h2 className="text-2xl font-bold text-white">🔐 Panelės prisijungimas</h2>
          <p className="mt-1 text-sm text-slate-400">
            Įvesk slaptą kodą, kad atrakintum admin panelę.
          </p>
          <div className="mt-6">
            <PanelCodeForm next={next} />
          </div>
          <div className="mt-6 space-y-2 text-center text-xs text-slate-500">
            <p>
              Turi paskyrą su admin teisėmis?{" "}
              <Link href="/login?next=/admin" className="text-indigo-300 hover:text-indigo-200">
                Prisijunk įprastai
              </Link>
            </p>
            <p>
              <Link href="/" className="text-slate-400 hover:text-white">
                ← Grįžti į parduotuvę
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
