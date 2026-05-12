import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ComponentProps } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-cw-sm px-4 py-2.5 text-sm font-semibold tracking-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cw-bg disabled:pointer-events-none disabled:opacity-45";

const variants = {
  primary:
    "bg-cw-accent text-white shadow-cw-sm hover:bg-cw-accent-hover focus-visible:ring-cw-accent",
  secondary:
    "bg-cw-surface-2 text-cw-text border border-cw-border hover:bg-cw-surface focus-visible:ring-cw-accent",
  ghost:
    "text-cw-muted hover:text-cw-text hover:bg-cw-surface-2 focus-visible:ring-cw-accent",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600",
} as const;

type Variant = keyof typeof variants;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: Variant;
};

export function LinkButton({ className = "", variant = "primary", ...props }: LinkButtonProps) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
