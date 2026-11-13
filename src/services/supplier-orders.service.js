import { apiClient } from "@/lib/api-client"

/**
 * Servicio para Órdenes a Proveedor / Lotes (`/api/v1/orders/supplier-orders`)
 * Sección 8 de troncos-system-API.md y SPEC: LOT FINANCIALS & EXPENSES
 */
export const supplierOrdersService = {
  /**
   * 8.1. Obtener todas las órdenes a proveedor (`{ status, search, summary }`)
   */
  getAll(params = {}, options = {}) {
    return apiClient.get(
      "/supplier-orders",
      { summary: "true", ...params },
      options
    )
  },

  /**
   * 8.2. Obtener órdenes a proveedor paginadas (`{ page, per_page, status, search, summary }`)
   */
  getPaginated(params = {}, options = {}) {
    return apiClient.get(
      "/supplier-orders/paginated",
      { summary: "true", ...params },
      options
    )
  },

  /**
   * 8.3. Obtener orden a proveedor por ID (incluye `customer_orders` asociadas y `financial_summary` con `expenses`)
   */
  getById(id, options = {}) {
    return apiClient.get(`/supplier-orders/${id}`, undefined, options)
  },

  /**
   * 8.3b. Obtener balance financiero ligero del lote (`?include_expenses=true`)
   */
  getFinancialSummary(id, params = { include_expenses: "true" }, options = {}) {
    return apiClient.get(
      `/supplier-orders/${id}/financial-summary`,
      params,
      options
    )
  },

  /**
   * 8.4. Crear orden a proveedor (`{ code, status, tracking_code, tracking_url, notes, customer_order_ids }`)
   */
  create(payload, options = {}) {
    return apiClient.post("/supplier-orders", payload, options)
  },

  /**
   * 8.5. Actualizar orden a proveedor
   */
  update(id, payload, options = {}) {
    return apiClient.put(`/supplier-orders/${id}`, payload, options)
  },

  /**
   * 8.6. Eliminar orden a proveedor
   */
  remove(id, options = {}) {
    return apiClient.delete(`/supplier-orders/${id}`, options)
  },
}
