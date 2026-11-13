import * as React from "react"
import {
  Loader2,
  Truck,
  CheckCircle2,
  HelpCircle,
  PackageCheck,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Lock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  build17TrackUrl,
  parseTrackingCodes,
} from "@/components/supplier-orders/supplier-order-constants"

const TRACKING_STATE_META = {
  CHECKING: {
    label: "Consultando...",
    icon: Loader2,
    iconClass: "text-amber-500 animate-spin",
    badgeClass:
      "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  INFO_RECEIVED: {
    label: "Info Recibida",
    icon: PackageCheck,
    iconClass: "text-indigo-500",
    badgeClass:
      "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
  },
  IN_TRANSIT: {
    label: "En Tránsito",
    icon: Truck,
    iconClass: "text-blue-500",
    badgeClass:
      "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  },
  DELIVERED: {
    label: "Entregado",
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    badgeClass:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
  NOT_FOUND: {
    label: "No Encontrado",
    icon: HelpCircle,
    iconClass: "text-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
  EXCEPTION: {
    label: "Novedad / Alerta",
    icon: AlertTriangle,
    iconClass: "text-rose-500",
    badgeClass:
      "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
  },
}

/**
 * Determina el estado inicial sugerido para cada código según el estado del lote
 * o desde el arreglo `trackings` del backend si ya está disponible.
 */
function inferInitialTrackingState(lotStatus) {
  if (lotStatus === "RECEIVED" || lotStatus === "DELIVERED") return "DELIVERED"
  if (lotStatus === "IN_TRANSIT") return "IN_TRANSIT"
  if (lotStatus === "ORDERED") return "INFO_RECEIVED"
  return "NOT_FOUND"
}

export function TrackingCodesStatusList({
  trackingCode,
  trackingItems = null,
  lotStatus = "OPEN",
  onAllPackagesDelivered,
}) {
  const codes = React.useMemo(() => {
    if (Array.isArray(trackingItems) && trackingItems.length > 0) {
      return trackingItems.map((t) => t.tracking_code).filter(Boolean)
    }
    return parseTrackingCodes(trackingCode)
  }, [trackingCode, trackingItems])

  const [statusByCode, setStatusByCode] = React.useState({})

  React.useEffect(() => {
    const initial = {}
    if (Array.isArray(trackingItems) && trackingItems.length > 0) {
      trackingItems.forEach((item) => {
        initial[item.tracking_code] = item.is_delivered
          ? "DELIVERED"
          : item.status || inferInitialTrackingState(lotStatus)
      })
    } else {
      codes.forEach((code) => {
        initial[code] = inferInitialTrackingState(lotStatus)
      })
    }
    setStatusByCode(initial)
  }, [codes, trackingItems, lotStatus])

  // Verifica si todos los códigos están en estado DELIVERED para notificar al lote padre
  const deliveredCount = codes.filter(
    (code) => statusByCode[code] === "DELIVERED"
  ).length
  const allDelivered = codes.length > 0 && deliveredCount === codes.length

  const handleCheckTracking = (code) => {
    // Si ya fue entregado (is_delivered = true), no volvemos a hacer consulta
    if (statusByCode[code] === "DELIVERED") return

    setStatusByCode((prev) => ({ ...prev, [code]: "CHECKING" }))
    setTimeout(() => {
      setStatusByCode((prev) => ({
        ...prev,
        [code]: inferInitialTrackingState(lotStatus),
      }))
    }, 900)
  }

  const handleCheckPending = () => {
    const pendingCodes = codes.filter((c) => statusByCode[c] !== "DELIVERED")
    pendingCodes.forEach((c) => handleCheckTracking(c))
  }

  // Permite marcar manualmente una guía como entregada o simular la respuesta de la API
  const handleMarkCodeDelivered = (code) => {
    setStatusByCode((prev) => {
      const next = { ...prev, [code]: "DELIVERED" }
      const everyDelivered =
        codes.length > 0 && codes.every((c) => next[c] === "DELIVERED")
      if (
        everyDelivered &&
        lotStatus !== "DELIVERED" &&
        lotStatus !== "RECEIVED"
      ) {
        onAllPackagesDelivered?.()
      }
      return next
    })
  }

  if (codes.length === 0) {
    return (
      <div className="px-4 py-3 text-xs text-muted-foreground sm:px-6">
        Este lote aún no tiene códigos de rastreo registrados.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 border-b bg-muted/15 px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">
            Códigos de Rastreo ({deliveredCount}/{codes.length} entregados)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {codes.length > 1 && (
            <a
              href={build17TrackUrl(codes)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              <ExternalLink className="size-3" />
              Rastrear todos ({codes.length})
            </a>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={allDelivered}
            className="h-7 px-2 text-xs"
            onClick={handleCheckPending}
            title={
              allDelivered
                ? "Todas las guías ya fueron entregadas; no se requieren más consultas"
                : "Consultar solo las guías que aún no han sido entregadas"
            }
          >
            <RefreshCw className="size-3" />
            {allDelivered ? "Todos entregados" : "Consultar pendientes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {codes.map((code) => {
          const stateKey = statusByCode[code] || "NOT_FOUND"
          const isDelivered = stateKey === "DELIVERED"
          const meta =
            TRACKING_STATE_META[stateKey] || TRACKING_STATE_META.NOT_FOUND
          const Icon = meta.icon
          const singleUrl = build17TrackUrl([code])

          return (
            <div
              key={code}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-xs shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={`size-4 shrink-0 ${meta.iconClass}`} />
                <span className="font-mono font-semibold text-foreground truncate">
                  {code}
                </span>
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                <Badge
                  variant="outline"
                  className={`text-[11px] ${meta.badgeClass}`}
                >
                  {meta.label}
                </Badge>

                {isDelivered ? (
                  <span
                    title="Guía entregada (is_delivered = true). Bloqueada para no consumir más consultas de la API."
                    className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400"
                  >
                    <Lock className="size-3" />
                    Cerrado
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      title="Consultar estado de esta guía"
                      onClick={() => handleCheckTracking(code)}
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <RefreshCw className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Marcar esta guía como entregada en destino"
                      onClick={() => handleMarkCodeDelivered(code)}
                      className="rounded p-1 text-muted-foreground hover:bg-emerald-500/15 hover:text-emerald-600"
                    >
                      <CheckCircle2 className="size-3.5" />
                    </button>
                  </>
                )}

                {singleUrl && (
                  <a
                    href={singleUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Abrir detalle en 17track"
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium text-primary hover:bg-primary/10"
                  >
                    <ExternalLink className="size-3" />
                    17track
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
