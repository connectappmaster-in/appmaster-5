import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  accountType: 'personal' | 'organization' | null;
  userRole: string | null;
  userType: 'individual' | 'organization' | 'appmaster_admin' | null;
  appmasterRole: string | null;
  orgRole: 'super_admin' | 'org_admin' | 'org_user' | 'individual_user' | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState<'personal' | 'organization' | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userType, setUserType] = useState<'individual' | 'organization' | 'appmaster_admin' | null>(null);
  const [appmasterRole, setAppmasterRole] = useState<string | null>(null);
  const [orgRole, setOrgRole] = useState<'super_admin' | 'org_admin' | 'org_user' | 'individual_user' | null>(null);
  const navigate = useNavigate();

  const fetchUserMetadata = async (userId: string) => {
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id, role, user_type")
        .eq("auth_user_id", userId)
        .single();

      if (userData) {
        setUserType(userData.user_type || null);
        
        // Fetch org-level role from user_org_map
        if (userData?.organisation_id) {
          const { data: orgMapData } = await supabase
            .from("user_org_map")
            .select("role")
            .eq("user_id", userId)
            .eq("organisation_id", userData.organisation_id)
            .single();
          
          setOrgRole((orgMapData?.role as 'super_admin' | 'org_admin' | 'org_user' | 'individual_user') || null);
        }
        
        // Check if appmaster admin
        if (userData.user_type === 'appmaster_admin') {
          const { data: adminData } = await supabase
            .from("appmaster_admins")
            .select("admin_role")
            .eq("user_id", userId)
            .single();
          
          setAppmasterRole(adminData?.admin_role || null);
        }

        if (userData?.organisation_id) {
          const { data: orgData } = await supabase
            .from("organisations")
            .select("account_type")
            .eq("id", userData.organisation_id)
            .single();

          const accType = orgData?.account_type as 'personal' | 'organization' | null;
          setAccountType(accType);
          setUserRole(userData.role);
        }
      }
    } catch (error) {
      console.error("Error fetching user metadata:", error);
    }
  };

  useEffect(() => {
    // Get initial session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserMetadata(session.user.id);
      }
      
      setLoading(false);
    });

    // Then set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event);
        
        // Only update state for specific events to prevent unnecessary resets
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            setTimeout(() => {
              fetchUserMetadata(session.user.id);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setAccountType(null);
          setUserRole(null);
          setUserType(null);
          setAppmasterRole(null);
          setOrgRole(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
      // Clear local storage even if server call fails
      localStorage.clear();
      // Clear state immediately
      setUser(null);
      setSession(null);
      setAccountType(null);
      setUserRole(null);
      setUserType(null);
      setAppmasterRole(null);
      setOrgRole(null);
    } finally {
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, accountType, userRole, userType, appmasterRole, orgRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
