"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";
import { isSuperAdmin } from "../lib/auth";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  Users,
  MessageSquare,
  Settings,
  BarChart3,
  LogOut
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const [superAdmin, setSuperAdmin] = useState(false);
   
  useEffect(() => {
    setSuperAdmin(isSuperAdmin());
  }, []);

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Blogs", href: "/blogs", icon: FileText },
    { name: "Categories", href: "/categories", icon: FolderTree },
    { name: "Tags", href: "/tags", icon: Tags },
    { name: "Users", href: "/users", icon: Users },
    { name: "Comments", href: "/comments", icon: MessageSquare },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    ...(superAdmin ? [{ name: "Tenants", href: "/tenants", icon: null }] : []), // ✅ icon removed
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-slate-50/50 dark:bg-slate-900/30 border-r border-border">
      <div className="flex h-16 items-center px-6 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-sm">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 bg-clip-text text-transparent">
            BlogOps
          </h1>
        </div>
      </div>
      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/');

          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg translate-x-1"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 hover:translate-x-0.5"
              )}
            >
              {Icon && ( // ✅ only renders icon if it exists
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    !isActive && "group-hover:scale-110"
                  )}
                />
              )}
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/60">
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:translate-x-0.5"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </div>
  );
}