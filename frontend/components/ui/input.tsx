import { forwardRef, type InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-cw-sm border border-cw-border bg-cw-surface px-3.5 py-2.5 text-sm text-cw-text shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-cw-muted focus-visible:border-cw-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/30 dark:shadow-none ${className}`}
      {...props}
    />
  ),
);
Input.displayName = "Input";
