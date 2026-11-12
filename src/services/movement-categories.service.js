import { apiClient } from "@/lib/api-client"

/**
 * Servicio para Categorías de Movimientos (`/api/v1/orders/movement-categories`)
 * Sección 5 de troncos-system-API.md
 */
export const movementCategoriesService = {
  /**
   * 5.1. Obtener todas las categorías (opcional: `{ default_type: "INCOME" | "EXPENSE" }`)
   */
  getAll(params = {}, options = {}) {
    return apiClient.get("/movement-categories", params, options)
  },

  /**
   * 5.2. Obtener categorías paginadas (`{ page, per_page, search, default_type }`)
   */
  getPaginated(params = {}, options = {}) {
    return apiClient.get("/movement-categories/paginated", params, options)
  },

  /**
   * 5.3. Obtener categoría por ID
   */
  getById(id, options = {}) {
    return apiClient.get(`/movement-categories/${id}`, undefined, options)
  },

  /**
   * 5.4. Crear categoría (`{ name, default_type, description }`)
   */
  create(payload, options = {}) {
    return apiClient.post("/movement-categories", payload, options)
  },

  /**
   * 5.5. Actualizar categoría
   */
  update(id, payload, options = {}) {
    return apiClient.put(`/movement-categories/${id}`, payload, options)
  },

  /**
   * 5.6. Eliminar categoría
   */
  remove(id, options = {}) {
    return apiClient.delete(`/movement-categories/${id}`, options)
  },
}

