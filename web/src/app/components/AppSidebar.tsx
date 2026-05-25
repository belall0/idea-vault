import { useState } from "react";
import { Link, useMatchRoute } from "@tanstack/react-router";
import {
  House,
  User,
  LogOut,
  ChevronsUpDown,
  Lightbulb,
  Compass,
  Shield,
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  Plus,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { useAuth } from "@/features/auth/auth-context";

const workspaces = [
  {
    id: "user",
    name: "IdeaVault Hub",
    plan: "Standard Workspace",
    icon: Lightbulb,
    color: "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20",
    navItems: [
      {
        title: "Home",
        url: "/" as const,
        icon: House,
      },
      {
        title: "Browse Ideas",
        url: "/ideas" as const,
        icon: Compass,
      },
    ],
  },
  {
    id: "admin",
    name: "Admin Console",
    plan: "Management Space",
    icon: Shield,
    color: "bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20",
    navItems: [
      {
        title: "Overview",
        url: "/" as const,
        icon: LayoutDashboard,
      },
      {
        title: "Manage Ideas",
        url: "/ideas" as const,
        icon: FolderKanban,
      },
      {
        title: "User Directory",
        url: "/" as const,
        icon: Users,
      },
      {
        title: "System Settings",
        url: "/" as const,
        icon: Settings,
      },
    ],
  },
];

export default function AppSidebar() {
  const { user, clearAuth } = useAuth();
  const matchRoute = useMatchRoute();
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0]);

  const isPrivileged = user?.role === "admin" || user?.role === "moderator";
  const currentNavItems = isPrivileged
    ? activeWorkspace.navItems
    : workspaces[0].navItems;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {isPrivileged ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                    tooltip={activeWorkspace.name}
                  >
                    <div
                      className={`flex aspect-square size-8 items-center justify-center rounded-lg ${activeWorkspace.color}`}
                    >
                      <activeWorkspace.icon className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {activeWorkspace.name}
                      </span>
                      <span className="text-muted-foreground truncate text-xs">
                        {activeWorkspace.plan}
                      </span>
                    </div>
                    <ChevronsUpDown className="text-muted-foreground ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-xs">
                    Workspaces
                  </DropdownMenuLabel>
                  {workspaces.map((workspace) => (
                    <DropdownMenuItem
                      key={workspace.id}
                      onClick={() => setActiveWorkspace(workspace)}
                      className="cursor-pointer gap-2 p-2"
                    >
                      <div
                        className={`flex size-6 items-center justify-center rounded-sm ${workspace.color}`}
                      >
                        <workspace.icon className="size-3.5 shrink-0" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <span className="text-sm font-medium">
                          {workspace.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {workspace.plan}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-muted-foreground cursor-not-allowed gap-2 p-2 opacity-60">
                    <div className="bg-background flex size-6 items-center justify-center rounded-md border border-dashed">
                      <Plus className="size-3.5" />
                    </div>
                    <div className="text-xs font-medium">Add workspace</div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton size="lg" asChild tooltip="IdeaVault">
                <Link to="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
                    <Lightbulb className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">IdeaVault</span>
                    <span className="text-muted-foreground truncate text-xs">
                      Your Idea Hub
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {currentNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      !!matchRoute({ to: item.url, fuzzy: item.url !== "/" })
                    }
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {user?.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.name ?? "User"}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user?.email ?? ""}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => clearAuth()}>
                  <LogOut />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
