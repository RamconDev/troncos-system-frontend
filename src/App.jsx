import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ToastProvider } from "@/components/ui/toast"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { PlaceholderPage } from "@/components/common/PlaceholderPage"
import { DashboardOverviewPage } from "@/pages/DashboardOverviewPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { CustomersPage } from "@/pages/CustomersPage"
import { OrdersPage } from "@/pages/OrdersPage"
import { ProductsPage } from "@/pages/ProductsPage"
import { SupplierOrdersPage } from "@/pages/SupplierOrdersPage"
import { FinancesPage } from "@/pages/FinancesPage"
import { ExpensesPage } from "@/pages/ExpensesPage"
import { AnalyticsPage } from "@/pages/AnalyticsPage"

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardOverviewPage />} />
            <Route path="/pedidos" element={<OrdersPage />} />
            <Route path="/nuevo" element={<OrdersPage defaultOpenCreate />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/lotes" element={<SupplierOrdersPage />} />
            <Route path="/finanzas" element={<FinancesPage />} />
            <Route path="/gastos" element={<ExpensesPage />} />
            <Route path="/estadisticas" element={<AnalyticsPage />} />
            <Route path="/clientes" element={<CustomersPage />} />
            <Route path="/configuracion" element={<SettingsPage />} />
            <Route
              path="/proveedores"
              element={
                <PlaceholderPage
                  title="Proveedores"
                  description="Directorio y gestión de proveedores."
                />
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
