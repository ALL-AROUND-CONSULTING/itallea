import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";

const VerifyEmail = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const email = new URLSearchParams(window.location.search).get("email") || "";

  const handleVerify = async () => {
    if (otp.length < 6) {
      toast.error("Inserisci il codice completo a 6 cifre.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Email verificata con successo!");
      navigate("/");
    }
    setSubmitting(false);
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email mancante. Torna alla registrazione.");
      return;
    }
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Codice reinviato! Controlla la tua email.");
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">📧 Verifica Email</CardTitle>
          <CardDescription>
            Inserisci il codice a 6 cifre inviato a{" "}
            <span className="font-medium text-foreground">{email || "la tua email"}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button onClick={handleVerify} className="w-full" disabled={submitting || otp.length < 6}>
            {submitting ? "Verifica…" : "Verifica"}
          </Button>

          <button
            type="button"
            onClick={handleResend}
            className="text-xs text-primary hover:underline"
          >
            Non hai ricevuto il codice? Reinvia
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
