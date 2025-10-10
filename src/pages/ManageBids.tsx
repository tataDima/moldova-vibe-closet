import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle, XCircle, MessageSquare } from "lucide-react";

interface Bid {
  id: string;
  listing_id: string;
  bidder_id: string;
  amount: number;
  message: string | null;
  status: string;
  counter_amount: number | null;
  counter_message: string | null;
  created_at: string;
  listings: {
    title: string;
    price: number;
    categories: { name: string } | null;
  };
}

const ManageBids = () => {
  const navigate = useNavigate();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterListing, setFilterListing] = useState<string>("all");
  const [categories, setCategories] = useState<{ name: string }[]>([]);
  const [listings, setListings] = useState<{ id: string; title: string }[]>([]);
  const [counterOfferBid, setCounterOfferBid] = useState<Bid | null>(null);
  const [counterAmount, setCounterAmount] = useState("");
  const [counterMessage, setCounterMessage] = useState("");

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
    await fetchFilters(session.user.id);
  };

  const fetchBids = async (userId: string) => {
    const { data, error } = await supabase
      .from("bids")
      .select(`
        *,
        listings!inner(title, price, categories(name))
      `)
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Eroare la încărcarea ofertelor");
      setLoading(false);
      return;
    }

    setBids(data as any || []);
    setLoading(false);
  };

  const fetchFilters = async (userId: string) => {
    const { data: listingsData } = await supabase
      .from("listings")
      .select("id, title, categories(name)")
      .eq("seller_id", userId);

    if (listingsData) {
      setListings(listingsData.map(l => ({ id: l.id, title: l.title })));
      
      const uniqueCategories = Array.from(
        new Set(listingsData.map(l => (l as any).categories?.name).filter(Boolean))
      ).map(name => ({ name: name as string }));
      
      setCategories(uniqueCategories);
    }
  };

  const handleAccept = async (bidId: string) => {
    const { error } = await supabase
      .from("bids")
      .update({ status: "accepted" })
      .eq("id", bidId);

    if (error) {
      toast.error("Eroare la acceptarea ofertei");
      return;
    }

    toast.success("Oferta a fost acceptată!");
    const { data: { session } } = await supabase.auth.getSession();
    if (session) fetchBids(session.user.id);
  };

  const handleReject = async (bidId: string) => {
    const { error } = await supabase
      .from("bids")
      .update({ status: "rejected" })
      .eq("id", bidId);

    if (error) {
      toast.error("Eroare la respingerea ofertei");
      return;
    }

    toast.success("Oferta a fost respinsă");
    const { data: { session } } = await supabase.auth.getSession();
    if (session) fetchBids(session.user.id);
  };

  const handleCounterOffer = async () => {
    if (!counterOfferBid) return;

    const amount = parseFloat(counterAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Introdu o sumă validă");
      return;
    }

    const { error } = await supabase
      .from("bids")
      .update({
        status: "counter_offered",
        counter_amount: amount,
        counter_message: counterMessage.trim() || null
      })
      .eq("id", counterOfferBid.id);

    if (error) {
      toast.error("Eroare la trimiterea contraofertei");
      return;
    }

    toast.success("Contraoferată trimisă!");
    setCounterOfferBid(null);
    setCounterAmount("");
    setCounterMessage("");
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) fetchBids(session.user.id);
  };

  const filteredBids = bids.filter(bid => {
    if (filterCategory !== "all" && bid.listings.categories?.name !== filterCategory) {
      return false;
    }
    if (filterListing !== "all" && bid.listing_id !== filterListing) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "default", label: "În așteptare" },
      accepted: { variant: "default", label: "Acceptată" },
      rejected: { variant: "destructive", label: "Respinsă" },
      counter_offered: { variant: "secondary", label: "Contraoferată" },
      counter_accepted: { variant: "default", label: "Contraoferată acceptată" },
      counter_rejected: { variant: "destructive", label: "Contraoferată respinsă" }
    };
    const { variant, label } = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const groupedBids = {
    pending: filteredBids.filter(b => b.status === "pending"),
    counterOffered: filteredBids.filter(b => b.status === "counter_offered"),
    accepted: filteredBids.filter(b => b.status === "accepted" || b.status === "counter_accepted"),
    rejected: filteredBids.filter(b => b.status === "rejected" || b.status === "counter_rejected")
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

  const BidCard = ({ bid }: { bid: Bid }) => (
    <Card key={bid.id}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{bid.listings.title}</CardTitle>
            {bid.listings.categories && (
              <Badge variant="outline" className="mt-2">{bid.listings.categories.name}</Badge>
            )}
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
            <p className="text-muted-foreground">Oferta</p>
            <p className="font-semibold text-primary">{bid.amount.toFixed(2)} MDL</p>
          </div>
        </div>

        {bid.message && (
          <div>
            <p className="text-sm text-muted-foreground">Mesaj</p>
            <p className="text-sm mt-1">{bid.message}</p>
          </div>
        )}

        {bid.status === "counter_offered" && bid.counter_amount && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-semibold">Contraoferată: {bid.counter_amount.toFixed(2)} MDL</p>
            {bid.counter_message && (
              <p className="text-sm text-muted-foreground mt-1">{bid.counter_message}</p>
            )}
          </div>
        )}

        {bid.status === "pending" && (
          <div className="flex gap-2">
            <Button
              onClick={() => handleAccept(bid.id)}
              className="flex-1"
              size="sm"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Acceptă
            </Button>
            <Button
              onClick={() => {
                setCounterOfferBid(bid);
                setCounterAmount(bid.amount.toString());
              }}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Contraoferă
            </Button>
            <Button
              onClick={() => handleReject(bid.id)}
              variant="destructive"
              className="flex-1"
              size="sm"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Respinge
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {new Date(bid.created_at).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20 px-4 pb-12">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-8">Gestionare Oferte</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label>Filtrează după categorie</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate categoriile</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Filtrează după produs</Label>
              <Select value={filterListing} onValueChange={setFilterListing}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate produsele</SelectItem>
                  {listings.map((listing) => (
                    <SelectItem key={listing.id} value={listing.id}>
                      {listing.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                În așteptare ({groupedBids.pending.length})
              </TabsTrigger>
              <TabsTrigger value="counterOffered">
                Contraoferte ({groupedBids.counterOffered.length})
              </TabsTrigger>
              <TabsTrigger value="accepted">
                Acceptate ({groupedBids.accepted.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Respinse ({groupedBids.rejected.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6 space-y-4">
              {groupedBids.pending.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Nu sunt oferte în așteptare</p>
                  </CardContent>
                </Card>
              ) : (
                groupedBids.pending.map(bid => <BidCard key={bid.id} bid={bid} />)
              )}
            </TabsContent>

            <TabsContent value="counterOffered" className="mt-6 space-y-4">
              {groupedBids.counterOffered.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Nu sunt contraoferte trimise</p>
                  </CardContent>
                </Card>
              ) : (
                groupedBids.counterOffered.map(bid => <BidCard key={bid.id} bid={bid} />)
              )}
            </TabsContent>

            <TabsContent value="accepted" className="mt-6 space-y-4">
              {groupedBids.accepted.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Nu sunt oferte acceptate</p>
                  </CardContent>
                </Card>
              ) : (
                groupedBids.accepted.map(bid => <BidCard key={bid.id} bid={bid} />)
              )}
            </TabsContent>

            <TabsContent value="rejected" className="mt-6 space-y-4">
              {groupedBids.rejected.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Nu sunt oferte respinse</p>
                  </CardContent>
                </Card>
              ) : (
                groupedBids.rejected.map(bid => <BidCard key={bid.id} bid={bid} />)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={!!counterOfferBid} onOpenChange={(open) => !open && setCounterOfferBid(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trimite contraoferată</DialogTitle>
            <DialogDescription>
              Oferta inițială: {counterOfferBid?.amount.toFixed(2)} MDL
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="counter-amount">Suma ta (MDL)</Label>
              <Input
                id="counter-amount"
                type="number"
                step="0.01"
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="counter-message">Mesaj (opțional)</Label>
              <Textarea
                id="counter-message"
                value={counterMessage}
                onChange={(e) => setCounterMessage(e.target.value)}
                placeholder="Explică contraoferta ta..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCounterOfferBid(null)}>
              Anulează
            </Button>
            <Button onClick={handleCounterOffer}>
              Trimite contraoferată
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageBids;
