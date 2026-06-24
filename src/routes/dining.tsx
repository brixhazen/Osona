import { createFileRoute } from "@tanstack/react-router";
import { DiningModule } from "@/components/dining/DiningModule";

export const Route = createFileRoute("/dining")({
  head: () => ({ meta: [
    { title: "Dining — Haven OS" },
    { name: "description", content: "Menu planning, dietary restrictions, and food service operations." },
  ]}),
  component: DiningModule,
});
