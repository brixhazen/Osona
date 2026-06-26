import { createFileRoute, useSearch } from "@tanstack/react-router";
import { ClipboardList, CalendarDays, AlertCircle, LayoutTemplate } from "lucide-react";
import { ModuleHeader } from "@/components/shell/ModuleHeader";
import { PlanBuilder } from "@/components/care-plans/PlanBuilder";
import { ComingSoon } from "@/components/shell/ComingSoon";

const MODULE_COLOR = "#2BBFAA";

function CarePlansPage() {
  const search = useSearch({ strict: false }) as { tab?: string };
  const activeTab = search.tab ?? "builder";

  return (
    <div className="flex flex-col gap-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Care Plans"
        description="Build and manage resident care plans, goals, and interventions."
        icon={ClipboardList}
        color={MODULE_COLOR}
      />
      {activeTab === "builder"   && <PlanBuilder />}
      {activeTab === "schedule"  && (
        <ComingSoon
          title="Review Schedule"
          icon={CalendarDays}
          blurb="Upcoming care plan reviews and overdue assessments across all residents."
        />
      )}
      {activeTab === "tracker"   && (
        <ComingSoon
          title="Active Problems"
          icon={AlertCircle}
          blurb="A facility-wide view of open care plan problems by category and priority."
        />
      )}
      {activeTab === "templates" && (
        <ComingSoon
          title="Templates"
          icon={LayoutTemplate}
          blurb="Reusable care plan templates and goal banks for common diagnoses."
        />
      )}
    </div>
  );
}

export const Route = createFileRoute("/care-plans")({
  head: () => ({
    meta: [
      { title: "Care Plans — Haven OS" },
      { name: "description", content: "Build and manage resident care plans, goals, and interventions." },
    ],
  }),
  component: CarePlansPage,
});
