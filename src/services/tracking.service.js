import { apiClient } from "@/lib/api-client"

/**
 * Servicio para Rastreo y Sincronización de Paquetes (`/api/v1/tracking`)
 * Especificación de integración Troncos Tracking Engine
 */
export const trackingService = {
  /**
   * Health check del módulo de tracking
   */
  getHealth(options = {}) {
    return apiClient.get("/api/v1/tracking/health", undefined, options)
  },

  /**
   * Información del proveedor activo (17track / mock), TTL de caché y estado
   */
  getProviderInfo(options = {}) {
    return apiClient.get("/api/v1/tracking/provider-info", undefined, options)
  },

  /**
   * Consulta el estado en tiempo real o en caché + checkpoints de una guía específica
   * @param {string} trackingNumber - Código de rastreo
   * @param {object} [params] - { force_refresh: boolean, supplier_order_id: number }
   */
  getTracking(trackingNumber, params = {}, options = {}) {
    const cleanCode = encodeURIComponent(String(trackingNumber).trim())
    return apiClient.get(
      `/api/v1/tracking/track/${cleanCode}`,
      params,
      options
    )
  },

  /**
   * Consulta por lote (batch) para múltiples códigos de guía
   * @param {string[]} trackingNumbers
   * @param {object} [extra] - { force_refresh: boolean, supplier_order_id: number }
   */
  trackBatch(trackingNumbers = [], extra = {}, options = {}) {
    return apiClient.post(
      "/api/v1/tracking/track/batch",
      {
        tracking_numbers: trackingNumbers,
        force_refresh: Boolean(extra.forceRefresh ?? extra.force_refresh),
        supplier_order_id: extra.supplierOrderId ?? extra.supplier_order_id,
      },
      options
    )
  },

  /**
   * Sincroniza todas las guías de un lote y actualiza automáticamente el estado de la orden
   * @param {number|string} supplierOrderId - ID del lote
   * @param {object} [params] - { force_refresh: boolean }
   */
  syncSupplierOrder(supplierOrderId, params = {}, options = {}) {
    const queryParams = {}
    if (params.forceRefresh !== undefined || params.force_refresh !== undefined) {
      queryParams.force_refresh = String(
        Boolean(params.forceRefresh ?? params.force_refresh)
      )
    }
    return apiClient.post(
      `/api/v1/tracking/sync/supplier-order/${supplierOrderId}`,
      null,
      {
        ...options,
        params: queryParams,
      }
    )
  },

  /**
   * Sincroniza automáticamente todos los lotes activos (OPEN / IN_TRANSIT) que tengan guías
   */
  syncAllActive(options = {}) {
    return apiClient.post("/api/v1/tracking/sync/all-active", null, options)
  },

  /**
   * Snapshot consolidado de rastreo y lista de paquetes de un lote
   * @param {number|string} supplierOrderId - ID del lote
   */
  getSupplierOrderTracking(supplierOrderId, options = {}) {
    return apiClient.get(
      `/api/v1/tracking/supplier-order/${supplierOrderId}`,
      undefined,
      options
    )
  },

  /**
   * Lista paginada de paquetes rastreados en la base de datos
   * @param {object} [params] - { page, per_page, status, carrier, search, supplier_order_id }
   */
  getPackages(params = {}, options = {}) {
    return apiClient.get("/api/v1/tracking/packages", params, options)
  },
}

