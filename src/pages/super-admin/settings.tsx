import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Shield, Mail, Bell, Settings as SettingsIcon, Database, Clock, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SuperAdminSettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    appName: "AppMaster",
    supportEmail: "support@appmaster.com",
    timezone: "UTC",
    maintenanceMode: false,
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    minPasswordLength: 8,
    requireSpecialChar: true,
    require2FA: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
  });

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpSecure: true,
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    systemAlerts: true,
    userActivityAlerts: false,
    securityAlerts: true,
  });

  // Load settings from database
  useEffect(() => {
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

          setSystemSettings({
            appName: settingsMap.app_name || "AppMaster",
            supportEmail: settingsMap.support_email || "support@appmaster.com",
            timezone: settingsMap.timezone || "UTC",
            maintenanceMode: settingsMap.maintenance_mode === 'true',
          });

          setSecuritySettings({
            minPasswordLength: parseInt(settingsMap.min_password_length || '8'),
            requireSpecialChar: settingsMap.require_special_char === 'true',
            require2FA: settingsMap.require_2fa === 'true',
            sessionTimeout: parseInt(settingsMap.session_timeout || '30'),
            maxLoginAttempts: parseInt(settingsMap.max_login_attempts || '5'),
          });

          setNotificationSettings({
            emailNotifications: settingsMap.email_notifications === 'true',
            systemAlerts: settingsMap.system_alerts === 'true',
            userActivityAlerts: settingsMap.user_activity_alerts === 'true',
            securityAlerts: settingsMap.security_alerts === 'true',
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Prepare all settings to update
      const updates = [
        { key: 'app_name', value: systemSettings.appName },
        { key: 'support_email', value: systemSettings.supportEmail },
        { key: 'timezone', value: systemSettings.timezone },
        { key: 'maintenance_mode', value: systemSettings.maintenanceMode.toString() },
        { key: 'min_password_length', value: securitySettings.minPasswordLength.toString() },
        { key: 'require_special_char', value: securitySettings.requireSpecialChar.toString() },
        { key: 'require_2fa', value: securitySettings.require2FA.toString() },
        { key: 'session_timeout', value: securitySettings.sessionTimeout.toString() },
        { key: 'max_login_attempts', value: securitySettings.maxLoginAttempts.toString() },
        { key: 'email_notifications', value: notificationSettings.emailNotifications.toString() },
        { key: 'system_alerts', value: notificationSettings.systemAlerts.toString() },
        { key: 'user_activity_alerts', value: notificationSettings.userActivityAlerts.toString() },
        { key: 'security_alerts', value: notificationSettings.securityAlerts.toString() },
      ];

      // Update each setting
      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .update({ value: update.value })
          .eq('key', update.key);

        if (error) throw error;
      }

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">System Settings</h2>
        <p className="text-sm text-muted-foreground">Configure global system settings</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading settings...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <SettingsIcon className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Configuration</CardTitle>
              <CardDescription>Manage basic system settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appName">Application Name</Label>
                <Input
                  id="appName"
                  value={systemSettings.appName}
                  onChange={(e) => setSystemSettings({ ...systemSettings, appName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={systemSettings.supportEmail}
                  onChange={(e) => setSystemSettings({ ...systemSettings, supportEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Select
                  value={systemSettings.timezone}
                  onValueChange={(value) => setSystemSettings({ ...systemSettings, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                    <SelectItem value="America/New_York">UTC-05:00 Eastern Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Chicago">UTC-06:00 Central Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Los_Angeles">UTC-08:00 Pacific Time (US & Canada)</SelectItem>
                    <SelectItem value="Europe/London">UTC±00:00 London (GMT)</SelectItem>
                    <SelectItem value="Europe/Athens">UTC+02:00 Central Europe</SelectItem>
                    <SelectItem value="Asia/Kolkata">UTC+05:30 IST (India Standard Time)</SelectItem>
                    <SelectItem value="Asia/Tokyo">UTC+09:00 Tokyo (Japan Standard Time)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to prevent user access
                  </p>
                </div>
                <Switch
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSystemSettings({ ...systemSettings, maintenanceMode: checked })
                  }
                />
              </div>

              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security & Compliance</CardTitle>
              <CardDescription>Configure security policies and authentication requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minPasswordLength">Minimum Password Length</Label>
                <Input
                  id="minPasswordLength"
                  type="number"
                  min="6"
                  max="32"
                  value={securitySettings.minPasswordLength}
                  onChange={(e) =>
                    setSecuritySettings({ ...securitySettings, minPasswordLength: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="5"
                  max="480"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) =>
                    setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  min="3"
                  max="10"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) =>
                    setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Special Characters</Label>
                  <p className="text-sm text-muted-foreground">
                    Passwords must contain special characters
                  </p>
                </div>
                <Switch
                  checked={securitySettings.requireSpecialChar}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, requireSpecialChar: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Force all users to enable 2FA
                  </p>
                </div>
                <Switch
                  checked={securitySettings.require2FA}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, require2FA: checked })
                  }
                />
              </div>

              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for system emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  placeholder="smtp.example.com"
                  value={emailSettings.smtpHost}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={emailSettings.smtpPort}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  value={emailSettings.smtpUser}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Use Secure Connection (TLS)</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable TLS encryption for email
                  </p>
                </div>
                <Switch
                  checked={emailSettings.smtpSecure}
                  onCheckedChange={(checked) =>
                    setEmailSettings({ ...emailSettings, smtpSecure: checked })
                  }
                />
              </div>

              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure system-wide notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications via email
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for system events
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.systemAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, systemAlerts: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Activity Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about user activities
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.userActivityAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, userActivityAlerts: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive critical security alerts
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.securityAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, securityAlerts: checked })
                  }
                />
              </div>

              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
};

export default SuperAdminSettings;
