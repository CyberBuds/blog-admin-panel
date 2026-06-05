"use client";

import { BlogForm } from "../../../../components/BlogForm";
import { Blog } from "../../../../types";
import useSWR from "swr";
import { fetcher, blogApi } from "../../../../lib/services";

// ✅ Helper to extract blog from any response format
function extractBlog(response: unknown): Blog | undefined {
  if (!response) return undefined;
  // Direct blog object
  if ((response as Blog).id) return response as Blog;
  // Wrapped in data field
  const r = response as Record<string, unknown>;
  if (r.data && (r.data as Blog).id) return r.data as Blog;
  return undefined;
}

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const { data: raw, error, isLoading } = useSWR(
    blogApi.getOne(params.id),
    fetcher
  );

  const blog = extractBlog(raw);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Blog</h1>
        <p className="text-muted-foreground">Update your existing blog post.</p>
      </div>

      <div className="border border-border bg-card rounded-xl p-6 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center p-8 text-muted-foreground animate-pulse">
            Loading blog data...
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">Failed to load blog post.</p>
            <p className="text-xs text-muted-foreground">
              Check console for details. Endpoint: {blogApi.getOne(params.id)}
            </p>
          </div>
        ) : !blog ? (
          <div className="text-center py-8 text-muted-foreground">
            Blog not found.
          </div>
        ) : (
          <BlogForm initialData={blog} />
        )}
      </div>
    </div>
  );
}