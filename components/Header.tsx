"use client";

import { useTheme } from "next-themes";
import { useAuthStore } from "../store/useAuthStore";
import { useTenantStore } from "../store/useTenantStore";
import { useEffect, useState, useRef } from "react";
import {
  Bell, X, Moon, Sun, Shield,
  User, KeyRound, Settings, LogOut, ChevronDown,
  Building2, Check, ChevronsUpDown,
} from "lucide-react";

// ── Notifications data ─────────────────────────────────────────
const INITIAL_NOTIFS = [
  { id: 1, title: "New user registered", desc: "john@example.com joined", time: "2m ago", read: false },
  { id: 2, title: "New blog post published", desc: '"Top 10 AI Tools" is live', time: "1h ago", read: false },
  { id: 3, title: "Comment flagged", desc: "A comment needs review", time: "3h ago", read: true },
  { id: 4, title: "Server backup complete", desc: "Daily backup successful", time: "5h ago", read: true },
];

// ── Avatar ─────────────────────────────────────────────────────
function Avatar({ name, initials, avatarUrl, size = 36 }: {
  name: string; initials: string; avatarUrl?: string | null; size?: number;
}) {
  const [imgError, setImgError] = useState(false);
  if (avatarUrl && !imgError) {
    return (
      <img src={avatarUrl} alt={name} onError={() => setImgError(true)}
        className="rounded-full object-cover ring-2 ring-indigo-500/30 ring-offset-1 dark:ring-offset-gray-950"
        style={{ width: size, height: size }} />
    );
  }
  return (
    <div style={{ width: size, height: size, fontSize: size * 0.35 }}
      className="rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold ring-2 ring-indigo-500/30 ring-offset-1 dark:ring-offset-gray-950 select-none tracking-wide flex-shrink-0">
      {initials}
    </div>
  );
}

