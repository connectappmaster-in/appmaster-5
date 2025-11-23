import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SuperAdminSidebar } from "@/components/SuperAdmin/SuperAdminSidebar";
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
  "/super-admin": "Dashboard",
  "/super-admin/users": "Individual Users",
  "/super-admin/organisations": "Organizations",
  "/super-admin/organization-users": "Organization Users",
  "/super-admin/admins": "Appmaster Admins",
  "/super-admin/api-keys": "API Keys Management",
  "/super-admin/broadcasts": "Broadcast Messages",
  "/super-admin/contact-submissions": "Contact Submissions",
  "/super-admin/features": "Feature Flags",
  "/super-admin/jobs": "Worker Jobs Monitor",
  "/super-admin/logs": "System Logs",
  "/super-admin/plans": "Subscription Plans",
  "/super-admin/tools": "Tools Management",
  "/super-admin/settings": "System Settings",
  "/super-admin/usage": "Usage Metrics",
};

const SuperAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = routeTitles[location.pathname] || "Super Admin";
  const { user, signOut } = useAuth();

  return <div className="h-screen flex w-full overflow-hidden mt-0">
      <BackButton />
      <SuperAdminSidebar />
      
      <main className="flex-1 h-screen flex flex-col bg-background">
        <div className="border-b px-4 flex items-center justify-between shrink-0 mt-0" style={{
        height: "52px"
      }}>
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
                    <span className="font-medium">S Admin</span>
                    <span className="text-xs text-muted-foreground">Super Admin</span>
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
    </div>;
};
export default SuperAdmin;