import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
export const AssetTopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/helpdesk/assets") return "overview";
    if (path.includes("/allassets")) return "all";
    if (path.includes("/tools")) return "tools";
    if (path.includes("/report")) return "reports";
    if (path.includes("/setup")) return "setup";
    return "overview";
  };
  const handleTabChange = (value: string) => {
    switch (value) {
      case "overview":
        navigate("/helpdesk/assets");
        break;
      case "all":
        navigate("/helpdesk/assets/allassets");
        break;
      case "tools":
        navigate("/helpdesk/assets/tools");
        break;
      case "reports":
        navigate("/helpdesk/assets/reports");
        break;
      case "setup":
        navigate("/helpdesk/assets/setup");
        break;
    }
  };
  return <div className="w-full px-4 pt-2 pb-3">
      <Tabs value={getActiveTab()} onValueChange={handleTabChange}>
        <div className="flex items-center gap-2 flex-wrap">
          <TabsList className="h-8">
            <TabsTrigger value="overview" className="gap-1.5 px-3 text-sm h-7">
              
              Overview
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1.5 px-3 text-sm h-7">
              
              All Assets
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-1.5 px-3 text-sm h-7">
              
              Tools
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1.5 px-3 text-sm h-7">
              
              Reports
            </TabsTrigger>
            <TabsTrigger value="setup" className="gap-1.5 px-3 text-sm h-7">
              
              Setup
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>;
};