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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserMetadata(session.user.id);
          }, 0);
        } else {
          setAccountType(null);
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserMetadata(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, accountType, userRole, userType, appmasterRole, signOut }}>
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
