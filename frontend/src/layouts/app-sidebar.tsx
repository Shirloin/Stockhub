import {
  Package,
  FolderTree,
  Truck,
  Warehouse,
  Activity,
  LayoutDashboard,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

// Master Data items
const masterDataItems = [
  {
    title: "Products",
    url: "/products",
    icon: Package,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: FolderTree,
  },
  {
    title: "Suppliers",
    url: "/suppliers",
    icon: Truck,
  },
];

// Operations items
const operationsItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Warehouses",
    url: "/warehouses",
    icon: Warehouse,
  },
  {
    title: "Stock Movements",
    url: "/stock-movements",
    icon: Activity,
  },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r">
      <SidebarHeader className="border-b border-sidebar-border/50 bg-sidebar/95 backdrop-blur supports-backdrop-filter:bg-sidebar/60">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
            <Package className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight">
              StockHub
            </span>
            <span className="text-xs text-muted-foreground/80">
              Inventory Management
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {operationsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="group relative rounded-lg transition-all hover:bg-sidebar-accent/80 data-[active=true]:bg-sidebar-accent data-[active=true]:shadow-sm"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:rotate-3" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-3 mx-0" />

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
            Master Data
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {masterDataItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="group relative rounded-lg transition-all hover:bg-sidebar-accent/80 data-[active=true]:bg-sidebar-accent data-[active=true]:shadow-sm"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:rotate-3" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
