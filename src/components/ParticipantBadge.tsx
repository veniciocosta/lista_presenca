import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { BadgeCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Participant } from "@/lib/store";

interface ParticipantBadgeProps {
  participant: Participant;
}

export default function ParticipantBadge({ participant }: ParticipantBadgeProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadBadge = () => {
    const canvas = document.createElement("canvas");
    const width = 900;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Brand header strip
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "#6366f1");
    gradient.addColorStop(1, "#8b5cf6");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, 200);

    ctx.fillStyle = "#ffffff";
    ctx.font = "600 40px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Attendly", 60, 86);
    ctx.font = "400 28px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText("Event Badge", 60, 128);

    // Participant name
    ctx.fillStyle = "#1e1b4b";
    ctx.font = "700 56px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(participant.fullName, width / 2, 340);

    // QR code (drawn from the rendered canvas, centered)
    const qrCanvas = qrRef.current?.querySelector("canvas");
    if (qrCanvas) {
      const size = Math.min(qrCanvas.width, qrCanvas.height);
      const target = 520;
      const x = (width - target) / 2;
      const y = 430;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x - 12, y - 12, target + 24, target + 24);
      ctx.drawImage(qrCanvas, x, y, target, target);
    }

    // Footer
    ctx.fillStyle = "#6b7280";
    ctx.font = "400 26px ui-monospace, monospace";
    ctx.fillText(`ID: ${participant.id}`, width / 2, height - 70);

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${participant.fullName.replace(/\s+/g, "-")}-badge.png`;
    a.click();
    toast.success("Badge downloaded", {
      description: `${participant.fullName}.png`,
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-[320px] overflow-hidden rounded-2xl border bg-card shadow-elegant">
        {/* Header strip */}
        <div className="bg-gradient-brand flex items-center justify-between px-5 py-3 text-white">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
            <BadgeCheck className="h-4 w-4" /> Attendly
          </span>
          <span className="text-xs font-medium text-white/80">Event Badge</span>
        </div>

        {/* Name */}
        <div className="px-5 pb-2 pt-5 text-center">
          <p className="text-xl font-bold tracking-tight">
            {participant.fullName}
          </p>
        </div>

        {/* QR code */}
        <div className="flex justify-center py-2">
          <div
            ref={qrRef}
            className="rounded-xl border-4 border-border bg-background p-3"
          >
            <QRCodeCanvas
              value={participant.qrData}
              size={200}
              marginSize={1}
              level="M"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            {participant.id.slice(0, 13)}…
          </p>
        </div>
      </div>

      <Button onClick={downloadBadge} className="w-full max-w-[320px]">
        <Download className="h-4 w-4" /> Download PNG
      </Button>
    </div>
  );
}
