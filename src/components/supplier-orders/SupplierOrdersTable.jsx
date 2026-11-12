import {
  Eye,
  Pencil,
  Trash2,
  ExternalLink,
  Package,
} from "lucide-react"
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
import { formatShortDate } from "@/components/supplier-orders/supplier-order-constants"

export function SupplierOrdersTable({
  lots,
  loading,
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
        {lots.map((lot) => (
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

            {lot.tracking_code ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-1.5 text-xs">
                <span className="font-mono text-muted-foreground truncate">
                  Guía: <strong className="text-foreground">{lot.tracking_code}</strong>
                </span>
                {lot.tracking_url && (
                  <a
                    href={lot.tracking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    <ExternalLink className="size-3" />
                    Rastrear
                  </a>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                Sin guía de rastreo asignada
              </span>
            )}

            <div className="flex items-center justify-between pt-1">
              <Button
                variant="secondary"
                size="sm"
                className="text-xs h-8"
                onClick={() => onViewDetail(lot)}
              >
                <Eye className="size-3.5" />
                Ver Órdenes del Lote
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
        ))}
      </div>

      {/* Vista Tablet y Desktop: Tabla completa (>= md) */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código de Lote</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Guía de Rastreo (Tracking)</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lots.map((lot) => (
              <TableRow key={lot.id}>
                <TableCell className="font-mono font-semibold text-foreground">
                  {lot.code}
                </TableCell>
                <TableCell>
                  <SupplierOrderStatusBadge status={lot.status} />
                </TableCell>
                <TableCell>
                  {lot.tracking_code ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">
                        {lot.tracking_code}
                      </span>
                      {lot.tracking_url && (
                        <a
                          href={lot.tracking_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
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
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {lot.notes || "—"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatShortDate(lot.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs"
                      onClick={() => onViewDetail(lot)}
                    >
                      <Eye className="size-3.5 text-primary" />
                      Órdenes
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
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

