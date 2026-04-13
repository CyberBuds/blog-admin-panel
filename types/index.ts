export type Role = 'SuperAdmin' | 'Admin' | 'Editor' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  categoryId: string;
  category?: Category;
  tags?: Tag[];
  isPublished: boolean;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  blogId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
