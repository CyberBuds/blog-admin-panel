"use client";

import { BlogForm } from "../../../../components/BlogForm";
import { Blog } from "../../../../types";

import useSWR from "swr";
import { fetcher, blogApi } from "../../../../lib/services";

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const { data, error, isLoading } = useSWR<Blog>(blogApi.getOne(params.id), fetcher);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Blog</h1>
        <p className="text-muted-foreground">Update your existing blog post.</p>
      </div>
      
      <div className="border border-border bg-card rounded-xl p-6 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center p-8 text-muted-foreground animate-pulse">Loading blog data...</div>
        ) : error ? (
          <div className="text-red-500 text-center">Failed to load blog post.</div>
        ) : (
          <BlogForm initialData={data} />
        )}
      </div>
    </div>
  );
}
