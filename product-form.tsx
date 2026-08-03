"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createProductAction, updateProductAction, type AdminState } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import type { Category, Product } from "@/db/schema";

const inputClass =
  "mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none";

export function ProductForm({
  mode,
  product,
  categories,
}: {
  mode: "create" | "edit";
  product?: Product;
  categories: Category[];
}) {
  const action = mode === "create" ? createProductAction : updateProductAction;
  const [state, formAction] = useActionState<AdminState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-5">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

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
        <label className="block text-sm font-medium text-slate-300 sm:col-span-2">
          Prekės pavadinimas *
          <input name="name" defaultValue={product?.name ?? ""} required className={inputClass} />
        </label>

        <label className="block text-sm font-medium text-slate-300">
          Kaina (EUR) *
          <input
            name="price"
            defaultValue={product ? (product.priceCents / 100).toFixed(2) : ""}
            placeholder="9.99"
            required
            className={inputClass}
          />
        </label>

        <label className="block text-sm font-medium text-slate-300">
          Nuolaida (%)
          <input
            name="discountPercent"
            type="number"
            min={0}
            max={95}
            defaultValue={product?.discountPercent ?? 0}
            className={inputClass}
          />
        </label>

        <label className="block text-sm font-medium text-slate-300">
          Kiekis sandėlyje
          <input
            name="stock"
            type="number"
            min={0}
            defaultValue={product?.stock ?? 0}
            className={inputClass}
          />
        </label>

        <label className="block text-sm font-medium text-slate-300">
          Kategorija
          <select name="categoryId" defaultValue={product?.categoryId ?? "none"} className={inputClass}>
            <option value="none">— be kategorijos —</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-300">
          Emoji (jei nėra nuotraukos)
          <input name="emoji" defaultValue={product?.emoji ?? "📦"} className={inputClass} />
        </label>

        <label className="block text-sm font-medium text-slate-300">
          Nuotraukos URL (nebūtina)
          <input
            name="imageUrl"
            defaultValue={product?.imageUrl ?? ""}
            placeholder="https://... arba /images/preke.jpg"
            className={inputClass}
          />
        </label>

        <label className="block text-sm font-medium text-slate-300 sm:col-span-2">
          Trumpas aprašymas
          <input
            name="shortDescription"
            defaultValue={product?.shortDescription ?? ""}
            maxLength={180}
            placeholder="Viena eilutė, rodoma prekių sąraše"
            className={inputClass}
          />
        </label>

        <label className="block text-sm font-medium text-slate-300 sm:col-span-2">
          Pilnas aprašymas
          <textarea
            name="description"
            defaultValue={product?.description ?? ""}
            rows={6}
            className={inputClass}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product ? product.active : true}
            className="h-4 w-4 accent-indigo-500"
          />
          Rodyti parduotuvėje
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={product?.featured ?? false}
            className="h-4 w-4 accent-amber-400"
          />
          Rodyti kaip TOP prekę
        </label>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton pendingLabel="Saugoma...">
          {mode === "create" ? "Sukurti prekę" : "Išsaugoti pakeitimus"}
        </SubmitButton>
        <Link
          href="/admin/products"
          className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          Atgal į sąrašą
        </Link>
      </div>
    </form>
  );
}
