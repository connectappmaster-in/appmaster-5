import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { useNavigate } from "react-router-dom";
import { ServiceCatalogCard } from "./components/ServiceCatalogCard";
import { ServiceCatalogFilters } from "./components/ServiceCatalogFilters";

export default function ServiceCatalog() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: catalogItems, isLoading } = useQuery({
    queryKey: ["srm-catalog", categoryFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("srm_catalog")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["srm-catalog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srm_catalog")
        .select("category")
        .eq("is_active", true);

      if (error) throw error;
      const uniqueCategories = [...new Set(data.map((item) => item.category))];
      return uniqueCategories;
    },
  });

  const groupedItems = catalogItems?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof catalogItems>);

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto py-4 px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Service Catalog</h1>
            <p className="text-muted-foreground">Browse available services and submit requests</p>
          </div>
          <Button onClick={() => navigate("/helpdesk/service-requests/my-requests")}>
            My Requests
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <ServiceCatalogFilters
            categories={categories || []}
            selectedCategory={categoryFilter}
            onCategoryChange={setCategoryFilter}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !catalogItems || catalogItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No services found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedItems || {}).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4 capitalize">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <ServiceCatalogCard
                      key={item.id}
                      item={item}
                      onRequest={() => navigate(`/helpdesk/service-requests/request-form?id=${item.id}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
