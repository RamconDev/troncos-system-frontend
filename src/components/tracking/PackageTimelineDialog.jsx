import * as React from "react"
import {
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  MapPin,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { trackingService } from "@/services/tracking.service"
import {
  getPackageStatusMeta,
  getEventStageMeta,
  build17TrackSingleUrl,
  formatTrackingDateTime,
} from "@/components/tracking/tracking-constants"

export function PackageTimelineDialog({
  open,
  onOpenChange,
  trackingNumber,
  supplierOrderId = null,
  initialPackage = null,
  onPackageUpdated = null,
}) {
  const [data, setData] = React.useState(initialPackage)
  const [loading, setLoading] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [copied, setCopied] = React.useState(false)

  // Sincroniza datos iniciales cuando cambia la guía o se abre el diálogo
  React.useEffect(() => {
    if (open && trackingNumber) {
      setData(initialPackage)
      fetchDetails(false)
    } else if (!open) {
      setError(null)
    }
  }, [open, trackingNumber])

  const fetchDetails = async (forceRefresh = false) => {
    if (!trackingNumber) return
    if (forceRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const res = await trackingService.getTracking(trackingNumber, {
        force_refresh: forceRefresh,
        supplier_order_id: supplierOrderId || undefined,
      })
      const pkgData = res.data || {}
      setData(pkgData)
      onPackageUpdated?.(pkgData)
    } catch (err) {
      setError(
        err.friendlyMessage ||
          err.message ||
          "Error al consultar el rastreo de la guía"
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleCopy = () => {
    if (!trackingNumber) return
    navigator.clipboard?.writeText(trackingNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const statusMeta = getPackageStatusMeta(data?.status)
  const StatusIcon = statusMeta.icon
  const externalUrl = build17TrackSingleUrl(trackingNumber)

  // Normaliza lista de eventos (puede venir como arreglo o como string JSON en raw_events)
  const events = React.useMemo(() => {
    if (!data) return []
    if (Array.isArray(data.events)) return data.events
    if (data.raw_events) {
      try {
        const parsed = JSON.parse(data.raw_events)
        if (Array.isArray(parsed)) return parsed
      } catch (_) {}
    }
    // Fallback: si hay last_event_description se genera un evento sintético
    if (data.last_event_description) {
      return [
        {
          time: data.last_event_time || data.updated_at,
          description: data.last_event_description,
          location: data.last_event_location,
          stage: data.status,
        },
      ]
    }
    return []
  }, [data])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader className="border-b pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-foreground">
                {trackingNumber}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                title="Copiar código de guía"
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>

            <Badge
              variant="outline"
              className={`text-xs font-semibold ${statusMeta.colorClass}`}
            >
              <StatusIcon className={`size-3.5 mr-1 ${statusMeta.iconColor}`} />
              {statusMeta.label}
            </Badge>
          </div>

          <DialogTitle className="sr-only">
            Historial de Rastreo {trackingNumber}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {data?.carrier_name || data?.carrier_code
              ? `Transportista: ${data.carrier_name || data.carrier_code}`
              : "Consulta de estado y eventos del paquete"}
          </DialogDescription>
        </DialogHeader>

        {/* Barra de metadatos y acciones rápidas */}
        <div className="rounded-lg border bg-muted/20 p-3 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {(data?.origin_country || data?.destination_country) && (
                <div className="flex items-center gap-1 font-mono text-[11px] font-medium text-foreground bg-background border px-2 py-0.5 rounded">
                  <span>{data.origin_country || "—"}</span>
                  <ArrowRight className="size-3 text-muted-foreground" />
                  <span>{data.destination_country || "—"}</span>
                </div>
              )}
              {data?.sub_status && (
                <span className="text-[11px] text-muted-foreground italic">
                  ({data.sub_status})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <Button
                variant="outline"
                size="sm"
                disabled={refreshing || loading}
                onClick={() => fetchDetails(true)}
                className="h-7 px-2.5 text-xs gap-1"
                title="Forzar actualización y consultar la transportista en tiempo real"
              >
                <RefreshCw
                  className={`size-3 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Actualizando..." : "Actualizar"}
              </Button>

              {externalUrl && (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-7 items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  <ExternalLink className="size-3" />
                  17track
                </a>
              )}
            </div>
          </div>

          {data?.last_checked_at && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground border-t pt-1.5">
              <Clock className="size-3" />
              <span>
                Última comprobación:{" "}
                <strong>{formatTrackingDateTime(data.last_checked_at)}</strong>
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Error al consultar la guía</p>
              <p className="mt-0.5">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDetails(true)}
              className="h-6 text-[11px] shrink-0"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* Timeline / Historial de eventos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-1.5">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Eventos y Checkpoints ({events.length})
            </span>
            {loading && !refreshing && (
              <span className="text-[11px] text-muted-foreground animate-pulse">
                Cargando historial...
              </span>
            )}
          </div>

          {events.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              {loading ? (
                <p>Consultando eventos con la transportista...</p>
              ) : (
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    Aún no hay eventos registrados para esta guía.
                  </p>
                  <p className="text-[11px]">
                    Es posible que la transportista apenas haya recibido los datos
                    electrónicos o el paquete esté pendiente de recepción física.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {events.map((evt, idx) => {
                const isLatest = idx === 0
                const stageMeta = getEventStageMeta(evt.stage)

                return (
                  <div key={`${evt.time}-${idx}`} className="relative group">
                    {/* Indicador / Nodo */}
                    <div
                      className={`absolute -left-6 top-1 size-3 rounded-full border-2 bg-background transition-transform group-hover:scale-125 ${
                        isLatest
                          ? "border-emerald-500 bg-emerald-500 ring-2 ring-emerald-500/20"
                          : "border-muted-foreground/50"
                      }`}
                    />

                    <div className="rounded-lg border bg-card p-3 shadow-2xs space-y-1 hover:border-foreground/30 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                        <span className="font-mono font-medium text-muted-foreground">
                          {formatTrackingDateTime(evt.time)}
                        </span>
                        {stageMeta && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-4.5 px-1.5"
                          >
                            {stageMeta.label}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs font-medium text-foreground leading-snug">
                        {evt.description || "Evento sin descripción"}
                      </p>

                      {evt.location && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-0.5">
                          <MapPin className="size-3 shrink-0 text-muted-foreground" />
                          <span>{evt.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

