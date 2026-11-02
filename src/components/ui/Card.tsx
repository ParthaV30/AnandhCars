"use client";

import { HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "default" | "sm" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, variant = "default", padding = "default", ...props }, ref) => {
    const variants = {
      default: "bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-[var(--shadow-card)]",
      elevated: "bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-[var(--shadow-elevated)]",
      outlined: "bg-transparent border border-[var(--border-primary)] shadow-none",
    };

    const paddings = {
      none: "",
      default: "p-6",
      sm: "p-4",
      lg: "p-8",
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "rounded-2xl transition-all duration-200",
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx("px-6 py-4 border-b border-[var(--border-primary)]", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={clsx("text-lg font-semibold text-[var(--text-primary)]", className)}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={clsx("text-sm text-[var(--text-secondary)] mt-1", className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = "CardDescription";

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx("p-6", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = "CardBody";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx("px-6 py-4 border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)] rounded-b-2xl flex items-center gap-3", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";

export type { CardProps };