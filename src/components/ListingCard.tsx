import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  condition: string;
  size?: string;
  brand?: string;
}

export const ListingCard = ({ id, title, price, imageUrl, condition, size, brand }: ListingCardProps) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
    checkAuth();
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const checkFavoriteStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("listing_id", id)
      .maybeSingle();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Te rugăm să te autentifici pentru a adăuga la favorite");
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
        .eq("listing_id", id);
      setIsFavorite(false);
      toast.success("Eliminat din favorite");
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: session.user.id, listing_id: id });
      setIsFavorite(true);
      toast.success("Adăugat la favorite");
    }
  };

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-lg"
      onClick={() => navigate(`/listing/${id}`)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            Fără imagine
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur hover:bg-background"
          onClick={toggleFavorite}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
        </Button>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-medium">{title}</h3>
          <p className="text-base font-bold text-primary whitespace-nowrap">{price.toFixed(2)} MDL</p>
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">{condition}</Badge>
          {size && <Badge variant="outline" className="text-xs">{size}</Badge>}
          {brand && <Badge variant="outline" className="text-xs">{brand}</Badge>}
        </div>
      </div>
    </Card>
  );
};
