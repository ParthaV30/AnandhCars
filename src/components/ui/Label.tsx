"use client";

import { LabelHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, optional, size = "md", children, ...props }, ref) => {
    const sizes = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    };

    return (
      <label
        ref={ref}
        className={clsx(
          "block font-medium text-[var(--text-secondary)] mb-1.5",
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
        {optional && <span className="text-[var(--text-muted)] ml-1">(optional)</span>}
      </label>
    );
  }
);

Label.displayName = "Label";

export type { LabelProps };