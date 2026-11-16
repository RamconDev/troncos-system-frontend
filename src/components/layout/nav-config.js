import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Package,
  Wallet,
  Receipt,
  BarChart3,
  Users,
  Truck,
  Settings,
} from "lucide-react"

export const navMain = [
  { title: "Vista General", url: "/", icon: LayoutDashboard },
  { title: "Pedidos", url: "/pedidos", icon: ShoppingCart, badge: "Nuevo" },
  { title: "Lotes de Pedido", url: "/lotes", icon: Package },
  { title: "Productos", url: "/productos", icon: Boxes },
  { title: "Finanzas & Caja", url: "/finanzas", icon: Wallet },
  { title: "Gastos y Costos", url: "/gastos", icon: Receipt },
  { title: "Estadísticas", url: "/estadisticas", icon: BarChart3 },
]

export const navSecondary = [
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Proveedores", url: "/proveedores", icon: Truck },
  { title: "Configuración", url: "/configuracion", icon: Settings },
]

export const routeTitles = {
  "/": "Vista General",
  "/pedidos": "Pedidos de Clientes",
  "/productos": "Catálogo de Productos",
  "/lotes": "Lotes / Órdenes a Proveedor",
  "/finanzas": "Finanzas & Caja",
  "/gastos": "Gastos y Costos",
  "/estadisticas": "Estadísticas & Reportes",
  "/clientes": "Directorio de Clientes",
  "/proveedores": "Proveedores",
  "/configuracion": "Configuración",
  "/nuevo": "Nuevo Registro",
}
