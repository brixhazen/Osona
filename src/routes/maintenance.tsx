import { createFileRoute } from "@tanstack/react-router";
import { MaintenanceModule } from "@/components/maintenance/MaintenanceModule";

export const Route = createFileRoute("/maintenance")({
  head: () => ({ meta: [
    { title: "Maintenance — Haven OS" },
    { name: "description", content: "Work orders, preventive maintenance, and facility lifecycle tracking." },
  ]}),
  component: MaintenanceModule,
});
