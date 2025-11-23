import { Home, User, Shield, CreditCard } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/useRole";

const navigationItems = [
  { title: "Home", icon: Home, path: "/profile" },
  { title: "Personal info", icon: User, path: "/profile/personal-info" },
  { title: "Security", icon: Shield, path: "/profile/security" },
  { title: "Payments", icon: CreditCard, path: "/profile/payments", adminOnly: true },
];

export const ProfileSidebar = () => {
  const { isAdmin, accountType } = useRole();
  
  // Filter navigation items - hide admin-only items for non-admins in organization accounts
  const visibleItems = navigationItems.filter(item => {
    if (!item.adminOnly) return true;
    if (accountType === 'personal') return true; // Personal accounts see all
    return isAdmin(); // Only admins in organizations see payments
  });

  return (
    <aside className="bg-background min-h-screen" style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
      <nav className="space-y-1 px-3 py-4">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/profile"}
            className={cn(
              "flex items-center h-9 rounded-md px-3 text-sm font-medium transition-all duration-[var(--transition-fast)]",
              "hover:bg-accent hover:text-accent-foreground"
            )}
            activeClassName="bg-primary/10 text-primary border-l-2 border-primary"
          >
            <item.icon className="h-4 w-4 mr-3" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};