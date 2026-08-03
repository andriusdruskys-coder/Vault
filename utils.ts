export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("lt-LT", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function finalPriceCents(priceCents: number, discountPercent: number): number {
  const safeDiscount = Math.min(Math.max(discountPercent ?? 0, 0), 95);
  return Math.round((priceCents * (100 - safeDiscount)) / 100);
}

export function slugify(value: string): string {
  const map: Record<string, string> = {
    ą: "a", č: "c", ę: "e", ė: "e", į: "i", š: "s", ų: "u", ū: "u", ž: "z",
  };
  return value
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function parsePriceToCents(value: string): number {
  const normalized = (value ?? "").toString().replace(",", ".").trim();
  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

export const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Laukiama kontakto", className: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  contacted: { label: "Susisiekta", className: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  paid: { label: "Apmokėta", className: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  completed: { label: "Įvykdyta", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  cancelled: { label: "Atšaukta", className: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

export function stockLabel(stock: number): { label: string; className: string } {
  if (stock <= 0) {
    return { label: "Nėra sandėlyje", className: "bg-rose-500/15 text-rose-300 border-rose-500/30" };
  }
  if (stock <= 3) {
    return { label: `Liko tik ${stock} vnt.`, className: "bg-amber-500/15 text-amber-300 border-amber-500/30" };
  }
  return { label: `Sandėlyje: ${stock} vnt.`, className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" };
}
