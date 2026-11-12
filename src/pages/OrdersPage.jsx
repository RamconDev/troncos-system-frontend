import { OrdersSection } from "@/components/orders/OrdersSection"

export function OrdersPage({ defaultOpenCreate = false }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Pedidos de Clientes
        </h1>
        <p className="text-sm text-muted-foreground">
          Controla las órdenes de compra, estado de pago, entrega y prendas solicitadas por cada cliente.
        </p>
      </div>

      <OrdersSection defaultOpenCreate={defaultOpenCreate} />
    </div>
  )
}

