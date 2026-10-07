import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Participant, loadParticipants, updateParticipantQr } from "@/lib/store";

interface AssignQrDialogProps {
  qrData: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
}

export default function AssignQrDialog({
  qrData,
  open,
  onOpenChange,
  onAssigned,
}: AssignQrDialogProps) {
  const [selectedId, setSelectedId] = useState<string>("");
  const participants = loadParticipants();

  const handleAssign = () => {
    if (!qrData || !selectedId) return;

    const participant = participants.find((p) => p.id === selectedId);
    if (!participant) return;

    if (confirm(`Tem certeza que deseja atribuir este crachá físico para o participante "${participant.fullName}"?`)) {
      updateParticipantQr(participant.id, qrData);
      toast.success("QR Code atribuído com sucesso!");
      onAssigned();
      onOpenChange(false);
      setSelectedId(""); // reset
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atribuir QR Code</DialogTitle>
          <DialogDescription>
            Este QR Code não está vinculado a ninguém. Deseja atribuí-lo a um dos participantes já cadastrados?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o participante" />
            </SelectTrigger>
            <SelectContent>
              {participants.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssign} disabled={!selectedId}>
              Atribuir Crachá
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
