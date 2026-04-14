"use client";

import { useState } from "react";
import { Edit2 } from "lucide-react";
import { DataTable, Column } from "../../components/DataTable";
import { User } from "../../types";
import { isAdminOrSuperAdmin } from "../../lib/auth";
import { toast } from "sonner";

import useSWR from "swr";
import { fetcher, userApi } from "../../lib/services";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const canManage = isAdminOrSuperAdmin();

  const { data, isLoading } = useSWR<User[]>(userApi.getAll(), fetcher);

  const columns: Column<User>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { 
      header: "Role", 
      accessorKey: "role",
      cell: (item) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          item.role === 'SuperAdmin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
          item.role === 'Admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
          item.role === 'Editor' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
          'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
        }`}>
          {item.role}
        </span>
      )
    },
    { header: "Joined", accessorKey: "createdAt" },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: () => (
        <div className="flex items-center space-x-2">
          {canManage && (
            <button
              onClick={() => toast.info("Edit user role functionality to be connected")}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-primary"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const filteredData = (data || []).filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage platform users and their roles.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8 text-muted-foreground animate-pulse">Loading users...</div>
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          onSearch={setSearch}
        />
      )}
    </div>
  );
}
