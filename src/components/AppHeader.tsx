import { Link, NavLink } from "react-router-dom";
import { ClipboardCheck, Users, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/participants", label: "Participants", icon: Users },
  { to: "/events", label: "Events", icon: CalendarDays },
];

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="bg-gradient-brand inline-flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-elegant">
            <ClipboardCheck className="h-4 w-4" />
          </span>
          <span className="hidden text-base sm:block">Attendly</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
