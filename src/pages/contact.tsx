import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MessageSquare, ArrowLeft } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
const Contact = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
        });

      if (error) throw error;

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible."
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: ""
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        
        <div className="max-w-4xl mx-auto mt-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Contact Us for Custom Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Need a custom tool tailored to your business needs? Get in touch with us and we'll help you build the perfect solution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Send us a message
                </CardTitle>
                <CardDescription>
                  Fill out the form and we'll respond within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea id="message" name="message" placeholder="Tell us about your custom tool requirements..." value={formData.message} onChange={handleChange} rows={5} required />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info Cards */}
            <div className="space-y-6">
              <Card className="shadow-lg border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="w-5 h-5 text-primary" />
                    Email Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">
                    For general inquiries and custom tool requests
                  </p>
                  <a href="mailto:support@appmaster.com" className="text-primary hover:underline font-medium">connect.appmaster@gmail.com</a>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Phone className="w-5 h-5 text-primary" />
                    Call Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">
                    Mon-Sun from 9am to 6pm IST
                  </p>
                  <a href="tel:+911234567890" className="text-primary hover:underline font-medium">+91 8425062561</a>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Why Custom Tools?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    ✓ Tailored to your specific workflow
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ✓ Seamless integration with existing systems
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ✓ Dedicated support and maintenance
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ✓ Scalable as your business grows
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Contact;