import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { HelpdeskSidebar } from "@/components/helpdesk/HelpdeskSidebar";
import { BackButton } from "@/components/BackButton";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationPanel } from "@/components/NotificationPanel";

const routeTitles: Record<string, string> = {
  "/helpdesk": "Dashboard",
  "/helpdesk/tickets": "All Tickets",
  "/helpdesk/new": "New Ticket",
  "/helpdesk/srm": "Service Requests",
  "/helpdesk/queues": "Queues",
  "/helpdesk/sla": "SLA Policies",
  "/helpdesk/assets": "IT Asset Management",
  "/helpdesk/kb": "Knowledge Base",
  "/helpdesk/problems": "Problem Management",
  "/helpdesk/changes": "Change Management",
  "/helpdesk/automation": "Automation Rules",
  "/helpdesk/subscription": "Subscription Management",
  "/helpdesk/subscription/tools": "Subscription Tools",
  "/helpdesk/subscription/vendors": "Subscription Vendors",
  "/helpdesk/subscription/licenses": "Subscription Licenses",
  "/helpdesk/subscription/payments": "Subscription Payments",
  "/helpdesk/system-updates": "System Updates",
  "/helpdesk/monitoring": "Monitoring",
  "/helpdesk/reports": "Reports & Analytics",
  "/helpdesk/audit": "Audit Logs",
  "/helpdesk/admin": "Admin Panel",
  "/helpdesk/settings": "Settings",
};

const HelpdeskLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  // Handle dynamic routes like /helpdesk/tickets/:id
  let pageTitle = routeTitles[location.pathname] || "IT Helpdesk";
  if (location.pathname.startsWith("/helpdesk/tickets/") && location.pathname !== "/helpdesk/tickets") {
    pageTitle = "Ticket Details";
  }

  return (
    <div className="h-screen flex w-full overflow-hidden">
      <BackButton />
      <HelpdeskSidebar />
      
      <main className="flex-1 h-screen flex flex-col bg-background">
        <div className="border-b px-4 flex items-center justify-between shrink-0" style={{ height: "52px" }}>
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
          
          <div className="flex items-center gap-2">
            <NotificationPanel />

            {/* Profile Icon */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground">Helpdesk</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default HelpdeskLayout;
