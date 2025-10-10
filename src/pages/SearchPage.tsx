import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { CategoryNav } from "@/components/CategoryNav";
import { ListingCard } from "@/components/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const { data: listings, isLoading } = useQuery({
    queryKey: ["listings", "search", query],
    queryFn: async () => {
      if (!query) return [];
      
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          listing_images(image_url),
          profiles(username)
        `)
        .eq("status", "active")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!query,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryNav />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Înapoi
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">
            Rezultate pentru "{query}"
          </h1>
          <p className="text-muted-foreground">
            {listings?.length || 0} produse găsite
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price={listing.price}
                imageUrl={listing.listing_images?.[0]?.image_url}
                condition={listing.condition}
                size={listing.size}
                brand={listing.brand}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg text-muted-foreground mb-4">
              Nu am găsit produse pentru căutarea ta
            </p>
            <Button onClick={() => navigate("/")}>
              Vezi toate produsele
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
