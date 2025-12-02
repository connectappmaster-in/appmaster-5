import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Wrench, Building2, Key, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
const HelpdeskSubscriptionLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    organisation
  } = useOrganisation();
  const currentPath = location.pathname;
  const isRootPath = currentPath === "/helpdesk/subscription" || currentPath === "/helpdesk/subscription/";

  // Fetch counts for badges
  const {
    data: tools = []
  } = useQuery({
    queryKey: ["subscriptions-tools-count", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];
      const {
        data
      } = await supabase.from("subscriptions_tools").select("*").eq("organisation_id", organisation.id);
      return data || [];
    },
    enabled: !!organisation?.id
  });
  const {
    data: vendors = []
  } = useQuery({
    queryKey: ["subscriptions-vendors-count", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];
      const {
        data
      } = await supabase.from("subscriptions_vendors").select("*").eq("organisation_id", organisation.id);
      return data || [];
    },
    enabled: !!organisation?.id
  });
  const {
    data: licenses = []
  } = useQuery({
    queryKey: ["subscriptions-licenses-count", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];
      const {
        data
      } = await supabase.from("subscriptions_licenses").select("*").eq("organisation_id", organisation.id);
      return data || [];
    },
    enabled: !!organisation?.id
  });
  const {
    data: payments = []
  } = useQuery({
    queryKey: ["subscriptions-payments-count", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];
      const {
        data
      } = await supabase.from("subscriptions_payments").select("*").eq("organisation_id", organisation.id);
      return data || [];
    },
    enabled: !!organisation?.id
  });
  const tabs = [{
    value: "/helpdesk/subscription",
    label: "Overview",
    icon: LayoutDashboard,
    count: 0
  }, {
    value: "/helpdesk/subscription/tools",
    label: "Tools",
    icon: Wrench,
    count: tools.length
  }, {
    value: "/helpdesk/subscription/vendors",
    label: "Vendors",
    icon: Building2,
    count: vendors.length
  }, {
    value: "/helpdesk/subscription/licenses",
    label: "Licenses",
    icon: Key,
    count: licenses.length
  }, {
    value: "/helpdesk/subscription/payments",
    label: "Payments",
    icon: CreditCard,
    count: payments.length
  }];
  const handleTabChange = (value: string) => {
    navigate(value);
  };
  return <div className="min-h-screen bg-background">
      <div className="w-full px-4 pt-2 pb-3">
        <Tabs value={isRootPath ? "/helpdesk/subscription" : currentPath} onValueChange={handleTabChange}>
          <div className="flex items-center gap-2 flex-wrap">
            <TabsList className="h-8">
              {tabs.map(tab => <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 px-3 text-sm h-7">
                  
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count > 0}
                </TabsTrigger>)}
            </TabsList>
          </div>
        </Tabs>
        
        <div className="mt-2">
          <Outlet />
        </div>
      </div>
    </div>;
};
export default HelpdeskSubscriptionLayout;