import { useState } from "react";
import { cn } from "@/lib/utils";
import { TodayView } from "./TodayView";
import { ActivityCalendar } from "./ActivityCalendar";
import { ResidentEngagement } from "./ResidentEngagement";
import { FamilyPortal } from "./FamilyPortal";
import { EngagementReports } from "./EngagementReports";
import { COMMUNITY_METRICS, RESIDENT_PROFILES, FAMILY_ACCOUNTS } from "@/lib/mock/engagement";
import { AlertTriangle, Users, Heart, Calendar, Star } from "lucide-react";
import { ModuleHeader } from "@/components/shell/ModuleHeader";

const MODULE_COLOR = "#C084FC";

type Tab = "today" | "calendar" | "residents" | "family" | "reports";

const TABS: { id: Tab; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "calendar", label: "Calendar" },
  { id: "residents", label: "Residents" },
  { id: "family", label: "Family Portal" },
  { id: "reports", label: "Reports" },
];

export function EngagementModule() {
  const [tab, setTab] = useState<Tab>("today");

  const criticalCount = RESIDENT_PROFILES.filter((r) => r.riskLevel === "critical").length;
  const atRiskCount = RESIDENT_PROFILES.filter((r) => r.riskLevel === "at_risk").length;
  const flaggedFamilies = FAMILY_ACCOUNTS.filter((f) => f.flagged).length;

  return (
    <div className="flex flex-col gap-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Resident Engagement"
        description="Activity programming, family communication, and resident wellbeing tracking."
        icon={Heart}
        color={MODULE_COLOR}
      />
      {/* KPI bar */}
      <div className="grid grid-cols-5 gap-3">
        <KpiCard icon={<Heart size={14} />} label="Participation Rate" value={`${COMMUNITY_METRICS.participationRate}%`} sub="of residents this week" tone="ok" />
        <KpiCard icon={<Calendar size={14} />} label="Programs Today" value={String(COMMUNITY_METRICS.totalActivitiesToday)} sub="across all domains" />
        <KpiCard
          icon={<AlertTriangle size={14} />}
          label="At-Risk Residents"
          value={`${criticalCount} critical · ${atRiskCount} watch`}
          sub="engagement declining"
          tone={criticalCount > 0 ? "danger" : "warn"}
        />
        <KpiCard icon={<Users size={14} />} label="Family Portal" value={`${COMMUNITY_METRICS.familyPortalActive}/87`} sub={`avg login ${COMMUNITY_METRICS.avgFamilyLastLogin} days ago`} />
        <KpiCard icon={<Star size={14} />} label="Avg Quality" value={`${COMMUNITY_METRICS.qualityDistribution.excellent + COMMUNITY_METRICS.qualityDistribution.good}% Good+`} sub={`${COMMUNITY_METRICS.preferenceMatchRate}% preference match`} tone="ok" />
      </div>

      {/* Alert bar */}
      {(criticalCount > 0 || flaggedFamilies > 0) && (
        <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5">
          <AlertTriangle size={14} className="text-destructive shrink-0" />
          <span className="text-sm">
            {criticalCount > 0 && (
              <span className="text-destructive font-medium">{criticalCount} resident{criticalCount !== 1 ? "s" : ""} in critical engagement decline</span>
            )}
            {criticalCount > 0 && flaggedFamilies > 0 && <span className="text-muted-foreground"> · </span>}
            {flaggedFamilies > 0 && (
              <span className="text-accent font-medium">{flaggedFamilies} family account{flaggedFamilies !== 1 ? "s" : ""} need attention</span>
            )}
          </span>
          <button
            onClick={() => setTab(criticalCount > 0 ? "residents" : "family")}
            className="ml-auto text-xs text-destructive hover:text-destructive/80 font-medium"
          >
            {criticalCount > 0 ? "View At-Risk →" : "View Family Portal →"}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.id
                ? "border-b-2"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            style={tab === t.id ? { borderColor: MODULE_COLOR, color: MODULE_COLOR } : {}}
          >
            {t.label}
            {t.id === "residents" && criticalCount > 0 && (
              <span className="ml-1.5 text-[10px] bg-destructive/10 text-destructive px-1 py-0.5 rounded font-mono">
                {criticalCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "today" && <TodayView />}
      {tab === "calendar" && <ActivityCalendar />}
      {tab === "residents" && <ResidentEngagement />}
      {tab === "family" && <FamilyPortal />}
      {tab === "reports" && <EngagementReports />}
    </div>
  );
}

function KpiCard({ icon, label, value, sub, tone }: {
  icon: React.ReactNode; label: string; value: string; sub: string; tone?: "ok" | "warn" | "danger";
}) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-4",
      tone === "danger" ? "border-destructive/30" : tone === "warn" ? "border-accent/30" : "border-border",
    )}>
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className={cn(
        "text-lg font-semibold leading-tight",
        tone === "danger" ? "text-destructive" : tone === "warn" ? "text-accent" : "text-foreground",
      )}>
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}
