import { useState } from "react";
import { LayoutDashboard, Ticket, Package, CreditCard, Bell, Activity, BarChart3, FileText, Settings, ChevronLeft } from "lucide-react";
import appmasterLogo from "@/assets/appmaster-logo.png";
import { NavLink, useLocation } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
const navItems = [{
  title: "Dashboard",
  url: "/helpdesk",
  icon: LayoutDashboard
}, {
  title: "Tickets",
  url: "/helpdesk/tickets",
  icon: Ticket
}, {
  title: "Assets",
  url: "/helpdesk/assets",
  icon: Package
}, {
  title: "Subscription",
  url: "/helpdesk/subscription",
  icon: CreditCard
}, {
  title: "Updates",
  url: "/helpdesk/system-updates",
  icon: Bell
}, {
  title: "Monitoring",
  url: "/helpdesk/monitoring",
  icon: Activity
}, {
  title: "Reports",
  url: "/helpdesk/reports",
  icon: BarChart3
}, {
  title: "Audit",
  url: "/helpdesk/audit",
  icon: FileText
}, {
  title: "Settings",
  url: "/helpdesk/settings",
  icon: Settings
}];
export function HelpdeskSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  const isActive = (path: string) => {
    if (path === "/helpdesk") {
      return currentPath === "/helpdesk";
    }
    return currentPath.startsWith(path);
  };
  return <div className="h-screen flex flex-col bg-background transition-all duration-300 ease-in-out border-r border-border" style={{
    width: collapsed ? "56px" : "160px",
    minWidth: collapsed ? "56px" : "160px",
    maxWidth: collapsed ? "56px" : "160px"
  }}>
      {/* Header - matches navbar height */}
      <div className="flex items-center justify-center border-b border-border px-2" style={{
      height: "52px"
    }}>
        {!collapsed && <img src={appmasterLogo} alt="AppMaster Logo" className="h-8 w-auto transition-all duration-300" />}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-3 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {navItems.map(item => {
          const active = isActive(item.url);
          const menuButton = <NavLink to={item.url} end={item.url === "/helpdesk"} className={`flex items-center h-9 px-3 rounded-lg relative transition-colors duration-200 font-medium text-sm ${active ? "text-primary bg-accent" : "text-foreground hover:text-primary hover:bg-accent/50"}`}>
                <item.icon className={`h-4 w-4 flex-shrink-0 ${collapsed ? "" : "mr-3"}`} />
                {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
              </NavLink>;
          if (collapsed) {
            return <TooltipProvider key={item.title}>
                  <Tooltip>
                    <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>;
          }
          return <div key={item.title}>{menuButton}</div>;
        })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-border p-2 space-y-1">
        {/* Collapse Toggle */}
        <div>
          {(() => {
          const collapseButton = <button onClick={toggleSidebar} className="flex items-center h-9 w-full px-3 rounded-lg transition-colors font-medium text-sm text-foreground/70 hover:text-primary hover:bg-accent/50">
                <ChevronLeft className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${collapsed ? "rotate-180 mx-auto" : "mr-3"}`} />
                {!collapsed && <span className="text-sm font-medium">Collapse</span>}
              </button>;
          if (collapsed) {
            return <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>{collapseButton}</TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      <p>Expand sidebar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>;
          }
          return collapseButton;
        })()}
        </div>
      </div>
    </div>;
}