import { asc } from "drizzle-orm";

import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/db";
import { categories } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const allCategories = await db.select().from(categories).orderBy(asc(categories.name));

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-2xl font-black text-white">Nauja prekė</h2>
      <p className="mt-1 text-sm text-slate-400">
        Užpildyk informaciją — prekė iškart atsiras parduotuvėje.
      </p>
      <div className="mt-6">
        <ProductForm mode="create" categories={allCategories} />
      </div>
    </div>
  );
}
