import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useEffect, useRef } from "react";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
    } else if (wasOffline.current) {
      wasOffline.current = false;
      toast.success("Connessione ripristinata");
    }
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-md">
      <WifiOff className="h-4 w-4" />
      <span>Connessione assente — Alcune funzionalità potrebbero non essere disponibili</span>
    </div>
  );
}
