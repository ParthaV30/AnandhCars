"use client";

import { useState, ReactNode, HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
  skipDelayDuration?: number;
}

export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  delayDuration = 200,
  skipDelayDuration = 0,
  className,
  ...props
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [skipTimeoutId, setSkipTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (skipTimeoutId) {
      clearTimeout(skipTimeoutId);
      setSkipTimeoutId(null);
    }
    const id = setTimeout(() => {
      setOpen(true);
    }, delayDuration);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    const id = setTimeout(() => {
      setOpen(false);
    }, skipDelayDuration);
    setSkipTimeoutId(id);
  };

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  };

  const alignClasses = {
    start: side === "top" || side === "bottom" ? "-translate-x-0" : "-translate-y-0",
    center: side === "top" || side === "bottom" ? "-translate-x-1/2" : "-translate-y-1/2",
    end: side === "top" || side === "bottom" ? "-translate-x-full" : "-translate-y-full",
  };

  const arrowClasses = {
    top: "bottom-[-4px] left-1/2 -translate-x-1/2 rotate-45",
    right: "left-[-4px] top-1/2 -translate-y-1/2 rotate-45",
    bottom: "top-[-4px] left-1/2 -translate-x-1/2 rotate-45",
    left: "right-[-4px] top-1/2 -translate-y-1/2 rotate-45",
  };

  return (
    <div
      className={clsx("relative inline-flex", className)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      {...props}
    >
      {children}
      {open && (
        <div
          className={clsx(
            "fixed z-[var(--z-tooltip)] max-w-xs px-3 py-2 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg shadow-[var(--shadow-lg)] animate-fade-in pointer-events-none",
            sideClasses[side],
            alignClasses[align]
          )}
          role="tooltip"
        >
          {content}
          <div
            className={clsx(
              "absolute w-2 h-2 bg-neutral-900 dark:bg-neutral-100 rotate-45",
              arrowClasses[side]
            )}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}

export type { TooltipProps };