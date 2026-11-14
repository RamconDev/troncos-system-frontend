import * as React from "react"
import {
  ExternalLink,
  RefreshCw,
  Clock,
  MapPin,
  HelpCircle,
  Truck,
  CheckCircle2,
  Package,
  Layers,
  ChevronRight,
  AlertCircle,
  Check,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { trackingService } from "@/services/tracking.service"
import {
  getPackageStatusMeta,
  build17TrackSingleUrl,
  formatTrackingDateTime,
} from "@/components/tracking/tracking-constants"
import {
  parseTrackingCodes,
  build17TrackUrl,
} from "@/components/supplier-orders/supplier-order-constants"
import { PackageTimelineDialog } from "@/components/tracking/PackageTimelineDialog"

export function SupplierOrderTrackingWidget({
  lot,
  onLotUpdated = null,
}) {
  const lotId = lot?.id
  const codes = React.useMemo(() => {
    return parseTrackingCodes(lot?.tracking_code)
  }, [lot?.tracking_code])

  const [packages, setPackages] = React.useState([])
  const [providerInfo, setProviderInfo] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [syncing, setSyncing] = React.useState(false)
  const [syncMessage, setSyncMessage] = React.useState(null)
  const [error, setError] = React.useState(null)

  // Estado para el modal de timeline de una guía individual
  const [selectedTrackingCode, setSelectedTrackingCode] = React.useState(null)
  const [timelineOpen, setTimelineOpen] = React.useState(false)
  const [activePackageData, setActivePackageData] = React.useState(null)

  // Carga el snapshot de rastreo del lote desde el backend
  const loadTrackingSnapshot = React.useCallback(async () => {
    if (!lotId || codes.length === 0) {
      setPackages([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await trackingService.getSupplierOrderTracking(lotId)
      const data = res.data
      let list = []
      if (Array.isArray(data)) {
        list = data
      } else if (Array.isArray(data?.packages)) {
        list = data.packages
      } else if (Array.isArray(lot?.trackings)) {
        list = lot.trackings
      }

      // Si el backend aún no tiene package_trackings para algún código, agregamos placeholders
      const existingCodes = new Set(list.map((p) => p.tracking_number || p.tracking_code))
      const combined = [...list]
      codes.forEach((c) => {
        if (!existingCodes.has(c)) {
          combined.push({
            tracking_number: c,
            status: lot.status === "DELIVERED" || lot.status === "RECEIVED"
              ? "DELIVERED"
              : lot.status === "IN_TRANSIT"
                ? "IN_TRANSIT"
                : "NOT_FOUND",
            carrier_name: null,
            last_event_description: null,
          })
        }
      })

      setPackages(combined)
    } catch (err) {
      // Si el endpoint de tracking falla (ej. sin configurar o 404), fallback a los códigos existentes
      if (Array.isArray(lot?.trackings) && lot.trackings.length > 0) {
        setPackages(lot.trackings)
      } else {
        setPackages(
          codes.map((c) => ({
            tracking_number: c,
            status: lot.status === "DELIVERED" || lot.status === "RECEIVED"
              ? "DELIVERED"
              : lot.status === "IN_TRANSIT"
                ? "IN_TRANSIT"
                : "NOT_FOUND",
          }))
        )
      }
    } finally {
      setLoading(false)
    }
  }, [lotId, codes, lot?.trackings, lot?.status])

  React.useEffect(() => {
    loadTrackingSnapshot()
  }, [loadTrackingSnapshot])

  React.useEffect(() => {
    trackingService
      .getProviderInfo()
      .then((res) => {
        if (res?.data) setProviderInfo(res.data)
      })
      .catch(() => {})
  }, [])

  // Acción: Sincronizar guías de este lote con la transportista
  const handleSyncLot = async (forceRefresh = false) => {
    if (!lotId) return
    setSyncing(true)
    setError(null)
    setSyncMessage(null)

    try {
      const res = await trackingService.syncSupplierOrder(lotId, {
        forceRefresh,
      })
      const message =
        res.message ||
        "Guías sincronizadas correctamente con la transportista"
      setSyncMessage(message)
      setTimeout(() => setSyncMessage(null), 4000)

      // Recarga el snapshot y avisa al panel padre que el lote pudo haber cambiado de estado
      await loadTrackingSnapshot()
      onLotUpdated?.()
    } catch (err) {
      setError(
        err.friendlyMessage ||
          err.message ||
          "Error al sincronizar guías con la transportista"
      )
    } finally {
      setSyncing(false)
    }
  }

  // Abre el diálogo de timeline para una guía
  const handleOpenTimeline = (pkg) => {
    const code = pkg.tracking_number || pkg.tracking_code
    setSelectedTrackingCode(code)
    setActivePackageData(pkg)
    setTimelineOpen(true)
  }

  // Al actualizarse una guía dentro del diálogo de timeline
  const handlePackageUpdatedFromTimeline = (updatedPkg) => {
    setPackages((prev) =>
      prev.map((p) => {
        const pCode = p.tracking_number || p.tracking_code
        const uCode = updatedPkg.tracking_number || updatedPkg.tracking_code
        return pCode === uCode ? { ...p, ...updatedPkg } : p
      })
    )
    onLotUpdated?.()
  }

  // Métricas de paquetes
  const totalPackages = packages.length || codes.length
  const deliveredCount = packages.filter(
    (p) => (p.status || "").toUpperCase() === "DELIVERED"
  ).length
  const inTransitCount = packages.filter((p) => {
    const st = (p.status || "").toUpperCase()
    return st === "IN_TRANSIT" || st === "OUT_FOR_DELIVERY" || st === "INFO_RECEIVED"
  }).length
  const progressPercentage =
    totalPackages > 0 ? Math.round((deliveredCount / totalPackages) * 100) : 0

  const isMockProvider = Boolean(
    providerInfo &&
      (String(providerInfo.provider || "").toLowerCase().includes("mock") ||
        providerInfo.is_mock === true ||
        providerInfo.is_configured === false)
  )

  if (codes.length === 0) {
    return (
      <div className="flex items-center justify-between border-b bg-muted/15 px-4 py-3 text-xs text-muted-foreground sm:px-6">
        <span>Este lote aún no tiene códigos de rastreo registrados.</span>
      </div>
    )
  }

  const multi17TrackUrl = build17TrackUrl(codes)

  return (
    <div className="flex flex-col gap-3 border-b bg-muted/15 px-4 py-3 sm:px-6">
      {/* Encabezado del widget y barra de acciones */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Truck className="size-4 text-primary" />
          <span className="text-xs font-bold text-foreground">
            Monitoreo de Envíos ({deliveredCount}/{totalPackages} entregados)
          </span>
          {providerInfo && (
            <Badge
              variant="outline"
              className={`text-[10px] font-medium h-4.5 ${
                isMockProvider
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
              }`}
            >
              {isMockProvider ? "Simulador Mock" : "17track Real"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {multi17TrackUrl && codes.length > 1 && (
            <a
              href={multi17TrackUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-[11px] font-medium text-foreground hover:bg-accent transition-colors"
            >
              <ExternalLink className="size-3 text-muted-foreground" />
              Rastrear todos ({codes.length})
            </a>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={syncing || loading}
            onClick={() => handleSyncLot(false)}
            className="h-7 px-2.5 text-xs gap-1 font-medium bg-background shadow-2xs"
            title="Sincronizar estados con la transportista (usa caché si está vigente)"
          >
            <RefreshCw className={`size-3 ${syncing ? "animate-spin text-primary" : ""}`} />
            {syncing ? "Sincronizando..." : "Sincronizar Guías"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={syncing || loading}
            onClick={() => handleSyncLot(true)}
            className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
            title="Forzar actualización sin usar caché"
          >
            Forzar
          </Button>
        </div>
      </div>

      {/* Aviso si el backend está en modo mock/simulación */}
      {isMockProvider && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600" />
          <div className="flex-1 text-[11px] leading-tight space-y-0.5">
            <p className="font-semibold">Proveedor en modo Simulación (Mock):</p>
            <p className="text-muted-foreground">
              El backend tiene activo el simulador de prueba. Las ubicaciones (ej. ciudades ficticias) y estados entregados son generados de ejemplo por el servidor. Para rastrear las guías reales con la transportista, configura tu clave API de 17track en el archivo <code>.env</code> del backend.
            </p>
          </div>
        </div>
      )}

      {/* Barra de progreso de entrega */}
      <div className="rounded-lg border bg-background p-2.5 shadow-2xs space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-medium text-muted-foreground">Progreso de entrega:</span>
            <span className="font-mono font-bold text-foreground">
              {progressPercentage}%
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              {deliveredCount} entregado{deliveredCount === 1 ? "" : "s"}
            </span>
            {inTransitCount > 0 && (
              <span className="text-amber-700 dark:text-amber-400 font-semibold">
                {inTransitCount} en tránsito
              </span>
            )}
          </div>
        </div>

        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPercentage >= 100
                ? "bg-emerald-500"
                : progressPercentage > 50
                  ? "bg-blue-500"
                  : "bg-amber-500"
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Feedback de sincronización */}
      {syncMessage && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
          <Check className="size-3.5 shrink-0 text-emerald-600" />
          <span>{syncMessage}</span>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs text-destructive flex items-center gap-1.5">
          <AlertCircle className="size-3.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSyncLot(false)}
            className="h-6 text-[10px] px-1.5"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Lista de tarjetas de guías */}
      <div className="grid grid-cols-1 gap-2">
        {packages.map((pkg) => {
          const code = pkg.tracking_number || pkg.tracking_code
          const statusMeta = getPackageStatusMeta(pkg.status)
          const StatusIcon = statusMeta.icon
          const singleUrl = build17TrackSingleUrl(code)
          const isDelivered = (pkg.status || "").toUpperCase() === "DELIVERED"

          return (
            <div
              key={code}
              className="flex flex-col gap-2 rounded-lg border bg-background p-3 text-xs shadow-2xs hover:border-foreground/30 transition-all sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Info de la guía y transportista */}
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-foreground text-sm">
                    {code}
                  </span>
                  {pkg.carrier_name && (
                    <Badge variant="outline" className="text-[10px] font-medium h-4.5">
                      {pkg.carrier_name}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold h-4.5 ${statusMeta.colorClass}`}
                  >
                    <StatusIcon className={`size-3 mr-1 ${statusMeta.iconColor}`} />
                    {statusMeta.label}
                  </Badge>
                </div>

                {/* Último evento reportado */}
                {pkg.last_event_description ? (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground pt-0.5">
                    <span className="font-medium text-foreground truncate max-w-xs">
                      {pkg.last_event_description}
                    </span>
                    {pkg.last_event_location && (
                      <span className="inline-flex items-center gap-0.5 text-[10px]">
                        <MapPin className="size-2.5 text-muted-foreground" />
                        {pkg.last_event_location}
                      </span>
                    )}
                    {pkg.last_event_time && (
                      <span className="text-[10px] font-mono">
                        • {formatTrackingDateTime(pkg.last_event_time)}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    {isDelivered
                      ? "Paquete entregado en destino"
                      : "Sin eventos registrados recientemente"}
                  </p>
                )}
              </div>

              {/* Botones de acción para esta guía */}
              <div className="flex items-center gap-1.5 shrink-0 ml-auto pt-1 sm:pt-0">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenTimeline(pkg)}
                  className="h-7 px-2 text-[11px] gap-1"
                  title="Ver línea de tiempo y eventos detallados de este paquete"
                >
                  <Clock className="size-3" />
                  Ver Historial
                  <ChevronRight className="size-3 text-muted-foreground" />
                </Button>

                {singleUrl && (
                  <a
                    href={singleUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Abrir directamente en 17track"
                    className="inline-flex h-7 items-center justify-center rounded-md border border-border bg-background p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Diálogo del historial de checkpoints */}
      <PackageTimelineDialog
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        trackingNumber={selectedTrackingCode}
        supplierOrderId={lotId}
        initialPackage={activePackageData}
        onPackageUpdated={handlePackageUpdatedFromTimeline}
      />
    </div>
  )
}

