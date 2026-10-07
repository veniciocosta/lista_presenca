import { useState } from "react";
import { Pencil, QrCode, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteParticipant,
  loadAttendance,
  loadParticipants,
  Participant,
} from "@/lib/store";
import AppHeader from "@/components/AppHeader";
import AddParticipantForm from "@/components/AddParticipantForm";
import ParticipantBadge from "@/components/ParticipantBadge";
import ParticipantDetailsDialog from "@/components/ParticipantDetailsDialog";
import EditParticipantDialog from "@/components/EditParticipantDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

export default function Participants() {
  const [participants, setParticipants] = useState<Participant[]>(() =>
    loadParticipants()
  );
  const [badgeTarget, setBadgeTarget] = useState<Participant | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Participant | null>(null);
  const [editTarget, setEditTarget] = useState<Participant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Participant | null>(null);

  const refresh = () => setParticipants(loadParticipants());

  // Total events attended per participant (single pass over attendance)
  const attendedCounts = new Map<string, number>();
  for (const a of loadAttendance()) {
    attendedCounts.set(a.participantId, (attendedCounts.get(a.participantId) ?? 0) + 1);
  }

  const handleDelete = () => {
    if (!deleteTarget) return;
    // Cascade delete: attendance records for this participant are removed too
    deleteParticipant(deleteTarget.id);
    refresh();
  };

  return (
    <div className="bg-gradient-page min-h-full w-full">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Participants</h1>
          <p className="text-muted-foreground">
            Register attendees, generate their QR badges, and view their event
            history.
          </p>
        </div>

        <AddParticipantForm onAdded={refresh} />

        <div>
          <h2 className="mb-3 text-lg font-semibold">
            Registered Participants{" "}
            <span className="text-muted-foreground">({participants.length})</span>
          </h2>

          {participants.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card py-16 text-center">
              <span className="bg-muted inline-flex h-12 w-12 items-center justify-center rounded-full">
                <Users className="h-6 w-6 text-muted-foreground" />
              </span>
              <p className="font-medium">No participants yet</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Add your first participant above to generate their QR badge.
              </p>
            </div>
          ) : (
            <Card className="shadow-elegant">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        QR Badge
                      </TableHead>
                      <TableHead>Events Attended</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant) => (
                      <TableRow
                        key={participant.id}
                        onClick={() => setDetailsTarget(participant)}
                        className="cursor-pointer"
                      >
                        <TableCell className="whitespace-nowrap font-medium">
                          {participant.fullName}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <QrCode className="h-4 w-4" />
                            {participant.id.slice(0, 13)}…
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {attendedCounts.get(participant.id) ?? 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className="flex justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="outline"
                              size="icon"
                              title="Edit participant"
                              onClick={() => setEditTarget(participant)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              title="View badge"
                              onClick={() => setBadgeTarget(participant)}
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              title="Delete participant"
                              onClick={() => setDeleteTarget(participant)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* QR badge dialog */}
      <Dialog
        open={!!badgeTarget}
        onOpenChange={(open) => !open && setBadgeTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{badgeTarget?.fullName}</DialogTitle>
            <DialogDescription>
              Share this QR badge with the participant, or download it as an
              image.
            </DialogDescription>
          </DialogHeader>
          {badgeTarget && <ParticipantBadge participant={badgeTarget} />}
        </DialogContent>
      </Dialog>

      {/* Analytics: events attended */}
      <ParticipantDetailsDialog
        participant={detailsTarget}
        open={!!detailsTarget}
        onOpenChange={(open) => !open && setDetailsTarget(null)}
      />

      {/* Edit */}
      <EditParticipantDialog
        participant={editTarget}
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onSaved={refresh}
      />

      {/* Delete with cascade confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.fullName ?? ""}?`}
        description="This will permanently remove the participant and delete all of their attendance records."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
