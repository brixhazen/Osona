import { createFileRoute } from "@tanstack/react-router";
import { ClinicalModule } from "@/components/clinical/ClinicalModule";

export const Route = createFileRoute("/clinical")({
  head: () => ({
    meta: [
      { title: "Clinical — Haven OS" },
      { name: "description", content: "Resident charts, vitals, ADLs, and clinical documentation." },
    ],
  }),
  component: ClinicalModule,
});
