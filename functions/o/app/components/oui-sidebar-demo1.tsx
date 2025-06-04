import * as Oui from "@workspace/oui";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/ui/breadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@workspace/ui/components/ui/sidebar";
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

/*
#fetch https://ui.shadcn.com/docs/components/sidebar
#fetch https://react-spectrum.adobe.com/react-aria/examples/contact-list.html
*/

const items = [
  {
    id: "Home",
    href: "/",
    icon: Home,
  },
  {
    id: "Inbox",
    href: "#",
    icon: Inbox,
  },
  {
    id: "Calendar",
    href: "#",
    icon: Calendar,
  },
  {
    id: "Search",
    href: "#",
    icon: Search,
  },
  {
    id: "Settings",
    href: "#",
    icon: Settings,
  },
];

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>List Box1</SidebarGroupLabel>
          <SidebarGroupContent>
            <Oui.SidebarListBox aria-label="List Box" items={items}>
              {(item) => (
                <Oui.SidebarListBoxItem
                  key={item.id}
                  href={item.href}
                  textValue={item.id}
                >
                  <item.icon />
                  <span>{item.id}</span>
                </Oui.SidebarListBoxItem>
              )}
            </Oui.SidebarListBox>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function OuiSidebarDemo1() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <Oui.SidebarTrigger className="-ml-1" />
            <Oui.Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
