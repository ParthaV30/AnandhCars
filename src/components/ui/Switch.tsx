"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface SwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, error, id, disabled, required, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={switchId}
            disabled={disabled}
            required={required}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${switchId}-error` : description ? `${switchId}-description` : undefined}
            className={clsx(
              "appearance-none w-11 h-6 rounded-full border-2 transition-all duration-150 cursor-pointer",
              "bg-[var(--bg-tertiary)] border-[var(--border-primary)]",
              "checked:bg-primary checked:border-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-error",
              "after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow-md after:transition-all after:duration-150",
              "checked:after:translate-x-5",
              className
            )}
            {...props}
          />
        </div>
        {label && (
          <div className="flex-1 min-w-0">
            <label
              htmlFor={switchId}
              className={clsx(
                "font-medium text-[var(--text-primary)] cursor-pointer select-none",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {label}
            </label>
            {description && (
              <p id={`${switchId}-description`} className="text-sm text-[var(--text-secondary)] mt-0.5">
                {description}
              </p>
            )}
            {error && (
              <p id={`${switchId}-error`} className="text-xs text-error mt-0.5" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";

export type { SwitchProps };