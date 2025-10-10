import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

interface MyBid {
  id: string;
  listing_id: string;
  amount: number;
  message: string | null;
  status: string;
  counter_amount: number | null;
  counter_message: string | null;
  created_at: string;
  listings: {
    title: string;
    price: number;
    seller_id: string;
  };
}

const MyBids = () => {
  const navigate = useNavigate();
  const [bids, setBids] = useState<MyBid[]>([]);
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

    await fetchBids(session.user.id);
  };

  const fetchBids = async (userId: string) => {
    const { data, error } = await supabase
      .from("bids")
      .select(`
        *,
        listings!inner(title, price, seller_id)
      `)
      .eq("bidder_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Eroare la încărcarea ofertelor");
      setLoading(false);
      return;
    }

    setBids(data as any || []);
    setLoading(false);
  };

  const handleAcceptCounterOffer = async (bidId: string) => {
    const { error } = await supabase
      .from("bids")
      .update({ status: "counter_accepted" })
      .eq("id", bidId);

    if (error) {
      toast.error("Eroare la acceptarea contraofertei");
      return;
    }

    toast.success("Ai acceptat contraoferta!");
    const { data: { session } } = await supabase.auth.getSession();
    if (session) fetchBids(session.user.id);
  };

  const handleRejectCounterOffer = async (bidId: string) => {
    const { error } = await supabase
      .from("bids")
      .update({ status: "counter_rejected" })
      .eq("id", bidId);

    if (error) {
      toast.error("Eroare la respingerea contraofertei");
      return;
    }

    toast.success("Ai respins contraoferta");
    const { data: { session } } = await supabase.auth.getSession();
    if (session) fetchBids(session.user.id);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "default", label: "În așteptare" },
      accepted: { variant: "default", label: "Acceptată" },
      rejected: { variant: "destructive", label: "Respinsă" },
      counter_offered: { variant: "secondary", label: "Contraoferată primită" },
      counter_accepted: { variant: "default", label: "Contraoferată acceptată" },
      counter_rejected: { variant: "destructive", label: "Contraoferată respinsă" }
    };
    const { variant, label } = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={variant}>{label}</Badge>;
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
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Ofertele mele</h1>

          {bids.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">Nu ai făcut nicio ofertă încă</p>
                <Button onClick={() => navigate("/")}>Explorează produse</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bids.map((bid) => (
                <Card key={bid.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{bid.listings.title}</CardTitle>
                      </div>
                      {getStatusBadge(bid.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Preț produs</p>
                        <p className="font-semibold">{bid.listings.price.toFixed(2)} MDL</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Oferta ta</p>
                        <p className="font-semibold text-primary">{bid.amount.toFixed(2)} MDL</p>
                      </div>
                    </div>

                    {bid.message && (
                      <div>
                        <p className="text-sm text-muted-foreground">Mesajul tău</p>
                        <p className="text-sm mt-1">{bid.message}</p>
                      </div>
                    )}

                    {bid.status === "counter_offered" && bid.counter_amount && (
                      <div className="bg-muted p-4 rounded-lg space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-primary">
                            Contraoferată: {bid.counter_amount.toFixed(2)} MDL
                          </p>
                          {bid.counter_message && (
                            <p className="text-sm text-muted-foreground mt-1">{bid.counter_message}</p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptCounterOffer(bid.id)}
                            className="flex-1"
                            size="sm"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Acceptă
                          </Button>
                          <Button
                            onClick={() => handleRejectCounterOffer(bid.id)}
                            variant="destructive"
                            className="flex-1"
                            size="sm"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Respinge
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(bid.created_at).toLocaleDateString('ro-RO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="flex gap-2">
                        {(bid.status === "accepted" || bid.status === "counter_accepted") && (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/checkout/${bid.listing_id}?bid=${bid.id}`)}
                          >
                            Mergi la plată
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/listing/${bid.listing_id}`)}
                        >
                          Vezi produsul
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default MyBids;
