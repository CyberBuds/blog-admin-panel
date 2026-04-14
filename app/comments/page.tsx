"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import { DataTable, Column } from "../../components/DataTable";
import { Comment } from "../../types";
import { toast } from "sonner";
import { ConfirmDialog } from "../../components/ConfirmDialog";



import useSWR from "swr";
import { fetcher, commentApi, blogApi } from "../../lib/services";
import { Blog } from "../../types";

export default function CommentsPage() {
  const [search, setSearch] = useState("");
  const [selectedBlogId, setSelectedBlogId] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch blogs to populate the dropdown
  const { data: blogs, isLoading: isBlogsLoading } = useSWR<Blog[]>(blogApi.getAll(), fetcher);

  // Fetch comments conditionally based on the chosen blog
  const { data, mutate, isLoading } = useSWR<Comment[]>(
    selectedBlogId ? commentApi.getByBlog(selectedBlogId) : null, 
    fetcher
  );

  // Auto-select the first blog if none is selected and blogs become available
  useEffect(() => {
    if (blogs && blogs.length > 0 && !selectedBlogId) {
      setSelectedBlogId(blogs[0].id);
    }
  }, [blogs, selectedBlogId]);

  const toggleApproval = async (id: string, isApproved: boolean) => {
    try {
      if (isApproved) {
        await commentApi.approve(id);
      } else {
        await commentApi.reject(id);
      }
      mutate();
      toast.success(isApproved ? "Comment approved" : "Comment rejected");
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to alter comment status");
    }
  };

  const deleteComment = async () => {
    if (!deletingId) return;
    try {
      await commentApi.delete(deletingId);
      mutate();
      toast.success("Comment deleted");
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to delete comment");
    } finally {
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const columns: Column<Comment>[] = [
    { header: "Author", accessorKey: "authorName", cell: (item) => (
      <div>
        <p className="font-medium">{item.authorName}</p>
        <p className="text-xs text-muted-foreground">{item.authorEmail}</p>
      </div>
    ) },
    { header: "Content", accessorKey: "content", cell: (item) => (
      <p className="max-w-md truncate" title={item.content}>{item.content}</p>
    )},
    { 
      header: "Status", 
      accessorKey: "isApproved",
      cell: (item) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          item.isApproved ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
        }`}>
          {item.isApproved ? "Approved" : "Pending"}
        </span>
      )
    },
    { header: "Date", accessorKey: "createdAt" },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item) => (
        <div className="flex items-center space-x-2">
          {!item.isApproved ? (
            <button onClick={() => toggleApproval(item.id, true)} className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition-colors text-emerald-500" title="Approve">
              <CheckCircle className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={() => toggleApproval(item.id, false)} className="p-2 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-md transition-colors text-amber-500" title="Reject">
              <XCircle className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => { setDeletingId(item.id); setIsConfirmOpen(true); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const filteredData = (data || []).filter(c => c.content.toLowerCase().includes(search.toLowerCase()) || c.authorName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comments Moderation</h1>
          <p className="text-muted-foreground">Approve, reject, or delete user comments on specific blogs.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Select Blog:</label>
          <select 
            value={selectedBlogId}
            onChange={(e) => setSelectedBlogId(e.target.value)}
            disabled={isBlogsLoading}
            className="flex h-10 rounded-md border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-[250px]"
          >
            <option value="">Choose a blog post...</option>
            {blogs?.map((b) => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedBlogId ? (
        <div className="flex justify-center p-8 text-muted-foreground">Select a blog post above to view comments.</div>
      ) : isLoading ? (
        <div className="flex justify-center p-8 text-muted-foreground animate-pulse">Loading comments...</div>
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          onSearch={setSearch}
        />
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={deleteComment}
        title="Delete Comment"
        description="Are you sure you want to delete this comment?"
      />
    </div>
  );
}
