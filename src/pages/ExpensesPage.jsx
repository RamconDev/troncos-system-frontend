import { MovementsSection } from "@/components/finances/MovementsSection"

export function ExpensesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Gastos y Costos
        </h1>
        <p className="text-sm text-muted-foreground">
          Control específico de egresos, pagos a proveedores, envíos y costos operativos.
        </p>
      </div>

      <MovementsSection
        fixedMovementType="EXPENSE"
        title="Historial de Gastos y Salidas (EXPENSE)"
        description="Pagos realizados a proveedores y costos operativos registrados."
        newButtonLabel="Registrar Gasto"
      />
    </div>
  )
}

