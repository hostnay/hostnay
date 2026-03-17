export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    throw new Error("Login failed");
  }
  return res.json() as Promise<{ token: string; user: { id: string; email: string; role: string } }>;
}

export async function fetchWithToken<T>(path: string, token: string) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${path}`);
  }
  return res.json() as Promise<T>;
}
