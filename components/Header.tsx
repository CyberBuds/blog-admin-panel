"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, User as UserIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useState } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-background/80 dark:bg-background/60 backdrop-blur-md border-b border-white/10 dark:border-slate-800/60 sticky top-0 z-30 shadow-sm transition-all">
      <div className="flex items-center gap-4">
        {/* Intentionally left blank for expansion */}
      </div>

      <div className="flex items-center gap-5">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all hover:scale-105 active:scale-95 text-foreground"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5 fill-slate-700 dark:fill-slate-300" />}
          </button>
        )}

        <div className="flex items-center gap-3 pl-5 border-l border-border h-8">
          <div className="text-right hidden md:flex flex-col justify-center">
            <p className="text-sm font-semibold text-foreground leading-tight">{user?.name || "Admin"}</p>
            <p className="text-xs text-muted-foreground opacity-80 leading-tight">{user?.role || "Admin"}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white shadow-sm shadow-primary/20 ring-2 ring-background">
            <UserIcon className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
