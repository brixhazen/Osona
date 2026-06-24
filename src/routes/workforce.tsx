import { createFileRoute } from "@tanstack/react-router";
import { WorkforceModule } from "@/components/workforce/WorkforceModule";

export const Route = createFileRoute("/workforce")({
  head: () => ({ meta: [
    { title: "Workforce — Haven OS" },
    { name: "description", content: "Staffing, scheduling, time-and-attendance, and labor analytics." },
  ]}),
  component: WorkforceModule,
});
