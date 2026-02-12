import { useState, useRef, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDeviceProfiles } from "@/hooks/useDeviceProfiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ChevronLeft, PenSquare, Loader2, QrCode, Scale, Unplug, UserPlus, Trash2, Edit2, Check, X, Users } from "lucide-react";

type Device = {
  id: string;
  hardware_device_id: string;
  serial_number: string | null;
};

const MAX_PROFILES = 5;

const DeviceConnectedView = ({ device, onUnpair, unpairLoading, navigate }: {
  device: Device;
  onUnpair: () => void;
  unpairLoading: boolean;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  const { profiles, isLoading, addProfile, updateProfile, deleteProfile } = useDeviceProfiles(device.id);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) { toast.error("Inserisci un nome per il profilo"); return; }
    if (profiles.length >= MAX_PROFILES) { toast.error(`Massimo ${MAX_PROFILES} profili`); return; }
    const nextIndex = profiles.length > 0 ? Math.max(...profiles.map(p => p.profile_index)) + 1 : 1;
    addProfile.mutate({ name, profileIndex: nextIndex }, {
      onSuccess: () => { setNewName(""); toast.success("Profilo aggiunto"); },
      onError: () => toast.error("Errore nell'aggiunta del profilo"),
    });
  };

  const handleSaveEdit = (id: string) => {
    const name = editName.trim();
    if (!name) return;
    updateProfile.mutate({ id, name }, {
      onSuccess: () => { setEditingId(null); toast.success("Profilo aggiornato"); },
      onError: () => toast.error("Errore nell'aggiornamento"),
    });
  };

  const handleDelete = (id: string) => {
    deleteProfile.mutate(id, {
      onSuccess: () => toast.success("Profilo eliminato"),
      onError: () => toast.error("Errore nell'eliminazione"),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background overflow-y-auto">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Collega la tua bilancia</h1>
      </div>

      <div className="flex flex-col items-center gap-6 px-6 pb-10">
        {/* Device info */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "hsl(var(--brand-blue) / 0.1)" }}>
          <Scale className="h-10 w-10" style={{ color: "hsl(var(--brand-blue))" }} />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground">Hai già una bilancia collegata</p>
          <p className="text-sm text-muted-foreground">
            Dispositivo: {device.hardware_device_id}
            {device.serial_number && ` · S/N ${device.serial_number}`}
          </p>
        </div>

        {/* Profiles section */}
        <div className="w-full max-w-sm space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" style={{ color: "hsl(var(--brand-blue))" }} />
            <h2 className="text-sm font-semibold text-foreground">Profili bilancia</h2>
            <span className="ml-auto text-xs text-muted-foreground">{profiles.length}/{MAX_PROFILES}</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-2">
              {profiles.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-xl border bg-card p-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold" style={{ background: "hsl(var(--brand-blue) / 0.15)", color: "hsl(var(--brand-blue))" }}>
                    {p.profile_index}
                  </span>
                  {editingId === p.id ? (
                    <>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 flex-1 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(p.id)}
                        autoFocus
                      />
                      <button onClick={() => handleSaveEdit(p.id)} className="text-primary"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditingId(null)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium">{p.name}</span>
                      <button onClick={() => { setEditingId(p.id); setEditName(p.name); }} className="text-muted-foreground hover:text-foreground"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </>
                  )}
                </div>
              ))}

              {profiles.length < MAX_PROFILES && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome nuovo profilo…"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    className="h-9 text-sm"
                  />
                  <Button size="sm" className="h-9 shrink-0" onClick={handleAdd} disabled={addProfile.isPending}>
                    {addProfile.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="w-full max-w-xs space-y-3 pt-2">
          <Button
            variant="destructive"
            className="w-full rounded-xl"
            onClick={onUnpair}
            disabled={unpairLoading}
          >
            {unpairLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unplug className="mr-2 h-4 w-4" />}
            Scollega dispositivo
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => navigate(-1)}
          >
            Torna indietro
          </Button>
        </div>
      </div>
    </div>
  );
};

