"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export type AccordionItem = { q: string; a: string };

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-forest/12 border-y border-forest/12">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${index}`}
                id={`faq-button-${index}`}
                className="group flex w-full items-start justify-between gap-6 py-5 text-left transition-colors hover:text-forest md:py-6"
              >
                <span className="font-display text-[1.08rem] leading-snug text-forest md:text-[1.22rem]">
                  {item.q}
                </span>
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    isOpen
                      ? "rotate-45 border-forest bg-forest text-cream"
                      : "border-forest/20 text-forest group-hover:border-forest/50"
                  }`}
                  aria-hidden="true"
                >
                  <Plus size={15} strokeWidth={1.6} />
                </span>
              </button>
            </h3>
            <div
              id={`faq-panel-${index}`}
              role="region"
              aria-labelledby={`faq-button-${index}`}
              className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl pb-6 pr-10 text-[0.92rem] leading-relaxed text-ink-soft">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
