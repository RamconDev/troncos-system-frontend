import { useLocation, Link } from "react-router-dom"
import { AppWindow } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { SidebarUserMenu } from "@/components/layout/SidebarUserMenu"
import { navMain, navSecondary } from "@/components/layout/nav-config"

function SidebarNavGroup({ label, items, currentPath }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = currentPath === item.url
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <Link to={item.url}>
                    <Icon />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary group-data-[collapsible=icon]:hidden">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar(props) {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <AppWindow className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Mi Plataforma</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Panel de Control
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavGroup
          label="Principal"
          items={navMain}
          currentPath={location.pathname}
        />
        <SidebarSeparator />
        <SidebarNavGroup
          label="Gestión"
          items={navSecondary}
          currentPath={location.pathname}
        />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60">
        <SidebarUserMenu />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
