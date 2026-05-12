"use client";

import { useRef, useState, useEffect } from "react";
import {
  User, KeyRound, Moon, Sun,
  Settings, LogOut, ChevronDown, Shield, Bell, X
} from "lucide-react";
import { useTheme } from "next-themes";
import Avatar from "./Avatar";

const adminUser = {
  name: "Super Admin",
  email: "admin@system.com",
  role: "SuperAdmin",
  initials: "SA",
  avatarUrl: null as string | null,
};

const notifications = [
  { id: 1, title: "New user registered", desc: "john@example.com joined", time: "2m ago", read: false },
  { id: 2, title: "New blog post published", desc: '"Top 10 AI Tools" is live', time: "1h ago", read: false },
  { id: 3, title: "Comment flagged", desc: "A comment needs review", time: "3h ago", read: true },
  { id: 4, title: "Server backup complete", desc: "Daily backup successful", time: "5h ago", read: true },
];

function TogglePill({ on }: { on: boolean }) {
  return (
    <span className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${on ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"}`}>
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

// ── Notification Bell ──────────────────────────────────────────────────────
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(notifications);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white transition-colors duration-150"
      >
        <Bell size={16} strokeWidth={2} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-950 text-white text-[9px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      <div className={`absolute right-0 mt-2 w-80 z-50 transition-all duration-200 ease-out origin-top-right ${
        open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
      }`}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl shadow-black/10 dark:shadow-black/40">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={() => setNotifs(prev => prev.map(n => ({ ...n, read: true })))}
                className="text-[11px] text-indigo-500 hover:text-indigo-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
            {notifs.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">No notifications</div>
            ) : notifs.map(n => (
              <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${!n.read ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{n.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{n.desc}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                </div>
                <button
                  onClick={() => setNotifs(prev => prev.filter(x => x.id !== n.id))}
                  className="text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 flex-shrink-0 mt-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 text-center">
            <button className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">
              View all notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Profile Dropdown ───────────────────────────────────────────────────────
export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/70 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <Avatar name={adminUser.name} avatarUrl={adminUser.avatarUrl} initials={adminUser.initials} size={30} />
        <div className="hidden md:block text-left leading-tight">
          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[130px]">
            {adminUser.email}
          </p>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold flex items-center gap-1">
            <Shield size={9} strokeWidth={2.5} />
            {adminUser.role}
          </p>
        </div>
        <ChevronDown size={13} strokeWidth={2.5}
          className={`text-gray-400 dark:text-gray-500 hidden md:block transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div className={`absolute right-0 mt-2 w-72 z-50 transition-all duration-200 ease-out origin-top-right ${
        open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
      }`}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl shadow-black/10 dark:shadow-black/40">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Avatar name={adminUser.name} avatarUrl={adminUser.avatarUrl} initials={adminUser.initials} size={44} />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-gray-900" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{adminUser.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{adminUser.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                <Shield size={9} strokeWidth={2.5} />
                {adminUser.role}
              </span>
            </div>
          </div>

          {/* Menu Items */}
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

          {/* Sign Out */}
          <div className="px-2 pb-2">
            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-1" />
            <MenuItem icon={LogOut} label="Sign Out" variant="danger" onClick={() => setOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}