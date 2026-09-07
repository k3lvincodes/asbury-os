const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export function setToken(token: string) {
  localStorage.setItem('admin_token', token);
}

export function removeToken() {
  localStorage.removeItem('admin_token');
}

export async function apiAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new Error(`Network error: ${(err as Error).message}`);
  }

  const text = await response.text();
  let json: ApiResponse<T>;
  try {
    json = JSON.parse(text);
  } catch {
    json = { success: false, error: `Request failed with status ${response.status}` };
  }

  return json;
}

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<ApiResponse<{ user: User; token: string }>> {
  return apiAuth('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function signIn(
  email: string,
  password: string
): Promise<ApiResponse<{ user: User; token: string }>> {
  return apiAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(): Promise<ApiResponse<{ user: User }>> {
  return apiAuth('/auth/me');
}
