"use client";

import { HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "warning" | "error" | "neutral" | "accent" | "info";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  icon?: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", size = "md", dot, icon, children, ...props }, ref) => {
    const variants = {
      primary: "bg-primary-light text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
      success: "bg-success-light text-success-700 dark:bg-success-900/30 dark:text-success-300",
      warning: "bg-warning-light text-warning-700 dark:bg-warning-900/30 dark:text-warning-300",
      error: "bg-error-light text-error-700 dark:bg-error-900/30 dark:text-error-300",
      neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300",
      accent: "bg-accent-light text-accent-700 dark:bg-accent-900/30 dark:text-accent-300",
      info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-0.5 text-xs",
      lg: "px-3 py-1 text-sm",
    };

    return (
      <span
        ref={ref}
        className={clsx(
          "inline-flex items-center gap-1.5 font-medium rounded-full",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />}
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export type { BadgeProps };