import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Clock, Shield, Palette, Users } from "lucide-react";
import { OrgUsersManager } from "@/components/OrgAdmin/OrgUsersManager";

export default function SettingsModule() {
  return (
    <div className="w-full h-full space-y-4">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sla">SLA</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>User Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <OrgUsersManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle>Organization Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" placeholder="Your Company" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" placeholder="UTC" />
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label htmlFor="working-hours">Working Hours</Label>
                <div className="flex gap-2 items-center">
                  <Input placeholder="09:00" className="flex-1" />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input placeholder="17:00" className="flex-1" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label>Ticket Created</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a new ticket is created
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label>Ticket Assigned</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a ticket is assigned to you
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <CardTitle>Email Configuration</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input id="smtp-host" placeholder="smtp.gmail.com" />
              </div>
              <Button>Test Connection</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <CardTitle>SLA Policies</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Button>
                <Clock className="h-4 w-4 mr-2" />
                Add New SLA Policy
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Security Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between py-2">
                <Label>Two-Factor Authentication</Label>
                <Switch />
              </div>
              <Button>Update Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <CardTitle>Appearance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Button>Save Appearance</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
