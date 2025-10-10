import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { CategoryNav } from "@/components/CategoryNav";
import { ListingCard } from "@/components/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";

const Home = () => {
  const { data: listings, isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          listing_images(image_url),
          profiles(username)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryNav />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Descoperă produse unice</h1>
          <p className="text-muted-foreground">
            Găsește cele mai bune oferte din Moldova
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {listings?.map((listing) => (
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
        )}

        {!isLoading && listings?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg text-muted-foreground">
              Niciun produs disponibil momentan
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
