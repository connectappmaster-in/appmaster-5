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
  "/helpdesk/tickets/create": "Create Ticket",
  "/helpdesk/tickets/assignment-rules": "Ticket Assignment Rules",
  "/helpdesk/tickets/closed-archive": "Closed Tickets Archive",
  "/helpdesk/tickets/linked-problems": "Linked Problems",
  "/helpdesk/tickets/reports": "Ticket Reports",
  "/helpdesk/new": "New Ticket",
  "/helpdesk/srm": "Service Requests",
  "/helpdesk/service-requests": "Service Requests",
  "/helpdesk/service-requests/my-requests": "My Requests",
  "/helpdesk/service-requests/approvals": "Approvals",
  "/helpdesk/service-requests/assignment-rules": "Assignment Rules",
  "/helpdesk/service-requests/request-form": "Request Form",
  "/helpdesk/service-requests/reports": "Service Request Reports",
  "/helpdesk/service-requests/change-management": "Change Management",
  "/helpdesk/service-requests/change-management/calendar": "Change Calendar",
  "/helpdesk/service-requests/change-management/approvals": "Change Approvals",
  "/helpdesk/queues": "Queues",
  "/helpdesk/sla": "SLA Policies",
  "/helpdesk/assets": "IT Asset Management",
  "/helpdesk/assets/allassets": "All Assets",
  "/helpdesk/assets/setup": "Asset Setup",
  "/helpdesk/assets/setup/fields-setup": "Fields Setup",
  "/helpdesk/assets/tools": "Asset Tools",
  "/helpdesk/assets/reports": "Asset Reports",
  "/helpdesk/assets/audit": "Asset Audit",
  "/helpdesk/assets/explore/bulk-actions": "Bulk Actions",
  "/helpdesk/assets/explore/reports": "Asset Reports",
  "/helpdesk/assets/repairs": "Repairs & Maintenance",
  "/helpdesk/assets/repairs/create": "Create Repair",
  "/helpdesk/assets/licenses": "Software Licenses",
  "/helpdesk/assets/licenses/add-license": "Add License",
  "/helpdesk/assets/licenses/allocate": "Allocate License",
  "/helpdesk/assets/purchase-orders": "Purchase Orders",
  "/helpdesk/assets/purchase-orders/create-po": "Create Purchase Order",
  "/helpdesk/assets/vendors": "Vendors",
  "/helpdesk/assets/vendors/add-vendor": "Add Vendor",
  "/helpdesk/assets/depreciation": "Depreciation",
  "/helpdesk/assets/depreciation/run": "Run Depreciation",
  "/helpdesk/assets/depreciation/reports": "Depreciation Reports",
  "/helpdesk/assets/depreciation/profile-create": "Create Depreciation Profile",
  "/helpdesk/kb": "Knowledge Base",
  "/helpdesk/problems": "Problem Management",
  "/helpdesk/changes": "Change Management",
  "/helpdesk/automation": "Automation Rules",
  "/helpdesk/subscription": "Subscription Management",
  "/helpdesk/subscription/dashboard": "Subscription Dashboard",
  "/helpdesk/subscription/list": "Subscriptions List",
  "/helpdesk/subscription/add": "Add Subscription",
  "/helpdesk/subscription/tools": "Subscription Tools",
  "/helpdesk/subscription/vendors": "Subscription Vendors",
  "/helpdesk/subscription/licenses": "Subscription Licenses",
  "/helpdesk/subscription/payments": "Subscription Payments",
  "/helpdesk/subscription/alerts": "Subscription Alerts",
  "/helpdesk/subscription/reports": "Subscription Reports",
  "/helpdesk/system-updates": "System Updates",
  "/helpdesk/system-updates/devices": "Devices",
  "/helpdesk/system-updates/updates": "Updates",
  "/helpdesk/system-updates/ingest-log": "Ingest Log",
  "/helpdesk/system-updates/settings": "Update Settings",
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
  if (location.pathname.startsWith("/helpdesk/tickets/") && location.pathname !== "/helpdesk/tickets" && !location.pathname.includes("/create") && !location.pathname.includes("/assignment-rules") && !location.pathname.includes("/closed-archive") && !location.pathname.includes("/linked-problems") && !location.pathname.includes("/reports")) {
    pageTitle = "Ticket Details";
  } else if (location.pathname.startsWith("/helpdesk/problems/") && location.pathname !== "/helpdesk/problems") {
    pageTitle = "Problem Details";
  } else if (location.pathname.startsWith("/helpdesk/assets/detail/")) {
    pageTitle = "Asset Details";
  } else if (location.pathname.startsWith("/helpdesk/assets/repairs/detail/")) {
    pageTitle = "Repair Details";
  } else if (location.pathname.startsWith("/helpdesk/assets/purchase-orders/po-detail/")) {
    pageTitle = "Purchase Order Details";
  } else if (location.pathname.startsWith("/helpdesk/assets/vendors/detail/")) {
    pageTitle = "Vendor Details";
  } else if (location.pathname.startsWith("/helpdesk/assets/depreciation/ledger/")) {
    pageTitle = "Depreciation Ledger";
  } else if (location.pathname.startsWith("/helpdesk/assets/depreciation/profile-detail/")) {
    pageTitle = "Depreciation Profile";
  } else if (location.pathname.startsWith("/helpdesk/subscription/detail/")) {
    pageTitle = "Subscription Details";
  } else if (location.pathname.startsWith("/helpdesk/service-requests/detail/")) {
    pageTitle = "Request Details";
  } else if (location.pathname.startsWith("/helpdesk/service-requests/change-management/detail/")) {
    pageTitle = "Change Request Details";
  } else if (location.pathname.startsWith("/helpdesk/system-updates/device-detail/")) {
    pageTitle = "Device Details";
  } else if (location.pathname.startsWith("/helpdesk/system-updates/update-detail/")) {
    pageTitle = "Update Details";
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

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default HelpdeskLayout;
