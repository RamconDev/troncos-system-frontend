import { SupplierOrdersSection } from "@/components/supplier-orders/SupplierOrdersSection"

export function SupplierOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Lotes / Órdenes a Proveedor
        </h1>
        <p className="text-sm text-muted-foreground">
          Encapsula múltiples pedidos de clientes dentro de lotes de proveedor y haz seguimiento de sus envíos.
        </p>
      </div>

      <SupplierOrdersSection />
    </div>
  )
}

