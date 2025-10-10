import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Messages = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }
    
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
          <h1 className="text-3xl font-bold mb-8">Mesaje</h1>
          
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Funcționalitatea de mesaje va fi disponibilă în curând</p>
              <Button onClick={() => navigate("/")}>Înapoi la pagina principală</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default Messages;
