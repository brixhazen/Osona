import {
  WORK_ORDERS, PM_TASKS, ASSETS,
  type WorkOrder,
} from "./mock/maintenance";
import {
  STAFF,
  getStaffCompletionPct, getStaffOverdueCount,
} from "./mock/training";
import {
  TODAY_SHIFTS, OPEN_SHIFTS,
  calcPPD, calcTodayHours,
  CENSUS_TODAY, PPD_TARGET, PPD_MINIMUM,
  type DailyShift, type OpenShift, type ShiftPeriod,
} from "./mock/workforce";
import {
  INCIDENTS, READINESS_DOMAINS, QAPI_INDICATORS,
  type Incident, type ReadinessDomainGroup,
} from "./mock/compliance";
import {
  LEADS, SCHEDULED_TOURS, RATE_ESTIMATES,
  type Lead, type ScheduledTour,
} from "./mock/crm";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EmergencyWO {
  id: string;
  title: string;
  location: string;
  assignedTo: string | null;
}

export interface MaintenanceMetrics {
  openWorkOrders: number;
  emergencyOpen: number;
  emergencyList: EmergencyWO[];
  pmCompletionPct: number;
  assetsNeedingService: number;
}

export interface TrainingMetrics {
  compliancePct: number;
  staffWithOverdue: number;
  expiredCerts: number;
  expiringCerts: number;
}

export interface WorkforceMetrics {
  openSlots: number;
  scheduledSlots: number;
  openShiftsCount: number;
  ppd: number;
  ppdStatus: "ok" | "warn" | "danger";
  shiftSummary: Array<{ period: ShiftPeriod; filled: number; total: number }>;
}

