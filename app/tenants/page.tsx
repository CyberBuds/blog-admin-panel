"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, ExternalLink } from "lucide-react";
import { DataTable, Column } from "../../components/DataTable";
import { Tenant } from "../../types";
import { isSuperAdmin } from "../../lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "../../components/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput } from "../../components/FormInput";



import useSWR from "swr";
import { fetcher, tenantApi } from "../../lib/services";

const tenantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  domain: z.string().optional(),
});

type FormValues = z.infer<typeof tenantSchema>;

export default function TenantsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(tenantSchema)
  });

  const { data, mutate, isLoading } = useSWR<Tenant[]>(
    isSuperAdmin() ? tenantApi.getAll() : null, 
    fetcher
  );

  useEffect(() => {
    setMounted(true);
    if (!isSuperAdmin()) {
      toast.error("Unauthorized access to Super Admin area.");
      router.push("/");
    }
  }, [router]);

  if (!mounted || !isSuperAdmin()) return null;

  const handleCreate = () => {
    reset();
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingId(tenant.id);
    setValue("name", tenant.name);
    setValue("domain", tenant.domain || "");
    setIsModalOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingId) {
        await tenantApi.update(editingId, values);
        toast.success("Tenant updated");
      } else {
        await tenantApi.create(values);
        toast.success("Tenant created");
      }
      mutate();
      setIsModalOpen(false);
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to save tenant");
    }
  };

  const columns: Column<Tenant>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Tenant ID", accessorKey: "id", cell: (item) => <span className="font-mono text-sm text-muted-foreground">{item.id}</span> },
    { header: "Domain", accessorKey: "domain", cell: (item) => (
      item.domain ? (
        <a href={`https://${item.domain}`} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
          {item.domain} <ExternalLink className="h-3 w-3" />
        </a>
      ) : <span className="text-muted-foreground italic">None</span>
    )},
    { header: "Status", accessorKey: "isActive", cell: (item) => (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
        {item.isActive ? "Active" : "Inactive"}
      </span>
    )},
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item) => (
        <div className="flex items-center space-x-2">
          <button onClick={() => handleEdit(item)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-primary">
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tenants (Super Admin)</h1>
          <p className="text-muted-foreground">Manage isolated tenants across the system.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8 text-muted-foreground animate-pulse">Loading tenants...</div>
      ) : (
        <DataTable
          data={(data || []).filter(t => t.name.toLowerCase().includes(search.toLowerCase()))}
          columns={columns}
          onSearch={setSearch}
          actions={
            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground h-9 px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" /> New Tenant
            </button>
          }
        />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Tenant" : "Create Tenant"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput label="Name" {...register("name")} error={errors.name?.message} />
          <FormInput label="Custom Domain (optional)" {...register("domain")} error={errors.domain?.message} />
          <div className="flex justify-end pt-4 space-x-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="inline-flex h-9 items-center border border-border bg-transparent px-4 py-2 hover:bg-slate-100 rounded-md text-sm font-medium">Cancel</button>
            <button type="submit" className="inline-flex h-9 items-center bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
