import { createFileRoute } from "@tanstack/react-router";
import { ComplianceModule } from "@/components/compliance/ComplianceModule";

export const Route = createFileRoute("/compliance")({
  head: () => ({ meta: [
    { title: "Compliance — Haven OS" },
    { name: "description", content: "Survey readiness, incident reporting, and regulatory documentation." },
  ]}),
  component: ComplianceModule,
});
