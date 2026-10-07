import { useMemo } from "react";
import { CheckCircle2, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import {
  Event,
  exportAttendanceCsv,
  formatDateTime,
  getAttendanceForEvent,
} from "@/lib/store";

interface AttendanceDialogProps {
  event: Event;
}

export default function AttendanceDialog({ event }: AttendanceDialogProps) {
  const records = useMemo(() => getAttendanceForEvent(event.id), [event.id]);

  const handleExport = () => {
    exportAttendanceCsv(event, records);
    toast.success("CSV exported", {
      description: `${event.name} · ${records.length} rows`,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4" /> Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <DialogTitle>{event.name}</DialogTitle>
              <DialogDescription>
                {records.length} checked in
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={records.length === 0}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </DialogHeader>

        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <span className="bg-muted inline-flex h-12 w-12 items-center justify-center rounded-full">
              <Users className="h-6 w-6 text-muted-foreground" />
            </span>
            <p className="font-medium">No check-ins yet</p>
            <p className="text-sm text-muted-foreground">
              Use the scanner at the door to check participants in.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead className="text-right">Checked in</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={`${r.eventId}-${r.participantId}`}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      {r.participantName}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDateTime(r.checkInTimestamp)}
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
