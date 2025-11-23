import { useState, useEffect } from "react";
import { X, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Broadcast {
  id: string;
  title: string;
  description: string;
  target_audience: string;
}

export function BroadcastBanner() {
  const { user, accountType, userRole, userType } = useAuth();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [bannerHeight, setBannerHeight] = useState(0);
  
  const isSuperAdmin = userType === 'appmaster_admin';

  useEffect(() => {
    if (!user) return;

    fetchBroadcasts();

    // Set up real-time subscription
    const channel = supabase
      .channel('broadcasts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'broadcasts'
        },
        () => {
          fetchBroadcasts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, accountType, userRole]);

  const fetchBroadcasts = async () => {
    if (!user) return;

    // Fetch active broadcasts
    const { data: broadcastData, error: broadcastError } = await supabase
      .from('broadcasts')
      .select('*')
      .eq('is_active', true)
      .or(`scheduled_for.is.null,scheduled_for.lte.${new Date().toISOString()}`)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    if (broadcastError) {
      console.error('Error fetching broadcasts:', broadcastError);
      return;
    }

    // Fetch user's dismissals
    const { data: dismissalData } = await supabase
      .from('broadcast_dismissals')
      .select('broadcast_id')
      .eq('user_id', user.id);

    const dismissed = new Set(dismissalData?.map(d => d.broadcast_id) || []);
    setDismissedIds(dismissed);

    // Filter broadcasts based on user type and role
    const filtered = (broadcastData || []).filter(broadcast => {
      if (broadcast.target_audience === 'all_users') return true;
      
      if (accountType === 'personal' && broadcast.target_audience === 'individual_users') {
        return true;
      }
      
      if (accountType === 'organization') {
        if (broadcast.target_audience === 'organization_users') return true;
        if (broadcast.target_audience === 'organization_admins' && 
            (userRole === 'admin' || userRole === 'owner')) {
          return true;
        }
      }
      
      return false;
    });

    setBroadcasts(filtered);
  };

  const dismissBroadcast = async (broadcastId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('broadcast_dismissals')
      .insert({
        broadcast_id: broadcastId,
        user_id: user.id
      });

    if (error) {
      console.error('Error dismissing broadcast:', error);
      return;
    }

    setDismissedIds(prev => new Set([...prev, broadcastId]));
  };

  const visibleBroadcasts = broadcasts.filter(b => !dismissedIds.has(b.id));

  if (!user || visibleBroadcasts.length === 0) return null;

  // Different styling for super-admin broadcasts
  if (isSuperAdmin) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800">
          <div className="container mx-auto px-4 space-y-2 py-2">
            {visibleBroadcasts.map((broadcast) => (
              <div
                key={broadcast.id}
                className="bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-500 px-4 py-3 flex items-start gap-3 rounded-md animate-in slide-in-from-top duration-300"
              >
                <Megaphone className="h-5 w-5 text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1 truncate">
                    {broadcast.title}
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-normal break-words">
                    {broadcast.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0 hover:bg-blue-200 dark:hover:bg-blue-800"
                  onClick={() => dismissBroadcast(broadcast.id)}
                >
                  <X className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        {/* Spacer to prevent content from being hidden behind fixed banner */}
        <div style={{ height: `${(visibleBroadcasts.length * 80) + 16}px` }} />
      </>
    );
  }

  // Regular user broadcasts (yellow theme, below navbar)
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 bg-yellow-50 dark:bg-yellow-950/30 border-b border-yellow-200 dark:border-yellow-800">
        <div className="container mx-auto px-4 space-y-2 py-2">
          {visibleBroadcasts.map((broadcast) => (
            <div
              key={broadcast.id}
              className="bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 px-4 py-3 flex items-start gap-3 rounded-md animate-in slide-in-from-top duration-300"
            >
              <Megaphone className="h-5 w-5 text-yellow-700 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1 truncate">
                  {broadcast.title}
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 whitespace-normal break-words">
                  {broadcast.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0 hover:bg-yellow-200 dark:hover:bg-yellow-800"
                onClick={() => dismissBroadcast(broadcast.id)}
              >
                <X className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      {/* Spacer to prevent content from being hidden behind fixed banner */}
      <div style={{ height: `${(visibleBroadcasts.length * 80) + 16}px` }} />
    </>
  );
}
