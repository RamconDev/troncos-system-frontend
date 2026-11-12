import { ProductsSection } from "@/components/products/ProductsSection"

export function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Catálogo de Productos en Órdenes
        </h1>
        <p className="text-sm text-muted-foreground">
          Visualiza y administra todas las prendas, tallas, costos y enlaces de referencia registrados en los pedidos.
        </p>
      </div>

      <ProductsSection />
    </div>
  )
}

