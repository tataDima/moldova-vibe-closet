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
  condition: string;
  size: string | null;
  brand: string | null;
  created_at: string;
  listing_images: { image_url: string }[];
}

const MyListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
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

    await fetchListings(session.user.id);
  };

  const fetchListings = async (userId: string) => {
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, price, condition, size, brand, created_at")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Eroare la încărcarea anunțurilor");
      setLoading(false);
      return;
    }

    // Fetch images separately for each listing
    const listingsWithImages = await Promise.all(
      (data || []).map(async (listing) => {
        const { data: images } = await supabase
          .from("listing_images")
          .select("image_url")
          .eq("listing_id", listing.id)
          .order("display_order")
          .limit(1);
        
        return {
          ...listing,
          listing_images: images || []
        };
      })
    );

    setListings(listingsWithImages as any);
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Anunțurile mele</h1>
            <Button onClick={() => navigate("/sell")}>Adaugă anunț</Button>
          </div>
          
          {listings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">Nu ai anunțuri postate încă</p>
                <Button onClick={() => navigate("/sell")}>Postează primul anunț</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          )}
        </div>
      </main>
    </>
  );
};

export default MyListings;
