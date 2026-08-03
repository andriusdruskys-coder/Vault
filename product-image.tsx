/* eslint-disable @next/next/no-img-element */

import { cn } from "@/lib/utils";

export function ProductImage({
  imageUrl,
  emoji,
  name,
  className,
  emojiClassName = "text-6xl",
}: {
  imageUrl: string | null;
  emoji: string;
  name: string;
  className?: string;
  emojiClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950",
        className,
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <span className={emojiClassName} aria-hidden>
          {emoji}
        </span>
      )}
    </div>
  );
}
