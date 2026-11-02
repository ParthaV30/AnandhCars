"use client";

import { useSession, signOut } from "next-auth/react";
import { clsx } from "clsx";
import { Menu, User, LogOut, Bell, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Role } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/DropdownMenu";
import { Badge } from "@/components/ui/Badge";

interface HeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
}

const roleLabels: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  BILLING_STAFF: "Billing Staff",
  ACCOUNTANT: "Accountant",
  INVENTORY_MANAGER: "Inventory Manager",
  SERVICE_ADVISOR: "Service Advisor",
  BRANCH_MANAGER: "Branch Manager",
};

export function Header({ onMenuClick, sidebarCollapsed }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user as ExtendedUser | undefined;
  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <header
      className={clsx(
        "fixed top-0 right-0 z-[var(--z-sticky)] h-16 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] transition-all duration-300 backdrop-blur-sm bg-[var(--bg-secondary)]/80",
        sidebarCollapsed ? "left-20" : "left-64"
      )}
      role="banner"
    >
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left side - Menu button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="btn-ghost btn-icon-sm lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Right side - Notifications, User menu */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger aria-label="Notifications" className="btn-ghost btn-icon">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto p-2">
                <div className="px-2 py-4 text-center text-[var(--text-muted)] text-sm">
                  No notifications
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-1 rounded-xl hover:bg-[var(--bg-hover)] transition-colors">
              <Avatar fallback={user?.name || "U"} size="sm" src={user?.image || undefined} />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:block">
                  {user?.name}
                </span>
              )}
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 border-b border-[var(--border-primary)]">
                <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
                <Badge variant="primary" size="sm" className="mt-1">
                  {roleLabels[user?.role || "BILLING_STAFF"]}
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem icon={<LogOut className="w-4 h-4" />} onSelect={() => signOut({ callbackUrl: "/auth/login" })}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}