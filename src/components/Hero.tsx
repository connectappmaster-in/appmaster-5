import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CreditCard, FileText, Users, Ticket, Briefcase, MessageSquare } from "lucide-react";
const Hero = () => {
  const featuredApps = [{
    icon: Briefcase,
    name: "Assets",
    description: "Track business assets and calculate depreciation",
    color: "text-green-600",
    path: "/apps/assets"
  }, {
    icon: Users,
    name: "Attendance",
    description: "Employee management and attendance tracking system",
    color: "text-pink-600",
    path: "/apps/attendance"
  }, {
    icon: BarChart3,
    name: "CRM",
    description: "Manage leads, contacts, and deals in one unified platform",
    color: "text-blue-600",
    path: "/apps/crm"
  }, {
    icon: FileText,
    name: "Invoicing",
    description: "Create and manage professional invoices with ease",
    color: "text-purple-600",
    path: "/apps/invoicing"
  }, {
    icon: Ticket,
    name: "HelpDesk",
    description: "Streamline customer support with ticket management",
    color: "text-cyan-600",
    path: "/apps/helpdesk"
  }, {
    icon: CreditCard,
    name: "Subscriptions",
    description: "Manage recurring subscriptions and billing efficiently",
    color: "text-orange-600",
    path: "/apps/subscriptions"
  }];
  return <section className="relative pt-12 pb-8 px-4 bg-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: "1s"
      }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="space-y-6">
          {/* Main Hero Content */}
          <div className="space-y-4 animate-fade-in text-center max-w-4xl mx-auto">
            <div className="space-y-3 mx-0 py-0 px-0 my-0">
              <div className="inline-block animate-fade-in">
                
              </div>
              <h1 className="text-4xl font-bold text-foreground leading-tight lg:text-5xl font-display">
                Simplify Operations,{" "}
                <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Amplify Growth
                </span>
              </h1>
              
              <div className="flex flex-wrap gap-3 pt-2 justify-center">
                <Link to="/login">
                  <Button size="lg" className="shadow-lg hover:shadow-xl transition-all group">Get for Free<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  
                </Link>
              </div>
            </div>
          </div>

          {/* Featured Apps Grid */}
          <div className="animate-fade-in" style={{
          animationDelay: "0.2s"
        }}>
            <h3 className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Explore Our Apps
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
              {featuredApps.map((app, index) => <Link key={index} to={app.path} className="block h-full">
                  <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:border-primary/50 hover:scale-105 h-full">
                    <div className={`p-3 rounded-lg bg-background border border-border ${app.color} group-hover:scale-110 transition-transform duration-300 w-fit mb-3`}>
                      <app.icon className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm mb-2">
                      {app.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {app.description}
                    </p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </Link>)}
            </div>
          </div>

          {/* Contact CTA Section */}
          <div className="animate-fade-in mt-8" style={{
          animationDelay: "0.4s"
        }}>
            <Link to="/contact" className="block max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm border border-primary/20 rounded-lg p-6 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:border-primary/50">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-lg bg-background border border-border text-primary group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                      Need a Custom Tool?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Let's build something specific for your business needs
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;