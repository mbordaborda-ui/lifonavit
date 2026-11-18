import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  light = false,
  className = "",
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl"} ${className}`}
    >
      {eyebrow ? (
        <p className={`eyebrow ${light ? "eyebrow-light" : ""} ${align === "center" ? "justify-center" : ""}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`display-lg mt-5 text-balance ${light ? "text-cream" : "text-forest"}`}
      >
        {title}
      </h2>
      {intro ? (
        <p
          className={`mt-5 max-w-2xl text-[0.98rem] leading-relaxed ${
            align === "center" ? "mx-auto" : ""
          } ${light ? "text-cream/72" : "text-ink-soft"}`}
        >
          {intro}
        </p>
      ) : null}
      {children}
    </div>
  );
}
