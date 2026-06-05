"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { DataTable, Column } from "../../components/DataTable";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Blog } from "../../types";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher, blogApi } from "../../lib/services";
import { useTenantStore } from "../../store/useTenantStore"; // ✅ ADD THIS



export default function BlogsPage() {
  const [search, setSearch] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  
// ✅ FIX: also read hasHydrated — prevents fetching before localStorage is read
  const { activeIdentifier, hasHydrated } = useTenantStore();

 const { data: blogsResponse, mutate, isLoading } = useSWR(
    hasHydrated ? blogApi.getAll(activeIdentifier) : null,
    fetcher
  );
  
  
  // ✅ FIX: Backend returns flat [] — handle both shapes
  const allBlogs: Blog[] = Array.isArray(blogsResponse)
    ? blogsResponse
    : (blogsResponse?.data || []);

  // ✅ Only ONE filteredData line
  const filteredData = allBlogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const togglePublish = async (id: string, current: boolean) => {
    try {
      if (current) {
        await blogApi.unpublish(id);
      } else {
        await blogApi.publish(id);
      }
      mutate();
      toast.success(current ? "Blog unpublished" : "Blog published");
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to update publish status");
    }
  };

  const deleteBlog = async () => {
    if (!deletingId) return;
    try {
      await blogApi.delete(deletingId);
      mutate();
      toast.success("Blog deleted");
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to delete blog");
    } finally {
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const columns: Column<Blog>[] = [
    { header: "Title", accessorKey: "title", cell: (item) => <span className="font-medium">{item.title}</span> },
    { 
      header: "Status", 
      accessorKey: "isPublished",
      cell: (item) => (
        <button 
          onClick={() => togglePublish(item.id, item.isPublished)}
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${
            item.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
          }`}
        >
          {item.isPublished ? "Published" : "Draft"}
        </button>
      )
    },
    { header: "Views", accessorKey: "views" },
    { header: "Likes", accessorKey: "likes" },
    { header: "Created At", accessorKey: "createdAt" },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item) => (
        <div className="flex items-center space-x-2">
          <Link href={`/blogs/edit/${item.id}`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-primary">
            <Edit2 className="h-4 w-4" />
          </Link>
          <button onClick={() => { setDeletingId(item.id); setIsConfirmOpen(true); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Blogs</h1>
        <p className="text-muted-foreground">Manage your blog posts here.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8 text-muted-foreground animate-pulse">Loading blogs...</div>
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          onSearch={setSearch}
          actions={
            <button
              onClick={() => router.push("/blogs/create")}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground h-9 px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" /> New Blog
            </button>
          }
        />
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={deleteBlog}
        title="Delete Blog Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
      />
    </div>
  );
}