# Sidebar

## Installation

### Run the following command to install `sidebar.tsx`

```bash
pnpm dlx shadcn@latest add sidebar
```

### Add the following colors to your CSS file

```css
@layer base {
  :root {
    --sidebar: oklch(0.985 0 0);
    --sidebar-foreground: oklch(0.145 0 0);
    --sidebar-primary: oklch(0.205 0 0);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.97 0 0);
    --sidebar-accent-foreground: oklch(0.205 0 0);
    --sidebar-border: oklch(0.922 0 0);
    --sidebar-ring: oklch(0.708 0 0);
  }
  .dark {
    --sidebar: oklch(0.205 0 0);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.488 0.243 264.376);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.269 0 0);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(1 0 0 / 10%);
    --sidebar-ring: oklch(0.439 0 0);
  }
}
```

## Structure

A `Sidebar` component is composed of the following parts:

- `SidebarProvider` - Handles collapsible state.
- `Sidebar` - The sidebar container.
- `SidebarHeader` and `SidebarFooter` - Sticky at the top and bottom of the sidebar.
- `SidebarContent` - Scrollable content.
- `SidebarGroup` - Section within the `SidebarContent`.
- `SidebarTrigger` - Trigger for the `Sidebar`.

## Usage

### Add a `SidebarProvider` and `SidebarTrigger` at the root of your application.

```tsx
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
```

### Create a new sidebar component at `components/app-sidebar.tsx`.

```tsx
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent />
    </Sidebar>
  );
}
```

### Add a `SidebarMenu` to the sidebar.

```tsx
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

// Menu items.
const items = [
  { title: "Home", url: "#", icon: Home },
  { title: "Inbox", url: "#", icon: Inbox },
  { title: "Calendar", url: "#", icon: Calendar },
  { title: "Search", url: "#", icon: Search },
  { title: "Settings", url: "#", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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
```

## Components

### SidebarProvider

Props:

| Prop         | Type                    | Description                             |
| ------------ | ----------------------- | --------------------------------------- |
| defaultOpen  | boolean                 | Default open state of the sidebar.      |
| open         | boolean                 | Open state of the sidebar (controlled). |
| onOpenChange | (open: boolean) => void | Sets open state of the sidebar.         |

### Sidebar

Props:

| Prop        | Type                           | Description                       |
| ----------- | ------------------------------ | --------------------------------- |
| side        | "left" or "right"              | The side of the sidebar.          |
| variant     | "sidebar", "floating", "inset" | The variant of the sidebar.       |
| collapsible | "offcanvas", "icon", "none"    | Collapsible state of the sidebar. |

### SidebarMenu

The `SidebarMenu` component is used for building a menu within a `SidebarGroup`.

### SidebarMenuButton

Props:

| Prop     | Type    | Description                  |
| -------- | ------- | ---------------------------- |
| isActive | boolean | Marks a menu item as active. |

### SidebarMenuAction

The `SidebarMenuAction` component is used to render a menu action within a `SidebarMenuItem`.

### SidebarMenuSub

The `SidebarMenuSub` component is used to render a submenu within a `SidebarMenu`.

### SidebarMenuBadge

The `SidebarMenuBadge` component is used to render a badge within a `SidebarMenuItem`.

### SidebarMenuSkeleton

The `SidebarMenuSkeleton` component is used to render a skeleton for a `SidebarMenu`.

### SidebarSeparator

The `SidebarSeparator` component is used to render a separator within a `Sidebar`.

### SidebarTrigger

The `SidebarTrigger` component must be used within a `SidebarProvider`.

### SidebarRail

The `SidebarRail` component is used to render a rail within a `Sidebar`.

## Theming

We use the following CSS variables to theme the sidebar:

```css
@layer base {
  :root {
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
  .dark {
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 0 0% 98%;
    --sidebar-primary-foreground: 240 5.9% 10%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}
```

## Styling

### Styling an element based on the sidebar collapsible state:

```tsx
<Sidebar collapsible="icon">
  <SidebarContent>
    <SidebarGroup className="group-data-[collapsible=icon]:hidden" />
  </SidebarContent>
</Sidebar>
```

### Styling a menu action based on the menu button active state:

```tsx
<SidebarMenuItem>
  <SidebarMenuButton />
  <SidebarMenuAction className="peer-data-[active=true]/menu-button:opacity-100" />
</SidebarMenuItem>
```

## Changelog

### 2024-10-30 Cookie handling in setOpen

Improved setOpen callback logic in `<SidebarProvider>`.

### 2024-10-21 Fixed `text-sidebar-foreground`

Moved `text-sidebar-foreground` from `<SidebarProvider>` to `<Sidebar>` component.

### 2024-10-20 Typo in `useSidebar` hook

Fixed typo in `useSidebar` hook.
