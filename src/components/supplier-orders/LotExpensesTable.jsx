import * as React from "react"
import { Trash2, Pencil, Wallet } from "lucide-react"
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

export const LOT_EXPENSES_COLUMNS_CONFIG = [
  { id: "date", label: "Fecha" },
  { id: "category", label: "Tipo" },
  { id: "description", label: "Descripción / Concepto" },
  { id: "originalAmount", label: "Monto Original" },
  { id: "amountUsd", label: "Monto USD" },
]

export const DEFAULT_LOT_EXPENSES_VISIBLE_COLUMNS = {
  date: true,
  category: true,
  description: true,
  originalAmount: true,
  amountUsd: true,
}

/**
 * Tabla de egresos asociados al lote según SPEC 4.3 con soporte de visibilidad de columnas
 */
export function LotExpensesTable({
  expenses = [],
  visibleColumns = DEFAULT_LOT_EXPENSES_VISIBLE_COLUMNS,
  onEditExpense,
  onDeleteExpense,
  deletingId = null,
}) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
        <Wallet className="size-6 text-muted-foreground/40" />
        <p>
          No hay pagos a proveedor ni gastos de logística registrados para este lote.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-background overflow-hidden shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="text-xs">
            {visibleColumns.date !== false && (
              <TableHead className="w-[100px]">Fecha</TableHead>
            )}
            {visibleColumns.category !== false && (
              <TableHead className="w-[120px]">Tipo</TableHead>
            )}
            {visibleColumns.description !== false && (
              <TableHead>Descripción / Concepto</TableHead>
            )}
            {visibleColumns.originalAmount !== false && (
              <TableHead className="text-right">Monto Original</TableHead>
            )}
            {visibleColumns.amountUsd !== false && (
              <TableHead className="text-right">Monto USD</TableHead>
            )}
            {(onDeleteExpense || onEditExpense) && (
              <TableHead className="w-[90px] text-center">Acciones</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((exp) => {
            const isSupplier = exp.category_name === "SUPPLIER_PAYMENT"
            const isDeleting = deletingId === exp.id

            return (
              <TableRow key={exp.id} className="text-xs hover:bg-muted/40">
                {visibleColumns.date !== false && (
                  <TableCell className="font-mono text-muted-foreground">
                    {formatShortDate(exp.created_at)}
                  </TableCell>
                )}
                {visibleColumns.category !== false && (
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        isSupplier
                          ? "bg-blue-500/15 text-[11px] font-semibold text-blue-700 dark:text-blue-400 border-blue-500/30"
                          : "bg-amber-500/15 text-[11px] font-semibold text-amber-700 dark:text-amber-400 border-amber-500/30"
                      }
                    >
                      {isSupplier ? "Proveedor" : "Logística"}
                    </Badge>
                  </TableCell>
                )}
                {visibleColumns.description !== false && (
                  <TableCell className="max-w-xs truncate font-medium text-foreground">
                    {exp.description || "—"}
                  </TableCell>
                )}
                {visibleColumns.originalAmount !== false && (
                  <TableCell className="font-mono text-right text-muted-foreground">
                    {Number(exp.amount || 0).toLocaleString("es-CO", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {exp.currency_code || exp.currency_id}
                    </Badge>
                  </TableCell>
                )}
                {visibleColumns.amountUsd !== false && (
                  <TableCell className="font-mono font-bold text-right text-rose-600 dark:text-rose-400">
                    -{formatUsd(exp.amount_usd)}
                  </TableCell>
                )}
                {(onDeleteExpense || onEditExpense) && (
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {onEditExpense && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          title="Editar gasto"
                          onClick={() => onEditExpense(exp)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      )}
                      {onDeleteExpense && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isDeleting}
                          className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Eliminar gasto"
                          onClick={() => onDeleteExpense(exp)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
