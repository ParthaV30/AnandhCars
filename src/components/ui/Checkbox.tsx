"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { Check } from "lucide-react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, disabled, required, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            required={required}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${checkboxId}-error` : description ? `${checkboxId}-description` : undefined}
            className={clsx(
              "appearance-none w-5 h-5 rounded-lg border-2 transition-all duration-150 cursor-pointer",
              "bg-[var(--bg-secondary)] border-[var(--border-primary)]",
              "checked:bg-primary checked:border-primary checked:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-error",
              className
            )}
            {...props}
          />
          <Check className="w-3.5 h-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" aria-hidden="true" />
        </div>
        {label && (
          <div className="flex-1 min-w-0">
            <label
              htmlFor={checkboxId}
              className={clsx(
                "font-medium text-[var(--text-primary)] cursor-pointer select-none",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {label}
            </label>
            {description && (
              <p id={`${checkboxId}-description`} className="text-sm text-[var(--text-secondary)] mt-0.5">
                {description}
              </p>
            )}
            {error && (
              <p id={`${checkboxId}-error`} className="text-xs text-error mt-0.5" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export type { CheckboxProps };