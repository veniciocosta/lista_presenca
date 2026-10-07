import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Pencil, ScanLine, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteEvent,
  Event,
  formatDate,
  getCheckInCount,
  loadEvents,
} from "@/lib/store";
import AppHeader from "@/components/AppHeader";
import CreateEventForm from "@/components/CreateEventForm";
import AttendanceDialog from "@/components/AttendanceDialog";
import EditEventDialog from "@/components/EditEventDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

export default function Events() {
  const [events, setEvents] = useState<Event[]>(() => loadEvents());
  const [editTarget, setEditTarget] = useState<Event | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);

  const refresh = () => setEvents(loadEvents());

  const handleDelete = () => {
    if (!deleteTarget) return;
    // Cascade delete: attendance records for this event are removed too
    deleteEvent(deleteTarget.id);
    refresh();
  };

  return (
    <div className="bg-gradient-page min-h-full w-full">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Create events and scan QR badges at the door.
          </p>
        </div>

        <CreateEventForm onCreated={refresh} />

        <div>
          <h2 className="mb-3 text-lg font-semibold">
            Events <span className="text-muted-foreground">({events.length})</span>
          </h2>

          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card py-16 text-center">
              <span className="bg-muted inline-flex h-12 w-12 items-center justify-center rounded-full">
                <CalendarDays className="h-6 w-6 text-muted-foreground" />
              </span>
              <p className="font-medium">No events yet</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Create an event above to start scanning participants in.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop table */}
              <div className="hidden md:block">
                <Card className="shadow-elegant">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Checked in</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((event) => (
                          <EventRow
                            key={event.id}
                            event={event}
                            onEdit={setEditTarget}
                            onDelete={setDeleteTarget}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Mobile cards */}
              <div className="grid gap-4 md:hidden">
                {events.map((event) => (
                  <MobileEventCard
                    key={event.id}
                    event={event}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <EditEventDialog
        event={editTarget}
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onSaved={refresh}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name ?? ""}?`}
        description="This will permanently remove the event and all of its attendance records."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}

interface RowHandlers {
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

function EventRow({ event, onEdit, onDelete }: RowHandlers & { event: Event }) {
  const count = getCheckInCount(event.id);
  return (
    <TableRow>
      <TableCell className="font-medium">{event.name}</TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(event.date)}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{count}</Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1.5">
          <Button
            variant="outline"
            size="icon"
            title="Edit event"
            onClick={() => onEdit(event)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AttendanceDialog event={event} />
          <Button asChild size="sm" className="bg-gradient-brand text-white">
            <Link to={`/scanner/${event.id}`}>
              <ScanLine className="h-4 w-4" /> Start Scanner
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-destructive hover:text-destructive"
            title="Delete event"
            onClick={() => onDelete(event)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function MobileEventCard({
  event,
  onEdit,
  onDelete,
}: RowHandlers & { event: Event }) {
  const count = getCheckInCount(event.id);
  return (
    <Card className="shadow-elegant">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg">{event.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant="secondary" className="whitespace-nowrap">
          {count} checked in
        </Badge>
        <div className="flex flex-wrap items-center gap-2">
          <AttendanceDialog event={event} />
          <Button asChild size="sm" className="bg-gradient-brand text-white">
            <Link to={`/scanner/${event.id}`}>
              <ScanLine className="h-4 w-4" /> Start Scanner
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-xs text-muted-foreground">Manage event</span>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="icon"
              title="Edit event"
              onClick={() => onEdit(event)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:text-destructive"
              title="Delete event"
              onClick={() => onDelete(event)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
