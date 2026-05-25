// api.js — Real REST API client for Bambi marketplace
// Uses fetch + JWT Bearer + calls the real .NET backend.
// In dev: requests to /api are proxied to http://localhost:5138 (see vite.config.js).
// In prod: set VITE_API_URL to point at your deployed API.

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// ---------- JWT helpers ----------
const decodeJwt = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (payload.length % 4) payload += "=";
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// ---------- Token & request helpers ----------
let currentToken = null;

const setToken = (t) => {
  currentToken = t || null;
  if (t) localStorage.setItem("bambi_token", t);
  else localStorage.removeItem("bambi_token");
};

const getToken = () => currentToken || localStorage.getItem("bambi_token");

const apiError = (status, message) => {
  const e = new Error(message);
  e.status = status;
  return e;
};

// Hydrate the in-memory token from storage on module load so the api works
// before AuthProvider's first render.
const stored = typeof localStorage !== "undefined" ? localStorage.getItem("bambi_token") : null;
if (stored) currentToken = stored;

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...(options.headers || {}) };

  // Only set JSON content type if we have a body that's not FormData.
  if (options.body !== undefined && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let message = response.statusText || "Request failed";
    try {
      const body = await response.json();
      // FluentValidation/ProblemDetails: { title, detail, errors: { field: [msgs] } }
      if (body?.errors && typeof body.errors === "object") {
        const all = Object.values(body.errors).flat().join("; ");
        if (all) message = all;
      } else {
        message = body.detail || body.message || body.title || message;
      }
    } catch { /* keep statusText */ }
    throw apiError(response.status, message);
  }

  if (response.status === 204) return null;
  const ct = response.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  return response.json();
};

// ---------- Shape mappers ----------
// Frontend expects: status="available"|"sold", soldAt, createdAt as numbers/strings ok.
const mapListing = (l) => {
  if (!l) return l;
  const rawImages = Array.isArray(l.images) ? l.images : [];
  // Sort primary first so the "cover" sticker matches the first thumbnail.
  const sorted = [...rawImages].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
  return {
    ...l,
    status: l.isAvailable ? "available" : "sold",
    category: l.categoryName ? { id: l.categoryId, name: l.categoryName } : null,
    // images: array of URL strings (consumed by ListingCard, listing.jsx gallery)
    images: sorted.map((img) => img.imageUrl || img),
    // imageItems: full objects with id, for EditListingPage to compute removals
    imageItems: sorted,
    createdAt: l.createdAt,
  };
};

const mapPurchaseToListingLike = (p) => ({
  // Render as a pseudo-listing for my-purchases.jsx
  id: p.listingId,
  title: p.listingTitle,
  price: p.pricePaid,
  size: p.size || "—",
  sellerId: p.sellerId,
  sellerUsername: p.sellerUsername || p.buyerUsername || "—",
  sellerCity: p.sellerCity || "—",
  images: p.images || [],
  status: "sold",
  soldAt: p.purchasedAt,
  purchaseId: p.id,
  purchaseStatus: p.status,
});

const mapPaged = (resp, mapItem) => {
  const pages = resp.totalPages ?? resp.pages ?? 1;
  return {
    items: (resp.items || []).map(mapItem),
    total: resp.totalCount ?? resp.total ?? 0,
    page: resp.page ?? 1,
    pageSize: resp.pageSize ?? (resp.items || []).length,
    pages,
    totalPages: pages,
  };
};

