"use client";

import { useRef, useState, useEffect } from "react";
import {
  User, KeyRound, Moon, Sun,
  Settings, LogOut, ChevronDown, Shield,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "../../store/useAuthStore";
import { useTenantStore } from "../../store/useTenantStore";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";

function TogglePill({ on }: { on: boolean }) {
  return (
    <span className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors duration-200 ${on ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"}`}>
      <span className={`inline-block w-3.5 h-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </span>
  );
}

function MenuItem({
  icon: Icon, label, onClick, variant = "default", rightSlot,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  variant?: "default" | "danger";
  rightSlot?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-2 py-2.5 rounded-lg transition-colors duration-100 outline-none text-left ${
        variant === "danger"
          ? "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <span className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 flex-shrink-0">
        <Icon size={14} strokeWidth={2} />
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {rightSlot}
    </button>
  );
}

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { user, logout } = useAuthStore();
  const { reset } = useTenantStore();

  const handleSignOut = () => {
    logout();
    reset();
    router.push("/");
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  const name = user.name ?? "";
  const initials = user.initials || name.slice(0, 2).toUpperCase() || "";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/70 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-150 outline-none"
      >
        <Avatar name={name} avatarUrl={user.avatarUrl} initials={initials} size={30} />
        <div className="hidden md:block text-left leading-tight">
          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[130px]">
            {user.email}
          </p>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold flex items-center gap-1">
            <Shield size={9} strokeWidth={2.5} />
            {user.role}
          </p>
        </div>
        <ChevronDown size={13} strokeWidth={2.5} className={`text-gray-400 dark:text-gray-500 hidden md:block transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <div className={`absolute right-0 mt-2 w-72 z-50 transition-all duration-200 ease-out origin-top-right ${open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"}`}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl shadow-black/10 dark:shadow-black/40">
          <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Avatar name={name} avatarUrl={user.avatarUrl} initials={initials} size={44} />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-gray-900" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                <Shield size={9} strokeWidth={2.5} />
                {user.role}
              </span>
            </div>
          </div>

          <div className="p-2 space-y-0.5">
            <MenuItem icon={User} label="My Profile" onClick={() => setOpen(false)} />
            <MenuItem icon={KeyRound} label="Change Password" onClick={() => setOpen(false)} />
            <MenuItem
              icon={isDark ? Sun : Moon}
              label={isDark ? "Light Mode" : "Dark Mode"}
              onClick={() => setTheme(isDark ? "light" : "dark")}
              rightSlot={<TogglePill on={isDark} />}
            />
            <MenuItem icon={Settings} label="Settings" onClick={() => setOpen(false)} />
          </div>

          <div className="px-2 pb-2">
            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-1" />
            <MenuItem icon={LogOut} label="Sign Out" variant="danger" onClick={handleSignOut} />
          </div>
        </div>
      </div>
    </div>
  );
}