import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { ActivityCalendar } from "@/components/engagement/ActivityCalendar";
import { ModuleHeader } from "@/components/shell/ModuleHeader";

const MODULE_COLOR = "#C084FC";

function ActivitiesPage() {
  return (
    <div className="flex flex-col gap-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Activities"
        description="Activity programming and community event calendar."
        icon={Calendar}
        color={MODULE_COLOR}
      />
      <ActivityCalendar />
    </div>
  );
}

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "Activities — Haven OS" },
      { name: "description", content: "Activity programming and community calendar." },
    ],
  }),
  component: ActivitiesPage,
});