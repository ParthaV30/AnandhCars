"use client";

import { createContext, useContext, useState, ReactNode, HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface TabsContextValue {
  activeTab: string;
  onTabChange: (value: string) => void;
  variant?: "default" | "underline" | "pills";
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within Tabs.Root");
  }
  return context;
}

interface TabsRootProps {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  variant?: "default" | "underline" | "pills";
  children: ReactNode;
  className?: string;
}

export const TabsRoot = ({
  defaultValue = "",
  value,
  onChange,
  onValueChange,
  variant = "default",
  children,
  className,
}: TabsRootProps) => {
  const [activeTab, setActiveTab] = useState(value !== undefined ? value : defaultValue);
  const currentTab = value !== undefined ? value : activeTab;

  const handleTabChange = (newValue: string) => {
    if (value === undefined) {
      setActiveTab(newValue);
    }
    onChange?.(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab: currentTab, onTabChange: handleTabChange, variant }}>
      <div className={clsx("space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  ariaLabel?: string;
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ariaLabel = "Tabs", ...props }, ref) => {
    const { variant } = useTabsContext();

    const variants = {
      default: "bg-[var(--bg-tertiary)] p-1 rounded-xl",
      underline: "border-b border-[var(--border-primary)] pb-0",
      pills: "gap-1",
    };

    return (
      <div
        ref={ref}
        role="tablist"
        aria-label={ariaLabel}
        className={clsx("flex", variants[variant || "default"], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsList.displayName = "TabsList";

interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, icon, children, ...props }, ref) => {
    const { activeTab, onTabChange, variant } = useTabsContext();
    const isActive = activeTab === value;

    const baseStyles = "flex items-center justify-center gap-2 font-medium text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      default: clsx(
        baseStyles,
        "rounded-lg px-4 py-2",
        isActive
          ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm"
          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
      ),
      underline: clsx(
        baseStyles,
        "rounded-none px-2 py-3 -mb-px border-b-2",
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-primary)]"
      ),
      pills: clsx(
        baseStyles,
        "rounded-xl px-4 py-2",
        isActive
          ? "bg-primary text-primary-foreground shadow-[var(--shadow-primary)]"
          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
      ),
    };

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${value}`}
        id={`tab-${value}`}
        tabIndex={isActive ? 0 : -1}
        disabled={disabled}
        onClick={() => !disabled && onTabChange(value)}
        className={clsx(variants[variant || "default"], className)}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);

TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { activeTab } = useTabsContext();
    const isActive = activeTab === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`panel-${value}`}
        aria-labelledby={`tab-${value}`}
        tabIndex={0}
        className={clsx("animate-fade-in", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = "TabsContent";

// Compound component exports
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});

export type { TabsRootProps, TabsListProps, TabsTriggerProps, TabsContentProps };