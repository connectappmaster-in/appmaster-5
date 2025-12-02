import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAssetSetupConfig = () => {
  const { data: sites = [], isLoading: sitesLoading } = useQuery({
    queryKey: ["itam-sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itam_sites")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ["itam-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itam_locations")
        .select("*, itam_sites(name)")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["itam-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itam_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ["itam-departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itam_departments")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: makes = [], isLoading: makesLoading } = useQuery({
    queryKey: ["itam-makes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itam_makes")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: tagFormat } = useQuery({
    queryKey: ["itam-tag-format"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itam_tag_format")
        .select("*")
        .maybeSingle();
      
      if (error) throw error;
      return data || { prefix: "AST-", start_number: "0001", auto_increment: true, padding_length: 6 };
    },
  });

  return {
    sites,
    locations,
    categories,
    departments,
    makes,
    tagFormat,
    isLoading: sitesLoading || locationsLoading || categoriesLoading || departmentsLoading || makesLoading,
  };
};
