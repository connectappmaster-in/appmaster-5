import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ProfileSidebar } from "@/components/Profile/ProfileSidebar";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Edit, Save, X } from "lucide-react";

const PersonalInfo = () => {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!isEditing && userData) {
      setFormData({
        name: userData.name || "",
        phone: userData.phone || "",
      });
    }
  }, [userData, isEditing]);

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      const { data: updated, error } = await supabase
        .from("users")
        .update({ name: data.name, phone: data.phone })
        .eq("auth_user_id", user?.id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", user?.id] });
      toast({ title: "Profile updated", description: "Your changes have been saved." });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getInitials = () => {
    if (!formData.name) return "U";
    return formData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex pt-14">
          <ProfileSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      <Navbar />
      <div className="flex pt-14 h-full overflow-hidden">
        <ProfileSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-3 space-y-3">
          <div>
            <h1 className="text-xl font-normal">Personal info</h1>
          </div>

          {/* Profile Picture Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4 pb-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">Change photo</Button>
            </CardContent>
          </Card>

          {/* Basic Info Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Basic info</CardTitle>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              <div className="grid gap-3 max-w-xs">
                <div className="space-y-1.5">
                  <Label className="text-sm">Name</Label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      className="h-9"
                    />
                  ) : (
                    <p className="text-sm py-1.5 px-3 bg-muted/20 rounded-md">
                      {formData.name || "-"}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Email</Label>
                  <p className="text-sm py-1.5 px-3 bg-muted/20 rounded-md">
                    {userData?.email || user?.email}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Phone</Label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone"
                      className="h-9"
                    />
                  ) : (
                    <p className="text-sm py-1.5 px-3 bg-muted/20 rounded-md">
                      {formData.phone || "-"}
                    </p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      if (userData) {
                        setFormData({
                          name: userData.name || "",
                          phone: userData.phone || "",
                        });
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateMutation.mutate(formData)}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      </div>
    </div>
  );
};

export default PersonalInfo;
