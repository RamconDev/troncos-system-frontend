import { apiClient } from "@/lib/api-client"

/**
 * Servicio para Métricas del Dashboard (`/api/v1/orders/dashboard`)
 */
export const dashboardService = {
  /**
   * Obtener métricas agregadas a nivel SQL para la vista general
   */
  getMetrics(options = {}) {
    return apiClient.get("/dashboard/metrics", {}, options)
  },
}

