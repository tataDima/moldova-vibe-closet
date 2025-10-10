import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";

export const CategoryNav = () => {
  const navigate = useNavigate();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const getIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-4 w-4" /> : null;
  };

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/category/${category.slug}`)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {getIcon(category.icon)}
              <span>{category.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
