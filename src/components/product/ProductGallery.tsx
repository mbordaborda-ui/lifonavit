"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({
  images,
  name,
}: {
  images: { src: string; label: string }[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] border border-forest/10 bg-white shadow-soft">
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        {current ? (
          <Image
            key={current.src}
            src={current.src}
            alt={`${name} — ${current.label}`}
            fill
            priority
            loading="eager"
            sizes="(max-width: 1024px) 90vw, 460px"
            className="object-contain p-8 mix-blend-multiply"
          />
        ) : null}
        <span className="absolute bottom-4 left-4 rounded-full border border-forest/10 bg-cream/90 px-3 py-1 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-forest">
          60 ml · gotero
        </span>
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver ${image.label}`}
              aria-pressed={index === active}
              className={`relative h-20 w-16 overflow-hidden rounded-lg border bg-white transition ${
                index === active
                  ? "border-forest/60 ring-1 ring-forest/20"
                  : "border-forest/10 hover:border-forest/30"
              }`}
            >
              <Image
                src={image.src}
                alt={image.label}
                fill
                sizes="64px"
                className="object-contain p-1 mix-blend-multiply"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
