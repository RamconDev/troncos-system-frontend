import {
  HelpCircle,
  FileText,
  Truck,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Package,
} from "lucide-react"

/**
 * Matriz visual normalizada para los estados de paquete
 * Basada en la Sección 5.1 de la especificación técnica
 */
export const PACKAGE_STATUS_META = {
  NOT_FOUND: {
    key: "NOT_FOUND",
    label: "No encontrado",
    colorClass: "bg-muted text-muted-foreground border-border",
    icon: HelpCircle,
    iconColor: "text-muted-foreground",
    description: "Guía no registrada o sin datos en la transportista",
  },
  INFO_RECEIVED: {
    key: "INFO_RECEIVED",
    label: "Etiqueta creada",
    colorClass:
      "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    icon: FileText,
    iconColor: "text-blue-500",
    description: "Datos electrónicos recibidos por la transportista",
  },
  IN_TRANSIT: {
    key: "IN_TRANSIT",
    label: "En tránsito",
    colorClass:
      "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    icon: Truck,
    iconColor: "text-amber-500",
    description: "Paquete viajando entre nodos internacionales",
  },
  OUT_FOR_DELIVERY: {
    key: "OUT_FOR_DELIVERY",
    label: "En reparto",
    colorClass:
      "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
    icon: Navigation,
    iconColor: "text-indigo-500",
    description: "Asignado al mensajero para entrega final",
  },
  DELIVERED: {
    key: "DELIVERED",
    label: "Entregado",
    colorClass:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    description: "Paquete entregado exitosamente al destinatario",
  },
  EXCEPTION: {
    key: "EXCEPTION",
    label: "Alerta / Retenido",
    colorClass:
      "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
    icon: AlertTriangle,
    iconColor: "text-rose-500",
    description: "Problema en aduana, dirección errónea o intento fallido",
  },
  EXPIRED: {
    key: "EXPIRED",
    label: "Expirado",
    colorClass:
      "bg-zinc-500/15 text-zinc-700 dark:text-zinc-400 border-zinc-500/30",
    icon: Clock,
    iconColor: "text-zinc-500",
    description: "Paquete sin movimiento por más de 30-60 días",
  },
}

/**
 * Obtiene la metadata para un estado de paquete, con fallback seguro a NOT_FOUND
 */
export function getPackageStatusMeta(statusKey) {
  if (!statusKey) return PACKAGE_STATUS_META.NOT_FOUND
  const normalized = String(statusKey).toUpperCase().trim()
  return PACKAGE_STATUS_META[normalized] || {
    key: normalized,
    label: normalized.replace(/_/g, " "),
    colorClass: "bg-muted text-muted-foreground border-border",
    icon: Package,
    iconColor: "text-muted-foreground",
    description: "Estado desconocido",
  }
}

/**
 * Metadata para etapas de eventos individuales (stage)
 */
export const EVENT_STAGE_META = {
  InfoReceived: { label: "Info Recibida", icon: FileText, color: "text-blue-500" },
  InTransit: { label: "En Tránsito", icon: Truck, color: "text-amber-500" },
  Customs: { label: "Aduana", icon: AlertTriangle, color: "text-orange-500" },
  OutForDelivery: { label: "En Reparto", icon: Navigation, color: "text-indigo-500" },
  Delivered: { label: "Entregado", icon: CheckCircle2, color: "text-emerald-500" },
}

export function getEventStageMeta(stage) {
  if (!stage) return null
  return EVENT_STAGE_META[stage] || null
}

/**
 * Genera el enlace de 17track para una sola guía o múltiples guías
 */
export function build17TrackSingleUrl(trackingNumber) {
  if (!trackingNumber) return null
  return `https://t.17track.net/es#nums=${encodeURIComponent(String(trackingNumber).trim())}`
}

/**
 * Formatea fechas ISO de checkpoints y timestamps
 */
export function formatTrackingDateTime(isoString) {
  if (!isoString) return "—"
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

