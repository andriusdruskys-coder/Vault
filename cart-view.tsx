"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createOrderAction } from "@/app/actions/orders";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/utils";

export function CartView({
  isLoggedIn,
  defaultDiscord,
  discord,
}: {
  isLoggedIn: boolean;
  defaultDiscord: string;
  discord: string;
}) {
  const { items, totalCents, setQuantity, remove, clear, ready } = useCart();
  const [discordTag, setDiscordTag] = useState(defaultDiscord);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await createOrderAction({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        discordTag,
        note,
      });
      if (result.ok) {
        setOrderId(result.orderId);
        clear();
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  if (orderId) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-8 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="mt-4 text-2xl font-bold text-white">Užsakymas #{orderId} pateiktas!</h2>
        <p className="mt-3 text-sm text-emerald-100">
          Dabar parašyk savininkui per <strong>Discord: {discord}</strong> ir nurodyk savo užsakymo
          numerį <strong>#{orderId}</strong>. Prekė bus pristatyta patvirtinus mokėjimą.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/profile"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900"
          >
            Mano užsakymai
          </Link>
          <Link
            href="/products"
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold text-white"
          >
            Tęsti apsipirkimą
          </Link>
        </div>
      </div>
    );
  }

  if (!ready) {
    return <div className="py-16 text-center text-slate-400">Kraunamas krepšelis...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center">
        <div className="text-5xl">🛒</div>
        <h2 className="mt-4 text-xl font-bold text-white">Krepšelis tuščias</h2>
        <p className="mt-2 text-sm text-slate-400">Išsirink prekių iš mūsų katalogo.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white"
        >
          Į katalogą →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-800 to-indigo-950 text-2xl">
              {item.emoji}
            </span>
            <div className="min-w-40 flex-1">
              <Link href={`/products/${item.slug}`} className="font-semibold text-white hover:text-indigo-300">
                {item.name}
              </Link>
              <p className="text-xs text-slate-400">
                {formatPrice(item.priceCents)} × {item.quantity} · maks. {item.maxStock} vnt.
              </p>
            </div>
            <div className="flex items-center rounded-xl border border-white/15 bg-white/5">
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                className="px-3 py-1.5 text-lg leading-none text-slate-300 hover:text-white"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                className="px-3 py-1.5 text-lg leading-none text-slate-300 hover:text-white"
              >
                +
              </button>
            </div>
            <span className="w-24 text-right font-bold text-white">
              {formatPrice(item.priceCents * item.quantity)}
            </span>
            <button
              type="button"
              onClick={() => remove(item.productId)}
              className="rounded-lg px-2 py-1 text-sm text-rose-300 hover:bg-rose-500/10"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={clear}
          className="text-sm text-slate-400 underline-offset-4 hover:text-white hover:underline"
        >
          Išvalyti krepšelį
        </button>
      </div>

      <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-bold text-white">Užsakymo suvestinė</h2>
        <div className="mt-4 flex items-center justify-between border-b border-white/10 pb-4 text-sm text-slate-300">
          <span>Prekių suma</span>
          <span className="text-xl font-black text-white">{formatPrice(totalCents)}</span>
        </div>

        {isLoggedIn ? (
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              Tavo Discord vardas
              <input
                value={discordTag}
                onChange={(event) => setDiscordTag(event.target.value)}
                placeholder="pvz. tavo_vardas"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              />
            </label>
            <label className="block text-sm font-medium text-slate-300">
              Pastaba (nebūtina)
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                placeholder="Papildoma informacija savininkui"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              />
            </label>

            {error ? (
              <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Pateikiama..." : "Pateikti užsakymą"}
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              Kad pateiktum užsakymą, prisijunk arba susikurk nemokamą paskyrą.
            </p>
            <Link
              href="/login?next=/cart"
              className="block rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3 text-center text-sm font-bold text-white"
            >
              Prisijungti
            </Link>
            <Link
              href="/signup?next=/cart"
              className="block rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-center text-sm font-bold text-white"
            >
              Registruotis
            </Link>
          </div>
        )}

        <p className="mt-4 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-xs text-indigo-200">
          💬 Pateikus užsakymą, susisiek per Discord: <strong>{discord}</strong>
        </p>
      </aside>
    </div>
  );
}
