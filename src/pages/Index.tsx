import { Link } from "react-router-dom";
import { ClipboardCheck, Users, CalendarDays, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStats } from "@/lib/store";

const Index = () => {
  const stats = getStats();

  return (
    <div className="bg-gradient-page min-h-full w-full">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold">
            <span className="bg-gradient-brand inline-flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-elegant">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <span className="text-lg">Attendly</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Event Check-in Console
          </h1>
          <p className="text-muted-foreground">
            Register participants, issue QR badges, and scan them at the door.
          </p>
        </header>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            label="Participants"
            value={stats.participants}
            icon={Users}
          />
          <StatCard
            label="Events"
            value={stats.events}
            icon={CalendarDays}
          />
          <StatCard
            label="Check-ins"
            value={stats.totalCheckIns}
            icon={ScanLine}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="shadow-elegant">
            <CardHeader>
              <span className="bg-gradient-brand mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white">
                <Users className="h-5 w-5" />
              </span>
              <CardTitle>Participants</CardTitle>
              <CardDescription>
                Add attendees and generate downloadable QR code badges for
                their tickets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/participants">Manage participants</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <span className="bg-gradient-brand mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white">
                <CalendarDays className="h-5 w-5" />
              </span>
              <CardTitle>Events</CardTitle>
              <CardDescription>
                Create events, review attendance, and launch the QR scanner at
                the door.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/events">Manage events</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <Card className="shadow-elegant">
      <CardContent className="flex flex-col gap-1.5 p-4 sm:p-5">
        <span className="bg-muted inline-flex h-8 w-8 items-center justify-center rounded-lg">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </span>
        <span className="text-2xl font-bold tracking-tight sm:text-3xl">
          {value}
        </span>
        <span className="text-xs font-medium text-muted-foreground sm:text-sm">
          {label}
        </span>
      </CardContent>
    </Card>
  );
}

export default Index;
