import { createFileRoute } from "@tanstack/react-router";
import { AdmissionsModule } from "@/components/admissions/AdmissionsModule";

export const Route = createFileRoute("/admissions")({
  component: AdmissionsModule,
});
