import { apiClient } from "@/lib/api-client"

/**
 * Servicio para Analíticas & Reportes Mensuales (`/api/v1/orders/analytics`)
 */
export const analyticsService = {
  /**
   * Obtener estadísticas agregadas mensuales desde el backend
   * @param {Object} params - { months?: number, year?: number }
   * @param {Object} options - Opciones adicionales de fetch (signal, etc.)
   */
  getMonthly(params = {}, options = {}) {
    return apiClient.get("/analytics/monthly", params, options)
  },
}

