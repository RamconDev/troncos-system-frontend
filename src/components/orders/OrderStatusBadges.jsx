import { Badge } from "@/components/ui/badge"

const DELIVERY_STYLES = {
  PENDING: {
    label: "Pendiente",
    className:
      "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  IN_TRANSIT: {
    label: "En Tránsito",
    className:
      "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  },
  DELIVERED: {
    label: "Entregado",
    className:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
}

const PAYMENT_STYLES = {
  UNPAID: {
    label: "Sin Pagar",
    className:
      "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
  },
  PARTIAL: {
    label: "Parcial",
    className:
      "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  PAID: {
    label: "Pagado",
    className:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
}

export function DeliveryStatusBadge({ status }) {
  const config = DELIVERY_STYLES[status] || {
    label: status || "—",
    className: "",
  }
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

export function PaymentStatusBadge({ status }) {
  const config = PAYMENT_STYLES[status] || {
    label: status || "—",
    className: "",
  }
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

