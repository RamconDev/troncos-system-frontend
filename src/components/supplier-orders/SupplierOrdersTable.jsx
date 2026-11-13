import {
  Eye,
  Pencil,
  Trash2,
  ExternalLink,
  Package,
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
import { SupplierOrderStatusBadge } from "@/components/supplier-orders/SupplierOrderStatusBadge"
import {
  build17TrackUrl,
  formatShortDate,
  parseTrackingCodes,
  DEFAULT_SUPPLIER_ORDER_VISIBLE_COLUMNS,
} from "@/components/supplier-orders/supplier-order-constants"
import { formatUsd } from "@/components/orders/order-constants"

export function SupplierOrdersTable({
  lots,
  loading,
  visibleColumns = DEFAULT_SUPPLIER_ORDER_VISIBLE_COLUMNS,
  onViewDetail,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Cargando lotes a proveedor...
      </div>
    )
  }

  if (!lots.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-10 text-center text-sm text-muted-foreground">
        <Package className="size-8 text-muted-foreground/50" />
        <p>No se encontraron lotes registrados con los filtros actuales.</p>
      </div>
    )
  }

  return (
    <>
      {/* Vista Móvil: Tarjetas apiladas (< md) */}
      <div className="divide-y md:hidden">
        {lots.map((lot) => {
          const codes = parseTrackingCodes(lot.tracking_code)
          const trackUrl = lot.tracking_url || build17TrackUrl(codes)
          return (
            <div key={lot.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-foreground">
                      {lot.code}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • {formatShortDate(lot.created_at)}
                    </span>
                  </div>
                  {lot.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lot.notes}
                    </p>
                  )}
                </div>

                <SupplierOrderStatusBadge status={lot.status} />
              </div>

              {codes.length > 0 ? (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {codes.map((c) => (
                      <Badge
                        key={c}
                        variant="secondary"
                        className="font-mono text-[11px]"
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                  {trackUrl && (
                    <a
                      href={trackUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="size-3" />
                      Rastrear ({codes.length})
                    </a>
                  )}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Sin guías de rastreo asignadas
                </span>
              )}

              {lot.financial_summary && (
                <div className="flex items-center justify-between rounded-md bg-emerald-500/10 px-3 py-1.5 text-xs">
                  <span className="text-muted-foreground">Ganancia Real:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatUsd(lot.financial_summary.real_profit_usd)} USD
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => onViewDetail(lot)}
                >
                  <Eye className="size-3.5" />
                  Ver Lote y Guías
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    title="Editar lote"
                    onClick={() => onEdit(lot)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    title="Eliminar lote"
                    onClick={() => onDelete(lot)}
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
              {visibleColumns.code !== false && (
                <TableHead>Código de Lote</TableHead>
              )}
              {visibleColumns.status !== false && (
                <TableHead>Estado</TableHead>
              )}
              {visibleColumns.tracking !== false && (
                <TableHead>Guías de Rastreo (Tracking)</TableHead>
              )}
              {visibleColumns.realProfit !== false && (
                <TableHead className="text-right">Ganancia Real</TableHead>
              )}
              {visibleColumns.notes !== false && (
                <TableHead>Notas</TableHead>
              )}
              {visibleColumns.date !== false && (
                <TableHead>Fecha</TableHead>
              )}
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lots.map((lot) => {
              const codes = parseTrackingCodes(lot.tracking_code)
              const trackUrl = lot.tracking_url || build17TrackUrl(codes)
              const hasSummary = Boolean(lot.financial_summary)
              const realProfit = Number(lot.financial_summary?.real_profit_usd || 0)

              return (
                <TableRow key={lot.id}>
                  {visibleColumns.code !== false && (
                    <TableCell className="font-mono font-semibold text-foreground">
                      {lot.code}
                    </TableCell>
                  )}
                  {visibleColumns.status !== false && (
                    <TableCell>
                      <SupplierOrderStatusBadge status={lot.status} />
                    </TableCell>
                  )}
                  {visibleColumns.tracking !== false && (
                    <TableCell>
                      {codes.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {codes[0]}
                          </Badge>
                          {codes.length > 1 && (
                            <Badge variant="outline" className="font-mono text-[11px]">
                              +{codes.length - 1} más
                            </Badge>
                          )}
                          {trackUrl && (
                            <a
                              href={trackUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline ml-1"
                            >
                              <ExternalLink className="size-3.5" />
                              17track
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.realProfit !== false && (
                    <TableCell className="text-right font-mono text-xs">
                      {hasSummary ? (
                        <span
                          className={`font-bold ${
                            realProfit >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {formatUsd(realProfit)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.notes !== false && (
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {lot.notes || "—"}
                    </TableCell>
                  )}
                  {visibleColumns.date !== false && (
                    <TableCell className="text-xs text-muted-foreground">
                      {formatShortDate(lot.created_at)}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-xs"
                        onClick={() => onViewDetail(lot)}
                      >
                        <Eye className="size-3.5 text-primary" />
                        Ver Lote
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar lote"
                        onClick={() => onEdit(lot)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title="Eliminar lote"
                        onClick={() => onDelete(lot)}
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
