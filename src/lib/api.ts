interface FetchOptions extends RequestInit {
  token?: string;
}

function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const currentOriginBase = `${window.location.protocol}//${window.location.hostname}:5000/api`;

    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const configuredUrl = new URL(process.env.NEXT_PUBLIC_API_URL);
        const isLoopbackHost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(configuredUrl.hostname);
        const isRemoteBrowserHost = !['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname);

        if (isLoopbackHost && isRemoteBrowserHost) {
          return `${configuredUrl.protocol}//${window.location.hostname}:${configuredUrl.port || '5000'}${configuredUrl.pathname}`;
        }

        return process.env.NEXT_PUBLIC_API_URL;
      } catch {
        return process.env.NEXT_PUBLIC_API_URL;
      }
    }

    return currentOriginBase;
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  return 'http://localhost:5000/api';
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      signal: controller.signal,
      ...rest,
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.replace('/signin');
      }
      throw new Error(data.error || 'Something went wrong');
    }

    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out. Please check that the backend is reachable and try again.');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
