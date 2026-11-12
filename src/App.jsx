import { BrowserRouter, Routes, Route } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { PlaceholderPage } from "@/components/common/PlaceholderPage"
import { SettingsPage } from "@/pages/SettingsPage"

const placeholderRoutes = [
  {
    path: "/",
    title: "Vista General",
    description: "Resumen operativo y métricas principales del sistema.",
  },
  {
    path: "/pedidos",
    title: "Pedidos de Clientes",
    description: "Gestión y seguimiento de pedidos.",
  },
  {
    path: "/productos",
    title: "Catálogo de Productos",
    description: "Inventario y catálogo de productos disponibles.",
  },
  {
    path: "/lotes",
    title: "Lotes a Proveedor",
    description: "Control de lotes y órdenes a proveedores.",
  },
  {
    path: "/finanzas",
    title: "Finanzas & Caja",
    description: "Flujo de caja, ingresos y balance financiero.",
  },
  {
    path: "/gastos",
    title: "Gastos y Costos",
    description: "Registro de gastos operativos y costos.",
  },
  {
    path: "/proveedores",
    title: "Proveedores",
    description: "Directorio y gestión de proveedores.",
  },
  {
    path: "/nuevo",
    title: "Nuevo Registro",
    description: "Crear un nuevo registro en el sistema.",
  },
]

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/configuracion" element={<SettingsPage />} />
          {placeholderRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <PlaceholderPage
                  title={route.title}
                  description={route.description}
                />
              }
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
