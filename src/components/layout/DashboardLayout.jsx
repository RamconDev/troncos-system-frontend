import { Outlet } from "react-router-dom"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { TopHeader } from "@/components/layout/TopHeader"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopHeader />
        <div className="flex-1 w-full min-w-0 bg-muted/15 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
