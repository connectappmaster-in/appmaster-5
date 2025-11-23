import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ServiceCatalogFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function ServiceCatalogFilters({
  categories,
  selectedCategory,
  onCategoryChange,
}: ServiceCatalogFiltersProps) {
  return (
    <Select value={selectedCategory} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category} value={category} className="capitalize">
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
