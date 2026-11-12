import { apiClient } from "@/lib/api-client"

/**
 * Servicio para Clientes (`/api/v1/orders/customers`)
 * Sección 7 de troncos-system-API.md
 */
export const customersService = {
  /**
   * 7.1. Obtener todos los clientes (opcional: `{ search, reference }`)
   */
  getAll(params = {}, options = {}) {
    return apiClient.get("/customers", params, options)
  },

  /**
   * 7.2. Obtener clientes paginados (`{ page, per_page, search, reference }`)
   */
  getPaginated(params = {}, options = {}) {
    return apiClient.get("/customers/paginated", params, options)
  },

  /**
   * 7.3. Obtener cliente por ID
   */
  getById(id, options = {}) {
    return apiClient.get(`/customers/${id}`, undefined, options)
  },

  /**
   * 7.4. Crear cliente (`{ name, phone, reference }`)
   */
  create(payload, options = {}) {
    return apiClient.post("/customers", payload, options)
  },

  /**
   * 7.5. Actualizar cliente (`{ name, phone, reference }`)
   */
  update(id, payload, options = {}) {
    return apiClient.put(`/customers/${id}`, payload, options)
  },

  /**
   * 7.6. Eliminar cliente (retorna 409 CONFLICT_HAS_ORDERS si tiene órdenes)
   */
  remove(id, options = {}) {
    return apiClient.delete(`/customers/${id}`, options)
  },
}

