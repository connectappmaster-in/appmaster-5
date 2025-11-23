import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
const ProductShowcase = () => {
  return <section className="py-12 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Zoho One Section */}
          

          {/* Testimonial */}
          <div className="mt-8 p-6 bg-card rounded-xl border border-border shadow-sm">
            <blockquote className="text-center">
              <p className="text-base text-muted-foreground italic mb-3">
                "You can be a startup, mid-sized company, or an enterprise—AppMaster One is a boon for all."
              </p>
              <footer className="text-sm text-muted-foreground">
                — Happy Customer
              </footer>
            </blockquote>
          </div>

          {/* Stats Grid */}
          
        </div>
      </div>
    </section>;
};
export default ProductShowcase;