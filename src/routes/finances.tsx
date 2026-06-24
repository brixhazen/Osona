import { createFileRoute } from "@tanstack/react-router";
import { FinancesModule } from "@/components/finances/FinancesModule";

export const Route = createFileRoute("/finances")({
  head: () => ({ meta: [
    { title: "Finances — Haven OS" },
    { name: "description", content: "QuickBooks-connected P&L, expense tracking, and accounts receivable." },
  ]}),
  component: FinancesModule,
});
