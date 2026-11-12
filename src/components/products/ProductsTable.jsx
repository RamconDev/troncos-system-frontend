import { Link } from "react-router-dom"
import {
  Pencil,
  Trash2,
  ExternalLink,
  Boxes,
  ShoppingCart,
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

export function ProductsTable({
  products,
  loading,
  hideOrderColumn = false,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Cargando catálogo de productos...
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-10 text-center text-sm text-muted-foreground">
        <Boxes className="size-8 text-muted-foreground/50" />
        <p>No se encontraron productos registrados.</p>
      </div>
    )
  }

  return (
    <>
      {/* Vista Móvil: Tarjetas (< md) */}
      <div className="divide-y md:hidden">
        {products.map((item) => {
          const profit = Number(item.sale_price || 0) - Number(item.base_cost || 0)
          return (
            <div key={item.id} className="flex flex-col gap-2.5 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground break-words">
                    {item.name}
                  </p>
                  {!hideOrderColumn && (
                    <Link
                      to={`/pedidos?order_id=${item.customer_order_id}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5"
                    >
                      <ShoppingCart className="size-3" />
                      Orden #{item.customer_order_id}
                    </Link>
                  )}
                </div>

                <Badge variant="secondary" className="shrink-0 font-mono">
                  {item.size || "Sin talla"}
                </Badge>
              </div>

              {item.notes && (
                <p className="rounded bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
                  {item.notes}
                </p>
              )}

              <div className="grid grid-cols-3 gap-2 rounded-md border p-2 text-center text-xs">
                <div>
                  <span className="block text-[10px] text-muted-foreground">Costo</span>
                  <span className="font-medium">{formatUsd(item.base_cost)}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground">Venta</span>
                  <span className="font-semibold">{formatUsd(item.sale_price)}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground">Ganancia</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatUsd(profit)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {item.reference_url ? (
                  <a
                    href={item.reference_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <ExternalLink className="size-3.5" />
                    Ver Álbum / Yupoo
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">Sin enlace</span>
                )}

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    title="Editar producto"
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    title="Eliminar producto"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Vista Tablet y Desktop: Tabla (>= md) */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {!hideOrderColumn && <TableHead>Orden</TableHead>}
              <TableHead>Prenda / Producto</TableHead>
              <TableHead>Talla</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Venta</TableHead>
              <TableHead>Ganancia</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((item) => {
              const profit =
                Number(item.sale_price || 0) - Number(item.base_cost || 0)
              return (
                <TableRow key={item.id}>
                  {!hideOrderColumn && (
                    <TableCell>
                      <Link
                        to={`/pedidos?order_id=${item.customer_order_id}`}
                        className="font-mono text-xs font-medium text-primary hover:underline"
                      >
                        #{item.customer_order_id}
                      </Link>
                    </TableCell>
                  )}
                  <TableCell className="max-w-xs">
                    <div className="truncate font-medium text-foreground" title={item.name}>
                      {item.name}
                    </div>
                    {item.notes && (
                      <div
                        className="truncate text-xs text-muted-foreground"
                        title={item.notes}
                      >
                        {item.notes}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {item.size || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatUsd(item.base_cost)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatUsd(item.sale_price)}
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatUsd(profit)}
                  </TableCell>
                  <TableCell>
                    {item.reference_url ? (
                      <a
                        href={item.reference_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="size-3.5" />
                        Yupoo
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar producto"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title="Eliminar producto"
                        onClick={() => onDelete(item)}
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

