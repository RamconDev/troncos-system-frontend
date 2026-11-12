import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PaymentStatusBadge } from "@/components/orders/OrderStatusBadges"
import { formatUsd } from "@/components/orders/order-constants"

export function UnpaidProductsCard({
  unpaidData = {
    unpaidProducts: [],
    unpaidProductsCount: 0,
    unpaidOrdersCount: 0,
    totalPendingUsd: 0,
  },
}) {
  const { unpaidProducts, unpaidProductsCount, unpaidOrdersCount, totalPendingUsd } =
    unpaidData

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <span>Productos Pendientes por Cobrar</span>
            <Badge variant="secondary" className="font-mono">
              {unpaidProductsCount} prenda(s)
            </Badge>
          </CardTitle>
          <CardDescription>
            {unpaidOrdersCount} orden(es) con saldo pendiente por un total de{" "}
            <strong className="text-amber-600 dark:text-amber-400">
              {formatUsd(totalPendingUsd)}
            </strong>
          </CardDescription>
        </div>

        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
          <Link to="/pedidos">
            Ver todos los pedidos
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {unpaidProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
            <CheckCircle2 className="size-8 text-emerald-500/70" />
            <p>¡Excelente! Todos los productos y pedidos están cobrados al 100%.</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto border-t">
            {/* Vista Móvil: Tarjetas (< md) */}
            <div className="divide-y md:hidden">
              {unpaidProducts.map((prod) => (
                <div
                  key={`${prod.orderId}-${prod.id}`}
                  className="flex flex-col gap-2 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground break-words">
                        {prod.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cliente: <strong className="text-foreground">{prod.customerName}</strong>
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-mono shrink-0">
                      {prod.size || "Sin talla"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <PaymentStatusBadge status={prod.paymentStatus} />
                      <span>
                        Precio: <strong>{formatUsd(prod.sale_price)}</strong>
                      </span>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      asChild
                      className="h-7 px-2.5 text-xs"
                    >
                      <Link to={`/pedidos?order_id=${prod.orderId}`}>
                        <ShoppingCart className="size-3" />
                        Ir a Orden #{prod.orderId}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista Tablet / Desktop: Tabla (>= md) */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Orden</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Producto / Prenda</TableHead>
                    <TableHead>Talla</TableHead>
                    <TableHead>Venta Prenda</TableHead>
                    <TableHead>Estado Pago</TableHead>
                    <TableHead className="text-right">Enlace Directo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidProducts.map((prod) => (
                    <TableRow key={`${prod.orderId}-${prod.id}`}>
                      <TableCell className="font-mono text-xs font-semibold">
                        #{prod.orderId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {prod.customerName}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate font-medium text-foreground">
                          {prod.name}
                        </div>
                        {prod.notes && (
                          <div className="truncate text-xs text-muted-foreground">
                            {prod.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {prod.size || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        {formatUsd(prod.sale_price)}
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={prod.paymentStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-7 px-2.5 text-xs text-primary"
                        >
                          <Link to={`/pedidos?order_id=${prod.orderId}`}>
                            Ver Orden #{prod.orderId}
                            <ArrowRight className="size-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

