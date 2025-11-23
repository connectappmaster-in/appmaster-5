import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Settings, User, Shield, ArrowLeft } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logo from "@/assets/appmaster-logo.png";
import { useState, useEffect } from "react";
import { NotificationPanel } from "@/components/NotificationPanel";
const Navbar = () => {
  const {
    user,
    signOut,
    userType,
    appmasterRole
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === "/";
  const isProfilePage = location.pathname.startsWith("/profile");
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-[var(--transition-base)] ${isScrolled ? "bg-background/95 backdrop-blur-lg shadow-sm border-b" : "bg-transparent"}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 items-center justify-between flex flex-row">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className={isLandingPage ? "invisible" : "opacity-0 hover:opacity-100 transition-opacity duration-[var(--transition-base)]"}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <nav className="flex items-center gap-1">
          {user ? <>
              {!isLandingPage && <Link to="/dashboard">
                  
                </Link>}
              {!isProfilePage && <NotificationPanel />}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {!isProfilePage && <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>}
                  {(userType === 'appmaster_admin' || appmasterRole) && <DropdownMenuItem asChild>
                      <Link to="/super-admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>}
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </> : <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/login">
                <Button size="sm">Get Started</Button>
              </Link>
            </>}
        </nav>
      </div>
    </nav>;
};
export default Navbar;