import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemSettings {
  timezone: string;
  appName: string;
  supportEmail: string;
  maintenanceMode: boolean;
}

interface SystemSettingsContextType {
  settings: SystemSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export function SystemSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>({
    timezone: 'UTC',
    appName: 'AppMaster',
    supportEmail: 'support@appmaster.com',
    maintenanceMode: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value');

      if (error) throw error;

      if (data) {
        const settingsMap = data.reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {} as Record<string, string>);

        setSettings({
          timezone: settingsMap.timezone || 'UTC',
          appName: settingsMap.app_name || 'AppMaster',
          supportEmail: settingsMap.support_email || 'support@appmaster.com',
          maintenanceMode: settingsMap.maintenance_mode === 'true',
        });
      }
    } catch (error) {
      console.error('Error loading system settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();

    // Subscribe to changes in system_settings
    const channel = supabase
      .channel('system_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings'
        },
        () => {
          loadSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <SystemSettingsContext.Provider value={{ settings, isLoading, refreshSettings: loadSettings }}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  const context = useContext(SystemSettingsContext);
  if (context === undefined) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
}
