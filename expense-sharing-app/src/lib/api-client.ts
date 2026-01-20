/**
 * Helper functions for making authenticated API requests
 */

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

interface ApiRequestOptions {
  method?: HttpMethod
  body?: any
  headers?: Record<string, string>
}

/**
 * Make an authenticated API request using NextAuth session
 */
export async function fetchApi<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  }

  if (body && method !== "GET") {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(endpoint, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "An error occurred",
    }))
    throw new Error(error.message || "API request failed")
  }

  return response.json()
}

/**
 * API client with typed methods
 */
export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body: any) =>
    fetchApi<T>(endpoint, { method: "POST", body }),

  put: <T>(endpoint: string, body: any) =>
    fetchApi<T>(endpoint, { method: "PUT", body }),

  patch: <T>(endpoint: string, body: any) =>
    fetchApi<T>(endpoint, { method: "PATCH", body }),

  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: "DELETE" }),
}
