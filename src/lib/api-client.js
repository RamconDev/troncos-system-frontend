import { ApiError, ERROR_CODE_MESSAGES } from "@/lib/api-errors"

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000").replace(/\/+$/, "")
export const ORDERS_API_PREFIX = "/api/v1/orders"

export function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

export function resolveApiUrl(endpoint, params = {}) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  return `${BASE_URL}${cleanEndpoint}${buildQueryString(params)}`
}

function prefixOrdersPath(path) {
  if (path.startsWith("/api/")) return path
  return `${ORDERS_API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`
}

async function request(endpoint, { method = "GET", params, body, headers = {}, signal } = {}) {
  const url = resolveApiUrl(endpoint, params)
  const requestHeaders = { Accept: "application/json", ...headers }

  if (body !== undefined && body !== null) {
    requestHeaders["Content-Type"] = "application/json"
  }

  let response
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (err) {
    if (err.name === "AbortError") throw err
    throw new ApiError({
      code: "NETWORK_ERROR",
      message: ERROR_CODE_MESSAGES.NETWORK_ERROR,
      details: { originalError: err.message, url },
      status: 0,
    })
  }

  const contentType = response.headers.get("content-type") || ""
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null

  if (!response.ok || payload?.status === "error") {
    const errorObj = payload?.error || {}
    throw new ApiError({
      code: errorObj.code || `HTTP_${response.status}`,
      message: errorObj.message || payload?.message || response.statusText,
      details: errorObj.details || null,
      status: response.status,
    })
  }

  return {
    status: payload?.status ?? "success",
    message: payload?.message ?? "",
    data: payload?.data !== undefined ? payload.data : payload,
    meta: payload?.meta ?? null,
  }
}

export const apiClient = {
  baseUrl: BASE_URL,
  ordersPrefix: ORDERS_API_PREFIX,
  raw: request,
  get: (path, params, options = {}) =>
    request(prefixOrdersPath(path), { ...options, method: "GET", params }),
  post: (path, body, options = {}) =>
    request(prefixOrdersPath(path), { ...options, method: "POST", body }),
  put: (path, body, options = {}) =>
    request(prefixOrdersPath(path), { ...options, method: "PUT", body }),
  delete: (path, options = {}) =>
    request(prefixOrdersPath(path), { ...options, method: "DELETE" }),
}

export { ApiError }
