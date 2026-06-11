// API client - uses VITE_API_BASE from environment variables
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

function getCsrfToken() {
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const csrfToken = getCsrfToken();

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
