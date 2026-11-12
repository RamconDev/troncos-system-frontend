import { apiClient } from "@/lib/api-client"

/**
 * Servicio para los Endpoints de Estado del Sistema (Sección 3 de troncos-system-API.md)
 * - GET /                   -> Servidor principal activo
 * - GET /test-db            -> Conexión activa con la base de datos
 * - GET /api/v1/orders/health -> Blueprint de pedidos activo
 */
export const healthService = {
  /**
   * Verifica que el servidor principal esté activo (`GET /`)
   */
  checkServer(options = {}) {
    return apiClient.raw("/", { ...options, method: "GET" })
  },

  /**
   * Verifica la conexión activa con la base de datos (`GET /test-db`)
   */
  checkDatabase(options = {}) {
    return apiClient.raw("/test-db", { ...options, method: "GET" })
  },

  /**
   * Verifica que el blueprint de pedidos esté activo (`GET /api/v1/orders/health`)
   */
  checkOrdersBlueprint(options = {}) {
    return apiClient.get("/health", undefined, options)
  },

  /**
   * Ejecuta el diagnóstico completo de los 3 endpoints de estado en paralelo
   */
  async checkAll(options = {}) {
    const [serverResult, dbResult, ordersResult] = await Promise.allSettled([
      this.checkServer(options),
      this.checkDatabase(options),
      this.checkOrdersBlueprint(options),
    ])

    const serverOk = serverResult.status === "fulfilled"
    const dbOk = dbResult.status === "fulfilled"
    const ordersOk = ordersResult.status === "fulfilled"

    return {
      isOnline: ordersOk && dbOk,
      isPartiallyOnline: serverOk || ordersOk || dbOk,
      checkedAt: new Date().toISOString(),
      endpoints: {
        server: {
          ok: serverOk,
          endpoint: "/",
          message: serverOk
            ? serverResult.value.message || "Servidor principal activo"
            : serverResult.reason?.message || "Sin respuesta",
        },
        database: {
          ok: dbOk,
          endpoint: "/test-db",
          message: dbOk
            ? dbResult.value.message || "Base de datos conectada"
            : dbResult.reason?.message || "Sin conexión a BD",
        },
        orders: {
          ok: ordersOk,
          endpoint: "/api/v1/orders/health",
          message: ordersOk
            ? ordersResult.value.message || "Módulo de pedidos activo"
            : ordersResult.reason?.message || "Módulo inactivo",
        },
      },
    }
  },
}

