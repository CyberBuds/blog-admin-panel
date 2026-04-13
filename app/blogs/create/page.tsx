"use client";

import { BlogForm } from "../../../components/BlogForm";

export default function CreateBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Blog</h1>
        <p className="text-muted-foreground">Draft a new post for your audience.</p>
      </div>
      
      <div className="border border-border bg-card rounded-xl p-6 shadow-sm">
        <BlogForm />
      </div>
    </div>
  );
}
