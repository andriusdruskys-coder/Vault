import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-2xl font-black text-white">Svetainės nustatymai</h2>
        <p className="mt-1 text-sm text-slate-400">
          Keisk pavadinimą, Discord kontaktą ir pagrindinio puslapio tekstus — pakeitimai iškart
          matomi svetainėje.
        </p>
        <div className="mt-6">
          <SettingsForm settings={settings} />
        </div>
      </div>

      <aside className="h-fit space-y-4">
        <div className="rounded-3xl border border-indigo-400/30 bg-indigo-500/10 p-5">
          <h3 className="font-bold text-white">💬 Discord kontaktas</h3>
          <p className="mt-2 text-sm text-indigo-100">
            Dabartinis kontaktas: <strong>{settings.discord}</strong>
          </p>
          <p className="mt-2 text-xs text-indigo-200/80">
            Šis vardas rodomas antraštėje, poraštėje, prie kiekvienos prekės ir kontaktų puslapyje.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
          <h3 className="font-bold text-white">💡 Patarimas</h3>
          <p className="mt-2">
            Skelbimo juostą naudok akcijoms — ji rodoma pačiame svetainės viršuje. Palik lauką
            tuščią, jei nori ją paslėpti.
          </p>
        </div>
      </aside>
    </div>
  );
}
