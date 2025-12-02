import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LogIn, ArrowLeft } from "lucide-react";
const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [loginStep, setLoginStep] = useState<'email' | 'password'>('email');
  const [signupStep, setSignupStep] = useState<1 | 2 | 3 | 4>(1);
  const [accountType, setAccountType] = useState<'personal' | 'organization'>('personal');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Check if email exists using edge function (admin API)
  const checkEmailExists = async (emailToCheck: string) => {
    const {
      data,
      error
    } = await supabase.functions.invoke("check-user-exists", {
      body: {
        email: emailToCheck
      }
    });
    if (error) {
      console.error("Failed to check email existence", error);
      throw error;
    }
    return Boolean((data as any)?.exists);
  };
  const handleEmailNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const exists = await checkEmailExists(email);
      if (exists) {
        setLoginStep('password');
      } else {
        toast({
          title: "Account not found",
          description: "No account exists with this email. Please sign up.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to verify email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        // Handle email not confirmed error specifically
        if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email Not Confirmed",
            description: "Please check your email and click the confirmation link to activate your account.",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }
      toast({
        title: "Success",
        description: "Logged in successfully!"
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSignupNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupStep === 1 && accountType) {
      setSignupStep(2);
    } else if (signupStep === 2 && name.trim()) {
      setSignupStep(3);
    } else if (signupStep === 3 && email.trim()) {
      setSignupStep(4);
    }
  };
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const {
        data,
        error
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            organisation_name: accountType === 'organization' ? orgName : name,
            account_type: accountType
          }
        }
      });
      if (error) throw error;
      toast({
        title: "Account created",
        description: "Please sign in with your credentials."
      });

      // Reset form and switch to login
      setIsSignup(false);
      setSignupStep(1);
      setPassword("");
      setLoginStep('email');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleBackToSignup = () => {
    setIsSignup(true);
    setLoginStep('email');
  };
  const handleBackInSignup = () => {
    if (signupStep > 1) {
      setSignupStep(signupStep - 1 as 1 | 2 | 3 | 4);
    } else {
      setIsSignup(false);
      setSignupStep(1);
    }
  };
  const handleBackInLogin = () => {
    setLoginStep('email');
    setPassword("");
  };
  return <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-card rounded-lg border border-border shadow-lg p-6">
          {/* Greeting */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {isSignup ? "Create your AppMaster account" : "Sign in to continue to AppMaster"}
            </h1>
          </div>

          {!isSignup ? (/* Login Form */
        <>
              {loginStep === 'email' ? <form onSubmit={handleEmailNext} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@company.com" autoFocus />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Checking..." : "Next"}
                  </Button>
                </form> : <form onSubmit={handleLogin} className="space-y-4">
                  
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" autoFocus />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Checkbox id="remember" checked={rememberMe} onCheckedChange={checked => setRememberMe(checked as boolean)} />
                      <label htmlFor="remember" className="text-foreground cursor-pointer">
                        Remember me
                      </label>
                    </div>
                    <Link to="/password-reset" className="text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign in
                      </>}
                  </Button>
                </form>}
            </>) : (/* Signup Form - Multi-step */
        <>
              {signupStep === 1 && <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <ToggleGroup type="single" value={accountType} className="justify-start">
                      <ToggleGroupItem 
                        value="personal" 
                        className="flex-1"
                        onClick={() => {
                          setAccountType('personal');
                          setSignupStep(2);
                        }}
                      >
                        Individual
                      </ToggleGroupItem>
                      <ToggleGroupItem 
                        value="organization" 
                        className="flex-1"
                        onClick={() => {
                          setAccountType('organization');
                          setSignupStep(2);
                        }}
                      >
                        Organization
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>}

              {signupStep === 2 && <form onSubmit={handleSignupNext} className="space-y-4">
                  

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Enter your full name" autoFocus />
                  </div>

                  {accountType === 'organization' && <div className="space-y-2 animate-fade-in">
                      <Label htmlFor="orgName">Organisation Name</Label>
                      <Input id="orgName" type="text" value={orgName} onChange={e => setOrgName(e.target.value)} required placeholder="Enter organization name" />
                    </div>}

                  <Button type="submit" className="w-full">
                    Next
                  </Button>
                </form>}

              {signupStep === 3 && <form onSubmit={handleSignupNext} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@company.com" autoFocus />
                  </div>

                  <Button type="submit" className="w-full">
                    Next
                  </Button>
                </form>}

              {signupStep === 4 && <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Minimum 6 characters" minLength={6} autoFocus />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>}
            </>)}

          {/* Toggle between Login/Signup */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button type="button" onClick={() => {
              setIsSignup(!isSignup);
              setLoginStep('email');
              setSignupStep(1);
              setPassword("");
            }} className="text-primary font-medium hover:underline">
                {isSignup ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default Login;