export interface ComplianceMetrics {
  readinessScore: number;
  openIncidents: number;
  statePending: number;
  qapiAlerts: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveMaintenanceMetrics(wos: WorkOrder[]): Omit<MaintenanceMetrics, "pmCompletionPct" | "assetsNeedingService"> {
  const open = wos.filter((wo) => wo.status !== "completed");
  const emergency = open.filter((wo) => wo.priority === "emergency");
  return {
    openWorkOrders: open.length,
    emergencyOpen: emergency.length,
    emergencyList: emergency.map((wo) => ({
      id: wo.id,
      title: wo.title,
      location: wo.location,
      assignedTo: wo.assignedTo,
    })),
  };
}

function deriveWorkforceMetrics(shifts: DailyShift[], openShifts: OpenShift[]): WorkforceMetrics {
  const allSlots = shifts.flatMap((s) => s.slots);
  const scheduledSlots = allSlots.filter((sl) => sl.status === "scheduled").length;
  const openSlots = allSlots.filter((sl) => sl.status === "open" || sl.status === "called_out").length;
  const { scheduled: scheduledHours } = calcTodayHours(shifts);
  const ppd = calcPPD(CENSUS_TODAY, scheduledHours);
  const ppdStatus: WorkforceMetrics["ppdStatus"] =
    ppd < PPD_MINIMUM ? "danger" : ppd < PPD_TARGET ? "warn" : "ok";
  return {
    openSlots,
    scheduledSlots,
    openShiftsCount: openShifts.length,
    ppd,
    ppdStatus,
    shiftSummary: shifts.map((s) => ({
      period: s.period,
      filled: s.slots.filter((sl) => sl.status === "scheduled").length,
      total: s.slots.length,
    })),
  };
}

function deriveComplianceMetrics(
  incidents: Incident[],
  indicators: typeof QAPI_INDICATORS,
  domains: ReadinessDomainGroup[],
): ComplianceMetrics {
  const allItems = domains.flatMap((d) => d.items);
  return {
    readinessScore: Math.round(
      allItems.reduce(
        (s, i) => s + (i.status === "complete" ? 100 : i.status === "needs_attention" ? 60 : 0),
        0,
      ) / allItems.length,
    ),
    openIncidents: incidents.filter((i) => i.status !== "closed").length,
    statePending: incidents.filter(
      (i) => i.stateReportable && !i.stateReportedDate && i.status !== "closed",
    ).length,
    qapiAlerts: indicators.filter((q) => q.inAlert).length,
  };
}

// ── Maintenance store ─────────────────────────────────────────────────────────

const _initOpen = WORK_ORDERS.filter((wo) => wo.status !== "completed");
const _initEmergency = _initOpen.filter((wo) => wo.priority === "emergency");

let _maintenance: MaintenanceMetrics = {
  openWorkOrders: _initOpen.length,
  emergencyOpen: _initEmergency.length,
  emergencyList: _initEmergency.map((wo) => ({
    id: wo.id,
    title: wo.title,
    location: wo.location,
    assignedTo: wo.assignedTo,
  })),
  pmCompletionPct: Math.round(
    PM_TASKS.filter((t) => t.status === "current").length / PM_TASKS.length * 100,
  ),
  assetsNeedingService: ASSETS.filter(
    (a) => a.serviceStatus === "overdue" || a.serviceStatus === "due_soon",
  ).length,
};

export function getMaintenanceMetrics(): MaintenanceMetrics {
  return { ..._maintenance, emergencyList: [..._maintenance.emergencyList] };
}

export function syncMaintenanceWOs(wos: WorkOrder[]): void {
  const derived = deriveMaintenanceMetrics(wos);
  _maintenance = { ..._maintenance, ...derived };
}

export function syncMaintenancePM(currentCount: number, total: number): void {
  _maintenance = { ..._maintenance, pmCompletionPct: Math.round((currentCount / total) * 100) };
}

export function syncMaintenanceAssets(needingService: number): void {
  _maintenance = { ..._maintenance, assetsNeedingService: needingService };
}

// ── Training store ────────────────────────────────────────────────────────────

const _initAllCerts = STAFF.flatMap((s) => s.certifications);

let _training: TrainingMetrics = {
  compliancePct: Math.round(
    STAFF.reduce((acc, s) => acc + getStaffCompletionPct(s), 0) / STAFF.length,
  ),
  staffWithOverdue: STAFF.filter((s) => getStaffOverdueCount(s) > 0).length,
  expiredCerts: _initAllCerts.filter((c) => c.status === "expired").length,
  expiringCerts: _initAllCerts.filter((c) => c.status === "expiring_soon").length,
};

export function getTrainingMetrics(): TrainingMetrics {
  return { ..._training };
}

export function syncTrainingStaff(staff: typeof STAFF): void {
  const allCerts = staff.flatMap((s) => s.certifications);
  _training = {
    compliancePct: Math.round(
      staff.reduce((acc, s) => acc + getStaffCompletionPct(s), 0) / staff.length,
    ),
    staffWithOverdue: staff.filter((s) => getStaffOverdueCount(s) > 0).length,
    expiredCerts: allCerts.filter((c) => c.status === "expired").length,
    expiringCerts: allCerts.filter((c) => c.status === "expiring_soon").length,
  };
}

// ── Workforce store ───────────────────────────────────────────────────────────

let _workforce: WorkforceMetrics = deriveWorkforceMetrics(TODAY_SHIFTS, OPEN_SHIFTS);

export function getWorkforceMetrics(): WorkforceMetrics {
  return { ..._workforce, shiftSummary: [..._workforce.shiftSummary] };
}

export function syncWorkforceShifts(shifts: DailyShift[]): void {
  const allSlots = shifts.flatMap((s) => s.slots);
  const scheduledHours = calcTodayHours(shifts).scheduled;
  const ppd = calcPPD(CENSUS_TODAY, scheduledHours);
  _workforce = {
    ..._workforce,
    scheduledSlots: allSlots.filter((sl) => sl.status === "scheduled").length,
    openSlots: allSlots.filter((sl) => sl.status === "open" || sl.status === "called_out").length,
    ppd,
    ppdStatus: ppd < PPD_MINIMUM ? "danger" : ppd < PPD_TARGET ? "warn" : "ok",
    shiftSummary: shifts.map((s) => ({
      period: s.period,
      filled: s.slots.filter((sl) => sl.status === "scheduled").length,
      total: s.slots.length,
    })),
  };
}

export function syncWorkforceOpenShifts(count: number): void {
  _workforce = { ..._workforce, openShiftsCount: count };
}

// ── Compliance store ──────────────────────────────────────────────────────────

let _compliance: ComplianceMetrics = deriveComplianceMetrics(
  INCIDENTS, QAPI_INDICATORS, READINESS_DOMAINS,
);

export function getComplianceMetrics(): ComplianceMetrics {
  return { ..._compliance };
}

export function syncComplianceIncidents(openIncidents: number, statePending: number): void {
  _compliance = { ..._compliance, openIncidents, statePending };
}

export function syncComplianceQapi(qapiAlerts: number): void {
  _compliance = { ..._compliance, qapiAlerts };
}

export function syncComplianceSurvey(readinessScore: number): void {
  _compliance = { ..._compliance, readinessScore };
}

export function syncClinicalIncidentAdded(stateReportable: boolean): void {
  _compliance = {
    ..._compliance,
    openIncidents: _compliance.openIncidents + 1,
    statePending: stateReportable ? _compliance.statePending + 1 : _compliance.statePending,
  };
}

// ── CRM store ─────────────────────────────────────────────────────────────────

export interface CrmMetrics {
  activeLeads: number;
  pipelineValue: number;
  overdueFollowUps: number;
  depositsCount: number;
  toursScheduled: number;
}

function deriveCrmMetrics(leads: Lead[], tours: ScheduledTour[]): CrmMetrics {
  const today = new Date().toISOString().slice(0, 10);
  const active = leads.filter((l) => !["moved_in", "lost"].includes(l.stage));
  return {
    activeLeads: active.length,
    pipelineValue: active.reduce((sum, l) => sum + RATE_ESTIMATES[l.careInterest], 0),
    overdueFollowUps: active.filter((l) => !!l.followUpDate && l.followUpDate < today).length,
    depositsCount: leads.filter((l) => l.stage === "deposit").length,
    toursScheduled: tours.filter((t) => t.status === "scheduled").length,
  };
}

let _crm: CrmMetrics = deriveCrmMetrics(LEADS, SCHEDULED_TOURS);

export function getCrmMetrics(): CrmMetrics { return { ..._crm }; }

export function syncCrmData(leads: Lead[], tours: ScheduledTour[]): void {
  _crm = deriveCrmMetrics(leads, tours);
}
