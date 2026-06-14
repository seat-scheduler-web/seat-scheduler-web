// API client - uses VITE_API_BASE from environment variables
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

async function fetchCsrfToken() {
  const res = await fetch(`${API_BASE}/users/csrf-token`, {
    credentials: "include",
  });
  const data = await res.json();
  return data.csrfToken;
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const method = options.method?.toUpperCase() || "GET";

  // Always fetch a fresh CSRF token for mutating requests
  let csrfToken = null;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    csrfToken = await fetchCsrfToken();
  }

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(csrfToken && { "x-csrf-token": csrfToken }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || "Something went wrong");
    error.status = res.status;
    throw error;
  }

  return data;
}
