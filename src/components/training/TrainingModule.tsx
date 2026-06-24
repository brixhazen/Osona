import { useState, useMemo } from "react";
import {
  STAFF, SESSIONS, COURSES,
  getStaffCompletionPct, getStaffOverdueCount,
  type StaffMember, type TrainingSession, type CertType,
} from "@/lib/mock/training";
import { syncTrainingStaff } from "@/lib/appStore";
import { cn } from "@/lib/utils";
import { AlertTriangle, Award, BookOpen, GraduationCap, Users } from "lucide-react";
import { ModuleHeader } from "@/components/shell/ModuleHeader";
import { StaffProgress } from "./StaffProgress";
import { CourseLibrary } from "./CourseLibrary";
import { Certifications } from "./Certifications";
import { TrainingCalendar } from "./TrainingCalendar";
import { TrainingReports } from "./TrainingReports";

const MODULE_COLOR = "#22D3EE";

const TABS = [
  { id: "staff",    label: "Staff Progress" },
  { id: "courses",  label: "Course Library" },
  { id: "certs",    label: "Certifications" },
  { id: "calendar", label: "Schedule" },
  { id: "reports",  label: "Reports" },
] as const;

type TabId = typeof TABS[number]["id"];

const VARIANT_STYLES = {
  danger: "border-destructive/30 bg-destructive/5 text-destructive",
  warn:   "border-accent/30 bg-accent/5 text-accent",
  ok:     "border-border bg-card text-foreground",
} as const;

