"use client";

import { useState } from "react";

import { useCart, type CartItem } from "@/components/cart-provider";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  item,
  className,
  withQuantity = false,
  label = "Į krepšelį",
}: {
  item: Omit<CartItem, "quantity">;
  className?: string;
  withQuantity?: boolean;
  label?: string;
}) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const disabled = item.maxStock <= 0;

  const handleAdd = () => {
    if (disabled) return;
    add(item, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className={cn("flex w-full items-center gap-2", className)}>
      {withQuantity && !disabled ? (
        <div className="flex items-center rounded-xl border border-white/15 bg-white/5">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="px-3 py-2 text-lg leading-none text-slate-300 hover:text-white"
            aria-label="Mažiau"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold text-white tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(item.maxStock, value + 1))}
            className="px-3 py-2 text-lg leading-none text-slate-300 hover:text-white"
            aria-label="Daugiau"
          >
            +
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled}
        className={cn(
          "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
          disabled
            ? "cursor-not-allowed bg-white/5 text-slate-500"
            : added
              ? "bg-emerald-500 text-white"
              : "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:opacity-90",
        )}
      >
        {disabled ? "Nėra sandėlyje" : added ? "✓ Pridėta!" : label}
      </button>
    </div>
  );
}
