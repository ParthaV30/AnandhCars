"use client";

import * as React from "react";
import { HTMLAttributes, forwardRef, useState } from "react";
import { clsx } from "clsx";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  shape?: "circle" | "square";
}

const sizes = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
  "2xl": "w-24 h-24 text-2xl",
};

const shapes = {
  circle: "rounded-full",
  square: "rounded-xl",
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", shape = "circle", ...props }, ref) => {
    const [imageError, setImageError] = useState(false);

    if (src && !imageError) {
      return (
        <div
          ref={ref}
          className={clsx("inline-flex items-center justify-center overflow-hidden bg-[var(--bg-tertiary)]", sizes[size], shapes[shape], className)}
          {...props}
        >
          <img
            src={src}
            alt={alt || fallback || "Avatar"}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
            {...(alt ? {} : { "aria-hidden": true })}
          />
        </div>
      );
    }

    const initials = fallback
      ? fallback
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";

    const colorIndex = fallback
      ? fallback.charCodeAt(0) % 6
      : 0;

    const bgColors = [
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    ];

    return (
      <div
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center font-medium select-none",
          sizes[size],
          shapes[shape],
          bgColors[colorIndex],
          className
        )}
        {...props}
      >
        {initials}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarProps["size"];
  children: React.ReactNode;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 5, size = "md", children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    return (
      <div
        ref={ref}
        className={clsx("flex -space-x-2", className)}
        {...props}
      >
        {visibleChildren.map((child, index) => {
          if (!React.isValidElement(child)) return child;
          const childProps = child.props as { className?: string };
          return React.cloneElement(child as React.ReactElement<AvatarProps>, {
            key: child.key || index,
            size,
            className: clsx("ring-2 ring-[var(--bg-secondary)]", childProps?.className),
          });
        })}
        {remainingCount > 0 && (
          <div
            className={clsx(
              "inline-flex items-center justify-center font-medium select-none ring-2 ring-[var(--bg-secondary)] bg-[var(--bg-tertiary)] text-[var(--text-muted)]",
              sizes[size],
              shapes.circle
            )}
            aria-label={`${remainingCount} more`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";
