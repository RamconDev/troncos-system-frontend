import * as React from "react"
import { Link } from "react-router-dom"
import {
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  ShoppingCart,
  Truck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatUsd } from "@/components/orders/order-constants"
import { formatShortDate } from "@/components/supplier-orders/supplier-order-constants"

export function MovementsTable({
  movements,
  supplierOrders = [],
  loading,
  onEdit,
  onDelete,
}) {
  const lotCodeMap = React.useMemo(() => {
    const map = new Map()
    supplierOrders.forEach((lot) => {
      map.set(Number(lot.id), lot.code)
    })
    return map
  }, [supplierOrders])
  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Cargando movimientos financieros...
      </div>
    )
  }

  if (!movements.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-10 text-center text-sm text-muted-foreground">
        <Wallet className="size-8 text-muted-foreground/50" />
        <p>No se encontraron movimientos registrados con estos filtros.</p>
      </div>
    )
  }

  return (
    <>
      {/* Vista Móvil: Tarjetas apiladas (< md) */}
      <div className="divide-y md:hidden">
        {movements.map((mov) => {
          const isIncome = mov.movement_type === "INCOME"
          return (
            <div key={mov.id} className="flex flex-col gap-2.5 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        isIncome
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                      }
                    >
                      {isIncome ? (
                        <ArrowUpRight className="size-3" />
                      ) : (
                        <ArrowDownRight className="size-3" />
                      )}
                      {isIncome ? "Ingreso" : "Egreso"}
                    </Badge>
                    <span className="font-mono text-xs font-semibold">
                      {mov.category_name || `Cat #${mov.category_id}`}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {mov.description || "Sin descripción"}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`block font-mono text-sm font-bold ${
                      isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatUsd(mov.amount_usd)}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {Number(mov.amount).toLocaleString("es-CO", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    {mov.currency_code}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>{formatShortDate(mov.created_at)}</span>
                  <span>
                    • Tasa: {Number(mov.applied_exchange_rate || 1).toLocaleString("es-CO")}
                  </span>
                  {mov.source_id &&
                    (isIncome ? (
                      <Link
                        to={`/pedidos?order_id=${mov.source_id}`}
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        <ShoppingCart className="size-3" />
                        Orden #{mov.source_id}
                      </Link>
                    ) : (
                      <Link
                        to="/lotes"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        <Truck className="size-3" />
                        Lote{" "}
                        {lotCodeMap.get(Number(mov.source_id)) ||
                          `#${mov.source_id}`}
                      </Link>
                    ))}
                </div>

                <div className="flex items-center gap-1 ml-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    title="Editar movimiento"
                    onClick={() => onEdit(mov)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    title="Eliminar movimiento"
                    onClick={() => onDelete(mov)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Vista Tablet y Desktop: Tabla completa (>= md) */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción / Orden</TableHead>
              <TableHead>Monto Original</TableHead>
              <TableHead>Tasa</TableHead>
              <TableHead>Monto USD</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((mov) => {
              const isIncome = mov.movement_type === "INCOME"
              return (
                <TableRow key={mov.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatShortDate(mov.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        isIncome
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                      }
                    >
                      {isIncome ? (
                        <ArrowUpRight className="size-3" />
                      ) : (
                        <ArrowDownRight className="size-3" />
                      )}
                      {isIncome ? "Ingreso" : "Egreso"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold">
                    {mov.category_name || `#${mov.category_id}`}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate font-medium text-foreground">
                      {mov.description || "—"}
                    </div>
                    {mov.source_id &&
                      (isIncome ? (
                        <Link
                          to={`/pedidos?order_id=${mov.source_id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <ShoppingCart className="size-3" />
                          Orden #{mov.source_id}
                        </Link>
                      ) : (
                        <Link
                          to="/lotes"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <Truck className="size-3" />
                          Lote{" "}
                          {lotCodeMap.get(Number(mov.source_id)) ||
                            `#${mov.source_id}`}
                        </Link>
                      ))}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {Number(mov.amount).toLocaleString("es-CO", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    <Badge variant="secondary" className="ml-1 font-mono text-[10px]">
                      {mov.currency_code || mov.currency_id}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {Number(mov.applied_exchange_rate || 1).toLocaleString("es-CO", {
                      maximumFractionDigits: 4,
                    })}
                  </TableCell>
                  <TableCell
                    className={`font-mono font-semibold ${
                      isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatUsd(mov.amount_usd)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar movimiento"
                        onClick={() => onEdit(mov)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title="Eliminar movimiento"
                        onClick={() => onDelete(mov)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

