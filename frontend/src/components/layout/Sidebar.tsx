import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Target,
  Settings,
  Zap,
  Building2,
  FileSpreadsheet,
  X,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  {
    to: "/user-management",
    icon: UserCog,
    label: "User Management",
  },
  {
    to: "/ssrs-reports",
    icon: FileSpreadsheet,
    label: "SSRS Reports",
  },
  {
    to: "/product-and-custom-sales",
    icon: BarChart3,
    label: "Product and Custom Sales",
  },
  {
    to: "/v-t-and-target-customer-list",
    icon: Target,
    label: "V-T and Target Customer List",
  },
  {
    to: "/management",
    icon: Settings,
    label: "Management",
  },
  {
    to: "/dynamic-reports",
    icon: Zap,
    label: "Dynamic Reports",
  },
  {
    to: "/b2b-reports",
    icon: Building2,
    label: "B2B Reports",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "bg-card border-r transition-all duration-300 ease-in-out",
          "fixed md:static inset-y-0 left-0 z-50",
          "md:translate-x-0",
          isOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full md:translate-x-0 md:w-20",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 md:p-6 border-b flex items-center justify-between">
            <h1
              className={cn(
                "font-bold text-lg md:text-xl",
                !isOpen && "md:hidden",
              )}
            >
              Dashboard
            </h1>
            {!isOpen && <span className="hidden md:block text-xl">D</span>}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="flex-1 p-2 md:p-4 space-y-1 md:space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    "hover:bg-accent hover:text-accent-foreground text-sm",
                    isActive &&
                      "bg-primary text-primary-foreground font-medium",
                  )
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className={cn(!isOpen && "md:hidden")}>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};
