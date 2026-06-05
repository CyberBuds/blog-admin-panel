"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { DataTable, Column } from "../../components/DataTable";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EditModal } from "../../components/EditModal";
import { User, Role } from "../../types";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher, userApi } from "../../lib/services";
import { useTenantStore } from "../../store/useTenantStore";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<User | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("User");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const { activeIdentifier, hasHydrated } = useTenantStore();

  const { data, mutate, isLoading } = useSWR(
    hasHydrated ? userApi.getAll(activeIdentifier) : null,
    fetcher
  );

  const allUsers: User[] = Array.isArray(data) ? data : (data?.data || []);

  const filtered = allUsers.filter(u =>
    (u.username || u.name || u.email || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openEdit = (item: User) => {
    setEditingItem(item);
    setUsername(item.username || item.name || "");
    setEmail(item.email);
    setRole(item.role);
    setPassword("");
  };

  const openCreate = () => {
    setUsername(""); setEmail(""); setRole("User"); setPassword("");
    setIsCreateOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = password
        ? { username, email, role, password }
        : { username, email, role };

      if (editingItem) {
        await userApi.update(editingItem.id, payload);
        toast.success("User updated");
        setEditingItem(null);
      } else {
        await userApi.create(payload);
        toast.success("User created");
        setIsCreateOpen(false);
      }
      mutate();
    } catch {
      toast.error("Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await userApi.delete(deletingId);
      mutate();
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      SuperAdmin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      Admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      Editor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      User: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[role] || styles.User}`}>
        {role}
      </span>
    );
  };

  const columns: Column<User>[] = [
    {
      header: "Username", accessorKey: "username",
      cell: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {(item.username || item.name || item.email).charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{item.username || item.name || "—"}</span>
        </div>
      )
    },
    {
      header: "Email", accessorKey: "email",
      cell: (item) => <span className="text-sm text-muted-foreground">{item.email}</span>
    },
    {
      header: "Role", accessorKey: "role",
      cell: (item) => roleBadge(item.role)
    },
    {
      header: "Tenant", accessorKey: "tenantId",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.tenantId ? item.tenantId.slice(0, 8) + "..." : "Global"}
        </span>
      )
    },
    { header: "Created At", accessorKey: "createdAt" },
    {
      header: "Actions", accessorKey: "actions",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEdit(item)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-primary"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setDeletingId(item.id); setIsConfirmOpen(true); }}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const formJSX = (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Username</label>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="username"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="user@example.com"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Role</label>
        <select
          value={role}
          onChange={e => setRole(e.target.value as Role)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="User">User</option>
          <option value="Editor">Editor</option>
          <option value="Admin">Admin</option>
          <option value="SuperAdmin">SuperAdmin</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
          Password {editingItem && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="••••••••"
        />
      </div>
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
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage platform users.</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center p-8 text-muted-foreground animate-pulse">Loading...</div>
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          onSearch={setSearch}
          actions={
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground h-9 px-4 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" /> New User
            </button>
          }
        />
      )}
      <EditModal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="Edit User">
        {formJSX}
      </EditModal>
      <EditModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New User">
        {formJSX}
      </EditModal>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
}