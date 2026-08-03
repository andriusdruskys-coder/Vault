import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync } from "node:fs";
import pg from "pg";

function loadEnv() {
  try {
    const raw = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!match) continue;
      const key = match[1];
      let value = (match[2] ?? "").trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* ignore */
  }
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

const CATEGORIES = [
  { name: "Žaidimų paskyros", slug: "zaidimu-paskyros", emoji: "🎮" },
  { name: "Prenumeratos", slug: "prenumeratos", emoji: "💎" },
  { name: "Discord paslaugos", slug: "discord-paslaugos", emoji: "🤖" },
  { name: "Dizainas", slug: "dizainas", emoji: "🎨" },
];

const PRODUCTS = [
  {
    name: "Discord Nitro 1 mėn.",
    slug: "discord-nitro-1-men",
    shortDescription: "Pilna Nitro prenumerata mėnesiui su 2 serverio boostais.",
    description:
      "Gauk Discord Nitro prenumeratą visam mėnesiui: HD ekrano transliacijos, didesni failai, animuoti emoji, custom profilis ir 2 serverio boostai.\n\nPristatymas: per 5–30 min. nuo apmokėjimo. Susisiek per Discord.",
    priceCents: 899,
    discountPercent: 20,
    stock: 25,
    emoji: "💎",
    category: "prenumeratos",
    featured: true,
    image: "/images/nitro.jpg",
  },
  {
    name: "Minecraft Premium paskyra",
    slug: "minecraft-premium-paskyra",
    shortDescription: "Pilnos prieigos Java + Bedrock paskyra su el. pašto prieiga.",
    description:
      "Originali Minecraft paskyra su pilna el. pašto prieiga. Gali keisti slapyvardį, prisijungti prie bet kokio serverio.\n\nGarantija 30 dienų. Detalės — per Discord.",
    priceCents: 1499,
    discountPercent: 0,
    stock: 8,
    emoji: "🟩",
    category: "zaidimu-paskyros",
    featured: true,
    image: "/images/minecraft.jpg",
  },
  {
    name: "Custom Discord botas",
    slug: "custom-discord-botas",
    shortDescription: "Individualus botas tavo serveriui su moderavimo funkcijomis.",
    description:
      "Sukuriame botą pagal tavo poreikius: moderavimas, tikets sistema, lygiai, muzika, automatinės rolės ir daugiau.\n\nĮskaičiuota: šaltinio kodas, dokumentacija ir 14 d. palaikymas.",
    priceCents: 4999,
    discountPercent: 10,
    stock: 3,
    emoji: "🤖",
    category: "discord-paslaugos",
    featured: true,
    image: "/images/bot.jpg",
  },
  {
    name: "Serverio dizaino paketas",
    slug: "serverio-dizaino-paketas",
    shortDescription: "Banneriai, ikonos ir emoji rinkinys tavo Discord serveriui.",
    description:
      "Profesionalus vizualinis paketas: serverio baneris, ikona, 10 custom emoji, rolių ikonos ir vieninga spalvų schema.\n\nFailai pateikiami PNG ir SVG formatais.",
    priceCents: 2999,
    discountPercent: 0,
    stock: 5,
    emoji: "🎨",
    category: "dizainas",
    featured: false,
    image: "/images/design.jpg",
  },
  {
    name: "Steam piniginės papildymas 20€",
    slug: "steam-pinigines-papildymas-20",
    shortDescription: "Steam kodas 20 EUR sumai — greitas pristatymas.",
    description:
      "Steam dovanų kodas 20 EUR vertės. Tinka žaidimams, DLC ir bendruomenės rinkai.\n\nKodas pateikiamas per Discord iškart po apmokėjimo.",
    priceCents: 2099,
    discountPercent: 5,
    stock: 0,
    emoji: "🕹️",
    category: "zaidimu-paskyros",
    featured: false,
    image: null,
  },
  {
    name: "Serverio boost paketas (14x)",
    slug: "serverio-boost-paketas-14x",
    shortDescription: "14 boostų mėnesiui — iškart 3 serverio lygis.",
    description:
      "Pakelk savo Discord serverį iki 3 lygio: geresnė garso kokybė, daugiau emoji, custom nuoroda ir baneris.\n\nGarantija visą prenumeratos laikotarpį.",
    priceCents: 1299,
    discountPercent: 15,
    stock: 12,
    emoji: "🚀",
    category: "discord-paslaugos",
    featured: false,
    image: null,
  },
];

const SETTINGS = [
  ["siteName", "SnowShop"],
  ["discord", "Snowlt"],
  ["tagline", "Skaitmeninių prekių parduotuvė"],
  ["heroTitle", "Premium skaitmeninės prekės vienoje vietoje"],
  [
    "heroSubtitle",
    "Rinkis prekę, pridėk į krepšelį ir pateik užsakymą — po to parašyk savininkui per Discord (Snowlt), kad užbaigtum pirkimą.",
  ],
  ["announcement", "🔥 Nuolaidos aktyvios! Pirkimui rašyk per Discord: Snowlt"],
  ["supportHours", "Kasdien 10:00 – 23:00 (EET)"],
];

async function main() {
  loadEnv();
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // Admin account
  const adminEmail = "admin@snowshop.lt";
  const adminExists = await client.query("select id from users where email = $1", [adminEmail]);
  if (adminExists.rowCount === 0) {
    await client.query(
      "insert into users (email, username, discord_tag, password_hash, role) values ($1,$2,$3,$4,'admin')",
      [adminEmail, "Snowlt", "Snowlt", hashPassword("Snowlt2026!")],
    );
    console.log("Created admin:", adminEmail, "/ Snowlt2026!");
  }

  for (const category of CATEGORIES) {
    await client.query(
      "insert into categories (name, slug, emoji) values ($1,$2,$3) on conflict (slug) do nothing",
      [category.name, category.slug, category.emoji],
    );
  }

  const categoryRows = await client.query("select id, slug from categories");
  const categoryMap = new Map(categoryRows.rows.map((row) => [row.slug, row.id]));

  for (const product of PRODUCTS) {
    await client.query(
      `insert into products
        (name, slug, short_description, description, price_cents, discount_percent, stock, image_url, emoji, category_id, featured, active)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true)
       on conflict (slug) do nothing`,
      [
        product.name,
        product.slug,
        product.shortDescription,
        product.description,
        product.priceCents,
        product.discountPercent,
        product.stock,
        product.image,
        product.emoji,
        categoryMap.get(product.category) ?? null,
        product.featured,
      ],
    );
  }

  for (const [key, value] of SETTINGS) {
    await client.query(
      "insert into settings (key, value) values ($1,$2) on conflict (key) do nothing",
      [key, value],
    );
  }

  await client.end();
  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
