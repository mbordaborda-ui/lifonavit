import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type ButtonVariant = "primary" | "gold" | "outline" | "light" | "ghostLight";
type ButtonSize = "md" | "lg" | "sm";

const variants: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  gold: "btn-gold",
  outline: "btn-outline",
  light: "btn-light",
  ghostLight: "btn-ghost-light",
};

const sizes: Record<ButtonSize, string> = {
  sm: "!px-4 !py-2.5 !text-[11px]",
  md: "",
  lg: "!px-7 !py-[1.15rem] !text-[0.78rem]",
};

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  className?: string;
};

export function ButtonLink({
  children,
  href,
  variant = "primary",
  size = "md",
  arrow = false,
  className = "",
  ...rest
}: CommonProps & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link
      href={href}
      className={`btn ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
      {arrow ? <Arrow /> : null}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  className = "",
  ...rest
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={`btn ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
      {arrow ? <Arrow /> : null}
    </button>
  );
}

function Arrow() {
  return (
    <span className="btn-arrow" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2.5 6h7M6.5 3l3 3-3 3"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
