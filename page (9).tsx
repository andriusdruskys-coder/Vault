import { CartView } from "@/components/cart-view";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black text-white sm:text-4xl">Krepšelis</h1>
      <p className="mt-2 text-sm text-slate-400">
        Peržiūrėk pasirinktas prekes ir pateik užsakymą. Pirkimas užbaigiamas per Discord.
      </p>
      <div className="mt-8">
        <CartView
          isLoggedIn={Boolean(user)}
          defaultDiscord={user?.discordTag ?? ""}
          discord={settings.discord}
        />
      </div>
    </div>
  );
}
