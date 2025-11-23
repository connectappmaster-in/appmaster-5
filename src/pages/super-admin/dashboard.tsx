import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/SuperAdmin/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, DollarSign, TrendingUp, Activity, ArrowRight, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrgs: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    activeOrgs: 0,
    suspendedOrgs: 0,
    totalAdmins: 0,
    totalContacts: 0,
    totalPlans: 0
  });
  const [recentOrgs, setRecentOrgs] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats - only count organizations (not personal accounts)
      const [orgsResult, usersResult, subscriptionsResult, adminsResult, contactsResult, plansResult] = await Promise.all([supabase.from("organisations").select("*").eq("account_type", "organization"), supabase.from("users").select("*", {
        count: "exact",
        head: true
      }), supabase.from("subscriptions").select("*").eq("status", "active"), supabase.from("appmaster_admins").select("*", {
        count: "exact",
        head: true
      }).eq("is_active", true), supabase.from("contact_submissions").select("*", {
        count: "exact",
        head: true
      }), supabase.from("subscription_plans").select("*", {
        count: "exact",
        head: true
      })]);

      // Count active and suspended orgs
      const activeOrgsCount = orgsResult.data?.filter(org => org.plan !== 'suspended').length || 0;
      const suspendedOrgsCount = orgsResult.data?.filter(org => org.plan === 'suspended').length || 0;

      // Calculate monthly revenue from active subscriptions
      const totalRevenue = subscriptionsResult.data?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;
      setStats({
        totalOrgs: orgsResult.data?.length || 0,
        totalUsers: usersResult.count || 0,
        activeSubscriptions: subscriptionsResult.data?.length || 0,
        monthlyRevenue: totalRevenue,
        activeOrgs: activeOrgsCount,
        suspendedOrgs: suspendedOrgsCount,
        totalAdmins: adminsResult.count || 0,
        totalContacts: contactsResult.count || 0,
        totalPlans: plansResult.count || 0
      });

      // Fetch recent organizations (last 5)
      const {
        data: recentOrgsData
      } = await supabase.from("organisations").select("*").order("created_at", {
        ascending: false
      }).limit(5);
      setRecentOrgs(recentOrgsData || []);

      // Fetch recent users (last 5)
      const {
        data: recentUsersData
      } = await supabase.from("users").select("*").order("created_at", {
        ascending: false
      }).limit(5);
      setRecentUsers(recentUsersData || []);

      // Fetch recent audit logs (last 10)
      const {
        data: recentLogsData
      } = await supabase.from("audit_logs").select("*").order("created_at", {
        ascending: false
      }).limit(10);
      setRecentLogs(recentLogsData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'user_signup':
      case 'user_created':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'user_deleted':
      case 'organisation_deleted':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };
  return <div className="space-y-6">
      <div>
        
        
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Organisations" value={stats.totalOrgs} icon={Building2} trend={{
        value: `${stats.activeOrgs} active`,
        positive: true
      }} description="Organization accounts" onClick={() => navigate("/super-admin/organisations")} />
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} description="Across all orgs" onClick={() => navigate("/super-admin/users")} />
        <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} icon={TrendingUp} description="Paying customers" onClick={() => navigate("/super-admin/plans")} />
        <StatCard title="Monthly Revenue" value={`₹${stats.monthlyRevenue.toLocaleString()}`} icon={DollarSign} description="This month" onClick={() => navigate("/super-admin/usage")} />
        <StatCard title="System Admins" value={stats.totalAdmins} icon={Users} description="Active administrators" onClick={() => navigate("/super-admin/admins")} />
        <StatCard title="Contact Queries" value={stats.totalContacts} icon={Activity} description="Total submissions" onClick={() => navigate("/super-admin/contact-submissions")} />
        <StatCard title="Subscription Plans" value={stats.totalPlans} icon={DollarSign} description="Available plans" onClick={() => navigate("/super-admin/plans")} />
        <StatCard title="System Health" value="Active" icon={CheckCircle} description="All systems operational" onClick={() => navigate("/super-admin/logs")} />
      </div>

      {/* Recent Activity Grid */}
      

      {/* System Activity */}
      
    </div>;
};
export default SuperAdminDashboard;