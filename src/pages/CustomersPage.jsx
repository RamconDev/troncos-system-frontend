import { CustomersSection } from "@/components/customers/CustomersSection"

export function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Directorio de Clientes
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestiona la cartera de clientes, teléfonos de contacto y grupos de referencia.
        </p>
      </div>

      <CustomersSection />
    </div>
  )
}

