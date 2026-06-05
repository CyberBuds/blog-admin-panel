"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { DataTable, Column } from "../../components/DataTable";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EditModal } from "../../components/EditModal";
import { Category } from "../../types";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher, categoryApi } from "../../lib/services";
import { useTenantStore } from "../../store/useTenantStore";

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

 // ✅ Use activeIdentifier for API calls
  const { activeIdentifier, hasHydrated } = useTenantStore();
  
  const { data, mutate, isLoading } = useSWR(
    hasHydrated ? categoryApi.getAll(activeIdentifier) : null,
    fetcher
  );

   // ✅ FIX: Backend returns flat [] — handle both shapes
  const allCategories: Category[] = Array.isArray(data)
    ? data
    : (data?.data || []);

  const filtered = allCategories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (item: Category) => {
    setEditingItem(item);
    setName(item.name); 
    setSlug(item.slug);
    setDescription(item.description || "");
  };

  const openCreate = () => {
    setName(""); setSlug(""); setDescription("");
    setIsCreateOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingItem) {
        await categoryApi.update(editingItem.id, { name, slug, description });
        toast.success("Category updated");
        setEditingItem(null);
      } else {
        await categoryApi.create({ name, slug, description });
        toast.success("Category created");
        setIsCreateOpen(false);
      }
      mutate();
    } catch { toast.error("Failed to save category"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await categoryApi.delete(deletingId);
      mutate(); toast.success("Category deleted");
    } catch { toast.error("Failed to delete category"); }
    finally { setIsConfirmOpen(false); setDeletingId(null); }
  };

  const columns: Column<Category>[] = [
    { header: "Name", accessorKey: "name", cell: (item) => <span className="font-medium">{item.name}</span> },
    { header: "Slug", accessorKey: "slug", cell: (item) => <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{item.slug}</code> },
    { header: "Blogs", accessorKey: "blogCount", cell: (item) => <span>{item.blogCount ?? 0}</span> },
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

  const formJSX = (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Category name"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Slug</label>
        <input
          value={slug}
          onChange={e => setSlug(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="category-slug"
        />
      </div>
      {/* Description field removed */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={() => { setEditingItem(null); setIsCreateOpen(false); }}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Manage your blog categories.</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center p-8 text-muted-foreground animate-pulse">Loading...</div>
      ) : (
        <DataTable data={filtered} columns={columns} onSearch={setSearch}
          actions={
            <button onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground h-9 px-4 text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" /> New Category
            </button>
          }
        />
      )}
      <EditModal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="Edit Category">{formJSX}</EditModal>
      <EditModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Category">{formJSX}</EditModal>
      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete} title="Delete Category" description="Are you sure you want to delete this category?" />
    </div>
  );
}