"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { useTenantStore } from "../../store/useTenantStore";
import useSWR from "swr"; // ✅ import useSWRConfig
import { fetcher, tenantApi } from "../../lib/services";
import { TenantItem } from "../../types";
import api from "../../lib/api";

export default function WorkspaceSwitcher() {
  // const { cache } = useSWRConfig(); // ← add this
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // ✅ FIX 1: Use correct store methods — setActiveTenantId (not setSelectedTenant)
const { activeTenantId, 
        setActiveTenantId, 
        setActiveIdentifier,
        setActiveApiKey,
        setTenants,
      } = useTenantStore();

  // ✅ NEW: fetch the tenant's active api key so requests can send x-api-key
  const loadApiKeyForTenant = async (tenantId: string) => {
    try {
      const res = await api.get("/apikeys", { headers: { TenantId: tenantId } });
      const keys = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const active = keys.find((k: any) => k.isActive) || keys[0];
      setActiveApiKey(active?.key || null);
    } catch {
      setActiveApiKey(null);
    }
  };
    
// const { mutate: mutateAll } = useSWRConfig();  
const { data } = useSWR(tenantApi.getAll(), fetcher);

// ✅ FIX: Memoize 'tenants' so it retains its reference across renders
  const tenants: TenantItem[] = useMemo(() => {
    return Array.isArray(data) ? data : (data?.data || []);
  }, [data]);

 // ✅ Now this will only trigger when the actual data contents update
  useEffect(() => {
    if (tenants.length > 0) {
      setTenants(tenants);
    }
  }, [tenants, setTenants]);

  // ✅ FIX 4: Derive label from store — shows selected tenant name dynamically
  const selectedTenant = tenants.find((t) => t.id === activeTenantId) ?? null;

    // ✅ Single handler that sets both UUID (for display) and identifier (for API)
  // const handleSelectTenant = (tenant: TenantItem) => {
    
  //   if (cache instanceof Map) cache.clear(); // ← add this
  //   setActiveTenantId(tenant.id);
  //   setActiveIdentifier(tenant.identifier || null); // ✅ sends "tech-blog" not UUID
  //   setOpen(false);
  //       mutateAll(                  // ← invalidates every SWR key in the app
  //     () => true,               // ← match ALL keys
  //     undefined,                // ← no optimistic data
  //     { revalidate: true }      // ← force fresh fetch on next visit
  //   );
  // };
 
  // const handleSelectAll = () => {
    
  //   if (cache instanceof Map) cache.clear(); // ← add this
  //   setActiveTenantId(null);
  //   setActiveIdentifier(null); // ✅ clear identifier → API gets no filter
  //   setOpen(false);
  //   mutateAll(() => true, undefined, { revalidate: true });
  // };
  
  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>

      {/* Trigger Button — ✅ FIX 4: shows selected tenant name, not hardcoded "All Workspaces" */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg
          border border-gray-200 dark:border-gray-800
          bg-white dark:bg-gray-950
          hover:bg-gray-50 dark:hover:bg-gray-800
          transition-all duration-150 text-sm font-medium
          text-gray-700 dark:text-gray-200 outline-none"
      >
        <Building2 size={14} className="text-indigo-500 flex-shrink-0" />
        <span className="max-w-[140px] truncate">
          {selectedTenant ? selectedTenant.name : "All Workspaces"}
        </span>
        <ChevronDown
          size={12}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <div
        className={`absolute left-0 mt-2 w-60 z-50
          transition-all duration-200 ease-out origin-top-left
          ${open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
          }`}
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden
            border border-gray-200 dark:border-gray-800
            shadow-xl shadow-black/10 dark:shadow-black/40">

          {/* Header */}
          <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Switch Workspace
            </p>
          </div>

          <div className="p-1.5 space-y-0.5 max-h-64 overflow-y-auto">

            {/* ✅ All Workspaces option — highlighted when activeTenantId is null */}
            <button
              onClick={() => { setActiveTenantId(null); setActiveIdentifier(null); setActiveApiKey(null); setOpen(false); }}
              className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg
                text-sm transition-colors duration-100 text-left
                ${activeTenantId === null
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
            >
              <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50
                  flex items-center justify-center flex-shrink-0">
                <Building2 size={13} className="text-indigo-500" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">All Workspaces</p>
                <p className="text-[10px] text-gray-400">View all tenant data</p>
              </div>
              {activeTenantId === null && (
                <Check size={13} className="text-indigo-500 flex-shrink-0" />
              )}
            </button>

            {/* ✅ FIX 5: Dynamic tenant list from API */}
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => { setActiveTenantId(tenant.id); setActiveIdentifier(tenant.identifier || tenant.domain || tenant.slug || null); loadApiKeyForTenant(tenant.id); setOpen(false); }}
                className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg
                  text-sm transition-colors duration-100 text-left
                  ${activeTenantId === tenant.id
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center
                  flex-shrink-0 text-xs font-bold uppercase
                  ${activeTenantId === tenant.id
                    ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {tenant.name.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{tenant.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {tenant.identifier ||tenant.domain || tenant.slug || "—"}
                  </p>
                </div>
                {activeTenantId === tenant.id && (
                  <Check size={13} className="text-indigo-500 flex-shrink-0" />
                )}
              </button>
            ))}

            {/* Empty state */}
            {tenants.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-3 px-2">
                No tenants found
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}