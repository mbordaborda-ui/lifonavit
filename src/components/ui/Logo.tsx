import Link from "next/link";

export function Logo({
  variant = "dark",
  className = "",
  href = "/",
}: {
  variant?: "dark" | "light";
  className?: string;
  href?: string;
}) {
  const color = variant === "light" ? "#F8F6EF" : "#244C3A";
  return (
    <Link
      href={href}
      aria-label="LINFOVIT — inicio"
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      <svg
        width="30"
        height="34"
        viewBox="0 0 32 36"
        fill="none"
        aria-hidden="true"
        className="transition-transform duration-500 group-hover:-rotate-6"
      >
        <path
          d="M16 34V13"
          stroke={color}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M16 22c-6.5 0-10.5-3.6-10.5-10.5C12 11.5 16 15 16 22Z"
          fill={variant === "light" ? "#F8F6EF" : "#244C3A"}
          opacity={variant === "light" ? 0.95 : 1}
        />
        <path
          d="M16 27c6 0 9.5-3.2 9.5-9.5C19.5 17.5 16 20.8 16 27Z"
          fill="#C7A66A"
        />
        <path
          d="M16 13c0-3.4 1.8-6 4.6-7.2"
          stroke="#C7A66A"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="21.6" cy="5" r="1.4" fill="#C7A66A" />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className="font-display text-[1.42rem] font-semibold tracking-[0.24em]"
          style={{ color }}
        >
          LINFOVIT
        </span>
        <span
          className="mt-1 text-[0.48rem] font-semibold uppercase tracking-[0.3em]"
          style={{ color: variant === "light" ? "rgba(248,246,239,.55)" : "#66866A" }}
        >
          Bienestar botánico
        </span>
      </span>
    </Link>
  );
}
