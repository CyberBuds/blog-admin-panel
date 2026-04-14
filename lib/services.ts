import api from './api';

export const fetcher = (url: string) => api.get(url).then(res => res.data);

// Blog
export const blogApi = {
  getAll: () => '/admin/blogs', // Admin view all 
  getOne: (id: string) => `/blogs/${id}`,
  create: (data: unknown) => api.post('/admin/blogs', data),
  update: (id: string, data: unknown) => api.put(`/admin/blogs/${id}`, data),
  delete: (id: string) => api.delete(`/admin/blogs/${id}`),
  publish: (id: string) => api.patch(`/admin/blogs/${id}/publish`),
  unpublish: (id: string) => api.patch(`/admin/blogs/${id}/unpublish`),
};

// Category
export const categoryApi = {
  getAll: () => '/categories',
  create: (data: unknown) => api.post('/admin/categories', data),
  update: (id: string, data: unknown) => api.put(`/admin/categories/${id}`, data),
  delete: (id: string) => api.delete(`/admin/categories/${id}`),
};

// Tag
export const tagApi = {
  getAll: () => '/tags',
  create: (data: unknown) => api.post('/admin/tags', data),
  update: (id: string, data: unknown) => api.put(`/admin/tags/${id}`, data),
  delete: (id: string) => api.delete(`/admin/tags/${id}`),
};

// Users
export const userApi = {
  getAll: () => '/admin/users',
  updateRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
};

// Comments
export const commentApi = {
  getByBlog: (blogId: string) => `/comments/blog/${blogId}`,
  approve: (id: string) => api.patch(`/admin/comments/${id}/approve`),
  reject: (id: string) => api.patch(`/admin/comments/${id}/reject`),
  delete: (id: string) => api.delete(`/comments/${id}`),
};

// Analytics
export const analyticsApi = {
  getDashboard: () => '/analytics/dashboard',
};

// Tenants
export const tenantApi = {
  getAll: () => '/admin/tenants',
  create: (data: unknown) => api.post('/admin/tenants', data),
  update: (id: string, data: unknown) => api.put(`/admin/tenants/${id}`, data),
  delete: (id: string) => api.delete(`/admin/tenants/${id}`),
};
