const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.onechatai.ai/api';

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
}

async function apiService<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});

  // Pull token from localStorage (supporting both Next.js and Flutter storage keys)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('flutter.user_token') || localStorage.getItem('authToken');
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
  }

  // Auto-serialize JSON body
  if (
    !(fetchOptions.body instanceof FormData) &&
    typeof fetchOptions.body === 'object' &&
    fetchOptions.body !== null
  ) {
    headers.append('Content-Type', 'application/json');
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  // Build URL with query parameters
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    const qs = queryParams.toString();
    if (qs) url += `?${qs}`;
  }

  const response = await fetch(url, { ...fetchOptions, headers });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  return {} as T;
}

export default apiService;
