"use client";

import { useActionState } from "react";

import { saveSettingsAction, type AdminState } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import type { SiteSettings } from "@/lib/settings";

const inputClass =
  "mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useActionState<AdminState, FormData>(saveSettingsAction, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">
          {state.success}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-300">
          Svetainės pavadinimas *
          <input name="siteName" defaultValue={settings.siteName} required className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Savininko Discord *
          <input name="discord" defaultValue={settings.discord} required className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-slate-300 sm:col-span-2">
          Šūkis
          <input name="tagline" defaultValue={settings.tagline} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-slate-300 sm:col-span-2">
          Pagrindinė antraštė
          <input name="heroTitle" defaultValue={settings.heroTitle} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-slate-300 sm:col-span-2">
          Antraštės paaiškinimas
          <textarea
            name="heroSubtitle"
            defaultValue={settings.heroSubtitle}
            rows={3}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-slate-300 sm:col-span-2">
          Skelbimo juosta (viršuje)
          <input name="announcement" defaultValue={settings.announcement} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-slate-300 sm:col-span-2">
          Darbo laikas
          <input name="supportHours" defaultValue={settings.supportHours} className={inputClass} />
        </label>
      </div>

      <SubmitButton pendingLabel="Saugoma...">Išsaugoti nustatymus</SubmitButton>
    </form>
  );
}
