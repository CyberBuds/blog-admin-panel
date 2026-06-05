"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DataTable, Column } from "../../components/DataTable";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EditModal } from "../../components/EditModal";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher, mediaApi, blogApi } from "../../lib/services";
import { useTenantStore } from "../../store/useTenantStore";
import { Blog } from "../../types";

interface MediaItem {
  id: string;
  url?: string;
  fileName?: string;
  contentType?: string;
  size?: number;
  createdAt?: string;
  blogId?: string;
}

export default function MediaPage() {
  const { activeTenantId } = useTenantStore();

  // ── Blog list for dropdown ──────────────────────────────────────────────
  const { data: blogsResponse } = useSWR(blogApi.getAll(activeTenantId), fetcher);
  const blogs: Blog[] = Array.isArray(blogsResponse)
    ? blogsResponse
    : (blogsResponse?.data || []);

  // ── Media list ──────────────────────────────────────────────────────────
  const [selectedBlogId, setSelectedBlogId] = useState<string>("all");

  useEffect(() => {
    setSelectedBlogId("all");
  }, [activeTenantId]);

  useEffect(() => {
    if (blogs.length > 0 && selectedBlogId === "all") {
      setSelectedBlogId(blogs[0].id);
    }
  }, [blogs, selectedBlogId]);

  const { data: mediaResponse, mutate, isLoading } = useSWR(
    activeTenantId && selectedBlogId !== "all"
      ? ["media", activeTenantId, selectedBlogId]
      : null,
    () => mediaApi.getByBlogId(selectedBlogId, activeTenantId)
  );
  const mediaItems: MediaItem[] = Array.isArray(mediaResponse)
    ? mediaResponse
    : (mediaResponse?.data || []);

  // ── Search ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const filtered = mediaItems.filter((m) =>
    m.fileName?.toLowerCase().includes(search.toLowerCase()) ||
    m.contentType?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Create modal ────────────────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [modalBlogId, setModalBlogId] = useState("");
  const [contentType, setContentType] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-select first blog in modal when blogs load
  useEffect(() => {
    if (blogs.length > 0 && !modalBlogId) {
      setModalBlogId(blogs[0].id);
    }
  }, [blogs]);

  const handleCreate = async () => {
    if (!fileName.trim()) { toast.error("File name is required."); return; }
    if (!modalBlogId) { toast.error("Please select a blog."); return; }
    if (!contentType.trim()) { toast.error("Content type is required."); return; }
    setSaving(true);
    try {
      await mediaApi.upload({
        fileName: fileName.trim(),
        blogId: modalBlogId,
        contentType: contentType.trim(),
      }, activeTenantId);
      toast.success("Media uploaded successfully.");
      setIsCreateOpen(false);
      setFileName("");
      setModalBlogId(blogs[0]?.id || "");
      setContentType("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      mutate();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await mediaApi.delete(deletingId);
      mutate();
      toast.success("Media deleted.");
    } catch {
      toast.error("Failed to delete media.");
    } finally {
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  // ── Table columns ───────────────────────────────────────────────────────
  const columns: Column<MediaItem>[] = [
    {
      header: "FileName",
      accessorKey: "fileName",
      cell: (item) => <span className="font-medium">{item.fileName || "—"}</span>,
    },
    {
      header: "ContentType",
      accessorKey: "contentType",
      cell: (item) => (
        <span className="text-sm text-muted-foreground">{item.contentType || "—"}</span>
      ),
    },
    {
      header: "CreatedAt",
      accessorKey: "createdAt",
      cell: (item) => (
        <span className="text-sm text-muted-foreground">{item.createdAt || "—"}</span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item) => (
        <button
          onClick={() => { setDeletingId(item.id); setIsConfirmOpen(true); }}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  // ── Blog filter dropdown (same as CommentsPage) ─────────────────────────
  const blogDropdown = (
    <div className="relative">
      <select
        value={selectedBlogId}
        onChange={(e) => setSelectedBlogId(e.target.value)}
        className="h-9 pl-3 pr-8 rounded-md border border-input bg-background text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <option value="all">All Blogs</option>
        {blogs.map((blog) => (
          <option key={blog.id} value={blog.id}>{blog.title}</option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
    </div>
  );

  // ── New Media modal form (same structure as CommentsPage formJSX) ────────
  const formJSX = (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
          FileName
        </label>
        <input
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          autoFocus
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. hero-image"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
          Blog
        </label>
        <select
          value={modalBlogId}
          onChange={(e) => setModalBlogId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select a blog</option>
          {blogs.map((b) => (
            <option key={b.id} value={b.id}>{b.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
          ContentType
        </label>
        <input
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. image/png"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
          Upload File
        </label>
        <label className="flex items-center gap-3 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <svg className="h-4 w-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {selectedFile ? selectedFile.name : "Choose a file…"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={() => setIsCreateOpen(false)}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Media</h1>
        <p className="text-muted-foreground">Upload and manage your media files.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8 text-muted-foreground animate-pulse">Loading...</div>
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          onSearch={setSearch}
          actions={
            <div className="flex items-center gap-2">
              {blogDropdown}
              <button
                onClick={() => {
                  setFileName("");
                  setModalBlogId(blogs[0]?.id || "");
                  setContentType("");
                  setIsCreateOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground h-9 px-4 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" /> New Media
              </button>
            </div>
          }
        />
      )}

      <EditModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Media"
      >
        {formJSX}
      </EditModal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Media"
        description="Are you sure you want to delete this media file? This action cannot be undone."
      />
    </div>
  );
}