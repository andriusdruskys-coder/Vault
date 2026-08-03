import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db";
import { categories, products, settings, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { DEFAULT_SETTINGS } from "@/lib/settings";

export const DEMO_ADMIN = { email: "admin@snowshop.lt", password: "Snowlt2026!" };

const CATEGORY_SEED = [
  { name: "Žaidimų paskyros", slug: "zaidimu-paskyros", emoji: "🎮" },
  { name: "Prenumeratos", slug: "prenumeratos", emoji: "💎" },
  { name: "Discord paslaugos", slug: "discord-paslaugos", emoji: "🤖" },
  { name: "Dizainas", slug: "dizainas", emoji: "🎨" },
];

const PRODUCT_SEED = [
  {
    name: "Discord Nitro 1 mėn.",
    slug: "discord-nitro-1-men",
    shortDescription: "Pilna Nitro prenumerata mėnesiui su 2 serverio boostais.",
    description:
      "Gauk Discord Nitro prenumeratą visam mėnesiui: HD ekrano transliacijos, didesni failai, animuoti emoji ir 2 serverio boostai.\n\nPristatymas per 5–30 min. nuo apmokėjimo.",
    priceCents: 899,
    discountPercent: 20,
    stock: 25,
    emoji: "💎",
    categorySlug: "prenumeratos",
    featured: true,
    imageUrl: "/images/nitro.jpg",
  },
  {
    name: "Minecraft Premium paskyra",
    slug: "minecraft-premium-paskyra",
    shortDescription: "Pilnos prieigos Java + Bedrock paskyra su el. pašto prieiga.",
    description:
      "Originali Minecraft paskyra su pilna el. pašto prieiga. Gali keisti slapyvardį ir jungtis prie bet kokio serverio.\n\nGarantija 30 dienų.",
    priceCents: 1499,
    discountPercent: 0,
    stock: 8,
    emoji: "🟩",
    categorySlug: "zaidimu-paskyros",
    featured: true,
    imageUrl: "/images/minecraft.jpg",
  },
  {
    name: "Custom Discord botas",
    slug: "custom-discord-botas",
    shortDescription: "Individualus botas tavo serveriui su moderavimo funkcijomis.",
    description:
      "Sukuriame botą pagal tavo poreikius: moderavimas, ticket sistema, lygiai, muzika ir automatinės rolės.\n\nĮskaičiuota: šaltinio kodas ir 14 d. palaikymas.",
    priceCents: 4999,
    discountPercent: 10,
    stock: 3,
    emoji: "🤖",
    categorySlug: "discord-paslaugos",
    featured: true,
    imageUrl: "/images/bot.jpg",
  },
  {
    name: "Serverio dizaino paketas",
    slug: "serverio-dizaino-paketas",
    shortDescription: "Banneriai, ikonos ir emoji rinkinys tavo Discord serveriui.",
    description:
      "Profesionalus vizualinis paketas: serverio baneris, ikona, 10 custom emoji ir rolių ikonos.\n\nFailai pateikiami PNG ir SVG formatais.",
    priceCents: 2999,
    discountPercent: 0,
    stock: 5,
    emoji: "🎨",
    categorySlug: "dizainas",
    featured: false,
    imageUrl: "/images/design.jpg",
  },
  {
    name: "Steam piniginės papildymas 20€",
    slug: "steam-pinigines-papildymas-20",
    shortDescription: "Steam kodas 20 EUR sumai — greitas pristatymas.",
    description:
      "Steam dovanų kodas 20 EUR vertės. Tinka žaidimams, DLC ir bendruomenės rinkai.",
    priceCents: 2099,
    discountPercent: 5,
    stock: 0,
    emoji: "🕹️",
    categorySlug: "zaidimu-paskyros",
    featured: false,
    imageUrl: null,
  },
  {
    name: "Serverio boost paketas (14x)",
    slug: "serverio-boost-paketas-14x",
    shortDescription: "14 boostų mėnesiui — iškart 3 serverio lygis.",
    description:
      "Pakelk savo Discord serverį iki 3 lygio: geresnė garso kokybė, daugiau emoji, custom nuoroda ir baneris.",
    priceCents: 1299,
    discountPercent: 15,
    stock: 12,
    emoji: "🚀",
    categorySlug: "discord-paslaugos",
    featured: false,
    imageUrl: null,
  },
];

let bootstrapPromise: Promise<void> | null = null;

async function runBootstrap(): Promise<void> {
  const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
  if ((userCount?.count ?? 0) === 0) {
    await db.insert(users).values({
      email: DEMO_ADMIN.email,
      username: "Snowlt",
      discordTag: "Snowlt",
      passwordHash: hashPassword(DEMO_ADMIN.password),
      role: "admin",
    });
  }

  const [productCount] = await db.select({ count: sql<number>`count(*)::int` }).from(products);
  if ((productCount?.count ?? 0) === 0) {
    await db.insert(categories).values(CATEGORY_SEED).onConflictDoNothing();
    const allCategories = await db.select().from(categories);
    const map = new Map(allCategories.map((category) => [category.slug, category.id]));
    await db
      .insert(products)
      .values(
        PRODUCT_SEED.map(({ categorySlug, ...product }) => ({
          ...product,
          categoryId: map.get(categorySlug) ?? null,
          active: true,
        })),
      )
      .onConflictDoNothing();
  }

  const [settingsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(settings);
  if ((settingsCount?.count ?? 0) === 0) {
    await db
      .insert(settings)
      .values(
        Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({ key, value })),
      )
      .onConflictDoNothing();
  }
}

export async function ensureBootstrapped(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = runBootstrap().catch(() => {
      bootstrapPromise = null;
    });
  }
  await bootstrapPromise;
}
