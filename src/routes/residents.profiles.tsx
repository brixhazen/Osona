import { createFileRoute } from "@tanstack/react-router";
import { ProfilesPage } from "@/components/residents/ProfilesPage";

export const Route = createFileRoute("/residents/profiles")({
  head: () => ({
    meta: [
      { title: "Profiles — Haven OS" },
      { name: "description", content: "Resident administrative profiles, contacts, and payer information." },
    ],
  }),
  component: ProfilesPage,
});
