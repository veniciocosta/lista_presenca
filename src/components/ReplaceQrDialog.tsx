import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, ScanLine } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Participant, updateParticipantQr } from "@/lib/store";

interface ReplaceQrDialogProps {
  participant: Participant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReplaced: () => void;
}

export default function ReplaceQrDialog({
  participant,
  open,
  onOpenChange,
  onReplaced,
}: ReplaceQrDialogProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const lastScanRef = useRef<number>(0);
  
  // UUID validation regex (checks structure like d63bba11-6b5b-40be-a568-a6c44a822e85)
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  useEffect(() => {
    if (!open || !participant) {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
      return;
    }

    // Reset state
    setCameraError(null);
    lastScanRef.current = 0;
    
    // Html5Qrcode requires the DOM element to be fully rendered. We use a small delay.
    const timer = setTimeout(() => {
      const scanner = new Html5Qrcode("replace-qr-reader");
      scannerRef.current = scanner;
      let active = true;

      const handleScan = (data: string) => {
        if (!active) return;
        
        // Prevent multiple rapid reads causing toast spam
        const now = Date.now();
        if (now - lastScanRef.current < 2000) return;
        
        const qrData = data.trim();
        
        if (!uuidRegex.test(qrData)) {
          lastScanRef.current = now;
          toast.error("Formato de QR Code inválido. Apenas IDs antigos no formato UUID são aceitos.");
          return;
        }
        
        // Stop scanner and replace
        active = false;
        scanner.stop().then(() => {
          updateParticipantQr(participant.id, qrData);
          toast.success("QR Code substituído com sucesso!");
          onReplaced();
          onOpenChange(false);
        }).catch(console.error);
      };

      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          handleScan,
          () => {} // ignore scan failures
        )
        .catch((err) => {
          console.error("Camera start error:", err);
          setCameraError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
        });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [open, participant, onOpenChange, onReplaced]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Substituir QR Code</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code antigo (crachá físico) de <strong>{participant?.fullName}</strong> para associá-lo a este cadastro.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative aspect-square w-full max-w-[250px] overflow-hidden rounded-xl bg-muted md:max-w-xs">
            <div
              id="replace-qr-reader"
              className="absolute inset-0 z-10 h-full w-full object-cover"
            />
            <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Camera className="h-8 w-8" />
              <p className="text-sm">Iniciando câmera...</p>
            </div>

            {/* Overlay to focus user on the QR box */}
            <div className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_0_1000px_rgba(0,0,0,0.5)] transition-all">
              <div className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-primary bg-transparent shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]" />
              <ScanLine className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 text-primary/40" />
            </div>
          </div>

          {cameraError && (
            <div className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {cameraError}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