// ---------- Public api object ----------
const api = {
  setToken,
  getToken,
  decodeJwt,

  // ===== Auth =====
  async login({ username, password }) {
    const r = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ usernameOrEmail: username, password }),
    });
    setToken(r.token);
    const user = {
      id: r.userId, username: r.username, email: r.email,
      role: (r.role || "").toLowerCase(), city: r.city,
      profilePicUrl: r.profilePicUrl,
    };
    return { token: r.token, user };
  },

  async register({ username, email, password, phoneNumber, city }) {
    const r = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password, phoneNumber, city }),
    });
    setToken(r.token);
    const user = {
      id: r.userId, username: r.username, email: r.email,
      role: (r.role || "").toLowerCase(), city: r.city,
      profilePicUrl: r.profilePicUrl,
    };
    return { token: r.token, user };
  },

  // ===== Categories =====
  async listCategories() {
    const r = await request("/api/categories?pageSize=100");
    return r.items || [];
  },
  async getCategory(id) { return request(`/api/categories/${id}`); },
  async createCategory(data) {
    return request("/api/categories", { method: "POST", body: JSON.stringify(data) });
  },
  async updateCategory(id, data) {
    return request(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  async deleteCategory(id) {
    return request(`/api/categories/${id}`, { method: "DELETE" });
  },

  // ===== Listings =====
  async listListings(params = {}) {
    const q = new URLSearchParams();
    if (params.categoryIds?.length) q.append("categoryId", params.categoryIds[0]);
    if (params.sizes?.length) q.append("size", params.sizes[0]);
    if (params.priceMin != null) q.append("minPrice", params.priceMin);
    if (params.priceMax != null) q.append("maxPrice", params.priceMax);
    if (params.conditionMin != null) q.append("condition", params.conditionMin);
    if (params.onlyAvailable) q.append("isAvailable", "true");
    q.append("page", params.page || 1);
    q.append("pageSize", params.pageSize || 12);
    const sortMap = {
      newest: { sortBy: "createdAt", sortOrder: "desc" },
      oldest: { sortBy: "createdAt", sortOrder: "asc" },
      price_asc: { sortBy: "price", sortOrder: "asc" },
      price_desc: { sortBy: "price", sortOrder: "desc" },
      condition_desc: { sortBy: "condition", sortOrder: "desc" },
    };
    const s = sortMap[params.sort || "newest"];
    q.append("sortBy", s.sortBy);
    q.append("sortOrder", s.sortOrder);

    let resp = await request(`/api/listings?${q}`);
    let mapped = mapPaged(resp, mapListing);

    // Backend filters by single category/size; the UI sends arrays.
    // Apply remaining filters client-side when more than one was picked,
    // and the search query (backend has no text search endpoint).
    if (params.categoryIds?.length > 1) {
      mapped.items = mapped.items.filter((l) => params.categoryIds.includes(l.categoryId));
    }
    if (params.sizes?.length > 1) {
      mapped.items = mapped.items.filter((l) => params.sizes.includes(l.size));
    }
    if (params.search) {
      const qs = params.search.toLowerCase();
      mapped.items = mapped.items.filter((l) =>
        (l.title || "").toLowerCase().includes(qs) ||
        (l.description || "").toLowerCase().includes(qs) ||
        (l.sellerUsername || "").toLowerCase().includes(qs)
      );
    }
    if (params.sellerId != null) {
      mapped.items = mapped.items.filter((l) => l.sellerId === Number(params.sellerId));
    }
    return mapped;
  },

  async listMyListings(page = 1, pageSize = 50) {
    const resp = await request(`/api/listings/my?page=${page}&pageSize=${pageSize}`);
    return mapPaged(resp, mapListing);
  },

  async getListing(id) {
    const l = await request(`/api/listings/${id}`);
    return mapListing(l);
  },

  async createListing(data) {
    // Backend wants: { title, description, price, size, condition, categoryId }
    const payload = {
      title: data.title,
      description: data.description,
      price: Number(data.price),
      size: data.size,
      condition: Number(data.condition),
      categoryId: Number(data.categoryId),
    };
    const created = await request("/api/listings", { method: "POST", body: JSON.stringify(payload) });
    return mapListing(created);
  },

  async updateListing(id, data) {
    const payload = {
      title: data.title,
      description: data.description,
      price: Number(data.price),
      size: data.size,
      condition: Number(data.condition),
      categoryId: Number(data.categoryId),
    };
    // Only send isAvailable if the caller explicitly set it. The backend
    // preserves the current value when this is null (`dto.IsAvailable ?? listing.IsAvailable`),
    // so omitting it stops a routine edit from un-selling a sold listing.
    if (data.isAvailable !== undefined) payload.isAvailable = data.isAvailable;
    const updated = await request(`/api/listings/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    return mapListing(updated);
  },

  async deleteListing(id) {
    return request(`/api/listings/${id}`, { method: "DELETE" });
  },

  // ===== Listing images =====
  async uploadListingImage(listingId, file) {
    const fd = new FormData();
    fd.append("file", file);
    return request(`/api/listings/${listingId}/images`, { method: "POST", body: fd });
  },
  async setPrimaryImage(imageId) {
    return request(`/api/listing-images/${imageId}/primary`, { method: "PUT" });
  },
  async deleteListingImage(imageId) {
    return request(`/api/listing-images/${imageId}`, { method: "DELETE" });
  },

  // ===== Users =====
  async listUsers(params = {}) {
    const q = new URLSearchParams();
    if (params.username) q.append("username", params.username);
    if (params.city) q.append("city", params.city);
    q.append("page", params.page || 1);
    q.append("pageSize", params.pageSize || 100);
    if (params.sortBy) q.append("sortBy", params.sortBy);
    if (params.sortOrder) q.append("sortOrder", params.sortOrder);
    const r = await request(`/api/users?${q}`);
    // Frontend admin table reads listingCount/purchaseCount; backend doesn't
    // ship those, so default to 0 to keep the column rendering harmless.
    return (r.items || []).map((u) => ({
      ...u,
      role: (u.role || "").toLowerCase(),
      listingCount: u.listingCount ?? 0,
      purchaseCount: u.purchaseCount ?? 0,
    }));
  },

  async getUser(id) {
    const u = await request(`/api/users/${id}`);
    if (u) u.role = (u.role || "").toLowerCase();
    return u;
  },

  async updateUser(id, data) {
    const u = await request(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
    if (u) u.role = (u.role || "").toLowerCase();
    return u;
  },

  async updateUserRole(id, role) {
    return request(`/api/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role: role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() }),
    });
  },

  async deleteUser(id) {
    return request(`/api/users/${id}`, { method: "DELETE" });
  },

  async deleteAccount() {
    return request(`/api/users/me`, { method: "DELETE" });
  },

  async uploadProfileImage(file) {
    const fd = new FormData();
    fd.append("file", file);
    return request(`/api/users/me/profile-pic`, { method: "POST", body: fd });
  },

  // ===== Purchases =====
  // Accepts either (page, pageSize) or ({page, pageSize, status, from, to}).
  async listMyPurchases(arg1 = 1, arg2 = 50) {
    const params = (typeof arg1 === "object" && arg1 !== null)
      ? arg1
      : { page: arg1, pageSize: arg2 };

    const q = new URLSearchParams();
    q.append("page", params.page || 1);
    q.append("pageSize", params.pageSize || 50);
    if (params.status) q.append("status", params.status);
    if (params.from) q.append("from", params.from);
    if (params.to) q.append("to", params.to);

    const resp = await request(`/api/purchases/my?${q}`);
    return mapPaged(resp, (p) => p);
  },

  async createPurchase(listingId, deliveryAddress, note) {
    return request("/api/purchases", {
      method: "POST",
      body: JSON.stringify({ listingId, deliveryAddress, note }),
    });
  },

  async getPurchase(id) { return request(`/api/purchases/${id}`); },

  // Sales — purchases of MY listings. Same shape as listMyPurchases.
  async listMySales(arg1 = 1, arg2 = 50) {
    const params = (typeof arg1 === "object" && arg1 !== null)
      ? arg1
      : { page: arg1, pageSize: arg2 };

    const q = new URLSearchParams();
    q.append("page", params.page || 1);
    q.append("pageSize", params.pageSize || 50);
    if (params.status) q.append("status", params.status);
    if (params.from) q.append("from", params.from);
    if (params.to) q.append("to", params.to);

    const resp = await request(`/api/purchases/sales?${q}`);
    return mapPaged(resp, (p) => p);
  },

  async updatePurchaseStatus(id, status) {
    return request(`/api/purchases/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  // Frontend compatibility — listing.jsx calls buyListing(id) directly.
  async buyListing(id) {
    const purchase = await api.createPurchase(id, null, null);
    // Refetch the listing so the UI sees isAvailable=false → status="sold".
    return api.getListing(id);
  },

  // ===== Misc =====
  async listSizes() {
    // Backend has no dedicated sizes endpoint — derive from a generous listing pull.
    const resp = await request(`/api/listings?pageSize=200&sortBy=createdAt&sortOrder=desc`);
    const sizes = new Set();
    (resp.items || []).forEach((l) => l.size && sizes.add(l.size));
    return Array.from(sizes).sort();
  },
};

export default api;
