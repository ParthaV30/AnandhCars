"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
  HTMLAttributes,
  forwardRef,
} from "react";
import { ChevronDown, Check } from "lucide-react";
import { clsx } from "clsx";

interface DropdownMenuContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("DropdownMenu components must be used within DropdownMenu.Root");
  }
  return context;
}

interface DropdownMenuRootProps {
  children: ReactNode;
}

export const DropdownMenuRoot = ({ children }: DropdownMenuRootProps) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <DropdownMenuContext.Provider
      value={{ open, onOpenChange: handleOpenChange, triggerRef, contentRef }}
    >
      {children}
    </DropdownMenuContext.Provider>
  );
};

interface DropdownMenuTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  "aria-label"?: string;
}

export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, children, "aria-label": ariaLabel, ...props }, ref) => {
    const { open, onOpenChange, triggerRef } = useDropdownMenuContext();

    return (
      <button
        ref={(el) => {
          triggerRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
        }}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => onOpenChange(!open)}
        className={clsx(
          "inline-flex items-center justify-center gap-1.5 font-medium text-sm rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:bg-[var(--bg-hover)]",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className={clsx("w-4 h-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
    );
  }
);

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: "start" | "end";
  sideOffset?: number;
}

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, children, align = "end", sideOffset = 4, ...props }, ref) => {
    const { open, contentRef } = useDropdownMenuContext();

    if (!open) return null;

    return (
      <div
        ref={(el) => {
          contentRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        role="menu"
        className={clsx(
          "fixed z-[var(--z-dropdown)] min-w-[180px] bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl shadow-[var(--shadow-xl)] py-1 animate-scale-in",
          align === "end" ? "right-0" : "left-0",
          className
        )}
        style={{ marginTop: sideOffset }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownMenuContent.displayName = "DropdownMenuContent";

interface DropdownMenuItemProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  inset?: boolean;
  disabled?: boolean;
  shortcut?: string;
  icon?: ReactNode;
  checked?: boolean;
  onSelect?: () => void;
}

export const DropdownMenuItem = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, children, inset, disabled, shortcut, icon, checked, onSelect, onClick, ...props }, ref) => {
    const { onOpenChange } = useDropdownMenuContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        onSelect?.();
        onClick?.(e);
        onOpenChange(false);
      }
    };

    return (
      <button
        ref={ref}
        role="menuitem"
        tabIndex={-1}
        disabled={disabled}
        onClick={handleClick}
        className={clsx(
          "w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:bg-[var(--bg-hover)]",
          inset && "pl-8",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0 w-4 h-4">{icon}</span>}
        {checked && <Check className="flex-shrink-0 w-4 h-4 text-primary" aria-hidden="true" />}
        <span className="flex-1 text-left">{children}</span>
        {shortcut && <span className="text-[var(--text-muted)] text-xs font-mono">{shortcut}</span>}
      </button>
    );
  }
);

DropdownMenuItem.displayName = "DropdownMenuItem";

type DropdownMenuSeparatorProps = HTMLAttributes<HTMLHRElement>;

export const DropdownMenuSeparator = forwardRef<HTMLHRElement, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        role="separator"
        className={clsx("h-px bg-[var(--border-primary)] my-1", className)}
        {...props}
      />
    );
  }
);

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

interface DropdownMenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  inset?: boolean;
}

export const DropdownMenuLabel = forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, children, inset, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx("px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider", inset && "pl-8", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownMenuLabel.displayName = "DropdownMenuLabel";

interface DropdownMenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const DropdownMenuGroup = forwardRef<HTMLDivElement, DropdownMenuGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx("", className)} {...props}>
        {children}
      </div>
    );
  }
);

DropdownMenuGroup.displayName = "DropdownMenuGroup";

// Compound component exports
export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Separator: DropdownMenuSeparator,
  Label: DropdownMenuLabel,
  Group: DropdownMenuGroup,
});

export type {
  DropdownMenuRootProps,
  DropdownMenuTriggerProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuSeparatorProps,
  DropdownMenuLabelProps,
  DropdownMenuGroupProps,
};