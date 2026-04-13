"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput } from "./FormInput";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Blog } from "../types";

import { blogApi } from "../lib/services";

const blogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(2, "Slug is required"),
  categoryId: z.string().min(1, "Category is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  isPublished: z.boolean().default(false),
});

type BlogFormValues = z.infer<typeof blogSchema>;

interface BlogFormProps {
  initialData?: Blog;
}

export function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      slug: initialData.slug,
      categoryId: initialData.categoryId,
      content: initialData.content,
      isPublished: initialData.isPublished,
    } : {
      isPublished: false,
    }
  });

  const onSubmit = async (data: BlogFormValues) => {
    try {
      if (initialData) {
        await blogApi.update(initialData.id, data);
      } else {
        await blogApi.create(data);
      }
      toast.success(initialData ? "Blog updated successfully" : "Blog created successfully");
      router.push("/blogs");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "An error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="grid gap-6 md:grid-cols-2">
        <FormInput
          label="Title"
          {...register("title")}
          error={errors.title?.message}
        />
        <FormInput
          label="Slug"
          {...register("slug")}
          error={errors.slug?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Category</label>
        <select 
          {...register("categoryId")} 
          className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="">Select a category</option>
          <option value="1">Technology</option>
          <option value="2">Business</option>
          <option value="3">Design</option>
        </select>
        {errors.categoryId && <p className="mt-1 text-sm text-red-500">{errors.categoryId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Content</label>
        <textarea
          {...register("content")}
          className="flex min-h-[300px] w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="Write your blog post here..."
        />
        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          id="isPublished" 
          {...register("isPublished")} 
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <label htmlFor="isPublished" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Publish this blog immediately
        </label>
      </div>

      <div className="flex gap-4 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-70"
        >
          {isSubmitting ? "Saving..." : (initialData ? "Update Blog" : "Create Blog")}
        </button>
      </div>
    </form>
  );
}
