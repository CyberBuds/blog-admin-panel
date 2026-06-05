"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import { DataTable, Column } from "../../components/DataTable";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EditModal } from "../../components/EditModal";
import { Comment, Blog } from "../../types";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher, commentApi, blogApi } from "../../lib/services";
import { useTenantStore } from "../../store/useTenantStore";

export default function CommentsPage() {
  const [search, setSearch] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [blogId, setBlogId] = useState("");
  //  const [email, setEmail] = useState(""); // ✅ added email state
  const [saving, setSaving] = useState(false);
  // Blog filter — null means "not selected yet"
  const [selectedBlogId, setSelectedBlogId] = useState<string>("all");

const { activeTenantId, hasHydrated } = useTenantStore();

 useEffect(() => {
    setSelectedBlogId("all");
  }, [activeTenantId]);
 
  // Fetch blogs for the tenant
  const { data: blogsResponse } = useSWR(
    blogApi.getAll(activeTenantId), fetcher
  );
  const blogs: Blog[] = Array.isArray(blogsResponse)
   ? blogsResponse
    : (blogsResponse?.data || []); 

  // ✅ FIX: Auto-select first blog when blogs load
  // Backend REQUIRES blogId — never send request without it
  useEffect(() => {
    if (blogs.length > 0 && selectedBlogId === "all") {
      setSelectedBlogId(blogs[0].id);
    }
  }, [blogs, selectedBlogId]);

  // ✅ FIX: Only fetch comments when a specific blogId is selected
  // commentApi.getAll returns null when blogId is missing → SWR won't fetch
  // AFTER
// AFTER
const { data: commentsResponse, mutate, isLoading } = useSWR(
  hasHydrated && activeTenantId && selectedBlogId !== "all"
    ? ["comments", activeTenantId, selectedBlogId]
    : null,
  () => commentApi.getAll(activeTenantId, selectedBlogId) // ✅ UUID instead of slug
);
  const comments: Comment[] = Array.isArray(commentsResponse)
    ? commentsResponse
    : (commentsResponse?.data || []);

  const filtered = comments.filter(c =>
    c.content?.toLowerCase().includes(search.toLowerCase()) ||
    c.authorName?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleApprove = async (id: string, current: boolean) => {
    try {
      if (current) await commentApi.unapprove(id);
      else await commentApi.approve(id);
      mutate();
      toast.success(current ? "Comment unapproved" : "Comment approved");
    } catch { toast.error("Failed to update comment"); }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await commentApi.create({ authorName: author, content, blogId }); // ✅ pass email
      toast.success("Comment created");
      setIsCreateOpen(false);
      setAuthor(""); setContent(""); setBlogId("");
      mutate();
    } catch { toast.error("Failed to create comment"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await commentApi.delete(deletingId); mutate(); toast.success("Comment deleted");
    } catch { toast.error("Failed to delete comment"); }
    finally { setIsConfirmOpen(false); setDeletingId(null); }
  };

  const columns: Column<Comment>[] = [
    {
      header: "Author", accessorKey: "authorName",
      cell: (item) => <span className="font-medium">{item.authorName}</span>,
    },

    // {
    //   header: "Email", accessorKey: "authorEmail",
    //   cell: (item) => <span className="font-medium">{item.authorName}</span>,
    // },

    {
      header: "Comment", accessorKey: "content",
      cell: (item) => <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">{item.content}</span>,
    },
   
    {
      header: "Status", accessorKey: "isApproved",
      cell: (item) => (
        <button onClick={() => toggleApprove(item.id, item.isApproved)}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${item.isApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
          {item.isApproved ? <><CheckCircle size={10} /> Approved</> : <><XCircle size={10} /> Pending</>}
        </button>
      ),
    },
    { header: "Created At", accessorKey: "createdAt" },
    {
      header: "Actions", accessorKey: "actions",
      cell: (item) => (
        <button onClick={() => { setDeletingId(item.id); setIsConfirmOpen(true); }}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors text-red-500">
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const blogDropdown = (
    <div className="relative">
      <select value={selectedBlogId} onChange={(e) => setSelectedBlogId(e.target.value)}
        className="h-9 pl-3 pr-8 rounded-md border border-input bg-background text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 hover:bg-accent hover:text-accent-foreground transition-colors">
        <option value="all">All Blogs</option>
        {blogs.map((blog) => (
          <option key={blog.id} value={blog.id}>{blog.title}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );

  const formJSX = (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Author</label>
        <input value={author} onChange={(e) => setAuthor(e.target.value)} autoFocus
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Author name" />
      </div>
      <div>
        {/* <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Email</label> */}
         {/* <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Author email"
        /> */}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Blog</label>
        <select value={blogId} onChange={e => setBlogId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Select a blog</option>
          {blogs.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Comment</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
          placeholder="Write comment here..." />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
        <button onClick={handleCreate} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Comments</h1>
        <p className="text-muted-foreground">Moderate and manage comments.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8 text-muted-foreground animate-pulse">Loading...</div>
      ) : (
        <DataTable data={filtered} columns={columns} onSearch={setSearch}
          actions={
            <div className="flex items-center gap-2">
              {blogDropdown}
              <button onClick={() => { setAuthor(""); setContent(""); setBlogId(""); setIsCreateOpen(true); }}
                className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground h-9 px-4 text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="h-4 w-4" /> New Comment
              </button>
            </div>
          }
        />
      )}

      <EditModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Comment">{formJSX}</EditModal>
      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDelete} title="Delete Comment" description="Are you sure you want to delete this comment?" />
    </div>
  );
}