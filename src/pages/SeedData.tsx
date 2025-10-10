import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { seedMockListings } from "@/utils/seedData";
import { toast } from "sonner";
import { Loader2, CheckCircle, Database } from "lucide-react";

const SeedData = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (!user) {
      toast.error("Trebuie să fii autentificat pentru a adăuga date de test");
      navigate("/auth");
    }
  };

  const handleSeed = async () => {
    setIsLoading(true);
    
    try {
      const success = await seedMockListings();
      
      if (success) {
        setIsSeeded(true);
        toast.success("Date de test adăugate cu succes! 🎉");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        toast.error("A apărut o eroare la adăugarea datelor");
      }
    } catch (error) {
      toast.error("A apărut o eroare neașteptată");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Adaugă Date de Test</CardTitle>
          <CardDescription>
            Acest script va adăuga produse mock în contul tău pentru a testa platforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSeeded ? (
            <>
              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-semibold mb-2">Vor fi adăugate:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>12 produse variate</li>
                  <li>Îmbrăcăminte femei, bărbați, copii</li>
                  <li>Încălțăminte</li>
                  <li>Electronice</li>
                  <li>Imagini pentru fiecare produs</li>
                </ul>
              </div>
              
              <Button 
                onClick={handleSeed} 
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se adaugă date...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Adaugă Date de Test
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <p className="text-lg font-semibold">Date adăugate cu succes!</p>
              <p className="text-sm text-muted-foreground">
                Vei fi redirecționat către pagina principală...
              </p>
            </div>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="w-full"
          >
            Înapoi la pagina principală
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeedData;
