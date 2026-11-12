import { apiClient } from "@/lib/api-client"

/**
 * Servicio para Productos de la Orden (`/api/v1/orders/products`)
 * Sección 10 de troncos-system-API.md
 */
export const productsService = {
  /**
   * 10.1. Obtener todos los productos (`{ customer_order_id, size, search }`)
   */
  getAll(params = {}, options = {}) {
    return apiClient.get("/products", params, options)
  },

  /**
   * 10.2. Obtener productos paginados (`{ page, per_page, customer_order_id, size, search }`)
   */
  getPaginated(params = {}, options = {}) {
    return apiClient.get("/products/paginated", params, options)
  },

  /**
   * 10.3. Obtener producto por ID
   */
  getById(id, options = {}) {
    return apiClient.get(`/products/${id}`, undefined, options)
  },

  /**
   * 10.4. Crear producto dentro de una orden
   */
  create(payload, options = {}) {
    return apiClient.post("/products", payload, options)
  },

  /**
   * 10.5. Actualizar producto
   */
  update(id, payload, options = {}) {
    return apiClient.put(`/products/${id}`, payload, options)
  },

  /**
   * 10.6. Eliminar producto
   */
  remove(id, options = {}) {
    return apiClient.delete(`/products/${id}`, options)
  },
}

