"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { DataTable, Column } from "../../components/DataTable";
import { Modal } from "../../components/Modal";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { FormInput } from "../../components/FormInput";
import { Tag } from "../../types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";



import useSWR from "swr";
import { fetcher, tagApi } from "../../lib/services";

const tagSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required"),
});

type FormValues = z.infer<typeof tagSchema>;

export default function TagsPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, error, mutate, isLoading } = useSWR<Tag[]>(tagApi.getAll(), fetcher);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(tagSchema)
  });

  const columns: Column<Tag>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Slug", accessorKey: "slug" },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(item)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-primary"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(item.id)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const handleCreate = () => {
    reset();
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setValue("name", tag.name);
    setValue("slug", tag.slug);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await tagApi.delete(deletingId);
      mutate();
      toast.success("Tag deleted");
      setIsConfirmOpen(false);
      setDeletingId(null);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete tag");
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingId) {
        await tagApi.update(editingId, values);
        toast.success("Tag updated");
      } else {
        await tagApi.create(values);
        toast.success("Tag created");
      }
      mutate();
      setIsModalOpen(false);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to save tag");
    }
  };

  const filteredData = (data || []).filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
        <p className="text-muted-foreground">Manage blog tags.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8 text-muted-foreground animate-pulse">Loading tags...</div>
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          onSearch={setSearch}
          actions={
            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground h-9 px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" /> Create Tag
            </button>
          }
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Tag" : "Create Tag"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="Name"
            {...register("name")}
            error={errors.name?.message}
          />
          <FormInput
            label="Slug"
            {...register("slug")}
            error={errors.slug?.message}
          />
          <div className="flex justify-end pt-4 space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {editingId ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onConfirmDelete}
        title="Delete Tag"
        description="Are you sure you want to delete this tag? This action cannot be undone."
      />
    </div>
  );
}
