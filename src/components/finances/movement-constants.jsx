import {
  Landmark,
  ShoppingCart,
  Wallet,
  Truck,
  Tag,
  PiggyBank,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

/**
 * Metadata normalizada de categorías de movimientos financieros
 */
export const MOVEMENT_CATEGORIES_META = {
  CAPITAL_INJECTION: {
    key: "CAPITAL_INJECTION",
    label: "Inyección de Capital",
    colorClass:
      "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-700/40",
    icon: Landmark,
    defaultType: "INCOME",
    description: "Aporte de capital propio, inversión o inyección de liquidez a la caja",
    requiresSource: false,
  },
  ORDER_PAYMENT: {
    key: "ORDER_PAYMENT",
    label: "Pago de Pedido (Cliente)",
    colorClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/40",
    icon: ShoppingCart,
    defaultType: "INCOME",
    description: "Abono o pago de cliente por orden de compra",
    requiresSource: true,
    sourceType: "CUSTOMER_ORDER",
  },
  SUPPLIER_PAYMENT: {
    key: "SUPPLIER_PAYMENT",
    label: "Pago a Proveedor",
    colorClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/40",
    icon: Wallet,
    defaultType: "EXPENSE",
    description: "Pago real a proveedor por lote de compra",
    requiresSource: true,
    sourceType: "SUPPLIER_ORDER",
  },
  LOGISTICS: {
    key: "LOGISTICS",
    label: "Flete / Logística",
    colorClass:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700/40",
    icon: Truck,
    defaultType: "EXPENSE",
    description: "Gastos de flete, encomienda o logística internacional",
    requiresSource: false,
    sourceType: "SUPPLIER_ORDER",
  },
}

/**
 * Obtiene la metadata para una categoría dada por nombre
 */
export function getMovementCategoryMeta(categoryName) {
  if (!categoryName) {
    return {
      key: "UNKNOWN",
      label: "General",
      colorClass: "bg-muted text-muted-foreground border-border",
      icon: Tag,
      defaultType: "EXPENSE",
      description: "Movimiento financiero",
      requiresSource: false,
    }
  }

  const normalized = String(categoryName).trim().toUpperCase()
  if (MOVEMENT_CATEGORIES_META[normalized]) {
    return MOVEMENT_CATEGORIES_META[normalized]
  }

  // Fallback con formato legible
  return {
    key: normalized,
    label: categoryName.replace(/_/g, " "),
    colorClass: "bg-muted text-muted-foreground border-border",
    icon: Tag,
    defaultType: "EXPENSE",
    description: categoryName,
    requiresSource: false,
  }
}

/**
 * Badge visual de categoría para tablas y formularios
 */
export function MovementCategoryBadge({ categoryName, className = "" }) {
  const meta = getMovementCategoryMeta(categoryName)
  const Icon = meta.icon

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1 font-medium text-[11px] h-5 ${meta.colorClass} ${className}`}
    >
      <Icon className="size-3 shrink-0" />
      <span>{meta.label}</span>
    </Badge>
  )
}

