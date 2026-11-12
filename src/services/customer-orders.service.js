import { apiClient } from "@/lib/api-client"

/**
 * Servicio para Órdenes de Clientes (`/api/v1/orders/customer-orders`)
 * Sección 9 de troncos-system-API.md
 */
export const customerOrdersService = {
  /**
   * 9.1. Obtener todas las órdenes de clientes
   * Params opcionales: { customer_id, supplier_order_id, unassigned_only, delivery_status, payment_status, include_products }
   */
  getAll(params = {}, options = {}) {
    return apiClient.get("/customer-orders", params, options)
  },

  /**
   * 9.2. Obtener órdenes de clientes paginadas
   */
  getPaginated(params = {}, options = {}) {
    return apiClient.get("/customer-orders/paginated", params, options)
  },

  /**
   * 9.3. Obtener orden de cliente por ID
   */
  getById(id, options = {}) {
    return apiClient.get(`/customer-orders/${id}`, undefined, options)
  },

  /**
   * 9.4. Crear orden de cliente (permite enviar `products` anidados)
   */
  create(payload, options = {}) {
    return apiClient.post("/customer-orders", payload, options)
  },

  /**
   * 9.5. Actualizar orden de cliente
   */
  update(id, payload, options = {}) {
    return apiClient.put(`/customer-orders/${id}`, payload, options)
  },

  /**
   * 9.6. Eliminar orden de cliente (elimina en cascada sus productos)
   */
  remove(id, options = {}) {
    return apiClient.delete(`/customer-orders/${id}`, options)
  },
}

