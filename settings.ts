import "server-only";

import { db } from "@/db";
import { settings } from "@/db/schema";

export type SiteSettings = {
  siteName: string;
  discord: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  announcement: string;
  supportHours: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "SnowShop",
  discord: "Snowlt",
  tagline: "Skaitmeninių prekių parduotuvė",
  heroTitle: "Premium skaitmeninės prekės vienoje vietoje",
  heroSubtitle:
    "Rinkis prekę, pridėk į krepšelį ir pateik užsakymą — po to parašyk savininkui per Discord, kad užbaigtum pirkimą.",
  announcement: "🔥 Naujiena: nuolaidos aktyvuotos! Susisiek per Discord: Snowlt",
  supportHours: "Kasdien 10:00 – 23:00 (EET)",
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await db.select().from(settings);
    const map = new Map(rows.map((row) => [row.key, row.value]));
    const result = { ...DEFAULT_SETTINGS };
    (Object.keys(DEFAULT_SETTINGS) as Array<keyof SiteSettings>).forEach((key) => {
      const value = map.get(key);
      if (value && value.trim().length > 0) result[key] = value;
    });
    return result;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(values: Partial<SiteSettings>): Promise<void> {
  const entries = Object.entries(values).filter(([, value]) => typeof value === "string");
  for (const [key, value] of entries) {
    await db
      .insert(settings)
      .values({ key, value: value as string })
      .onConflictDoUpdate({ target: settings.key, set: { value: value as string } });
  }
}
