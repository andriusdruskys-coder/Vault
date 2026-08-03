import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_ADMIN } from "@/lib/bootstrap";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/profile");

  const params = await searchParams;
  const settings = await getSettings();
  const next = params.next && params.next.startsWith("/") ? params.next : "";

  return (
    <div className="glow-grid">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div className="hidden lg:block">
          <h1 className="text-4xl font-black text-white">Sveikas sugrįžęs 👋</h1>
          <p className="mt-4 max-w-md text-slate-300">
            Prisijunk ir tęsk apsipirkimą {settings.siteName} parduotuvėje. Savo profilyje matysi
            visų užsakymų istoriją ir jų būsenas.
          </p>
          <div className="mt-8 rounded-3xl border border-indigo-400/30 bg-indigo-500/10 p-5">
            <p className="text-sm font-semibold text-white">💬 Savininko Discord: {settings.discord}</p>
            <p className="mt-1 text-xs text-indigo-200">
              Visos prekės įsigyjamos susisiekus per Discord.
            </p>
          </div>
          <div className="mt-4 rounded-3xl border border-amber-400/30 bg-amber-500/10 p-5">
            <p className="text-sm font-semibold text-amber-200">
              👑 Administratoriaus prisijungimas (pakeisk slaptažodį profilyje!)
            </p>
            <p className="mt-1 font-mono text-xs text-amber-100">
              {DEMO_ADMIN.email} · {DEMO_ADMIN.password}
            </p>
            <Link
              href="/admin-login"
              className="mt-3 inline-block rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-xs font-bold text-slate-900"
            >
              🔐 Arba jungtis panelės kodu →
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl sm:p-9">
          <h2 className="text-2xl font-bold text-white">Prisijungimas</h2>
          <p className="mt-1 text-sm text-slate-400">Įvesk savo paskyros duomenis.</p>
          <div className="mt-6">
            <LoginForm next={next} />
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            Grįžti į{" "}
            <Link href="/" className="text-slate-300 hover:text-white">
              pagrindinį puslapį
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
