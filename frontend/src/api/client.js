// API client - uses VITE_API_BASE from environment variables
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

let cachedCsrfToken = null;

function getCsrfTokenFromCookie() {
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

async function fetchCsrfToken() {
  try {
    const res = await fetch(`${API_BASE}/users/csrf-token`, {
      credentials: "include",
    });
    const data = await res.json();
    cachedCsrfToken = data.csrfToken;
    return cachedCsrfToken;
  } catch {
    return null;
  }
}

function getCsrfToken() {
  return cachedCsrfToken || getCsrfTokenFromCookie();
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  let csrfToken = getCsrfToken();

  // For mutating requests, ensure we have a CSRF token
  const method = options.method?.toUpperCase() || "GET";
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && !csrfToken) {
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

// Initialize CSRF token on app load
fetchCsrfToken();
