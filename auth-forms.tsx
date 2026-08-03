"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction, signupAction, updateProfileAction, type AuthState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";

const inputClass =
  "mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none";

function Alert({ state }: { state: AuthState }) {
  if (state.error) {
    return (
      <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">
        {state.success}
      </p>
    );
  }
  return null;
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<AuthState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Alert state={state} />
      <label className="block text-sm font-medium text-slate-300">
        El. paštas
        <input name="email" type="email" required autoComplete="email" className={inputClass} placeholder="tavo@pastas.lt" />
      </label>
      <label className="block text-sm font-medium text-slate-300">
        Slaptažodis
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} placeholder="••••••••" />
      </label>
      <SubmitButton className="w-full py-3" pendingLabel="Jungiamasi...">
        Prisijungti
      </SubmitButton>
      <p className="text-center text-sm text-slate-400">
        Neturi paskyros?{" "}
        <Link href="/signup" className="font-semibold text-indigo-300 hover:text-indigo-200">
          Registruokis nemokamai
        </Link>
      </p>
    </form>
  );
}

export function SignupForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<AuthState, FormData>(signupAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Alert state={state} />
      <label className="block text-sm font-medium text-slate-300">
        Vartotojo vardas
        <input name="username" required minLength={3} className={inputClass} placeholder="pvz. SnowFan" />
      </label>
      <label className="block text-sm font-medium text-slate-300">
        El. paštas
        <input name="email" type="email" required className={inputClass} placeholder="tavo@pastas.lt" />
      </label>
      <label className="block text-sm font-medium text-slate-300">
        Discord vardas (nebūtina)
        <input name="discordTag" className={inputClass} placeholder="pvz. snowfan" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-300">
          Slaptažodis
          <input name="password" type="password" required minLength={6} className={inputClass} placeholder="••••••••" />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Pakartok slaptažodį
          <input name="confirmPassword" type="password" required minLength={6} className={inputClass} placeholder="••••••••" />
        </label>
      </div>
      <SubmitButton className="w-full py-3" pendingLabel="Kuriama paskyra...">
        Sukurti paskyrą
      </SubmitButton>
      <p className="text-center text-sm text-slate-400">
        Jau turi paskyrą?{" "}
        <Link href="/login" className="font-semibold text-indigo-300 hover:text-indigo-200">
          Prisijunk
        </Link>
      </p>
    </form>
  );
}

export function ProfileForm({
  username,
  discordTag,
}: {
  username: string;
  discordTag: string;
}) {
  const [state, formAction] = useActionState<AuthState, FormData>(updateProfileAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <Alert state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-300">
          Vartotojo vardas
          <input name="username" defaultValue={username} required minLength={3} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Discord vardas
          <input name="discordTag" defaultValue={discordTag} className={inputClass} placeholder="pvz. snowfan" />
        </label>
      </div>
      <label className="block text-sm font-medium text-slate-300">
        Naujas slaptažodis (palik tuščią, jei nekeiti)
        <input name="newPassword" type="password" minLength={6} className={inputClass} placeholder="••••••••" />
      </label>
      <SubmitButton pendingLabel="Saugoma...">Išsaugoti pakeitimus</SubmitButton>
    </form>
  );
}
