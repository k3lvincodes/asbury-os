const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_URL}${endpoint}`);
  return response.json();
}

export async function apiPost<T>(
  endpoint: string,
  data: any
): Promise<ApiResponse<T>> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (err) {
    throw new Error(
      `Network error (${API_URL}${endpoint}): ${(err as Error).message}`
    );
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

export async function apiPut<T>(
  endpoint: string,
  data: any
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
  });
  return response.json();
}
