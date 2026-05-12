import type { HTMLAttributes } from "react";

export function Badge({
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-cw-border bg-cw-surface-2 px-2.5 py-0.5 text-xs font-medium text-cw-muted ${className}`}
      {...props}
    />
  );
}
