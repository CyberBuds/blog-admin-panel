import api from "./api";

// const BASE = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7196/api/v1";
const BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://blogservice-api.onrender.com/api/v1";

// ✅ Handles both {data:[]} and direct [] responses
export const fetcher = (url: string) => api.get(url).then((r) => r.data);

// ✅ CHANGED: sends "identifier=tech-blog" instead of "tenantId=UUID"
function withTenant(url: string, identifier?: string | null) {
  if (!identifier) return url;
  return `${url}${url.includes("?") ? "&" : "?"}identifier=${identifier}`;
}

export const analyticsApi = { 
  getDashboard: (tenantId?: string | null) => 
    withTenant(`${BASE}/analytics/dashboard`, tenantId), 
  getAnalytics: (tenantId?: string | null) =>
    withTenant(`${BASE}/analytics`, tenantId),
};

export const blogApi = {
  getAll: (tenantId?: string | null) =>
    withTenant(`${BASE}/admin/blogs`, tenantId),
// Clean simple version — interceptor handles the header automatically
getOne: (id: string) => `${BASE}/blogs/${id}`,

 create: (data: unknown, tenantIdentifier?: string | null) =>
    api.post(`${BASE}/admin/blogs`, data, {
      headers: tenantIdentifier ? { TenantId: tenantIdentifier } : {},
    }).then((r) => r.data),


  update: (id: string, data: unknown, tenantIdentifier?: string | null) =>
    api.put(`${BASE}/admin/blogs/${id}`, data, {
      headers: tenantIdentifier ? { TenantId: tenantIdentifier } : {},
    }).then((r) => r.data),

  delete: (id: string, tenantIdentifier?: string | null) =>
    api.delete(`${BASE}/admin/blogs/${id}`, {
      headers: tenantIdentifier ? { TenantId: tenantIdentifier } : {},
    }).then((r) => r.data),

  publish: (id: string, tenantIdentifier?: string | null) =>
    api.patch(`${BASE}/admin/blogs/${id}/publish`, null, {
      headers: tenantIdentifier ? { TenantId: tenantIdentifier } : {},
    }).then((r) => r.data),

  unpublish: (id: string, tenantIdentifier?: string | null) =>
    api.patch(`${BASE}/admin/blogs/${id}/unpublish`, null, {
      headers: tenantIdentifier ? { TenantId: tenantIdentifier } : {},
    }).then((r) => r.data),
};

export const categoryApi = {
  getAll: (tenantId?: string | null) =>
    withTenant(`${BASE}/categories`, tenantId), // ✅ fixed
  create: (data: unknown) =>
    api.post(`${BASE}/admin/categories`, data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    api.put(`${BASE}/admin/categories/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete(`${BASE}/admin/categories/${id}`).then((r) => r.data),
};

export const tagApi = {
  getAll: (tenantId?: string | null) =>
    withTenant(`${BASE}/tags`, tenantId), // ✅ fixed
  create: (data: unknown) =>
    api.post(`${BASE}/admin/tags`, data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    api.put(`${BASE}/admin/tags/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete(`${BASE}/admin/tags/${id}`).then((r) => r.data),
};

export const userApi = {
  getAll: (tenantId?: string | null) =>
    withTenant(`${BASE}/admin/users`, tenantId),
  create: (data: unknown) =>
    api.post(`${BASE}/admin/users`, data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    api.put(`${BASE}/admin/users/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete(`${BASE}/admin/users/${id}`).then((r) => r.data),
};

export const commentApi = { 
 getAll: (tenantId?: string | null, blogId?: string | null) => {
    if (!tenantId || !blogId) return null;
    return api
      .get(`${BASE}/admin/comments`, {
        params: {
          blogId,
          tenantId: tenantId.trim(),
          page: 1,
          pageSize: 20,
        },
        headers: {
          TenantId: tenantId.trim(), // Required header, exactly like Swagger
        },
      })
      .then((r) => r.data);
  },
  create: (data: unknown) =>
    api.post(`${BASE}/comments`, data).then((r) => r.data),
  approve: (id: string) =>
    api.patch(`${BASE}/admin/comments/${id}/approve`).then((r) => r.data),
  unapprove: (id: string) =>
    api.patch(`${BASE}/admin/comments/${id}/reject`).then((r) => r.data),
  delete: (id: string) =>
    api.delete(`${BASE}/comments/${id}`).then((r) => r.data),
};

export const tenantApi = {
  getAll: () => `${BASE}/admin/tenants`,
  create: (data: unknown) =>
    api.post(`${BASE}/admin/tenants`, data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    api.put(`${BASE}/admin/tenants/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete(`${BASE}/admin/tenants/${id}`).then((r) => r.data),
  toggleActive: (id: string, isActive: boolean) =>
    api.patch(`${BASE}/admin/tenants/${id}/status`, { isActive }).then((r) => r.data),
};

export const mediaApi = {
  upload: (payload: { blogId?: string; fileName: string; contentType: string }, tenantIdentifier?: string | null) =>
    api.post(`${BASE}/Media/upload`, payload, {
      headers: tenantIdentifier ? { TenantId: tenantIdentifier } : {},
    }).then((r) => r.data),

  getByBlogId: (blogId: string, tenantIdentifier?: string | null) =>
    api.get(`${BASE}/Media/blog/${blogId}`, {
      headers: tenantIdentifier ? { TenantId: tenantIdentifier } : {},
    }).then((r) => r.data),

  getById: (id: string) =>
    api.get(`${BASE}/Media/${id}`).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`${BASE}/Media/${id}`).then((r) => r.data),
};