export type ApiClientOptions = {
  baseUrl: string;
  getToken?: () => Promise<string | undefined>;
};

export type ApiClient = ReturnType<typeof createApiClient>;

export function createApiClient(options: ApiClientOptions) {
  const { baseUrl, getToken } = options;

  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = getToken ? await getToken() : undefined;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    const res = await fetch(baseUrl + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : null,
    });
    if (!res.ok) {
      throw new Error('API ' + res.status + ': ' + res.statusText);
    }
    return res.json() as Promise<T>;
  }

  return {
    get<T>(path: string): Promise<T> {
      return request<T>('GET', path);
    },
    post<T>(path: string, body: unknown): Promise<T> {
      return request<T>('POST', path, body);
    },
    put<T>(path: string, body: unknown): Promise<T> {
      return request<T>('PUT', path, body);
    },
    delete<T>(path: string): Promise<T> {
      return request<T>('DELETE', path);
    },
    health() {
      return request<{ ok: boolean; service: string }>('GET', '/health');
    },
  };
}
