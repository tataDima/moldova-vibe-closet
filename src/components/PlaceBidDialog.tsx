import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface PlaceBidDialogProps {
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  sellerId: string;
}

export const PlaceBidDialog = ({ listingId, listingTitle, listingPrice, sellerId }: PlaceBidDialogProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Te rugăm să te autentifici");
      navigate("/auth");
      return;
    }

    if (session.user.id === sellerId) {
      toast.error("Nu poți face ofertă la propriul produs");
      return;
    }

    const bidAmount = parseFloat(amount);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      toast.error("Introdu o sumă validă");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("bids")
      .insert({
        listing_id: listingId,
        bidder_id: session.user.id,
        seller_id: sellerId,
        amount: bidAmount,
        message: message.trim() || null,
        status: "pending"
      });

    setLoading(false);

    if (error) {
      toast.error("Eroare la trimiterea ofertei");
      console.error(error);
      return;
    }

    toast.success("Oferta a fost trimisă!");
    setOpen(false);
    setAmount("");
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          Fă o ofertă
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Fă o ofertă</DialogTitle>
            <DialogDescription>
              {listingTitle} - Preț: {listingPrice.toFixed(2)} MDL
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Suma ofertei (MDL) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mesaj (opțional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Scrie un mesaj pentru vânzător..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Anulează
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Se trimite..." : "Trimite oferta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
