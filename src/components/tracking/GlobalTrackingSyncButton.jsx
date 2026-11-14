import * as React from "react"
import { RefreshCw, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trackingService } from "@/services/tracking.service"

export function GlobalTrackingSyncButton({
  onSyncSuccess = null,
  className = "",
  size = "sm",
  variant = "outline",
}) {
  const [syncing, setSyncing] = React.useState(false)
  const [resultMessage, setResultMessage] = React.useState(null)
  const [error, setError] = React.useState(null)

  const handleSync = async () => {
    setSyncing(true)
    setError(null)
    setResultMessage(null)

    try {
      const res = await trackingService.syncAllActive()
      const data = res.data || {}
      const updatedCount =
        data.orders_updated ??
        data.updated_orders ??
        data.updated_count ??
        0
      const msg =
        res.message ||
        (updatedCount > 0
          ? `${updatedCount} lote(s) actualizado(s)`
          : "Envíos al día (sin cambios)")

      setResultMessage(msg)
      setTimeout(() => setResultMessage(null), 5000)

      onSyncSuccess?.(res)
    } catch (err) {
      const errMsg =
        err.friendlyMessage ||
        err.message ||
        "Error al sincronizar guías activas"
      setError(errMsg)
      setTimeout(() => setError(null), 6000)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={syncing}
        onClick={handleSync}
        className="gap-1.5 shadow-2xs font-medium"
        title="Sincroniza automáticamente todos los lotes abiertos o en tránsito con la transportista"
      >
        <RefreshCw
          className={`size-3.5 ${
            syncing ? "animate-spin text-primary" : "text-muted-foreground"
          }`}
        />
        <span>{syncing ? "Sincronizando..." : "Sincronizar Envíos"}</span>
      </Button>

      {resultMessage && (
        <div className="absolute top-full left-0 z-50 mt-1.5 flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-300 shadow-md whitespace-nowrap animate-in fade-in slide-in-from-top-1">
          <Check className="size-3.5 text-emerald-600 shrink-0" />
          <span>{resultMessage}</span>
        </div>
      )}

      {error && (
        <div className="absolute top-full left-0 z-50 mt-1.5 flex items-center gap-1.5 rounded-md border border-destructive/40 bg-rose-50 dark:bg-rose-950/80 px-2.5 py-1 text-xs font-medium text-rose-800 dark:text-rose-300 shadow-md whitespace-nowrap animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="size-3.5 text-destructive shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

