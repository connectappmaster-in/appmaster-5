import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { OrgAdminSidebar } from "@/components/OrgAdmin/OrgAdminSidebar";
import { OrgDashboard } from "@/components/OrgAdmin/OrgDashboard";
import { OrgUsersManager } from "@/components/OrgAdmin/OrgUsersManager";
import { OrgToolsManager } from "@/components/OrgAdmin/OrgToolsManager";
import { OrgBillingManager } from "@/components/OrgAdmin/OrgBillingManager";
import { OrgAuditLogs } from "@/components/OrgAdmin/OrgAuditLogs";
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
import { useNavigate } from "react-router-dom";
import { NotificationPanel } from "@/components/NotificationPanel";

const routeTitles: Record<string, string> = {
  "/org-admin": "Dashboard",
  "/org-admin/users": "Users Management",
  "/org-admin/tools": "Tools Management",
  "/org-admin/billing": "Billing & Subscription",
  "/org-admin/logs": "Audit Logs",
};

const OrgAdminDashboard = () => {
  const { accountType, userRole, loading, user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = routeTitles[location.pathname] || "Organization Admin";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const role = userRole?.toLowerCase();
  if (accountType !== "organization" || (role !== "admin" && role !== "owner")) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="h-screen flex w-full overflow-hidden">
      <BackButton />
      <OrgAdminSidebar />
      
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
                      {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin'}
                    </span>
                    <span className="text-xs text-muted-foreground">Org Admin</span>
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
          <Routes>
            <Route index element={<OrgDashboard />} />
            <Route path="users" element={<OrgUsersManager />} />
            <Route path="tools" element={<OrgToolsManager />} />
            <Route path="billing" element={<OrgBillingManager />} />
            <Route path="logs" element={<OrgAuditLogs />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default OrgAdminDashboard;
