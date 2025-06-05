import * as React from "react";
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
  SidebarProvider,
} from "@workspace/ui/components/ui/sidebar";
import * as Rac from "react-aria-components";

const items = [
  {
    id: "Home",
    href: "/",
  },
  {
    id: "Inbox",
    href: "#",
  },
  {
    id: "Calendar",
    href: "#",
  },
  {
    id: "Search",
    href: "#",
  },
  {
    id: "Settings",
    href: "#",
  },
];

const treeItems: Oui.SidebarTreeNodeEx[] = [
  {
    id: "Parent",
    children: [{ id: "Child" }, { id: "Child1" }, { id: "Child2" }],
  },
  {
    id: "Parent1",
    children: [{ id: "Child3" }, { id: "Child4" }],
  },
];

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <Rac.Tree<Oui.SidebarTreeNodeEx>
          aria-label="Files"
          items={treeItems}
          defaultExpandedKeys={["Parent", "Parent1"]}
        >
          {Oui.renderSidebarTreeNodeEx}
        </Rac.Tree>
        <SidebarGroup>
          <SidebarGroupLabel>List Box</SidebarGroupLabel>
          <SidebarGroupContent>
            <Oui.SidebarListBox aria-label="List Box" items={items}>
              {(item) => (
                <Oui.SidebarListBoxItem key={item.id} href={item.href}>
                  {item.id}
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
