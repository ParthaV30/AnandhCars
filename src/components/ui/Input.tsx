"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      hint,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = true,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const displayHint = hint || helperText;

    return (
      <div className={clsx("w-full", fullWidth && "max-w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
          >
            {label}
            {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : displayHint ? `${inputId}-hint` : undefined}
            className={clsx(
              "w-full px-4 py-2.5 text-sm bg-[var(--bg-secondary)] border rounded-xl placeholder:text-[var(--text-muted)] transition-all duration-150",
              leftIcon ? "pl-10" : "",
              rightIcon ? "pr-10" : "",
              error
                ? "border-error focus:ring-2 focus:ring-error focus:border-transparent"
                : "border-[var(--border-primary)] focus:ring-2 focus:ring-primary focus:border-transparent",
              disabled && "bg-[var(--bg-tertiary)] cursor-not-allowed opacity-60",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-error" role="alert">
            {error}
          </p>
        )}
        {displayHint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-[var(--text-muted)]">
            {displayHint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export type { InputProps };