import { useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addParticipant, Participant } from "@/lib/store";

interface AddParticipantFormProps {
  onAdded?: (participant: Participant) => void;
}

export default function AddParticipantForm({
  onAdded,
}: AddParticipantFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter the participant's full name.");
      return;
    }

    const participant = addParticipant(name);
    toast.success(`${participant.fullName} added`, {
      description: "A QR badge was generated for this participant.",
    });
    setName("");
    onAdded?.(participant);
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="bg-gradient-brand inline-flex h-9 w-9 items-center justify-center rounded-lg text-white">
            <UserPlus className="h-5 w-5" />
          </span>
          <div>
            <CardTitle>Add Participant</CardTitle>
            <CardDescription>
              Each participant gets a unique QR code badge.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid w-full gap-2">
            <Label htmlFor="participant-name">Full Name</Label>
            <Input
              id="participant-name"
              placeholder="e.g. Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            <Users className="h-4 w-4" /> Add
          </Button>
        </form>
        {error && (
          <p className="mt-3 text-sm font-medium text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
