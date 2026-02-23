import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Loader2, Bell, Users } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

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

  // Stats
  const totalSent = notifications.length;
  const totalRecipients = notifications.reduce((sum, n) => sum + n.sent_to_count, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalSent}</p>
              <p className="text-xs text-muted-foreground">Notifiche inviate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalRecipients}</p>
              <p className="text-xs text-muted-foreground">Destinatari totali</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Send form */}
        <Card className="lg:col-span-1">
          <CardContent className="space-y-4 p-5">
            <h2 className="font-semibold">Invia notifica</h2>
            <div className="space-y-1">
              <Label className="text-xs">Titolo</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titolo notifica" maxLength={100} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Messaggio</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Corpo della notifica…" maxLength={500} rows={4} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">URL (opzionale)</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            </div>
            <Button onClick={handleSend} disabled={sending} className="w-full">
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Invia a tutti
            </Button>
          </CardContent>
        </Card>

        {/* History table */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="border-b px-4 py-3">
              <h2 className="font-semibold text-sm">Storico notifiche</h2>
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : notifications.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nessuna notifica inviata.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titolo</TableHead>
                      <TableHead className="hidden md:table-cell">Messaggio</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Destinatari</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((n) => (
                      <TableRow key={n.id}>
                        <TableCell className="font-medium">{n.title}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-xs max-w-[300px] truncate">
                          {n.message}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(n.sent_at).toLocaleString("it-IT")}
                        </TableCell>
                        <TableCell className="text-right font-medium">{n.sent_to_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
