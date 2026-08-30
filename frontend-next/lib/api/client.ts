const DEFAULT_TIMEOUT = 120000;
const MAX_RETRIES = 1;
const RETRY_DELAY = 2000;

function getBaseUrl(): string {
  // Always return the full API URL - works both in browser and server
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse(response: Response): Promise<Record<string, unknown>> {
  if (response.status >= 200 && response.status < 300) {
    return response.json();
  }
  
  let message = `API error: ${response.status}`;
  try {
    const body = await response.json();
    if (body.detail) {
      message = `API error ${response.status}: ${body.detail}`;
    } else {
      message = `API error ${response.status}: ${JSON.stringify(body)}`;
    }
  } catch {
    const text = await response.text();
    if (text) {
      message = `API error ${response.status}: ${text}`;
    }
  }
  throw new ApiError(response.status, message);
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay);
    }
    
    if (error instanceof ApiError && error.statusCode >= 500) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay);
    }
    
    throw error;
  }
}

export async function apiGet<T>(path: string, timeout = DEFAULT_TIMEOUT): Promise<T> {
  const baseUrl = getBaseUrl();
  return withRetry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return handleResponse(response) as Promise<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  });
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  timeout = DEFAULT_TIMEOUT
): Promise<T> {
  const baseUrl = getBaseUrl();
  return withRetry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return handleResponse(response) as Promise<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  });
}

export function testConnection(urlOverride?: string): Promise<boolean> {
  const url = urlOverride || `${getBaseUrl()}/`;
  return fetch(url, { method: 'GET' })
    .then(response => response.ok)
    .catch(() => false);
}

export { ApiError };