const PairDevice = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scanning, setScanning] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [pairing, setPairing] = useState(false);
  const [existingDevice, setExistingDevice] = useState<Device | null>(null);
  const [loadingDevice, setLoadingDevice] = useState(true);
  const [unpairLoading, setUnpairLoading] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScannerRunning = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for existing device
  useEffect(() => {
    if (!user) return;
    supabase
      .from("devices")
      .select("id, hardware_device_id, serial_number")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("paired_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setExistingDevice(data as Device | null);
        setLoadingDevice(false);
      });
  }, [user]);

  // Auto-start scanner on mount (only if no existing device)
  useEffect(() => {
    if (loadingDevice || existingDevice) return;
    const timer = setTimeout(() => {
      if (!scanning && !showManual && !pairing) {
        startScanner();
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingDevice, existingDevice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && isScannerRunning.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
            isScannerRunning.current = false;
          })
          .catch(() => {
            try { scannerRef.current?.clear(); } catch {}
            scannerRef.current = null;
            isScannerRunning.current = false;
          });
      } else {
        try { scannerRef.current?.clear(); } catch {}
        scannerRef.current = null;
        isScannerRunning.current = false;
      }
    };
  }, []);

  const pairDevice = useCallback(async (hardwareId: string) => {
    setPairing(true);
    try {
      const res = await supabase.functions.invoke("pair-device", {
        method: "POST",
        body: { hardware_device_id: hardwareId.trim() },
      });

      if (res.error) {
        const msg = res.error.message || "";
        if (msg.includes("409") || msg.includes("already paired")) {
          toast.error("Questo dispositivo è già associato a un altro account");
        } else {
          toast.error("Errore durante il pairing: " + msg);
        }
      } else {
        // Check for 409 in response data
        const data = res.data;
        if (data?.error && data.error.includes("already paired")) {
          toast.error("Questo dispositivo è già associato a un altro account");
        } else {
          toast.success(data?.message || "Bilancia collegata con successo!");
          navigate("/", { replace: true });
        }
      }
    } catch (err: any) {
      toast.error("Errore: " + (err.message || "Riprova"));
    } finally {
      setPairing(false);
    }
  }, [navigate]);

  const startScanner = useCallback(async () => {
    if (!containerRef.current || isScannerRunning.current) return;

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          isScannerRunning.current = false;
          scanner
            .stop()
            .then(() => {
              scanner.clear();
              scannerRef.current = null;
              setScanning(false);
              pairDevice(decodedText);
            })
            .catch(() => {
              try { scanner.clear(); } catch {}
              scannerRef.current = null;
              setScanning(false);
              pairDevice(decodedText);
            });
        },
        () => {}
      );

      isScannerRunning.current = true;
      setScanning(true);
    } catch {
      toast.error("Impossibile accedere alla fotocamera");
    }
  }, [pairDevice]);

  const stopScanner = useCallback(() => {
    if (scannerRef.current && isScannerRunning.current) {
      isScannerRunning.current = false;
      scannerRef.current
        .stop()
        .then(() => {
          try { scannerRef.current?.clear(); } catch {}
          scannerRef.current = null;
        })
        .catch(() => {
          try { scannerRef.current?.clear(); } catch {}
          scannerRef.current = null;
        });
    } else {
      try { scannerRef.current?.clear(); } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleManualSubmit = () => {
    const code = manualCode.trim();
    if (code.length < 4) {
      toast.error("Inserisci un codice dispositivo valido");
      return;
    }
    setShowManual(false);
    pairDevice(code);
  };

  const handleUnpair = async () => {
    if (!existingDevice) return;
    setUnpairLoading(true);
    const res = await supabase.functions.invoke("pair-device", {
      method: "DELETE",
      body: { deviceId: existingDevice.id },
    });
    if (res.error) {
      toast.error("Errore disconnessione");
    } else {
      toast.success("Dispositivo scollegato");
      setExistingDevice(null);
      // Start scanner after unpair
      setTimeout(() => startScanner(), 300);
    }
    setUnpairLoading(false);
  };

  // Loading device check
  if (loadingDevice) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "hsl(var(--brand-blue))" }} />
      </div>
    );
  }

  // Existing device found
  if (existingDevice) {
    return <DeviceConnectedView device={existingDevice} onUnpair={handleUnpair} unpairLoading={unpairLoading} navigate={navigate} />;
  }

  // Pairing in progress
  if (pairing) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "hsl(var(--brand-blue))" }} />
        <p className="text-sm text-muted-foreground">Collegamento in corso…</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header overlay */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center gap-3 bg-gradient-to-b from-black/60 to-transparent px-4 pb-6 pt-4">
        <button onClick={() => { stopScanner(); navigate(-1); }}>
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">Collega la tua bilancia</h1>
      </div>

      {/* Camera area */}
      <div ref={containerRef} className="relative flex-1">
        <div
          id="qr-reader"
          className="h-full w-full [&>video]:h-full [&>video]:w-full [&>video]:object-cover"
        />

        {/* Square corner brackets for QR */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-56 w-56">
            <div className="absolute left-0 top-0 h-10 w-10 rounded-tl-2xl border-l-[3px] border-t-[3px] border-white/80" />
            <div className="absolute right-0 top-0 h-10 w-10 rounded-tr-2xl border-r-[3px] border-t-[3px] border-white/80" />
            <div className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-2xl border-b-[3px] border-l-[3px] border-white/80" />
            <div className="absolute bottom-0 right-0 h-10 w-10 rounded-br-2xl border-b-[3px] border-r-[3px] border-white/80" />
          </div>
        </div>

        {/* Instruction text */}
        {scanning && (
          <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
            <span className="rounded-full bg-black/50 px-4 py-2 text-xs text-white/80 backdrop-blur">
              Inquadra il QR code sulla bilancia
            </span>
          </div>
        )}

        {/* Not scanning yet */}
        {!scanning && !showManual && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <button
              onClick={startScanner}
              className="flex flex-col items-center gap-3 rounded-2xl bg-white/10 px-8 py-6 text-white backdrop-blur"
            >
              <QrCode className="h-10 w-10" />
              <span>Tocca per avviare la fotocamera</span>
            </button>
          </div>
        )}

        {/* Manual input overlay */}
        {showManual && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-8">
            <div className="w-full max-w-sm space-y-3 rounded-2xl bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">
                Inserisci codice dispositivo
              </h3>
              <Input
                placeholder="Codice dispositivo…"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowManual(false);
                    startScanner();
                  }}
                >
                  Annulla
                </Button>
                <Button className="flex-1" onClick={handleManualSubmit}>
                  Collega
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div
        className="bg-black/60 px-6 pb-10 pt-5 backdrop-blur"
        style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom, 2.5rem))" }}
      >
        <div className="mx-auto flex max-w-sm justify-center">
          <button
            onClick={() => {
              stopScanner();
              setShowManual(true);
            }}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <PenSquare className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs text-white/80">Inserimento manuale</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PairDevice;
