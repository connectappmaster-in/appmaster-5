import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { OrganisationProvider } from "./contexts/OrganisationContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SuperAdminRoute } from "./components/SuperAdminRoute";
import { DashboardRedirect } from "./components/DashboardRedirect";
import { ToolAccessGuard } from "./components/ToolAccessGuard";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import IndividualDashboard from "./pages/dashboard/individual";
import OrgAdminDashboard from "./pages/org-admin";
import OrgEditorDashboard from "./pages/dashboard/org-editor";
import OrgViewerDashboard from "./pages/dashboard/org-viewer";
import NotFound from "./pages/NotFound";
import Depreciation from "./pages/depreciation";
import Invoicing from "./pages/invoicing";
import Attendance from "./pages/attendance";
// Helpdesk imports
import HelpdeskLayout from "./pages/helpdesk/layout";
import HelpdeskDashboard from "./pages/helpdesk/dashboard";
import HelpdeskTickets from "./pages/helpdesk/tickets/index";
import TicketDetail from "./pages/helpdesk/tickets/[id]";
import NewTicket from "./pages/helpdesk/new";
import HelpdeskAssets from "./pages/helpdesk/assets";
import AssetDetail from "./pages/helpdesk/assets/detail/[assetId]";
import AssetReports from "./pages/helpdesk/assets/reports";
import AllAssets from "./pages/helpdesk/assets/allassets";
import AssetSetup from "./pages/helpdesk/assets/setup";
import DepreciationDashboard from "./pages/helpdesk/assets/depreciation/index";
import VendorsList from "./pages/helpdesk/assets/vendors/index";
import LicensesList from "./pages/helpdesk/assets/licenses/index";
import RepairsList from "./pages/helpdesk/assets/repairs/index";
import CreateRepair from "./pages/helpdesk/assets/repairs/create";
import RepairDetail from "./pages/helpdesk/assets/repairs/detail/[repairId]";
// Assets Explore imports
import AssetsBulkActions from "./pages/helpdesk/assets/explore/bulk-actions";
import AssetsReports from "./pages/helpdesk/assets/explore/reports";
import AssetsTools from "./pages/helpdesk/assets/tools";
import AssetsFieldsSetup from "./pages/helpdesk/assets/setup/fields-setup";
import HelpdeskProblemDetail from "./pages/helpdesk/problems/[id]";
import HelpdeskChanges from "./pages/helpdesk/changes";
import HelpdeskAutomation from "./pages/helpdesk/automation";
import HelpdeskSubscriptionLayout from "./pages/helpdesk/subscription/index";
import HelpdeskSubscriptionDashboard from "./pages/helpdesk/subscription/dashboard";
import HelpdeskSubscriptionTools from "./pages/helpdesk/subscription/tools";
import HelpdeskSubscriptionVendors from "./pages/helpdesk/subscription/vendors";
import HelpdeskSubscriptionLicenses from "./pages/helpdesk/subscription/licenses";
import HelpdeskSubscriptionPayments from "./pages/helpdesk/subscription/payments";
import HelpdeskAdmin from "./pages/helpdesk/admin";
import HelpdeskSettings from "./pages/helpdesk/settings";
import HelpdeskQueues from "./pages/helpdesk/queues";
import HelpdeskSLA from "./pages/helpdesk/sla";
import HelpdeskReports from "./pages/helpdesk/reports";
import HelpdeskMonitoring from "./pages/helpdesk/monitoring";
import HelpdeskSystemUpdates from "./pages/helpdesk/system-updates";
import SystemUpdatesSettings from "./pages/helpdesk/system-updates/settings";
import SystemUpdatesDevices from "./pages/helpdesk/system-updates/devices";
import SystemUpdatesUpdates from "./pages/helpdesk/system-updates/updates";
import HelpdeskAudit from "./pages/helpdesk/audit";
import Assets from "./pages/assets";
import ShopIncomeExpense from "./pages/shop-income-expense";
import CRM from "./pages/crm";
import LeadsListPage from "./pages/crm/leads";
import NewLeadPage from "./pages/crm/leads/new";
import CustomersListPage from "./pages/crm/customers";
import OpportunitiesPage from "./pages/crm/opportunities";
import QuotesListPage from "./pages/crm/quotes";
import PersonalExpense from "./pages/personal-expense";
import Contact from "./pages/contact";
import ReportIssue from "./pages/ReportIssue";
import Admin from "./pages/admin/index";
import Login from "./pages/Login";
import AuthConfirm from "./pages/AuthConfirm";
import Profile from "./pages/Profile";
import InitializeAdmin from "./pages/InitializeAdmin";
import PasswordReset from "./pages/PasswordReset";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";
import AcceptInvitation from "./pages/AcceptInvitation";
import SuperAdmin from "./pages/super-admin/index";
import SuperAdminDashboard from "./pages/super-admin/dashboard";
import SuperAdminOrganisations from "./pages/super-admin/organisations";
import SuperAdminUsers from "./pages/super-admin/users";
import SuperAdminJobs from "./pages/super-admin/jobs";
import SuperAdminAPIKeys from "./pages/super-admin/api-keys";
import SuperAdminUsage from "./pages/super-admin/usage";
import SuperAdminFeatures from "./pages/super-admin/features";
import SuperAdminPlans from "./pages/super-admin/plans";
import SuperAdminAdmins from "./pages/super-admin/admins";
import SuperAdminSettings from "./pages/super-admin/settings";
import SuperAdminLogs from "./pages/super-admin/logs";
import SuperAdminContactSubmissions from "./pages/super-admin/contact-submissions";
import SuperAdminIssueReports from "./pages/super-admin/issue-reports";
import SuperAdminBroadcasts from "./pages/super-admin/broadcasts";
import SuperAdminOrganizationUsers from "./pages/super-admin/organization-users";
import SuperAdminTools from "./pages/super-admin/tools";
import { BroadcastBanner } from "./components/BroadcastBanner";
import AppDetailPage from "./pages/apps/[slug]";
import Notifications from "./pages/Notifications";
import ITAM from "./pages/itam/index";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1
    }
  }
});
const App = () => {
  return <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <OrganisationProvider>
              <BroadcastBanner />
              <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/apps/:slug" element={<AppDetailPage />} />
                  
                  {/* Main dashboard redirect */}
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
                  
                  {/* Individual user dashboard */}
                  <Route path="/dashboard/individual" element={<ProtectedRoute><IndividualDashboard /></ProtectedRoute>} />
                  
                  {/* Organization dashboards */}
                  <Route path="/org-admin/*" element={<ProtectedRoute><OrgAdminDashboard /></ProtectedRoute>} />
                  <Route path="/dashboard/org-editor" element={<ProtectedRoute><OrgEditorDashboard /></ProtectedRoute>} />
                  <Route path="/dashboard/org-viewer" element={<ProtectedRoute><OrgViewerDashboard /></ProtectedRoute>} />
                  
                  {/* Legacy route - redirects to appropriate dashboard */}
                  <Route path="/index" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/auth/confirm" element={<AuthConfirm />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
          <Route path="/accept-invitation" element={<AcceptInvitation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/personal-info" element={<Navigate to="/profile#personal-info" replace />} />
          <Route path="/profile/security" element={<Navigate to="/profile#security" replace />} />
          <Route path="/profile/payments" element={<Navigate to="/profile#payments" replace />} />
          <Route path="/initialize-admin" element={<InitializeAdmin />} />
          <Route path="/depreciation" element={<ToolAccessGuard toolKey="assets"><Depreciation /></ToolAccessGuard>} />
          <Route path="/invoicing" element={<ToolAccessGuard toolKey="invoicing"><Invoicing /></ToolAccessGuard>} />
          <Route path="/attendance" element={<ToolAccessGuard toolKey="attendance"><Attendance /></ToolAccessGuard>} />
          
          {/* Helpdesk Routes - All under /helpdesk */}
          <Route path="/helpdesk" element={<ToolAccessGuard toolKey="helpdesk"><HelpdeskLayout /></ToolAccessGuard>}>
            
            <Route path="tickets" element={<HelpdeskTickets />} />
            <Route path="tickets/:id" element={<TicketDetail />} />
            <Route path="new" element={<NewTicket />} />
            <Route path="assets" element={<HelpdeskAssets />} />
            <Route path="assets/allassets" element={<AllAssets />} />
            <Route path="assets/detail/:assetId" element={<AssetDetail />} />
            <Route path="assets/reports" element={<AssetReports />} />
            <Route path="assets/tools" element={<AssetsTools />} />
            <Route path="assets/setup" element={<AssetSetup />} />
            <Route path="assets/depreciation" element={<DepreciationDashboard />} />
            <Route path="assets/vendors" element={<VendorsList />} />
            <Route path="assets/licenses" element={<LicensesList />} />
            <Route path="assets/repairs" element={<RepairsList />} />
            <Route path="assets/repairs/create" element={<CreateRepair />} />
            <Route path="assets/repairs/detail/:repairId" element={<RepairDetail />} />
            <Route path="assets/setup/fields-setup" element={<AssetsFieldsSetup />} />
            <Route path="subscription" element={<HelpdeskSubscriptionLayout />}>
              <Route index element={<HelpdeskSubscriptionDashboard />} />
              <Route path="tools" element={<HelpdeskSubscriptionTools />} />
              <Route path="vendors" element={<HelpdeskSubscriptionVendors />} />
              <Route path="licenses" element={<HelpdeskSubscriptionLicenses />} />
              <Route path="payments" element={<HelpdeskSubscriptionPayments />} />
            </Route>
            <Route path="system-updates" element={<HelpdeskSystemUpdates />} />
            <Route path="system-updates/settings" element={<SystemUpdatesSettings />} />
            <Route path="system-updates/devices" element={<SystemUpdatesDevices />} />
            <Route path="system-updates/updates" element={<SystemUpdatesUpdates />} />
            <Route path="monitoring" element={<HelpdeskMonitoring />} />
            <Route path="reports" element={<HelpdeskReports />} />
            <Route path="audit" element={<HelpdeskAudit />} />
            <Route path="problems" element={<HelpdeskTickets />} />
            <Route path="problems/:id" element={<HelpdeskProblemDetail />} />
            <Route path="changes" element={<HelpdeskChanges />} />
            <Route path="automation" element={<HelpdeskAutomation />} />
            <Route path="admin" element={<HelpdeskAdmin />} />
            <Route path="settings" element={<HelpdeskSettings />} />
            <Route path="queues" element={<HelpdeskQueues />} />
            <Route path="sla" element={<HelpdeskSLA />} />
          </Route>
          
          <Route path="/itam" element={<ToolAccessGuard toolKey="itam"><ITAM /></ToolAccessGuard>} />
          <Route path="/assets" element={<ToolAccessGuard toolKey="assets"><Assets /></ToolAccessGuard>} />
          <Route path="/shop-income-expense" element={<ShopIncomeExpense />} />
          <Route path="/crm" element={<ToolAccessGuard toolKey="crm"><CRM /></ToolAccessGuard>} />
          <Route path="/crm/leads" element={<ToolAccessGuard toolKey="crm"><LeadsListPage /></ToolAccessGuard>} />
          <Route path="/crm/leads/new" element={<ToolAccessGuard toolKey="crm"><NewLeadPage /></ToolAccessGuard>} />
          <Route path="/crm/customers" element={<ToolAccessGuard toolKey="crm"><CustomersListPage /></ToolAccessGuard>} />
          <Route path="/crm/opportunities" element={<ToolAccessGuard toolKey="crm"><OpportunitiesPage /></ToolAccessGuard>} />
          <Route path="/crm/quotes" element={<ToolAccessGuard toolKey="crm"><QuotesListPage /></ToolAccessGuard>} />
          <Route path="/personal-expense" element={<PersonalExpense />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/report-issue" element={<ReportIssue />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/super-admin" element={<SuperAdminRoute><SuperAdmin /></SuperAdminRoute>}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="organisations" element={<SuperAdminOrganisations />} />
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="plans" element={<SuperAdminPlans />} />
            <Route path="tools" element={<SuperAdminTools />} />
            <Route path="usage" element={<SuperAdminUsage />} />
            <Route path="logs" element={<SuperAdminLogs />} />
            <Route path="features" element={<SuperAdminFeatures />} />
            <Route path="api-keys" element={<SuperAdminAPIKeys />} />
            <Route path="jobs" element={<SuperAdminJobs />} />
            <Route path="admins" element={<SuperAdminAdmins />} />
            <Route path="contact-submissions" element={<SuperAdminContactSubmissions />} />
            <Route path="issue-reports" element={<SuperAdminIssueReports />} />
            <Route path="broadcasts" element={<SuperAdminBroadcasts />} />
            <Route path="organization-users" element={<SuperAdminOrganizationUsers />} />
            <Route path="settings" element={<SuperAdminSettings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
            </OrganisationProvider>
          </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>;
};
export default App;