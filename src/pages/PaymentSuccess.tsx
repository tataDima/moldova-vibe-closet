import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get("listing");
  const bidId = searchParams.get("bid");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    console.log("Payment successful:", { listingId, bidId, sessionId });
  }, [listingId, bidId, sessionId]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20 px-4 pb-12">
        <div className="container mx-auto max-w-2xl mt-12">
          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">
                Plata a fost procesată cu succes!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Comanda ta a fost confirmată. Vânzătorul va fi notificat și te va contacta în curând pentru detalii despre livrare.
              </p>
              
              {sessionId && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    ID sesiune: <span className="font-mono">{sessionId}</span>
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => navigate("/")} 
                  className="flex-1"
                >
                  Înapoi la pagina principală
                </Button>
                {listingId && (
                  <Button 
                    onClick={() => navigate(`/listing/${listingId}`)} 
                    variant="outline"
                    className="flex-1"
                  >
                    Vezi produsul
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default PaymentSuccess;
