import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Outlet } from "react-router"

export default function Layout() {
  return (
    <SidebarProvider>

      <main>
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
