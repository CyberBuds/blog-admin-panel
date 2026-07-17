"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Blog } from "../types";
import { blogApi, categoryApi, tagApi } from "../lib/services";
import { useAuthStore } from "../store/useAuthStore";
import { useTenantStore } from "../store/useTenantStore";
import useSWR from "swr";
import { fetcher } from "../lib/services";

interface CategoryItem { id: string; name: string; slug?: string; }
interface TagItem { id: string; name: string; slug?: string; }

// ✅ Helper to extract array from any API response format
function extractArray<T>(response: unknown): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response as T[];
  const r = response as Record<string, unknown>;
  if (Array.isArray(r.data)) return r.data as T[];
  if (Array.isArray(r.items)) return r.items as T[];
  if (Array.isArray(r.result)) return r.result as T[];
  return [];
}

interface BlogFormProps {
  initialData?: Blog;
}

export function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { activeTenantId,  activeIdentifier} = useTenantStore();

  // ✅ Individual state — no focus loss
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialData?.categoryIds || []
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tagIds || []
  );
  const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Fetch real categories
  const { data: categoriesRaw, isLoading: loadingCats } = useSWR(
    categoryApi.getAll(activeTenantId), fetcher
  );
  const categories: CategoryItem[] = extractArray<CategoryItem>(categoriesRaw);

  // ✅ Fetch real tags
  const { data: tagsRaw, isLoading: loadingTags } = useSWR(
    tagApi.getAll(activeTenantId), fetcher
  );
  const tags: TagItem[] = extractArray<TagItem>(tagsRaw);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleTag = (id: string) => {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
  
    // ✅ Read fresh from store at submit time — bypasses hydration timing issue
  const { user: currentUser, token, isAuthenticated } = useAuthStore.getState();
    if (!title || title.length < 5) {
      toast.error("Title must be at least 5 characters");
      return;
    }
    if (!content || content.length < 10) {
      toast.error("Content must be at least 10 characters");
      return;
    }
     
    
    if (!token || !isAuthenticated) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      
      
      // ✅ Build payload — authorId from auth store
      const payload: Record<string, unknown> = {
        title,
        content,
        authorId:currentUser?.id,
        categoryIds: selectedCategoryIds,
        tagIds: selectedTagIds,
      };

      // ✅ Only add authorId if it looks like a valid GUID
      const isValidGuid = (id: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      if (user?.id && isValidGuid(user.id)) {
        payload.authorId = user.id;
      }
      
      console.log("Submitting blog payload:", payload);

      if (initialData) {
        await blogApi.update(initialData.id, payload, activeIdentifier);
        toast.success("Blog updated successfully");
      } else {
        await blogApi.create(payload, activeIdentifier);
        toast.success("Blog created successfully");
      }
      router.push("/blogs");
    } catch (e: unknown) {
      const error = e as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> }; status?: number }
      };
      console.log("Blog error:", error.response?.status, error.response?.data);

      // ✅ Show specific validation errors
      const errors = error.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Validation error");
      } else {
        toast.error(error.response?.data?.message || "An error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="Blog title (min 5 characters)"
        />
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Categories</label>
        {loadingCats ? (
          <p className="text-sm text-muted-foreground animate-pulse">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No categories found.{" "}
            <a href="/categories" className="text-primary underline">Create one first →</a>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150
                  ${selectedCategoryIds.includes(cat.id)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent border-border text-muted-foreground hover:border-primary hover:text-foreground"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
        {loadingTags ? (
          <p className="text-sm text-muted-foreground animate-pulse">Loading tags...</p>
        ) : tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tags found.{" "}
            <a href="/tags" className="text-primary underline">Create one first →</a>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150
                  ${selectedTagIds.includes(tag.id)
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "bg-transparent border-border text-muted-foreground hover:border-indigo-400 hover:text-foreground"
                  }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="flex min-h-[300px] w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="Write your blog post here... (min 10 characters)"
        />
      </div>

      {/* Publish */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isPublished"
          checked={isPublished}
          onChange={e => setIsPublished(e.target.checked)}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <label htmlFor="isPublished" className="text-sm font-medium leading-none">
          Publish this blog immediately
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-4 border-t border-border">
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-70">
          {isSubmitting ? "Saving..." : (initialData ? "Update Blog" : "Create Blog")}
        </button>
      </div>
    </form>
  ); 
}