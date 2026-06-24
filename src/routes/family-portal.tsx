import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { FamilyPortal } from "@/components/engagement/FamilyPortal";
import { ModuleHeader } from "@/components/shell/ModuleHeader";

const MODULE_COLOR = "#C084FC";

function FamilyPortalPage() {
  return (
    <div className="flex flex-col gap-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Family Portal"
        description="Family accounts, notifications, and volunteer coordination."
        icon={Users}
        color={MODULE_COLOR}
      />
      <FamilyPortal />
    </div>
  );
}

export const Route = createFileRoute("/family-portal")({
  head: () => ({
    meta: [
      { title: "Family Portal — Haven OS" },
      { name: "description", content: "Family communication and volunteer coordination." },
    ],
  }),
  component: FamilyPortalPage,
});