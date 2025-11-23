import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import loginBackground from "@/assets/login-background.jpg";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [accountType, setAccountType] = useState<'personal' | 'organization'>('personal');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const redirectTo = (location.state as any)?.redirectTo || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle email not confirmed error specifically
        if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email Not Confirmed",
            description: "Please check your email and click the confirmation link to activate your account.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            organisation_name: accountType === 'organization' ? orgName : name,
            account_type: accountType,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account created! Please check your email to verify.",
      });

      if (data.user) {
        navigate(redirectTo);
      } else {
        setIsSignup(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {!isSignup ? (
        /* Login Form */
        <div className="w-full max-w-md relative z-10">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-white text-center mb-6">Login</h1>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-white text-sm mb-2">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder=""
                  className="w-full bg-transparent border-0 border-b-2 border-white/50 text-white placeholder:text-white/50 focus:border-white focus:outline-none px-0 py-2 transition-colors"
                />
              </div>
              
              <div>
                <label htmlFor="login-password" className="block text-white text-sm mb-2">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder=""
                  className="w-full bg-transparent border-0 border-b-2 border-white/50 text-white placeholder:text-white/50 focus:border-white focus:outline-none px-0 py-2 transition-colors"
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-white cursor-pointer">
                  <input type="checkbox" className="mr-2 rounded border-white/50" />
                  Remember Me
                </label>
                <Link to="/password-reset" className="text-white hover:underline">
                  Forget Password
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-white text-purple-900 hover:bg-white/90 rounded-full py-6 font-semibold text-base shadow-lg transition-all duration-200" 
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log in"}
              </Button>
              
              <p className="text-center text-white text-sm">
                Don't have a account{" "}
                <button
                  type="button"
                  onClick={() => setIsSignup(true)}
                  className="font-semibold hover:underline"
                >
                  Register
                </button>
              </p>
            </form>
          </div>
        </div>
      ) : (
        /* Sign Up Form */
        <div className="w-full max-w-md relative z-10">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-2xl font-bold text-white">Create Account</h1>
              <button
                type="button"
                onClick={() => setIsSignup(false)}
                className="text-white/80 hover:text-white text-sm transition-colors"
              >
                Back to Login
              </button>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Account Type Toggle */}
              <div>
                <Label className="text-white text-sm mb-2 block">Account Type</Label>
                <ToggleGroup 
                  type="single" 
                  value={accountType}
                  onValueChange={(value) => value && setAccountType(value as 'personal' | 'organization')}
                  className="justify-start bg-white/10 rounded-lg p-1"
                >
                  <ToggleGroupItem value="personal" className="flex-1 data-[state=on]:bg-white data-[state=on]:text-purple-900 text-white">
                    Individual
                  </ToggleGroupItem>
                  <ToggleGroupItem value="organization" className="flex-1 data-[state=on]:bg-white data-[state=on]:text-purple-900 text-white">
                    Organization
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div>
                <label htmlFor="signup-name" className="block text-white text-sm mb-2">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full bg-transparent border-0 border-b-2 border-white/50 text-white placeholder:text-white/50 focus:border-white focus:outline-none px-0 py-2 transition-colors"
                />
              </div>

              {accountType === 'organization' && (
                <div className="animate-fade-in">
                  <label htmlFor="signup-org" className="block text-white text-sm mb-2">Organisation Name</label>
                  <input
                    id="signup-org"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    placeholder="Acme Corp"
                    className="w-full bg-transparent border-0 border-b-2 border-white/50 text-white placeholder:text-white/50 focus:border-white focus:outline-none px-0 py-2 transition-colors"
                  />
                </div>
              )}

              <div>
                <label htmlFor="signup-email" className="block text-white text-sm mb-2">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className="w-full bg-transparent border-0 border-b-2 border-white/50 text-white placeholder:text-white/50 focus:border-white focus:outline-none px-0 py-2 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-white text-sm mb-2">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-transparent border-0 border-b-2 border-white/50 text-white placeholder:text-white/50 focus:border-white focus:outline-none px-0 py-2 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-white text-sm mb-2">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-transparent border-0 border-b-2 border-white/50 text-white placeholder:text-white/50 focus:border-white focus:outline-none px-0 py-2 transition-colors"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-white text-purple-900 hover:bg-white/90 rounded-full py-6 font-semibold text-base shadow-lg transition-all duration-200 mt-4" 
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
