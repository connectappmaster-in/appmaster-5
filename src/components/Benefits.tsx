import { Shield, Zap, Users, Lock, Headphones, TrendingUp, Cloud, Smartphone } from "lucide-react";

const Benefits = () => {
  const benefits = [
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with regular backups. Your data is always safe and protected.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance ensures smooth operations even with large datasets.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Built for teams of all sizes. Collaborate seamlessly across departments.",
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "We never share your data. What's yours stays yours—guaranteed.",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Our dedicated support team is always available to help you succeed.",
    },
    {
      icon: TrendingUp,
      title: "Scalable Platform",
      description: "Start small, grow big. Our platform scales with your business needs.",
    },
    {
      icon: Cloud,
      title: "Cloud-Based",
      description: "Access your business from anywhere, anytime. No installation required.",
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Fully responsive design. Manage your business on any device.",
    },
  ];

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Why Businesses Choose AppMaster
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Built with your success in mind, backed by cutting-edge technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-4 bg-card/80 backdrop-blur-sm rounded-xl border border-border hover:border-primary/30 hover:shadow-xl transition-all"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 w-fit mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all">
                <benefit.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
