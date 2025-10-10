import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ShoppingCart, CreditCard, Loader2 } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  price: number;
  listing_images: { image_url: string }[];
}

interface Bid {
  id: string;
  amount: number;
  counter_amount: number | null;
  status: string;
}

const Checkout = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const bidId = searchParams.get("bid");
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [bid, setBid] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkAuthAndFetch();
  }, [id, bidId]);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    await fetchData();
  };

  const fetchData = async () => {
    const { data: listingData, error: listingError } = await supabase
      .from("listings")
      .select("id, title, price, listing_images(image_url)")
      .eq("id", id!)
      .single();

    if (listingError || !listingData) {
      toast.error("Produsul nu a fost găsit");
      navigate("/");
      return;
    }

    setListing(listingData as any);

    if (bidId) {
      const { data: bidData } = await supabase
        .from("bids")
        .select("id, amount, counter_amount, status")
        .eq("id", bidId)
        .single();

      if (bidData) {
        setBid(bidData);
      }
    }

    setLoading(false);
  };

  const getFinalPrice = () => {
    if (bid?.status === "counter_accepted" && bid.counter_amount) {
      return bid.counter_amount;
    }
    if (bid?.status === "accepted") {
      return bid.amount;
    }
    return listing?.price || 0;
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Te rugăm să te autentifici");
        navigate("/auth");
        return;
      }

      console.log("Creating payment for:", {
        listingId: id,
        amount: finalPrice,
        title: listing.title,
        bidId: bidId || null,
      });

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          listingId: id,
          amount: finalPrice,
          title: listing.title,
          bidId: bidId || null,
        },
      });

      if (error) {
        console.error("Payment error:", error);
        toast.error("Eroare la procesarea plății");
        setProcessing(false);
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("Redirecting to Stripe...");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Eroare la procesarea plății");
      setProcessing(false);
    }
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

  const finalPrice = getFinalPrice();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20 px-4 pb-12">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-2 mb-8">
            <ShoppingCart className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Finalizare comandă</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informații de livrare</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prenume</Label>
                      <Input id="firstName" placeholder="Ion" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nume</Label>
                      <Input id="lastName" placeholder="Popescu" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@exemplu.md" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" type="tel" placeholder="+373" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adresa</Label>
                    <Input id="address" placeholder="Strada, nr." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Oraș</Label>
                      <Input id="city" placeholder="Chișinău" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">Cod poștal</Label>
                      <Input id="zip" placeholder="MD-2001" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Metodă de plată</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Număr card</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Data expirării</Label>
                      <Input id="expiry" placeholder="MM/AA" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Sumar comandă</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {listing.listing_images?.[0]?.image_url ? (
                        <img
                          src={listing.listing_images[0].image_url}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          Fără imagine
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{listing.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {bid ? "Preț negociat" : "Preț normal"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{finalPrice.toFixed(2)} MDL</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Livrare</span>
                      <span>Gratuit</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{finalPrice.toFixed(2)} MDL</span>
                  </div>

                  <Button 
                    onClick={handlePayment} 
                    disabled={processing}
                    className="w-full" 
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Se procesează...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Plătește cu Stripe
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Plățile sunt securizate și criptate
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Checkout;
