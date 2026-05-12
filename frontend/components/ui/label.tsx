import { forwardRef, type LabelHTMLAttributes } from "react";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className = "", ...props }, ref) => (
    <label
      ref={ref}
      className={`text-xs font-semibold uppercase tracking-wider text-cw-muted ${className}`}
      {...props}
    />
  ),
);
Label.displayName = "Label";
