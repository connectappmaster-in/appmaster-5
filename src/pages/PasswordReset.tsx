import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/BackButton";
import logo from "@/assets/appmaster-logo.png";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('forgot-password', {
        body: { email }
      });

      if (error) {
        throw new Error("System error occurred. Please try again later.");
      }

      setSent(true);
      toast({
        title: "Success",
        description: data.message || "If an account with this email exists, we've sent a password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "System error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BackButton />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/10 to-background p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <img src={logo} alt="AppMaster" className="h-14 w-auto" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to receive a password reset link
            </p>
          </div>

          {sent ? (
            <div className="space-y-4">
              <div className="p-4 bg-accent/20 rounded-md text-center">
                <p className="text-sm">
                  Check your email for a password reset link.
                  <br />
                  If you don't see it, check your spam folder.
                </p>
              </div>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </>
  );
};

export default PasswordReset;
