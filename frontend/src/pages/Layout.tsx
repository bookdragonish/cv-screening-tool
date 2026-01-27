import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/AppSidebar"
import { Outlet } from "react-router"

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="h-screen w-full flex flex-col">
        <SidebarTrigger title="Lukk sidefeltet" className="[&_svg]:!size-6 w-10 h-10 ml-3 mt-3"/>


          <Outlet />
      </main>
    </SidebarProvider>
  )
}
