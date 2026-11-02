"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Users,
  Car,
  Package,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Vehicles", href: "/vehicles", icon: Car },
  { name: "Parts & Services", href: "/items", icon: Package },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-[var(--z-fixed)] bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
      aria-label="Main navigation"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={clsx("flex items-center h-16 px-4 border-b border-[var(--border-primary)]", collapsed && "justify-center")}>
          <Link href="/dashboard" className="flex items-center gap-3" aria-label="Go to dashboard">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-xl text-[var(--text-primary)]">Orbenyx</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main menu">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary-light text-primary dark:bg-primary-900/30"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                  collapsed && "justify-center"
                )}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className={clsx("w-5 h-5 flex-shrink-0", isActive && "text-primary")} aria-hidden="true" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-[var(--border-primary)]">
          {!collapsed && (
            <div className="px-3 pb-2">
              <p className="text-xs text-[var(--text-muted)] text-center">
                Orbenyx Workshop Billing v1.0
              </p>
            </div>
          )}
          <button
            onClick={onToggle}
            className={clsx(
              "flex items-center justify-center w-full px-3 py-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors",
              collapsed && "mx-auto"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {!collapsed && session && (
            <div className="mt-3 pt-3 border-t border-[var(--border-primary)]">
              <button
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}