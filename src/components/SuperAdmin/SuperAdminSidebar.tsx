import { useState } from "react";
import { Building2, Users, DollarSign, Activity, Settings, Key, Flag, Briefcase, BarChart3, FileText, LayoutDashboard, ChevronLeft, Home, User, LogOut, Shield, MessageSquare, Megaphone, Wrench, AlertCircle } from "lucide-react";
import appmasterLogo from "@/assets/appmaster-logo.png";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
const navItems = [{
  title: "Dashboard",
  url: "/super-admin",
  icon: LayoutDashboard
}, {
  title: "Users",
  url: "/super-admin/users",
  icon: Users
}, {
  title: "Organisations",
  url: "/super-admin/organisations",
  icon: Building2
}, {
  title: "Admins",
  url: "/super-admin/admins",
  icon: Shield
}, {
  title: "Plans",
  url: "/super-admin/plans",
  icon: DollarSign
}, {
  title: "Tools",
  url: "/super-admin/tools",
  icon: Wrench
}, {
  title: "Usage",
  url: "/super-admin/usage",
  icon: BarChart3
}, {
  title: "Logs",
  url: "/super-admin/logs",
  icon: FileText
}, {
  title: "Jobs",
  url: "/super-admin/jobs",
  icon: Briefcase
}, {
  title: "Features",
  url: "/super-admin/features",
  icon: Flag
}, {
  title: "API Keys",
  url: "/super-admin/api-keys",
  icon: Key
}, {
  title: "Broadcasts",
  url: "/super-admin/broadcasts",
  icon: Megaphone
}, {
  title: "Contact US",
  url: "/super-admin/contact-submissions",
  icon: MessageSquare
}, {
  title: "Issue Reports",
  url: "/super-admin/issue-reports",
  icon: AlertCircle
}, {
  title: "Settings",
  url: "/super-admin/settings",
  icon: Settings
}];
export function SuperAdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [newSubmissionsCount, setNewSubmissionsCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useAuth();
  const {
    toast
  } = useToast();
  const currentPath = location.pathname;
  useEffect(() => {
    const fetchNewSubmissions = async () => {
      const {
        count
      } = await supabase.from('contact_submissions').select('*', {
        count: 'exact',
        head: true
      }).eq('status', 'new');
      setNewSubmissionsCount(count || 0);
    };
    fetchNewSubmissions();

    // Poll every 30 seconds for new submissions
    const interval = setInterval(fetchNewSubmissions, 30000);
    return () => clearInterval(interval);
  }, []);
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  const isActive = (path: string) => {
    if (path === "/super-admin") {
      return currentPath === "/super-admin";
    }
    return currentPath.startsWith(path);
  };
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account."
      });
      navigate("/login", {
        replace: true
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };
  return <div className="h-screen flex flex-col bg-background transition-all duration-300 ease-in-out" style={{
    width: collapsed ? "50px" : "180px",
    minWidth: collapsed ? "50px" : "180px",
    maxWidth: collapsed ? "50px" : "180px"
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
          const isContactSubmissions = item.url === "/super-admin/contact-submissions";
          const showBadge = isContactSubmissions && newSubmissionsCount > 0;
          const menuButton = <NavLink to={item.url} end={item.url === "/super-admin"} className={`flex items-center h-9 rounded-lg relative transition-colors duration-200 font-medium text-sm ${active ? "text-primary bg-accent" : "text-foreground hover:text-primary hover:bg-accent/50"}`}>
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4" />
                </div>
                <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap flex items-center gap-2 ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>
                  <span className="text-sm font-medium">{item.title}</span>
                  {showBadge && !collapsed && <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center px-1 text-xs">
                      {newSubmissionsCount}
                    </Badge>}
                </div>
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
        {/* Homepage Button */}
        <div>
          {(() => {
          const homeButton = <button onClick={() => navigate("/")} className="flex items-center h-9 w-full rounded-lg transition-colors font-medium text-sm text-foreground/70 hover:text-primary hover:bg-accent/50">
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                  <Home className="w-4 h-4" />
                </div>
                <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>
                  <span className="text-sm font-medium">Homepage</span>
                </div>
              </button>;
          if (collapsed) {
            return <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>{homeButton}</TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      <p>Homepage</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>;
          }
          return homeButton;
        })()}
        </div>

        {/* Collapse Toggle */}
        <div>
          {(() => {
          const collapseButton = <button onClick={toggleSidebar} className="flex items-center h-9 w-full rounded-lg transition-colors font-medium text-sm text-foreground/70 hover:text-primary hover:bg-accent/50">
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                  <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
                </div>
                <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>
                  <span className="text-sm font-medium">Collapse</span>
                </div>
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