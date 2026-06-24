import { createFileRoute } from "@tanstack/react-router";
import { AdmissionsPage } from "@/components/residents/AdmissionsPage";

export const Route = createFileRoute("/residents/admissions")({
  head: () => ({
    meta: [
      { title: "Admissions — Haven OS" },
      { name: "description", content: "Move-in packets, e-signatures, and onboarding documents." },
    ],
  }),
  component: AdmissionsPage,
});
