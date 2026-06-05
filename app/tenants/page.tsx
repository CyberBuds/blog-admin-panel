"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { DataTable, Column } from "../../components/DataTable";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EditModal } from "../../components/EditModal";
import { TenantItem } from "../../types";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher, tenantApi } from "../../lib/services";

export default function TenantsPage() { 
  const [search, setSearch] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<TenantItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

   // Tenants page = SuperAdmin only — always shows ALL tenants, no tenant filter needed
  const { data, mutate, isLoading } = useSWR(tenantApi.getAll(), fetcher);
 
  // ✅ FIX: Backend returns flat [] not { data: [] }
  const allTenants: TenantItem[] = Array.isArray(data) ? data : (data?.data || []);
  const filtered = allTenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  
  const openEdit = (item: TenantItem) => {
    setEditingItem(item);
    setName(item.name);
    setDomain(item.domain || "");
    setSlug(item.slug || "");
  };

  const openCreate = () => {
    setName(""); setDomain(""); setSlug("");
    setIsCreateOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingItem) {
        await tenantApi.update(editingItem.id, { name, domain, slug });
        toast.success("Tenant updated");
        setEditingItem(null);
      } else {
        await tenantApi.create({ name, domain, slug });
        toast.success("Tenant created");
        setIsCreateOpen(false);
      }
      mutate();
    } catch { toast.error("Failed to save tenant"); }
    finally { setSaving(false); }
  };

  const toggleActive = async (item: TenantItem) => {
    try {
      await tenantApi.toggleActive(item.id, !item.isActive);
      mutate();
      toast.success(item.isActive ? "Tenant deactivated" : "Tenant activated");
    } catch { toast.error("Failed to update status"); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await tenantApi.delete(deletingId);
      mutate();
      toast.success("Tenant deleted");
    } catch { toast.error("Failed to delete tenant"); }
    finally { setIsConfirmOpen(false); setDeletingId(null); }
  };

  const columns: Column<TenantItem>[] = [
    { header: "Name", accessorKey: "name", cell: (item) => <span className="font-medium">{item.name}</span> },
    { header: "Domain", accessorKey: "domain", cell: (item) => <span className="text-sm text-muted-foreground">{item.domain || "—"}</span> },
    { header: "Blogs", accessorKey: "blogCount", cell: (item) => <span>{item.blogCount ?? 0}</span> },
    { header: "Users", accessorKey: "userCount", cell: (item) => <span>{item.userCount ?? 0}</span> },
    {
      header: "Status", accessorKey: "isActive",
      cell: (item) => (
        <button onClick={() => toggleActive(item)}
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity
            ${item.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
          {item.isActive ? "Active" : "Inactive"}
        </button>
      )
    },
    { header: "Created At", accessorKey: "createdAt" },
    {
      header: "Actions", accessorKey: "actions",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(item)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-primary">
            <Edit2 className="h-4 w-4" />
          </button>
          <button onClick={() => { setDeletingId(item.id); setIsConfirmOpen(true); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  // ✅ Inline form JSX — no inner component
  const formJSX = (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Tenant name"
          autoFocus
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Domain</label>
        <input
          value={domain}
          onChange={e => setDomain(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="example.com"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Slug</label>
        <input
          value={slug}
          onChange={e => setSlug(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="tenant-slug"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={() => { setEditingItem(null); setIsCreateOpen(false); }}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tenants</h1>
        <p className="text-muted-foreground">Manage all tenants on the platform.</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center p-8 text-muted-foreground animate-pulse">Loading...</div>
      ) : (
        <DataTable data={filtered} columns={columns} onSearch={setSearch}
          actions={
            <button onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground h-9 px-4 text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" /> New Tenant
            </button>
          }
        />
      )}
      <EditModal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="Edit Tenant">
        {formJSX}
      </EditModal>
      <EditModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Tenant">
        {formJSX}
      </EditModal>
      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete} title="Delete Tenant"
        description="Are you sure? This will delete all tenant data permanently." />
    </div>
  );
}