// ── Toggle Pill ────────────────────────────────────────────────
function TogglePill({ on }: { on: boolean }) {
  return (
    <span className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${on ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"}`}>
      <span className={`inline-block w-3.5 h-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </span>
  );
}

// ── Menu Item ──────────────────────────────────────────────────
function MenuItem({ icon: Icon, label, onClick, variant = "default", rightSlot }: {
  icon: React.ElementType; label: string; onClick?: () => void;
  variant?: "default" | "danger"; rightSlot?: React.ReactNode;
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-3 w-full px-2 py-2.5 rounded-lg transition-colors duration-100 outline-none text-left ${
        variant === "danger"
          ? "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}>
      <span className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 flex-shrink-0">
        <Icon size={14} strokeWidth={2} />
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {rightSlot}
    </button>
  );
}

// ── Tenant initials avatar ─────────────────────────────────────
function TenantAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-rose-500 to-pink-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── Main Header ────────────────────────────────────────────────
export function Header() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const { tenants, activeTenantId, setActiveTenantId } = useTenantStore();
  const [mounted, setMounted] = useState(false);

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const notifRef = useRef<HTMLDivElement>(null);
  const unread = notifs.filter(n => !n.read).length;

  // Profile dropdown state
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Workspace dropdown state
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";

  const name = user?.name || "Super Admin";
  const role = user?.role || "SuperAdmin";
  const email = user?.email || "admin@system.com";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const activeTenant = tenants.find(t => t.id === activeTenantId) ?? null;

  useEffect(() => { setMounted(true); }, []);

  // Close all dropdowns on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (workspaceRef.current && !workspaceRef.current.contains(e.target as Node)) setWorkspaceOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const closeAll = () => { setNotifOpen(false); setProfileOpen(false); setWorkspaceOpen(false); };

  if (!mounted) return (
    <header className="h-16 flex items-center justify-end px-6 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-30" />
  );

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-background/80 dark:bg-background/60 backdrop-blur-md border-b border-white/10 dark:border-slate-800/60 sticky top-0 z-30 shadow-sm">

      <div /> {/* left side */}

      <div className="flex items-center gap-2">

        {/* ── Workspace Switcher ── */}
        <div className="relative" ref={workspaceRef}>
          <button
            onClick={() => { setWorkspaceOpen(v => !v); setNotifOpen(false); setProfileOpen(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/70 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 max-w-[200px]"
          >
            {activeTenant ? (
              <>
                <TenantAvatar name={activeTenant.name} />
                <div className="hidden md:block text-left leading-tight min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[110px]">
                    {activeTenant.name}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                    {activeTenant.domain ?? activeTenant.id}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <Building2 size={14} className="text-gray-400" />
                </div>
                <span className="hidden md:block text-xs font-medium text-gray-500 dark:text-gray-400">
                  All Workspaces
                </span>
              </>
            )}
            <ChevronsUpDown size={12} strokeWidth={2.5}
              className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
          </button>

          {/* Workspace Dropdown */}
          <div className={`absolute left-0 mt-2 w-72 z-50 transition-all duration-200 ease-out origin-top-left ${
            workspaceOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
          }`}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl shadow-black/10 dark:shadow-black/40">

              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Switch Workspace
                </p>
              </div>

              {/* All Workspaces option */}
              <div className="p-2">
                <button
                  onClick={() => { setActiveTenantId(null); setWorkspaceOpen(false); }}
                  className={`flex items-center gap-3 w-full px-2 py-2.5 rounded-lg transition-colors duration-100 text-left ${
                    activeTenantId === null
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0">
                    <Building2 size={13} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">All Workspaces</p>
                    <p className="text-[10px] text-gray-400">View all tenant data</p>
                  </div>
                  {activeTenantId === null && <Check size={14} className="text-indigo-500 flex-shrink-0" />}
                </button>

                {/* Divider */}
                <div className="border-t border-gray-100 dark:border-gray-800 my-1.5" />

                {/* Tenant list */}
                <div className="space-y-0.5 max-h-56 overflow-y-auto">
                  {tenants.map(tenant => (
                    <button
                      key={tenant.id}
                      onClick={() => { setActiveTenantId(tenant.id); setWorkspaceOpen(false); }}
                      className={`flex items-center gap-3 w-full px-2 py-2.5 rounded-lg transition-colors duration-100 text-left ${
                        activeTenantId === tenant.id
                          ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <TenantAvatar name={tenant.name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold truncate">{tenant.name}</p>
                          {!tenant.isActive && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-400 flex-shrink-0">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 truncate">
                          {tenant.domain ?? tenant.id}
                        </p>
                      </div>
                      {activeTenantId === tenant.id && (
                        <Check size={14} className="text-indigo-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer — shows active tenant ID */}
              {activeTenantId && (
                <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-[10px] text-gray-400 font-mono truncate">
                    ID: {activeTenantId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* ── Notification Bell ── */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => { setNotifOpen(v => !v); closeAll(); setNotifOpen(v => !v); }}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white transition-colors">
            <Bell size={16} strokeWidth={2} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-950 text-white text-[9px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          <div className={`absolute right-0 mt-2 w-80 z-50 transition-all duration-200 ease-out origin-top-right ${
            notifOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
          }`}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl shadow-black/10 dark:shadow-black/40">
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
                  <button onClick={() => setNotifs(p => p.map(n => ({ ...n, read: true })))}
                    className="text-[11px] text-indigo-500 hover:text-indigo-700 font-medium">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                {notifs.length === 0
                  ? <div className="py-8 text-center text-sm text-gray-400">No notifications</div>
                  : notifs.map(n => (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${!n.read ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{n.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{n.desc}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                      </div>
                      <button onClick={() => setNotifs(p => p.filter(x => x.id !== n.id))}
                        className="text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 flex-shrink-0 mt-0.5">
                        <X size={12} />
                      </button>
                    </div>
                  ))
                }
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 text-center">
                <button className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Profile Dropdown ── */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); setWorkspaceOpen(false); }}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/70 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            <Avatar name={name} initials={initials} avatarUrl={user?.avatarUrl ?? null} size={30} />
            <div className="hidden md:block text-left leading-tight">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[130px]">{email}</p>
              <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold flex items-center gap-1">
                <Shield size={9} strokeWidth={2.5} />{role}
              </p>
            </div>
            <ChevronDown size={13} strokeWidth={2.5}
              className={`text-gray-400 dark:text-gray-500 hidden md:block transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          <div className={`absolute right-0 mt-2 w-72 z-50 transition-all duration-200 ease-out origin-top-right ${
            profileOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
          }`}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl shadow-black/10 dark:shadow-black/40">
              <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="relative">
                  <Avatar name={name} initials={initials} avatarUrl={user?.avatarUrl ?? null} size={44} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-gray-900" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{email}</p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                    <Shield size={9} strokeWidth={2.5} />{role}
                  </span>
                </div>
              </div>
              <div className="p-2 space-y-0.5">
                <MenuItem icon={User} label="My Profile" onClick={() => setProfileOpen(false)} />
                <MenuItem icon={KeyRound} label="Change Password" onClick={() => setProfileOpen(false)} />
                <MenuItem
                  icon={isDark ? Sun : Moon}
                  label={isDark ? "Light Mode" : "Dark Mode"}
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  rightSlot={<TogglePill on={isDark} />}
                />
                <MenuItem icon={Settings} label="Settings" onClick={() => setProfileOpen(false)} />
              </div>
              <div className="px-2 pb-2">
                <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-1" />
                <MenuItem icon={LogOut} label="Sign Out" variant="danger" onClick={() => setProfileOpen(false)} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}