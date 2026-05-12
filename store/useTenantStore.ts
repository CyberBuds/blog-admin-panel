import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tenant } from '../types';

interface TenantState {
  tenants: Tenant[];
  activeTenantId: string | null;
  setActiveTenantId: (id: string | null) => void;
  setTenants: (tenants: Tenant[]) => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenants: [
        { id: 'tech-blog', name: 'Tech Blog', domain: 'techblog.com', isActive: true, createdAt: '2024-01-01' },
        { id: 'tenant-2', name: 'Acme Corp', domain: 'acme.com', isActive: true, createdAt: '2024-02-01' },
        { id: 'tenant-3', name: 'NewsDaily', domain: 'newsdaily.com', isActive: true, createdAt: '2024-03-01' },
      ],
      activeTenantId: 'tech-blog',  // ← set as default active
      setActiveTenantId: (id) => set({ activeTenantId: id }),
      setTenants: (tenants) => set({ tenants }),
    }),
    { name: 'tenant-store' }
  )
);