import { apiClient } from "@/lib/api-client"

/**
 * Servicio para Movimientos Financieros (`/api/v1/orders/movements`)
 * Sección 6 de troncos-system-API.md
 */
export const movementsService = {
  /**
   * 6.1. Obtener todos los movimientos
   * Params opcionales: { movement_type, currency_id, category_id, source_id, search }
   */
  getAll(params = {}, options = {}) {
    return apiClient.get("/movements", params, options)
  },

  /**
   * 6.2. Obtener movimientos paginados
   */
  getPaginated(params = {}, options = {}) {
    return apiClient.get("/movements/paginated", params, options)
  },

  /**
   * 6.3. Obtener movimiento por ID
   */
  getById(id, options = {}) {
    return apiClient.get(`/movements/${id}`, undefined, options)
  },

  /**
   * 6.4. Crear movimiento
   */
  create(payload, options = {}) {
    return apiClient.post("/movements", payload, options)
  },

  /**
   * 6.5. Actualizar movimiento
   */
  update(id, payload, options = {}) {
    return apiClient.put(`/movements/${id}`, payload, options)
  },

  /**
   * 6.6. Eliminar movimiento
   */
  remove(id, options = {}) {
    return apiClient.delete(`/movements/${id}`, options)
  },
}

