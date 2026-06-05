import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Tenant } from "../types";

interface TenantState {
  tenants: Tenant[];
  activeTenantId: string | null;
  activeIdentifier: string | null;  
  hasHydrated: boolean; // ← add
  setHasHydrated: (v: boolean) => void; // ← add
  setActiveTenantId: (id: string | null) => void;
  setActiveIdentifier: (identifier: string | null) => void; // ✅ NEW
  setTenants: (tenants: Tenant[]) => void;
  reset: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenants: [],
      activeTenantId: null,
      activeIdentifier: null,
      hasHydrated: false, // ← add
      setHasHydrated: (v) => set({ hasHydrated: v }), // ← add
      setActiveTenantId: (id) => set({ activeTenantId: id }),
      setActiveIdentifier: (identifier) => set({ activeIdentifier: identifier }), // ✅ NEW
      setTenants: (tenants) => set({ tenants }),
           // ✅ FIX: reset now clears activeIdentifier too — prevents stale tenant on logout
      reset: () => set({ tenants: [], activeTenantId: null, activeIdentifier: null }),
    }),
    { name: "tenant-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true); // ← fires after localStorage is read
      },
    }
    
  )
);