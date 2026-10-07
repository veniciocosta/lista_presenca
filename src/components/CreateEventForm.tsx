import { useState } from "react";
import { CalendarPlus, CalendarDays } from "lucide-react";
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
import { addEvent, Event } from "@/lib/store";

interface CreateEventFormProps {
  onCreated?: (event: Event) => void;
}

export default function CreateEventForm({ onCreated }: CreateEventFormProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !date) {
      setError("Please fill in the event name and date.");
      return;
    }

    const event = addEvent(name, date);
    toast.success("Event created", { description: event.name });
    setName("");
    setDate("");
    onCreated?.(event);
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="bg-gradient-brand inline-flex h-9 w-9 items-center justify-center rounded-lg text-white">
            <CalendarPlus className="h-5 w-5" />
          </span>
          <div>
            <CardTitle>Create Event</CardTitle>
            <CardDescription>
              e.g. "Day 1 - Morning Session"
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <div className="grid gap-2">
            <Label htmlFor="event-name">Event Name</Label>
            <Input
              id="event-name"
              placeholder="e.g. Day 1 - Morning Session"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-date">Date</Label>
            <Input
              id="event-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            <CalendarDays className="h-4 w-4" /> Create
          </Button>
        </form>
        {error && (
          <p className="mt-3 text-sm font-medium text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
