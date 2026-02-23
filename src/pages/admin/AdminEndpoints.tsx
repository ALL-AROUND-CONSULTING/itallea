import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const API_DOC = `/docs/API-Endpoints.md`;

interface Endpoint {
  name: string;
  method: string;
  verifyJwt: boolean;
  status: "idle" | "loading" | "ok" | "error";
  responseTime?: number;
}

const ENDPOINTS: Omit<Endpoint, "status">[] = [
  { name: "get-daily-nutrition", method: "POST", verifyJwt: false },
  { name: "lookup-barcode", method: "POST", verifyJwt: false },
  { name: "export-user-data", method: "POST", verifyJwt: false },
  { name: "delete-account", method: "POST", verifyJwt: false },
  { name: "admin-manage-users", method: "POST", verifyJwt: false },
  { name: "admin-send-notification", method: "POST", verifyJwt: false },
  { name: "admin-manage-products", method: "POST", verifyJwt: false },
  { name: "pair-device", method: "POST", verifyJwt: false },
  { name: "device-lookup-barcode", method: "POST", verifyJwt: false },
  { name: "device-send-weighing", method: "POST", verifyJwt: false },
  { name: "device-get-recipe", method: "POST", verifyJwt: false },
  { name: "submit-nutrition-correction", method: "POST", verifyJwt: false },
  { name: "ocr-nutrition-label", method: "POST", verifyJwt: false },
  { name: "manage-push-token", method: "POST", verifyJwt: false },
];

const BASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function AdminEndpoints() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>(
    ENDPOINTS.map((e) => ({ ...e, status: "idle" }))
  );
  const [testingAll, setTestingAll] = useState(false);

  const testEndpoint = async (index: number) => {
    setEndpoints((prev) =>
      prev.map((e, i) => (i === index ? { ...e, status: "loading" } : e))
    );

    const ep = endpoints[index];
    const start = performance.now();

    try {
      const res = await fetch(`${BASE_URL}/functions/v1/${ep.name}`, {
        method: "OPTIONS",
      });
      const elapsed = Math.round(performance.now() - start);
      const ok = res.ok || res.status === 204;

      setEndpoints((prev) =>
        prev.map((e, i) =>
          i === index ? { ...e, status: ok ? "ok" : "error", responseTime: elapsed } : e
        )
      );
    } catch {
      const elapsed = Math.round(performance.now() - start);
      setEndpoints((prev) =>
        prev.map((e, i) =>
          i === index ? { ...e, status: "error", responseTime: elapsed } : e
        )
      );
    }
  };

  const testAll = async () => {
    setTestingAll(true);
    for (let i = 0; i < endpoints.length; i++) {
      await testEndpoint(i);
    }
    setTestingAll(false);

    const results = endpoints; // will be stale, but we re-read from state
    toast.success("Test completato");
  };

  const statusBadge = (ep: Endpoint) => {
    switch (ep.status) {
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case "ok":
        return (
          <Badge variant="default" className="bg-emerald-500 text-white text-[10px]">
            OK {ep.responseTime && `${ep.responseTime}ms`}
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="text-[10px]">
            Errore {ep.responseTime && `${ep.responseTime}ms`}
          </Badge>
        );
      default:
        return <span className="text-xs text-muted-foreground">—</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Endpoints</h2>
          <p className="text-sm text-muted-foreground">{endpoints.length} funzioni configurate</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const link = document.createElement("a");
              link.href = API_DOC;
              link.download = "API-Endpoints.md";
              link.click();
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Scarica doc
          </Button>
          <Button onClick={testAll} disabled={testingAll} size="sm">
            {testingAll ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Testa tutti
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funzione</TableHead>
              <TableHead className="hidden sm:table-cell">Metodo</TableHead>
              <TableHead className="hidden sm:table-cell">JWT</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {endpoints.map((ep, i) => (
              <TableRow key={ep.name}>
                <TableCell className="font-mono text-xs">{ep.name}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline" className="text-[10px]">
                    {ep.method}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className={ep.verifyJwt ? "text-emerald-600" : "text-amber-500"}>
                    {ep.verifyJwt ? "Sì" : "No"}
                  </span>
                </TableCell>
                <TableCell>{statusBadge(ep)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => testEndpoint(i)}
                    disabled={ep.status === "loading"}
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
