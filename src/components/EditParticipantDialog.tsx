import { useEffect, useState } from "react";
import { UserPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Participant, updateParticipant } from "@/lib/store";

interface EditParticipantDialogProps {
  participant: Participant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export default function EditParticipantDialog({
  participant,
  open,
  onOpenChange,
  onSaved,
}: EditParticipantDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && participant) {
      setName(participant.fullName);
      setError(null);
    }
  }, [open, participant]);

  const handleSave = () => {
    if (!participant) return;
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    updateParticipant(participant.id, name);
    toast.success("Participant updated", { description: name.trim() });
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Participant</DialogTitle>
          <DialogDescription>
            Update the participant's full name. Their QR badge stays the same.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="edit-participant-name">Full Name</Label>
          <Input
            id="edit-participant-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <UserPen className="h-4 w-4" /> Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
