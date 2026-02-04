import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { HouseIcon } from 'lucide-react';
import { Link } from "react-router";

function AppSidebar() {
  return (
    <Sidebar
      collapsible="icon"
      side="left"
      variant="floating"
      className="border-r"
    >
      <SidebarHeader>
        <h1 className="overflow-hidden">Midlertidig</h1>
      </ SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Home">
                <Link to="/">
                  <HouseIcon />
                  Home

                </Link>

              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}

export { AppSidebar };