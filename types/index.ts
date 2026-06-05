export interface Blog {
  id: string;
  title: string;
  slug?: string;
  content?: string;
  isPublished: boolean;
  views: number;
  likes: number;
  createdAt: string;
  tenantId: string;
  authorId?: string;
  categoryIds?: string[];
  tagIds?: string[];
  categoryId?: string; // legacy
}


export type Role = "Admin" | "User" | "SuperAdmin";
 
export interface User {
  id: string;
  name?: string;
  username?: string; 
  email: string;
  role: Role;
  createdAt: string; 
  tenantId?: string | null;
  updatedAt?: string | null;
  initials?: string;
}

export interface Tenant {
  id: string;
  name: string;
  identifier?: string;
  domain?: string;
  slug?: string;
  isActive?: boolean;
  createdAt?: string;
  blogCount?: number;
  userCount?: number;
}

export interface TenantItem extends Tenant {
  createdAt: string; // required in list view
  updatedAt?: string | null;
}

export interface Blog {
  id: string;
  title: string;
  slug?: string;
  content?: string;
  isPublished: boolean;
  views: number;
  likes: number;
  createdAt: string;
  tenantId: string;
  authorId?: string;
  categoryIds?: string[];
  tagIds?: string[];
  categoryId?: string; // legacy
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  blogCount?: number;
  createdAt: string;
  tenantId?: string;
}


export interface Tag {
  id: string;
  name: string;
  slug: string;
  blogCount?: number;
  createdAt: string;
  tenantId?: string;
}


export interface Comment {
  id: string;
  blogId: string;
  authorName: string;
  // authorEmail?: string; // ✅ add this
  content: string;
  isApproved: boolean;
  createdAt: string;
  blogTitle?: string;
  tenantId?: string;
}

