import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Wrench, Building2, Key, CreditCard } from "lucide-react";

const HelpdeskSubscriptionLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const currentPath = location.pathname;
  const isRootPath = currentPath === "/helpdesk/subscription" || currentPath === "/helpdesk/subscription/";
  
  const tabs = [
    { value: "/helpdesk/subscription", label: "Dashboard", icon: LayoutDashboard },
    { value: "/helpdesk/subscription/tools", label: "Tools", icon: Wrench },
    { value: "/helpdesk/subscription/vendors", label: "Vendors", icon: Building2 },
    { value: "/helpdesk/subscription/licenses", label: "Licenses", icon: Key },
    { value: "/helpdesk/subscription/payments", label: "Payments", icon: CreditCard },
  ];

  const handleTabChange = (value: string) => {
    navigate(value);
  };

  return (
    <div className="space-y-4">
      <Tabs value={isRootPath ? "/helpdesk/subscription" : currentPath} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-10">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              className="flex items-center gap-2 text-xs"
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
};

export default HelpdeskSubscriptionLayout;
