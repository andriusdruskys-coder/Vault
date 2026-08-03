"use client";

import { useEffect, useState } from "react";

const dateFormatter = new Intl.DateTimeFormat("lt-LT", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("lt-LT", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function LiveClock({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (compact) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 tabular-nums">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        {now ? timeFormatter.format(now) : "--:--:--"}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2 text-2xl font-bold tabular-nums text-white">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        {now ? timeFormatter.format(now) : "--:--:--"}
      </div>
      <div className="text-xs uppercase tracking-wide text-slate-400">
        {now ? dateFormatter.format(now) : "Kraunama data..."}
      </div>
    </div>
  );
}
