import { useMemo } from "react";
import { CalendarCheck2, CalendarX2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  formatDate,
  formatDateTime,
  getParticipantEvents,
  Participant,
} from "@/lib/store";

interface ParticipantDetailsDialogProps {
  participant: Participant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ParticipantDetailsDialog({
  participant,
  open,
  onOpenChange,
}: ParticipantDetailsDialogProps) {
  const records = useMemo(
    () => (participant ? getParticipantEvents(participant.id) : []),
    [participant]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{participant?.fullName}</DialogTitle>
          <DialogDescription>
            {records.length} event{records.length === 1 ? "" : "s"} attended
          </DialogDescription>
        </DialogHeader>

        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <span className="bg-muted inline-flex h-12 w-12 items-center justify-center rounded-full">
              <CalendarX2 className="h-6 w-6 text-muted-foreground" />
            </span>
            <p className="font-medium">No events attended yet</p>
            <p className="text-sm text-muted-foreground">
              This participant hasn't checked into any events.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Checked in</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={`${r.eventId}-${r.checkInTimestamp}`}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      <CalendarCheck2 className="h-4 w-4 text-success" />
                      {r.eventName}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {formatDate(r.eventDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="font-normal">
                      {formatDateTime(r.checkInTimestamp)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
