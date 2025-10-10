import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingCard } from "@/components/ListingCard";
import { toast } from "sonner";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  condition: string;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        toast.error("Eroare la încărcarea profilului");
        return;
      }

      setProfile(profileData);

      const { data: listingsData, error: listingsError } = await supabase
        .from("listings")
        .select("id, title, price, condition, created_at")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (listingsError) {
        toast.error("Eroare la încărcarea anunțurilor");
        return;
      }

      setListings(listingsData || []);
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

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
      <main className="min-h-screen bg-background pt-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback>
                    {profile?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{profile?.full_name || profile?.username}</CardTitle>
                  <p className="text-muted-foreground">@{profile?.username}</p>
                  {profile?.location && (
                    <p className="text-sm text-muted-foreground mt-1">📍 {profile.location}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            {profile?.bio && (
              <CardContent>
                <p className="text-muted-foreground">{profile.bio}</p>
              </CardContent>
            )}
          </Card>

          <Tabs defaultValue="listings" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="listings">Anunțurile mele ({listings.length})</TabsTrigger>
              <TabsTrigger value="favorites">Favorite</TabsTrigger>
            </TabsList>
            
            <TabsContent value="listings" className="mt-6">
              {listings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">Nu ai încă anunțuri postate</p>
                    <Button onClick={() => navigate("/")}>Postează primul anunț</Button>
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
                      condition={listing.condition}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="favorites" className="mt-6">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Funcționalitate în curând</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default Profile;
