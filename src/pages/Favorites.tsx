import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ListingCard } from "@/components/ListingCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Listing {
  id: string;
  title: string;
  price: number;
  condition: ProductCondition;
  size: string | null;
  brand: string | null;
  listing_images?: { image_url: string }[];
}

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    await fetchFavorites(session.user.id);
  };

  const fetchFavorites = async (userId: string) => {
    // First get favorite listing IDs
    const { data: favoritesData, error: favError } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", userId);

    if (favError) {
      toast.error("Eroare la încărcarea favoritelor");
      setLoading(false);
      return;
    }

    if (!favoritesData || favoritesData.length === 0) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    // Then get the actual listings
    const listingIds = favoritesData.map(fav => fav.listing_id);
    
    const { data: listingsData, error: listingsError } = await supabase
      .from("listings")
      .select("id, title, price, condition, size, brand, listing_images(image_url)")
      .in("id", listingIds);

    if (listingsError) {
      toast.error("Eroare la încărcarea produselor");
      setLoading(false);
      return;
    }

    setFavorites(listingsData as any || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 px-4">
          <div className="container mx-auto">
            <p className="text-center">Se încarcă...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20 px-4 pb-12">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-8">Favorite</h1>
          
          {favorites.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">Nu ai favorite încă</p>
                <Button onClick={() => navigate("/")}>Explorează produse</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((listing) => (
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
        </div>
      </main>
    </>
  );
};

export default Favorites;
