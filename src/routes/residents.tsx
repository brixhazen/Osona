import { createFileRoute } from "@tanstack/react-router";
import { ClinicalModule } from "@/components/clinical/ClinicalModule";

export const Route = createFileRoute("/residents")({
  head: () => ({
    meta: [
      { title: "Residents — Haven OS" },
      { name: "description", content: "Resident charts, vitals, ADLs, and clinical documentation." },
    ],
  }),
  component: ClinicalModule,
});