import { apiClient } from "@/lib/api-client"

/**
 * Servicio para Monedas (`/api/v1/orders/currencies`)
 * Sección 4 de troncos-system-API.md
 */
export const currenciesService = {
  /**
   * 4.1. Obtener todas las monedas (opcional: `{ is_active: true | false }`)
   */
  getAll(params = {}, options = {}) {
    return apiClient.get("/currencies", params, options)
  },

  /**
   * 4.2. Obtener monedas paginadas (`{ page, per_page, search }`)
   */
  getPaginated(params = {}, options = {}) {
    return apiClient.get("/currencies/paginated", params, options)
  },

  /**
   * 4.3. Obtener una moneda por ID
   */
  getById(id, options = {}) {
    return apiClient.get(`/currencies/${id}`, undefined, options)
  },

  /**
   * 4.4. Crear moneda (`{ name, symbol, code, usd_rate, is_active }`)
   */
  create(payload, options = {}) {
    return apiClient.post("/currencies", payload, options)
  },

  /**
   * 4.5. Actualizar moneda (ej. actualizar `usd_rate` o `is_active`)
   */
  update(id, payload, options = {}) {
    return apiClient.put(`/currencies/${id}`, payload, options)
  },

  /**
   * 4.6. Eliminar moneda
   */
  remove(id, options = {}) {
    return apiClient.delete(`/currencies/${id}`, options)
  },
}

