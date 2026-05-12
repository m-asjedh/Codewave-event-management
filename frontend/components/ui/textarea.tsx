import { type TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", rows = 5, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={`w-full resize-y rounded-cw-sm border border-cw-border bg-cw-surface px-3.5 py-2.5 text-sm text-cw-text placeholder:text-cw-muted focus-visible:border-cw-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/30 ${className}`}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
