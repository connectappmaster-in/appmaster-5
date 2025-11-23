import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { BarChart3, Package, FileText, Users, Ticket, Briefcase, Calendar, ShoppingCart } from "lucide-react";
const Features = () => {
  const products = [{
    icon: BarChart3,
    title: "CRM",
    description: "Track leads, manage contacts, and close deals faster with our comprehensive CRM system",
    color: "from-blue-500 to-blue-600",
    path: "/apps/crm"
  }, {
    icon: FileText,
    title: "Invoicing & Billing",
    description: "Generate professional invoices and manage your billing cycles effortlessly",
    color: "from-purple-500 to-purple-600",
    path: "/apps/invoicing"
  }, {
    icon: Users,
    title: "HR & Attendance",
    description: "Streamline employee management, track attendance, and handle HR operations",
    color: "from-pink-500 to-pink-600",
    path: "/apps/attendance"
  }, {
    icon: Ticket,
    title: "Help Desk",
    description: "Provide excellent customer support with organized ticket management",
    color: "from-cyan-500 to-cyan-600",
    path: "/apps/helpdesk"
  }, {
    icon: Briefcase,
    title: "Asset Management",
    description: "Track business assets, calculate depreciation, and manage asset lifecycle",
    color: "from-green-500 to-green-600",
    path: "/apps/assets"
  }, {
    icon: Package,
    title: "Subscriptions",
    description: "Manage subscriptions, track renewals, and control access to tools",
    color: "from-rose-500 to-rose-600",
    path: "/apps/subscriptions"
  }];
  return <section className="py-24 px-4 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: "1.5s"
      }} />
      </div>

      
    </section>;
};
export default Features;