import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart3, Package, FileText, Users, Ticket, Briefcase, 
  Calendar, ShoppingCart, Check, ArrowRight, CreditCard 
} from "lucide-react";

const appDetails = {
  crm: {
    icon: BarChart3,
    title: "CRM",
    slug: "crm",
    tagline: "Manage Your Customer Relationships Like Never Before",
    description: "Transform your sales process with our comprehensive CRM system. Track leads, manage contacts, and close deals faster with powerful automation and insights.",
    color: "from-blue-500 to-blue-600",
    toolPath: "/crm",
    features: [
      "Lead tracking and scoring",
      "Contact management",
      "Deal pipeline visualization",
      "Email integration",
      "Sales analytics and reporting",
      "Custom workflows"
    ],
    benefits: [
      "Increase sales by 30%",
      "Reduce manual data entry",
      "Never miss a follow-up",
      "Team collaboration tools"
    ]
  },
  invoicing: {
    icon: FileText,
    title: "Invoicing & Billing",
    slug: "invoicing",
    tagline: "Professional Invoices in Seconds",
    description: "Create, send, and track professional invoices effortlessly. Automate recurring billing, accept payments online, and get paid faster.",
    color: "from-purple-500 to-purple-600",
    toolPath: "/invoicing",
    features: [
      "Custom invoice templates",
      "Recurring billing automation",
      "Payment tracking",
      "Multiple payment methods",
      "Tax calculations",
      "Client portal"
    ],
    benefits: [
      "Get paid 40% faster",
      "Reduce billing errors",
      "Professional branding",
      "Automated reminders"
    ]
  },
  attendance: {
    icon: Users,
    title: "HR & Attendance",
    slug: "attendance",
    tagline: "Streamline Your Workforce Management",
    description: "Complete HR solution for employee management, attendance tracking, leave management, and payroll processing. Everything you need in one place.",
    color: "from-pink-500 to-pink-600",
    toolPath: "/attendance",
    features: [
      "Digital attendance tracking",
      "Leave management",
      "Shift scheduling",
      "Payroll integration",
      "Employee self-service",
      "Performance tracking"
    ],
    benefits: [
      "Save 10+ hours per week",
      "Eliminate time theft",
      "Accurate payroll",
      "Employee satisfaction"
    ]
  },
  helpdesk: {
    icon: Ticket,
    title: "HelpDesk",
    slug: "helpdesk",
    tagline: "Deliver Exceptional Customer Support",
    description: "Organize and resolve customer issues efficiently with our ticketing system. Track, prioritize, and manage support requests from a unified dashboard.",
    color: "from-cyan-500 to-cyan-600",
    toolPath: "/helpdesk",
    features: [
      "Multi-channel support",
      "Ticket prioritization",
      "SLA management",
      "Knowledge base",
      "Team collaboration",
      "Customer satisfaction tracking"
    ],
    benefits: [
      "Reduce response time by 60%",
      "Improve customer satisfaction",
      "Track team performance",
      "Automated routing"
    ]
  },
  assets: {
    icon: Briefcase,
    title: "Asset Management",
    slug: "assets",
    tagline: "Track and Manage Your Business Assets",
    description: "Complete asset lifecycle management with depreciation calculations, maintenance tracking, and asset allocation. Know where your assets are at all times.",
    color: "from-green-500 to-green-600",
    toolPath: "/assets",
    features: [
      "Asset tracking and tagging",
      "Depreciation calculations",
      "Maintenance scheduling",
      "Asset allocation",
      "Audit trails",
      "Custom fields"
    ],
    benefits: [
      "Prevent asset loss",
      "Optimize utilization",
      "Accurate valuations",
      "Compliance ready"
    ]
  },
  "shop-income-expense": {
    icon: ShoppingCart,
    title: "Shop Management",
    slug: "shop-income-expense",
    tagline: "Complete Shop Operations Management",
    description: "Track income, expenses, and profitability for your retail operations. Get real-time insights into your shop's financial performance.",
    color: "from-indigo-500 to-indigo-600",
    toolPath: "/shop-income-expense",
    features: [
      "Income tracking",
      "Expense management",
      "Profit/loss reports",
      "Category management",
      "Receipt scanning",
      "Multi-location support"
    ],
    benefits: [
      "Real-time profitability",
      "Expense control",
      "Financial insights",
      "Tax preparation"
    ]
  },
  subscriptions: {
    icon: CreditCard,
    title: "Subscriptions",
    slug: "subscriptions",
    tagline: "Manage Recurring Revenue Effortlessly",
    description: "Streamline your subscription billing and management. Automate recurring payments, track subscriber metrics, and reduce churn with intelligent retention tools.",
    color: "from-orange-500 to-orange-600",
    toolPath: "/subscriptions",
    features: [
      "Automated billing cycles",
      "Flexible pricing plans",
      "Payment retry logic",
      "Subscriber analytics",
      "Dunning management",
      "Usage-based billing"
    ],
    benefits: [
      "Reduce churn by 35%",
      "Automate billing workflows",
      "Increase MRR visibility",
      "Improve customer retention"
    ]
  }
};

const AppDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const app = slug ? appDetails[slug as keyof typeof appDetails] : null;

  // Redirect logged-in users directly to the tool
  useEffect(() => {
    if (user && app?.toolPath) {
      navigate(app.toolPath, { replace: true });
    }
  }, [user, app, navigate]);

  if (!app) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold mb-4">App Not Found</h1>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const Icon = app.icon;

  const handleStartNow = () => {
    if (user) {
      navigate(app.toolPath);
    } else {
      navigate("/login", { state: { redirectTo: app.toolPath } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-background via-accent/5 to-background relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-12">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center mx-auto mb-6 shadow-2xl animate-scale-in`}>
                <Icon className="h-10 w-10 text-white" />
              </div>
              <Badge variant="secondary" className="mb-4">
                {app.title}
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in">
                {app.tagline}
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                {app.description}
              </p>
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 animate-fade-in" 
                style={{ animationDelay: "0.2s" }}
                onClick={handleStartNow}
              >
                Start Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features & Benefits Grid */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Features */}
              <Card className="border-border">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 text-foreground">
                    Key Features
                  </h2>
                  <ul className="space-y-4">
                    {app.features.map((feature, index) => (
                      <li 
                        key={index} 
                        className="flex items-start gap-3 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${app.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card className="border-border bg-gradient-to-br from-accent/5 to-background">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 text-foreground">
                    Key Benefits
                  </h2>
                  <ul className="space-y-4">
                    {app.benefits.map((benefit, index) => (
                      <li 
                        key={index} 
                        className="flex items-start gap-3 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground font-medium">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using AppMaster to streamline their operations
            </p>
            <Button 
              size="lg" 
              className="text-lg px-10 py-6"
              onClick={handleStartNow}
            >
              {user ? "Go to App" : "Start Free Trial"} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AppDetailPage;