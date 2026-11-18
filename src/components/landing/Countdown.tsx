"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

function pad(value: number) {
  return String(Math.max(0, value)).padStart(2, "0");
}

export function Countdown({
  endsAt,
  label,
}: {
  endsAt: string;
  label: string;
}) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(endsAt).getTime();
    if (!Number.isFinite(target)) return;

    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    const frame = requestAnimationFrame(tick);
    const interval = window.setInterval(tick, 1000);

    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(interval);
    };
  }, [endsAt]);

  if (remaining !== null && remaining <= 0) return null;

  const totalSeconds = Math.floor((remaining ?? 0) / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ready = remaining !== null;

  const units = [
    { value: ready ? pad(days) : "--", label: "días" },
    { value: ready ? pad(hours) : "--", label: "horas" },
    { value: ready ? pad(minutes) : "--", label: "min" },
    { value: ready ? pad(seconds) : "--", label: "seg" },
  ];

  return (
    <div
      className="mt-4 flex flex-wrap items-center gap-2"
      role="timer"
      aria-live="off"
      aria-label={`La oferta termina el ${label}`}
    >
      <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-gold-deep">
        <Clock3 size={12} /> La oferta termina en
      </span>
      <div className="flex items-center gap-1">
        {units.map((unit) => (
          <span
            key={unit.label}
            className="flex min-w-[38px] flex-col items-center rounded-md bg-forest px-1.5 py-1 text-cream"
          >
            <span className="font-display text-[0.95rem] leading-none tabular-nums">
              {unit.value}
            </span>
            <span className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.08em] text-cream/60">
              {unit.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
