import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Participants from "./pages/Participants";
import Events from "./pages/Events";
import Scanner from "./pages/Scanner";

export const routers = [
  {
    path: "/",
    name: "home",
    element: <Index />,
  },
  {
    path: "/participants",
    name: "participants",
    element: <Participants />,
  },
  {
    path: "/events",
    name: "events",
    element: <Events />,
  },
  {
    path: "/scanner/:eventId",
    name: "scanner",
    element: <Scanner />,
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
