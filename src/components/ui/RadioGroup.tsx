"use client";

import { HTMLAttributes, forwardRef, useState } from "react";
import { clsx } from "clsx";

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  label?: string;
  description?: string;
  options: { value: string; label: string; description?: string; disabled?: boolean }[];
  orientation?: "horizontal" | "vertical";
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  name?: string;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      label,
      description,
      options,
      orientation = "vertical",
      id,
      required,
      error,
      value: controlledValue,
      defaultValue = "",
      onChange,
      name,
      ...props
    },
    ref
  ) => {
    const groupId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : name || "radio-group");
    const [internalValue, setInternalValue] = useState<string>(defaultValue);

    const isControlled = controlledValue !== undefined;
    const selectedValue = isControlled ? controlledValue : internalValue;

    const handleChange = (val: string) => {
      if (!isControlled) {
        setInternalValue(val);
      }
      onChange?.(val);
    };

    return (
      <div ref={ref} className={clsx("space-y-3", className)} {...props}>
        {label ? (
          <fieldset>
            <legend className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              {label}
              {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
            </legend>
            {description && (
              <p className="text-sm text-[var(--text-secondary)] mb-2">{description}</p>
            )}
            <div
              role="radiogroup"
              aria-label={label}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? `${groupId}-error` : undefined}
              className={clsx(orientation === "horizontal" ? "flex flex-wrap gap-4" : "space-y-2")}
            >
              {options.map((option) => (
                <label
                  key={option.value}
                  className={clsx(
                    "flex items-center gap-2 cursor-pointer select-none transition-colors",
                    orientation === "horizontal" ? "px-3 py-2" : ""
                  )}
                >
                  <input
                    type="radio"
                    name={name || groupId}
                    value={option.value}
                    checked={selectedValue === option.value}
                    onChange={() => handleChange(option.value)}
                    disabled={option.disabled}
                    required={required}
                    className={clsx(
                      "appearance-none w-4 h-4 rounded-full border-2 transition-all duration-150 cursor-pointer",
                      "bg-[var(--bg-secondary)] border-[var(--border-primary)]",
                      "checked:border-primary checked:bg-primary",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      error && "border-error"
                    )}
                  />
                  <span className={clsx("font-medium text-[var(--text-primary)]", option.disabled && "opacity-50")}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
            {error && (
              <p id={`${groupId}-error`} className="text-xs text-error mt-1.5" role="alert">
                {error}
              </p>
            )}
          </fieldset>
        ) : null}
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";
