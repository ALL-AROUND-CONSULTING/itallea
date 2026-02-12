import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  url: string | null;
  sent_at: string;
  sent_to_count: number;
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await supabase.functions.invoke("admin-send-notification", { method: "GET" });
    if (!res.error) setNotifications(res.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Titolo e messaggio obbligatori");
      return;
    }
    setSending(true);
    const res = await supabase.functions.invoke("admin-send-notification", {
      method: "POST",
      body: { title: title.trim(), message: message.trim(), url: url.trim() || undefined },
    });
    if (res.error) {
      toast.error("Errore invio notifica");
    } else {
      toast.success(`Notifica inviata a ${res.data.sent_to_count} utenti`);
      setTitle("");
      setMessage("");
      setUrl("");
      fetchNotifications();
    }
    setSending(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Send form */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="font-semibold text-sm">Invia nuova notifica</h2>
          <div className="space-y-1">
            <Label className="text-xs">Titolo</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titolo notifica" maxLength={100} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Messaggio</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Corpo della notifica..." maxLength={500} rows={3} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">URL (opzionale)</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>
          <Button onClick={handleSend} disabled={sending} className="w-full">
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Invia a tutti
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <div>
        <h2 className="mb-2 font-semibold text-sm">Storico notifiche</h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessuna notifica inviata.</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <Card key={n.id}>
                <CardContent className="p-3">
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.sent_at).toLocaleString("it-IT")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      → {n.sent_to_count} utenti
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
