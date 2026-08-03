import type { Metadata } from "next";
import type { ReactNode } from "react";

import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAdminSession, getCurrentUser } from "@/lib/auth";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { getSettings } from "@/lib/settings";
import "./globals.css";

export const metadata: Metadata = {
  title: "SnowShop — skaitmeninių prekių parduotuvė",
  description:
    "Modernus skaitmeninių prekių katalogas. Užsakymus patvirtiname per Discord: Snowlt.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  await ensureBootstrapped();
  const [user, adminSession, settings] = await Promise.all([
    getCurrentUser(),
    getAdminSession(),
    getSettings(),
  ]);

  return (
    <html lang="lt">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader
              user={
                user
                  ? {
                      id: user.id,
                      username: user.username,
                      email: user.email,
                      role: user.role,
                    }
                  : null
              }
              isAdmin={Boolean(adminSession)}
              siteName={settings.siteName}
              discord={settings.discord}
              announcement={settings.announcement}
            />
            <main className="flex-1">{children}</main>
            <SiteFooter
              siteName={settings.siteName}
              discord={settings.discord}
              supportHours={settings.supportHours}
            />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
