import * as React from "react"
import { healthService } from "@/services/health.service"

/**
 * Hook para monitorear en tiempo real el estado de la API y Base de Datos
 */
export function useSystemStatus({ pollIntervalMs = 30000 } = {}) {
  const [status, setStatus] = React.useState({
    loading: true,
    isOnline: false,
    isPartiallyOnline: false,
    checkedAt: null,
    endpoints: {
      server: { ok: false, endpoint: "/", message: "Verificando..." },
      database: { ok: false, endpoint: "/test-db", message: "Verificando..." },
      orders: {
        ok: false,
        endpoint: "/api/v1/orders/health",
        message: "Verificando...",
      },
    },
  })

  const runCheck = React.useCallback(async () => {
    try {
      const result = await healthService.checkAll()
      setStatus({
        loading: false,
        ...result,
      })
      return result
    } catch {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        isOnline: false,
        isPartiallyOnline: false,
        checkedAt: new Date().toISOString(),
      }))
      return null
    }
  }, [])

  const refresh = React.useCallback(async () => {
    setStatus((prev) => ({ ...prev, loading: true }))
    return runCheck()
  }, [runCheck])

  React.useEffect(() => {
    let active = true
    healthService.checkAll().then((result) => {
      if (active) {
        setStatus({ loading: false, ...result })
      }
    })
    if (!pollIntervalMs) {
      return () => {
        active = false
      }
    }
    const timer = setInterval(runCheck, pollIntervalMs)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [runCheck, pollIntervalMs])

  return {
    ...status,
    refresh,
  }
}
