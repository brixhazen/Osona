import { createFileRoute } from "@tanstack/react-router";
import { CrmModule } from "@/components/crm/CrmModule";

export const Route = createFileRoute("/crm")({
  head: () => ({
    meta: [
      { title: "CRM / Sales — Haven OS" },
      { name: "description", content: "Lead pipeline, tour scheduling, and family communications for census growth." },
    ],
  }),
  component: CrmModule,
});
