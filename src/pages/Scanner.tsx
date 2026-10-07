import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ScanLine,
  XCircle,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  getEventById,
  getParticipantByQrData,
  getCheckInCount,
  isCheckedIn,
  recordAttendance,
} from "@/lib/store";

type ScanResult = {
  status: "success" | "warning" | "error";
  message: string;
};

export default function Scanner() {
  const { eventId } = useParams<{ eventId: string }>();
  const event = useMemo(
    () => (eventId ? getEventById(eventId) : undefined),
    [eventId]
  );

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ data: string; at: number }>({ data: "", at: 0 });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [count, setCount] = useState(() =>
    eventId ? getCheckInCount(eventId) : 0
  );

  useEffect(() => {
    if (!event) return;

    const scanner = new Html5Qrcode("qr-reader-region", { verbose: false });
    scannerRef.current = scanner;
    let active = true;
    let stopped = false;

    const handleScan = (data: string) => {
      if (!active) return;
      // Debounce: ignore the same code re-detected within 2s
      const now = Date.now();
      if (
        data === lastScanRef.current.data &&
        now - lastScanRef.current.at < 2000
      ) {
        return;
      }
      lastScanRef.current = { data, at: now };

      const participant = getParticipantByQrData(data);
      if (!participant) {
        setLastResult({
          status: "error",
          message: "Invalid QR code — not a registered participant.",
        });
        toast.error("Invalid QR code", {
          description: "Not a registered participant badge.",
        });
        return;
      }

      if (isCheckedIn(event.id, participant.id)) {
        setLastResult({
          status: "warning",
          message: `${participant.fullName} already checked in.`,
        });
        toast.warning("Already checked in", {
          description: participant.fullName,
        });
        return;
      }

      recordAttendance(event.id, participant.id);
      setCount((c) => c + 1);
      setLastResult({
        status: "success",
        message: `${participant.fullName} checked in!`,
      });
      toast.success(`${participant.fullName} checked in!`);
    };

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          handleScan,
          () => {} // per-frame decode errors are expected — keep scanning
        );
      } catch (err: unknown) {
        if (!active || stopped) return;
        const message =
          err instanceof Error && err.name === "NotAllowedError"
            ? "Camera permission was denied."
            : "Unable to access the camera.";
        setCameraError(message);
        toast.error("Scanner unavailable", { description: message });
      }
    };
    startScanner();

    return () => {
      active = false;
      stopped = true;
      const s = scannerRef.current;
      if (s && s.isScanning) {
        s.stop().catch(() => {});
      }
      scannerRef.current = null;
    };
  }, [event]);

  if (!event) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center gap-3 bg-foreground px-6 text-center text-background">
        <XCircle className="h-8 w-8 text-background/60" />
        <p className="font-semibold">Event not found</p>
        <Button asChild variant="secondary">
          <Link to="/events">Back to events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full flex-col bg-foreground text-background">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-background/70 transition-colors hover:text-background"
        >
          <ArrowLeft className="h-4 w-4" /> Events
        </Link>
        <div className="text-center">
          <p className="text-sm font-semibold leading-tight">{event.name}</p>
          <p className="text-xs text-background/60">
            {count} checked in
          </p>
        </div>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/10">
          <ScanLine className="h-4 w-4" />
        </span>
      </div>

      {/* Camera viewport */}
      <div className="flex-1 px-4 pb-2">
        <div className="relative mx-auto h-full max-w-md overflow-hidden rounded-2xl border border-background/15 bg-black">
          {cameraError ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <XCircle className="h-10 w-10 text-background/50" />
              <div>
                <p className="font-semibold">{cameraError}</p>
                <p className="mt-1 text-sm text-background/60">
                  Allow camera access in your browser, then reopen the scanner.
                  Or use the Attendance view to check people in manually.
                </p>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link to="/events">Back to events</Link>
              </Button>
            </div>
          ) : (
            <>
              <div id="qr-reader-region" className="h-full w-full" />
              {/* Scan frame overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-56 w-56">
                  <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-white/90" />
                  <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-white/90" />
                  <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-white/90" />
                  <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-white/90" />
                  <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-brand opacity-80" />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
                <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
                  Point the camera at a participant's QR badge
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Last scan status */}
      <div className="px-4 pb-6 pt-3">
        {lastResult ? (
          <div
            className={`mx-auto flex max-w-md items-center gap-3 rounded-xl px-4 py-3 ${
              lastResult.status === "success"
                ? "bg-success"
                : lastResult.status === "warning"
                  ? "bg-amber-500"
                  : "bg-destructive"
            } text-white`}
          >
            {lastResult.status === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : lastResult.status === "warning" ? (
              <AlertTriangle className="h-5 w-5 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0" />
            )}
            <p className="text-sm font-semibold">{lastResult.message}</p>
          </div>
        ) : (
          <p className="mx-auto max-w-md text-center text-sm text-background/50">
            The scanner runs continuously — keep scanning badge after badge.
          </p>
        )}
      </div>
    </div>
  );
}
