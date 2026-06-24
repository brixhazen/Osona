import { createFileRoute } from "@tanstack/react-router";
import { BillingModule } from "@/components/billing/BillingModule";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [
    { title: "Billing — Haven OS" },
    { name: "description", content: "Resident statements, payer mix, and accounts receivable workflows." },
  ]}),
  component: BillingModule,
});
