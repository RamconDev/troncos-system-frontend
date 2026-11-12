import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Package,
  Wallet,
  Receipt,
  Truck,
  Settings,
} from "lucide-react"

export const navMain = [
  { title: "Vista General", url: "/", icon: LayoutDashboard },
  { title: "Pedidos", url: "/pedidos", icon: ShoppingCart, badge: "Nuevo" },
  { title: "Productos", url: "/productos", icon: Boxes },
  { title: "Lotes a Proveedor", url: "/lotes", icon: Package },
  { title: "Finanzas & Caja", url: "/finanzas", icon: Wallet },
  { title: "Gastos y Costos", url: "/gastos", icon: Receipt },
]

export const navSecondary = [
  { title: "Proveedores", url: "/proveedores", icon: Truck },
  { title: "Configuración", url: "/configuracion", icon: Settings },
]

export const routeTitles = {
  "/": "Vista General",
  "/pedidos": "Pedidos de Clientes",
  "/productos": "Catálogo de Productos",
  "/lotes": "Lotes a Proveedor",
  "/finanzas": "Finanzas & Caja",
  "/gastos": "Gastos y Costos",
  "/proveedores": "Proveedores",
  "/configuracion": "Configuración",
  "/nuevo": "Nuevo Registro",
}

