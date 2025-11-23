import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserTools = (userId?: string) => {
  const queryClient = useQueryClient();

  // Fetch all available tools
  const { data: allTools = [], isLoading: isLoadingTools } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      // Check if current user is Super Admin
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase.from("tools").select("*").order("name");
      
      // Only filter by active if user is not Super Admin
      if (user) {
        const { data: superAdminData } = await supabase
          .from('appmaster_admins')
          .select('is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        // If not Super Admin, only show active tools
        if (!superAdminData) {
          query = query.eq("active", true);
        }
      } else {
        // If no user, only show active tools
        query = query.eq("active", true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch user's assigned tools
  const { data: userTools = [], isLoading: isLoadingUserTools } = useQuery({
    queryKey: ["userTools", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("user_tools")
        .select(`
          *,
          tool:tools(*)
        `)
        .eq("user_id", userId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Assign tool to user
  const assignTool = useMutation({
    mutationFn: async ({ userId, toolId, assignedBy }: { userId: string; toolId: string; assignedBy: string }) => {
      const { error } = await supabase
        .from("user_tools")
        .insert({
          user_id: userId,
          tool_id: toolId,
          assigned_by: assignedBy,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTools", userId] });
      toast.success("Tool assigned successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to assign tool: " + error.message);
    },
  });

  // Unassign tool from user
  const unassignTool = useMutation({
    mutationFn: async ({ userId, toolId }: { userId: string; toolId: string }) => {
      const { error } = await supabase
        .from("user_tools")
        .delete()
        .eq("user_id", userId)
        .eq("tool_id", toolId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTools", userId] });
      toast.success("Tool unassigned successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to unassign tool: " + error.message);
    },
  });

  // Bulk assign tools
  const bulkAssignTools = useMutation({
    mutationFn: async ({ 
      userIds, 
      toolIds, 
      assignedBy 
    }: { 
      userIds: string[]; 
      toolIds: string[]; 
      assignedBy: string 
    }) => {
      const assignments = userIds.flatMap(userId =>
        toolIds.map(toolId => ({
          user_id: userId,
          tool_id: toolId,
          assigned_by: assignedBy,
        }))
      );

      const { error } = await supabase
        .from("user_tools")
        .insert(assignments);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTools"] });
      toast.success("Tools assigned successfully to selected users");
    },
    onError: (error: any) => {
      toast.error("Failed to bulk assign tools: " + error.message);
    },
  });

  return {
    allTools,
    userTools,
    isLoading: isLoadingTools || isLoadingUserTools,
    assignTool,
    unassignTool,
    bulkAssignTools,
  };
};
