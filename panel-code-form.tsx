"use client";

import { useActionState, useState } from "react";

import { unlockPanelAction, type PanelState } from "@/app/actions/admin-access";
import { SubmitButton } from "@/components/submit-button";

export function PanelCodeForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<PanelState, FormData>(unlockPanelAction, {});
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {state.error ? (
        <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">
          {state.error}
        </p>
      ) : null}

      <label className="block text-sm font-medium text-slate-300">
        Panelės prisijungimo kodas
        <div className="relative mt-1">
          <input
            name="code"
            type={show ? "text" : "password"}
            autoComplete="off"
            autoFocus
            required
            placeholder="••••••••••"
            className="w-full rounded-xl border border-amber-400/30 bg-slate-950/70 px-4 py-3 pr-16 font-mono text-base tracking-widest text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-sm text-slate-400 hover:text-white"
            aria-label="Rodyti kodą"
          >
            {show ? "🙈" : "👁️"}
          </button>
        </div>
      </label>

      <SubmitButton
        className="w-full bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-slate-900 shadow-amber-500/25"
        pendingLabel="Tikrinama..."
      >
        🔓 Atrakinti panelę
      </SubmitButton>

      <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
        Įvedus teisingą kodą, tavo paskyrai suteikiamos nuolatinės administratoriaus teisės, o
        panelė lieka atrakinta 30 dienų šioje naršyklėje.
      </p>
    </form>
  );
}
