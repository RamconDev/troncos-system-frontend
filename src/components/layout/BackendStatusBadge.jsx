import { RefreshCw, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSystemStatus } from "@/hooks/use-system-status"
import { apiClient } from "@/lib/api-client"

export function BackendStatusBadge() {
  const { loading, isOnline, isPartiallyOnline, endpoints, refresh } = useSystemStatus()

  const dotColor = loading
    ? "bg-amber-500 animate-pulse"
    : isOnline
      ? "bg-emerald-500 animate-pulse"
      : isPartiallyOnline
        ? "bg-amber-500"
        : "bg-destructive"

  const statusLabel = loading
    ? "Verificando..."
    : isOnline
      ? "En Línea"
      : isPartiallyOnline
        ? "Parcial"
        : "Sin Conexión"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="focus:outline-none">
          <Badge
            variant="outline"
            className="hidden sm:inline-flex items-center gap-1.5 py-1 text-xs cursor-pointer hover:bg-accent"
          >
            <span className={`h-2 w-2 rounded-full ${dotColor}`} />
            <span>{statusLabel}</span>
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Estado del Backend</span>
          <span className="text-[11px] font-normal text-muted-foreground">
            {apiClient.baseUrl}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(endpoints).map(([key, item]) => (
          <div
            key={key}
            className="flex items-start justify-between gap-2 px-2 py-1.5 text-xs"
          >
            <div className="flex items-center gap-1.5">
              {item.ok ? (
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="size-3.5 text-destructive shrink-0" />
              )}
              <code className="font-mono text-[11px]">{item.endpoint}</code>
            </div>
            <span
              className="text-muted-foreground truncate max-w-[120px]"
              title={item.message}
            >
              {item.ok ? "Activo" : "Inactivo"}
            </span>
          </div>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            refresh()
          }}
          className="cursor-pointer justify-center text-xs font-medium"
        >
          <RefreshCw className={`mr-1.5 size-3.5 ${loading ? "animate-spin" : ""}`} />
          Verificar conexión ahora
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

