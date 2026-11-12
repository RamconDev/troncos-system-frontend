import { BrowserRouter, Routes, Route } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function PlaceholderPage({ title, description }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Módulo listo para comenzar a desarrollar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Selecciona una sección desde la barra lateral izquierda para navegar entre los módulos del sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route
            path="/"
            element={
              <PlaceholderPage
                title="Vista General"
                description="Resumen operativo y métricas principales del sistema."
              />
            }
          />
          <Route
            path="/pedidos"
            element={
              <PlaceholderPage
                title="Pedidos de Clientes"
                description="Gestión y seguimiento de pedidos."
              />
            }
          />
          <Route
            path="/productos"
            element={
              <PlaceholderPage
                title="Catálogo de Productos"
                description="Inventario y catálogo de productos disponibles."
              />
            }
          />
          <Route
            path="/lotes"
            element={
              <PlaceholderPage
                title="Lotes a Proveedor"
                description="Control de lotes y órdenes a proveedores."
              />
            }
          />
          <Route
            path="/finanzas"
            element={
              <PlaceholderPage
                title="Finanzas & Caja"
                description="Flujo de caja, ingresos y balance financiero."
              />
            }
          />
          <Route
            path="/gastos"
            element={
              <PlaceholderPage
                title="Gastos y Costos"
                description="Registro de gastos operativos y costos."
              />
            }
          />
          <Route
            path="/proveedores"
            element={
              <PlaceholderPage
                title="Proveedores"
                description="Directorio y gestión de proveedores."
              />
            }
          />
          <Route
            path="/configuracion"
            element={
              <PlaceholderPage
                title="Configuración"
                description="Ajustes generales de la plataforma."
              />
            }
          />
          <Route
            path="/nuevo"
            element={
              <PlaceholderPage
                title="Nuevo Registro"
                description="Crear un nuevo registro en el sistema."
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
