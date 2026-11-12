import { Badge } from "@/components/ui/badge"

const STATUS_STYLES = {
  OPEN: {
    label: "Abierto",
    className:
      "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
  },
  ORDERED: {
    label: "Pedido",
    className:
      "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  IN_TRANSIT: {
    label: "En Tránsito",
    className:
      "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  },
  RECEIVED: {
    label: "Recibido",
    className:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
}

export function SupplierOrderStatusBadge({ status }) {
  const config = STATUS_STYLES[status] || {
    label: status || "—",
    className: "",
  }

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

