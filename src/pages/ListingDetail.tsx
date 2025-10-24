import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceBidDialog } from "@/components/PlaceBidDialog";
import { Heart, MessageSquare, MapPin } from "lucide-react";
import { toast } from "sonner";
import { getProductConditionLabel } from "@/models/products";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  size: string | null;
  brand: string | null;
  created_at: string;
  seller_id: string;
  categories: { name: string; slug: string } | null;
}

interface Profile {
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
}

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchListing();
      checkAuth();
    }
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setCurrentUserId(session?.user?.id || null);
    if (session && id) {
      checkFavorite(session.user.id);
    }
  };

  const checkFavorite = async (userId: string) => {
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("listing_id", id!)
      .maybeSingle();
    setIsFavorite(!!data);
  };

  const fetchListing = async () => {
    const { data: listingData, error: listingError } = await supabase
      .from("listings")
      .select("id, title, description, price, condition, size, brand, created_at, seller_id, categories(name, slug)")
      .eq("id", id!)
      .single();

    if (listingError || !listingData) {
      toast.error("Anunțul nu a fost găsit");
      navigate("/");
      return;
    }

    setListing(listingData as any);

    const { data: imagesData } = await supabase
      .from("listing_images")
      .select("image_url")
      .eq("listing_id", id!)
      .order("display_order");

    setImages(imagesData?.map(img => img.image_url) || []);

    const { data: sellerData } = await supabase
      .from("profiles")
      .select("username, full_name, avatar_url, location")
      .eq("id", listingData.seller_id)
      .single();

    setSeller(sellerData);
    setLoading(false);
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Te rugăm să te autentifici");
      navigate("/auth");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", session.user.id)
        .eq("listing_id", id!);
      setIsFavorite(false);
      toast.success("Eliminat din favorite");
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: session.user.id, listing_id: id! });
      setIsFavorite(true);
      toast.success("Adăugat la favorite");
    }
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      toast.error("Te rugăm să te autentifici");
      navigate("/auth");
      return;
    }
    navigate(`/messages?listing=${id}`);
  };

  if (loading || !listing) {
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
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Fără imagine
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImage === idx ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt={`${listing.title} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold">{listing.title}</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFavorite}
                  >
                    <Heart className={`h-6 w-6 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                </div>
                <p className="text-4xl font-bold text-primary mb-4">{listing.price.toFixed(2)} MDL</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{ getProductConditionLabel(listing.condition) }</Badge>
                  {listing.size && <Badge variant="outline">{listing.size}</Badge>}
                  {listing.brand && <Badge variant="outline">{listing.brand}</Badge>}
                  {listing.categories && (
                    <Badge variant="outline">{listing.categories.name}</Badge>
                  )}
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Descriere</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{listing.description}</p>
                </CardContent>
              </Card>

              {seller && (
                <Card>
                  <CardHeader>
                    <CardTitle>Vânzător</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={seller.avatar_url || ""} />
                        <AvatarFallback>{seller.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{seller.full_name || seller.username}</p>
                        {seller.location && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {seller.location}
                          </p>
                        )}
                      </div>
                    </div>
                    {currentUserId !== listing.seller_id && (
                      <div className="space-y-2">
                        <Button 
                          onClick={() => navigate(`/checkout/${listing.id}`)} 
                          className="w-full" 
                          size="lg"
                        >
                          Cumpără acum
                        </Button>
                        <PlaceBidDialog
                          listingId={listing.id}
                          listingTitle={listing.title}
                          listingPrice={listing.price}
                          sellerId={listing.seller_id}
                        />
                        <Button onClick={handleContact} variant="outline" className="w-full">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Contactează vânzătorul
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ListingDetail;
