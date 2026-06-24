import { createFileRoute } from "@tanstack/react-router";
import { EngagementModule } from "@/components/engagement/EngagementModule";

export const Route = createFileRoute("/engagement")({
  head: () => ({ meta: [
    { title: "Resident Engagement — Haven OS" },
    { name: "description", content: "Activity calendar, family portal, and resident wellbeing tracking." },
  ]}),
  component: EngagementModule,
});
