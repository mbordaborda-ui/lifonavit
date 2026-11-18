"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BotanicalArt } from "@/components/ui/BotanicalArt";
import type { IngredientItem } from "@/lib/content";

const AUTOPLAY_MS = 4800;

export function IngredientsCarousel({ ingredients }: { ingredients: IngredientItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[index] as HTMLElement | undefined;
    if (!card) return;
    track.scrollTo({
      left: card.offsetLeft - track.offsetLeft - (track.clientWidth - card.clientWidth) / 2,
      behavior: "smooth",
    });
  }, []);

  // Detecta cuando la sección está a la vista para iniciar el giro automático.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting);
      },
      { threshold: 0.35 },
    );
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  // Avance automático solo en móvil/tablet, con la sección visible y sin interacción.
  useEffect(() => {
    if (!inView || paused || ingredients.length < 2) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % ingredients.length;
        scrollToIndex(next);
        return next;
      });
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [inView, paused, ingredients.length, scrollToIndex]);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let distance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < track.children.length; index += 1) {
      const card = track.children[index] as HTMLElement;
      const middle = card.offsetLeft - track.offsetLeft + card.offsetWidth / 2;
      const current = Math.abs(middle - center);
      if (current < distance) {
        distance = current;
        closest = index;
      }
    }
    setActive(closest);
  };

  const go = (index: number) => {
    const next = (index + ingredients.length) % ingredients.length;
    setActive(next);
    scrollToIndex(next);
  };

  return (
    <div
      className="mt-10 md:mt-12"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Los cinco ingredientes botánicos"
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            go(active + 1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            go(active - 1);
          }
        }}
        tabIndex={0}
        className="ingredients-track no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 outline-none md:mx-0 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0"
      >
        {ingredients.map((ingredient, index) => (
          <div
            key={ingredient.name}
            className="min-w-[84%] snap-center sm:min-w-[48%] md:min-w-0"
          >
            <article
              className="ingredient-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-forest/10 bg-white p-6 shadow-soft transition-colors duration-500 hover:border-gold/40 md:p-5"
              data-active={active === index}
            >
              <span className="absolute right-4 top-4 font-display text-[10px] tracking-[0.18em] text-forest/25">
                0{index + 1}
              </span>

              <div className="mx-auto h-32 w-28 text-sage transition-transform duration-700 group-hover:-translate-y-1.5 group-hover:scale-[1.04] md:h-28 md:w-24">
                <BotanicalArt name={ingredient.name} />
              </div>

              <div className="mt-4 h-px w-10 bg-gold/70 transition-all duration-500 group-hover:w-full" />
              <h3 className="mt-4 font-display text-[1.28rem] leading-tight text-forest md:text-[1.14rem]">
                {ingredient.name}
              </h3>
              <p className="serif-italic mt-1 text-[12px] text-sage">{ingredient.latin}</p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft md:text-[12.5px]">
                {ingredient.text}
              </p>
            </article>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between lg:hidden">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft">
          Desliza para ver los 5 botánicos
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label="Ingrediente anterior"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-forest/20 text-forest transition hover:border-forest/50 hover:bg-white"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label="Siguiente ingrediente"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-forest/20 text-forest transition hover:border-forest/50 hover:bg-white"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 lg:hidden">
        {ingredients.map((ingredient, index) => (
          <button
            key={ingredient.name}
            type="button"
            onClick={() => go(index)}
            aria-label={`Ver ${ingredient.name}`}
            aria-current={active === index}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              active === index ? "w-6 bg-forest" : "w-1.5 bg-forest/25 hover:bg-forest/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