export function TrainingModule() {
  const [tab, setTab] = useState<TabId>("staff");
  const [localStaff, setLocalStaff] = useState<StaffMember[]>(
    STAFF.map((s) => ({
      ...s,
      courses: s.courses.map((c) => ({ ...c })),
      certifications: s.certifications.map((cert) => ({ ...cert })),
    })),
  );
  const [localSessions, setLocalSessions] = useState<TrainingSession[]>(
    SESSIONS.map((s) => ({ ...s })),
  );

  // ── Mutations ────────────────────────────────────────────────────────────────

  function markCourseComplete(staffId: string, courseId: string) {
    const courseHours = COURSES.find((c) => c.id === courseId)?.durationHours ?? 0;
    setLocalStaff((prev) => {
      const next = prev.map((s) =>
        s.id !== staffId ? s : {
          ...s,
          inServiceHoursYTD: parseFloat((s.inServiceHoursYTD + courseHours).toFixed(1)),
          courses: s.courses.map((c) =>
            c.courseId !== courseId ? c : {
              ...c,
              status: "completed" as const,
              completedDate: "2026-06-05",
              score: 80,
              dueDate: null,
            },
          ),
        },
      );
      syncTrainingStaff(next);
      return next;
    });
  }

  function logInServiceHours(staffId: string, hours: number) {
    setLocalStaff((prev) => {
      const next = prev.map((s) =>
        s.id !== staffId ? s : {
          ...s,
          inServiceHoursYTD: parseFloat((s.inServiceHoursYTD + hours).toFixed(1)),
        },
      );
      syncTrainingStaff(next);
      return next;
    });
  }

  function enrollInSession(sessionId: string) {
    setLocalSessions((prev) =>
      prev.map((s) =>
        s.id !== sessionId ? s : { ...s, enrolled: Math.min(s.enrolled + 1, s.capacity) },
      ),
    );
  }

  function unenrollFromSession(sessionId: string) {
    setLocalSessions((prev) =>
      prev.map((s) =>
        s.id !== sessionId ? s : { ...s, enrolled: Math.max(0, s.enrolled - 1) },
      ),
    );
  }

  function renewCertification(staffId: string, certType: CertType) {
    setLocalStaff((prev) => {
      const next = prev.map((s) =>
        s.id !== staffId ? s : {
          ...s,
          certifications: s.certifications.map((cert) =>
            cert.type !== certType ? cert : {
              ...cert,
              status: "current" as const,
              issuedDate: "2026-06-05",
              expiryDate: "2028-06-05",
              daysUntilExpiry: 730,
            },
          ),
        },
      );
      syncTrainingStaff(next);
      return next;
    });
  }

  // ── Live KPIs ─────────────────────────────────────────────────────────────────

  const overallCompliancePct = Math.round(
    localStaff.reduce((acc, s) => acc + getStaffCompletionPct(s), 0) / localStaff.length,
  );
  const staffWithOverdue = localStaff.filter((s) => getStaffOverdueCount(s) > 0).length;
  const totalOverdueCourses = localStaff.reduce((acc, s) => acc + getStaffOverdueCount(s), 0);
  const avgInServiceHoursYTD =
    Math.round((localStaff.reduce((acc, s) => acc + s.inServiceHoursYTD, 0) / localStaff.length) * 10) / 10;
  const allCerts = localStaff.flatMap((s) => s.certifications);
  const expiringCerts = allCerts.filter((c) => c.status === "expiring_soon").length;
  const expiredCerts = allCerts.filter((c) => c.status === "expired").length;
  const newHires = localStaff.filter((s) => s.isNewHire).length;
  const upcomingSessions = localSessions.filter((s) => s.status === "upcoming").length;

  const kpiCards = [
    {
      label: "Compliance Rate",
      value: `${overallCompliancePct}%`,
      sub: "overall completion",
      variant: overallCompliancePct >= 80 ? "ok" as const : "warn" as const,
      icon: <GraduationCap size={14} />,
    },
    {
      label: "Staff w/ Overdue",
      value: String(staffWithOverdue),
      sub: `${totalOverdueCourses} total courses`,
      variant: staffWithOverdue > 0 ? "danger" as const : "ok" as const,
      icon: <AlertTriangle size={14} />,
    },
    {
      label: "In-Service Hours",
      value: `${avgInServiceHoursYTD}`,
      sub: `avg of 12 required`,
      variant: avgInServiceHoursYTD >= 12 ? "ok" as const : "warn" as const,
      icon: <BookOpen size={14} />,
    },
    {
      label: "Expiring Certs",
      value: String(expiringCerts + expiredCerts),
      sub: `${expiredCerts} expired · ${expiringCerts} soon`,
      variant: expiredCerts > 0 ? "danger" as const : expiringCerts > 0 ? "warn" as const : "ok" as const,
      icon: <Award size={14} />,
    },
    {
      label: "New Hire Orientation",
      value: String(newHires),
      sub: "staff in progress",
      variant: "ok" as const,
      icon: <Users size={14} />,
    },
  ];

  const tabBadges: Partial<Record<TabId, number>> = {
    staff:    staffWithOverdue,
    certs:    expiredCerts + expiringCerts,
    calendar: upcomingSessions,
  };

  return (
    <div className="flex flex-col gap-4 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Training & LMS"
        description="Staff onboarding, in-service hours, certifications, and compliance training."
        icon={GraduationCap}
        color={MODULE_COLOR}
      />

      {/* KPI bar */}
      <div className="grid grid-cols-5 gap-3">
        {kpiCards.map((k) => (
          <div key={k.label} className={cn("rounded-lg border p-3", VARIANT_STYLES[k.variant])}>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-70 mb-1.5">
              {k.icon}
              {k.label}
            </div>
            <div className="font-display font-bold text-xl leading-none">{k.value}</div>
            <div className="text-[10px] opacity-60 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Alert bar */}
      {staffWithOverdue > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/8 border border-destructive/25 text-[11px]">
          <AlertTriangle size={12} className="text-destructive shrink-0" />
          <span className="font-semibold text-destructive">{staffWithOverdue} staff</span>
          <span className="text-foreground/80">
            have mandatory annual training overdue — {totalOverdueCourses} total overdue courses
          </span>
          <button
            onClick={() => setTab("calendar")}
            className="ml-auto text-destructive font-medium hover:underline underline-offset-2 shrink-0"
          >
            View Schedule →
          </button>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-border gap-1">
        {TABS.map((t) => {
          const badge = tabBadges[t.id] ?? null;
          const isDanger = t.id === "staff";
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                tab === t.id
                  ? "border-b-2"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
              style={tab === t.id ? { borderColor: MODULE_COLOR, color: MODULE_COLOR } : {}}
            >
              {t.label}
              {badge !== null && badge > 0 && (
                <span className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded-full border",
                  isDanger
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-accent/10 text-accent border-accent/20",
                )}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {tab === "staff" && (
          <StaffProgress
            staff={localStaff}
            onMarkCourseComplete={markCourseComplete}
            onLogHours={logInServiceHours}
          />
        )}
        {tab === "courses" && (
          <CourseLibrary staff={localStaff} />
        )}
        {tab === "certs" && (
          <Certifications
            staff={localStaff}
            onRenewCert={renewCertification}
          />
        )}
        {tab === "calendar" && (
          <TrainingCalendar
            sessions={localSessions}
            onEnroll={enrollInSession}
            onUnenroll={unenrollFromSession}
          />
        )}
        {tab === "reports" && <TrainingReports />}
      </div>
    </div>
  );
}
