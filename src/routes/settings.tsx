import { createFileRoute } from "@tanstack/react-router";
import { SettingsModule } from "@/components/settings/SettingsModule";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings — Haven OS" },
    { name: "description", content: "Manage your Haven OS account, subscription, and team." },
  ]}),
  component: SettingsModule,
});
