import { createFileRoute } from "@tanstack/react-router";
import { RosterPage } from "@/components/residents/RosterPage";

export const Route = createFileRoute("/residents/roster")({
  head: () => ({
    meta: [
      { title: "Roster — Haven OS" },
      { name: "description", content: "Full resident census with filters, flags, and chart access." },
    ],
  }),
  component: RosterPage,
});
