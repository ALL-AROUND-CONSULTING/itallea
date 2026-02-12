import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Email inviata! Controlla la tua casella di posta.");
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🔑 Recupera Password</CardTitle>
          <CardDescription>
            {sent
              ? "Controlla la tua email per il link di reset"
              : "Inserisci la tua email per ricevere il link di reset"}
          </CardDescription>
        </CardHeader>
        {!sent ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Invio…" : "Invia link di reset"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Torna al login
                </Link>
              </p>
            </CardFooter>
          </form>
        ) : (
          <CardFooter className="flex flex-col gap-3">
            <p className="text-center text-sm text-muted-foreground">
              Non hai ricevuto l'email?{" "}
              <button
                onClick={() => setSent(false)}
                className="font-medium text-primary hover:underline"
              >
                Riprova
              </button>
            </p>
            <Link to="/login" className="text-center text-sm font-medium text-primary hover:underline">
              Torna al login
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
