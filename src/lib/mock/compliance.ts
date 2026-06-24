// ── Types ─────────────────────────────────────────────────────────────────────

export type IncidentType =
  | "fall" | "medication_error" | "elopement" | "altercation"
  | "injury_unknown" | "abuse_allegation" | "hospitalization" | "environmental";

export type IncidentSeverity = 1 | 2 | 3;

export type IncidentStatus =
  | "reported" | "investigating" | "awaiting_family" | "state_reported"
  | "care_plan_updated" | "closed";

export type DeficiencyStatus = "open" | "in_progress" | "submitted" | "accepted";
export type DeficiencySeverity = "A" | "B" | "C" | "D" | "E" | "F";
export type DeficiencyScope = "isolated" | "pattern" | "widespread";

export type QapiTrend = "improving" | "stable" | "worsening";

export type RegulatoryCategory = "staffing" | "safety" | "clinical" | "administrative" | "training";
export type RegulatoryStatus = "upcoming" | "due_soon" | "overdue" | "completed";

export type ReadinessDomain =
  | "resident_rights" | "assessment_care_plan" | "medication" | "staffing"
  | "physical_environment" | "infection_control" | "activities" | "staff_training";

export interface IncidentWorkflowStep {
  key: IncidentStatus;
  label: string;
}

export interface IncidentCorrectionAction {
  action: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
}

export interface Incident {
  id: string;
  type: IncidentType;
  residentName: string;
  residentRoom: string;
  date: string;
  time: string;
  reportedBy: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: string;
  description: string;
  injuries: string;
  witnesses: string[];
  immediateActions: string;
  stateReportable: boolean;
  stateReportDeadline?: string;
  stateReportedDate?: string;
  familyNotified: boolean;
  familyNotifiedDate?: string;
  physicianNotified: boolean;
  rootCause?: string;
  correctiveActions: IncidentCorrectionAction[];
  carePlanUpdated: boolean;
  closedDate?: string;
  closedBy?: string;
}

export interface Deficiency {
  id: string;
  surveyDate: string;
  tag: string;
  category: string;
  description: string;
  scope: DeficiencyScope;
  severity: DeficiencySeverity;
  status: DeficiencyStatus;
  pocDeadline: string;
  pocSubmittedDate?: string;
  pocAcceptedDate?: string;
  owner: string;
  pocSummary: string;
}

export interface QapiHistoryPoint {
  month: string;
  value: number;
}

export interface QapiPipIntervention {
  text: string;
  completed: boolean;
}

export interface QapiIndicator {
  id: string;
  name: string;
  value: number;
  unit: string;
  benchmark: number;
  target: number;
  trend: QapiTrend;
  history: QapiHistoryPoint[];
  inAlert: boolean;
  description: string;
}

export interface QapiPip {
  id: string;
  title: string;
  openedDate: string;
  targetDate: string;
  lead: string;
  goal: string;
  baselineValue: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  interventions: QapiPipIntervention[];
  status: "active" | "completed" | "on_hold";
}

export interface QapiMeeting {
  date: string;
  attendees: string[];
  highlights: string[];
}

export interface RegulatoryEvent {
  id: string;
  title: string;
  category: RegulatoryCategory;
  dueDate: string;
  responsible: string;
  status: RegulatoryStatus;
  notes?: string;
  recurring: "monthly" | "quarterly" | "annual" | "biennial" | "one_time";
}

export interface ReadinessItem {
  id: string;
  item: string;
  status: "complete" | "needs_attention" | "missing";
  lastReviewed?: string;
  notes?: string;
}

export interface ReadinessDomainGroup {
  domain: ReadinessDomain;
  label: string;
  score: number;
  items: ReadinessItem[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const SURVEY_READINESS_SCORE = 83;
export const LAST_SURVEY_DATE = "2026-03-12";
export const NEXT_SURVEY_ESTIMATE = "Sep – Dec 2026";

export function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}
export const FACILITY_NAME = "Haven Gardens Assisted Living";
export const FACILITY_LICENSE = "AL-2019-0447";

// ── Incident workflow definition ─────────────────────────────────────────────

export const INCIDENT_WORKFLOW: IncidentWorkflowStep[] = [
  { key: "reported",          label: "Reported" },
  { key: "investigating",     label: "Investigated" },
  { key: "awaiting_family",   label: "Family Notified" },
  { key: "state_reported",    label: "State Reported" },
  { key: "care_plan_updated", label: "Care Plan Updated" },
  { key: "closed",            label: "Closed" },
];

export const WORKFLOW_ORDER: Record<IncidentStatus, number> = {
  reported:          0,
  investigating:     1,
  awaiting_family:   2,
  state_reported:    3,
  care_plan_updated: 4,
  closed:            5,
};

// ── Incident type config ──────────────────────────────────────────────────────

export const INCIDENT_TYPE_CONFIG: Record<IncidentType, { label: string; color: string }> = {
  fall:             { label: "Fall",                   color: "text-destructive bg-destructive/10" },
  medication_error: { label: "Medication Error",       color: "text-accent bg-accent/10" },
  elopement:        { label: "Elopement",              color: "text-destructive bg-destructive/10" },
  altercation:      { label: "Altercation",            color: "text-accent bg-accent/10" },
  injury_unknown:   { label: "Injury of Unknown Origin", color: "text-accent bg-accent/10" },
  abuse_allegation: { label: "Abuse Allegation",       color: "text-destructive bg-destructive/10" },
  hospitalization:  { label: "Hospitalization",        color: "text-muted-foreground bg-secondary" },
  environmental:    { label: "Environmental Hazard",   color: "text-accent bg-accent/10" },
};

export const SEVERITY_CONFIG: Record<IncidentSeverity, { label: string; cls: string }> = {
  1: { label: "Sev 1 · Minor",    cls: "bg-success/10 text-success" },
  2: { label: "Sev 2 · Moderate", cls: "bg-accent/10 text-accent" },
  3: { label: "Sev 3 · Critical", cls: "bg-destructive/10 text-destructive" },
};

// ── Incidents ────────────────────────────────────────────────────────────────

export const INCIDENTS: Incident[] = [
  {
    id: "inc001",
    type: "injury_unknown",
    residentName: "Charles Wells",
    residentRoom: "W-310",
    date: "2026-06-05",
    time: "8:42 AM",
    reportedBy: "Lisa Park, CNA",
    severity: 2,
    status: "reported",
    location: "Resident Room W-310",
    description: "CNA found resident with a 2-inch laceration on right forearm during morning care. Resident unable to explain how injury occurred. No fall observed overnight. Room inspection completed — no sharp objects found. Wound assessed by charge nurse.",
    injuries: "2-inch laceration, right forearm. Cleaned and dressed. No sutures required.",
    witnesses: [],
    immediateActions: "Wound cleaned and bandaged by RN Sarah Mitchell. Physician Dr. Evans notified 8:55 AM. Physician order received for wound care Q shift. Incident report initiated.",
    stateReportable: true,
    stateReportDeadline: "2026-06-08",
    stateReportedDate: undefined,
    familyNotified: false,
    physicianNotified: true,
    rootCause: undefined,
    correctiveActions: [
      { action: "Notify family of injury", assignedTo: "Brenda Foster, DON", dueDate: "2026-06-05", completed: false },
      { action: "Complete state incident report (Form AL-1400)", assignedTo: "Maria Santos, Administrator", dueDate: "2026-06-08", completed: false },
      { action: "Review overnight monitoring — camera footage if available", assignedTo: "Brenda Foster, DON", dueDate: "2026-06-06", completed: false },
    ],
    carePlanUpdated: false,
  },
  {
    id: "inc002",
    type: "fall",
    residentName: "Margaret Olson",
    residentRoom: "E-114",
    date: "2026-06-03",
    time: "3:17 PM",
    reportedBy: "Carol Nguyen, CNA",
    severity: 2,
    status: "investigating",
    location: "Bathroom, Room E-114",
    description: "Resident found on bathroom floor by CNA during afternoon rounds. Resident states she attempted to stand from toilet without using grab bar. Alert and oriented x3 at time of fall. No loss of consciousness reported.",
    injuries: "Right hip pain, mild bruising to right elbow. X-ray ordered to rule out fracture — results pending.",
    witnesses: ["Carol Nguyen, CNA"],
    immediateActions: "Resident assisted to bed. Vital signs stable. RN assessed — no acute distress. X-ray ordered stat. Family notified via phone at 3:45 PM by charge nurse. Physician notified 3:50 PM.",
    stateReportable: true,
    stateReportDeadline: "2026-06-06",
    stateReportedDate: undefined,
    familyNotified: true,
    familyNotifiedDate: "2026-06-03",
    physicianNotified: true,
    rootCause: "Resident bypassed grab bar during toileting. Fall risk assessment indicates HIGH risk (Morse Fall Score 65). Last fall risk intervention audit was 3 weeks ago.",
    correctiveActions: [
      { action: "X-ray follow-up and documentation of results", assignedTo: "RN Sarah Mitchell", dueDate: "2026-06-04", completed: true },
      { action: "Complete and submit state fall report (Form AL-1400)", assignedTo: "Maria Santos, Administrator", dueDate: "2026-06-06", completed: false },
      { action: "Update care plan: add bed alarm, reinforce grab bar education", assignedTo: "Brenda Foster, DON", dueDate: "2026-06-05", completed: false },
      { action: "PT evaluation order — mobility and fall prevention", assignedTo: "Dr. Evans", dueDate: "2026-06-05", completed: true },
    ],
    carePlanUpdated: false,
  },
  {
    id: "inc003",
    type: "elopement",
    residentName: "Vivian Marsh",
    residentRoom: "MC-201",
    date: "2026-05-30",
    time: "6:04 AM",
    reportedBy: "Night Shift Supervisor, James Sullivan",
    severity: 3,
    status: "state_reported",
    location: "Memory Care Unit — East Exit Door",
    description: "Resident found at east exit door attempting to push through emergency exit at 6:04 AM during shift change. Door alarm activated. Resident was redirected immediately by night staff. Total time outside secure unit: 0 minutes. Resident appeared agitated and stated she 'needed to get home to feed the cat.'",
    injuries: "No physical injuries. Resident calmed within 10 minutes with redirection and music intervention.",
    witnesses: ["James Sullivan, RN", "Tracy Alvarez, CNA"],
    immediateActions: "Resident redirected to common area. Warm beverage and calming music provided. Physician notified at 6:30 AM. Family notified at 7:15 AM. Incident report filed at 7:00 AM. Memory Care unit door code reviewed — all staff reminded of protocol.",
    stateReportable: true,
    stateReportDeadline: "2026-06-02",
    stateReportedDate: "2026-06-01",
    familyNotified: true,
    familyNotifiedDate: "2026-05-30",
    physicianNotified: true,
    rootCause: "Elopement risk assessment completed at move-in was not updated after recent cognitive decline. Wanderguard bracelet ordered but not yet received (on order since May 1). Night shift staffing at minimum during shift change window.",
    correctiveActions: [
      { action: "Expedite Wanderguard bracelet order — escalate to vendor", assignedTo: "Maria Santos, Administrator", dueDate: "2026-06-02", completed: true },
      { action: "Update elopement risk assessment in care plan", assignedTo: "Brenda Foster, DON", dueDate: "2026-06-01", completed: true },
      { action: "Review and update Memory Care shift change coverage protocol", assignedTo: "Brenda Foster, DON", dueDate: "2026-06-04", completed: true },
      { action: "State elopement report submitted", assignedTo: "Maria Santos, Administrator", dueDate: "2026-06-02", completed: true },
    ],
    carePlanUpdated: true,
  },
  {
    id: "inc004",
    type: "medication_error",
    residentName: "Robert Chen",
    residentRoom: "W-204",
    date: "2026-05-28",
    time: "9:15 AM",
    reportedBy: "Lisa Park, Med Tech",
    severity: 1,
    status: "care_plan_updated",
    location: "Med Cart, West Wing",
    description: "Resident's morning Metoprolol 25mg administered at 9:15 AM instead of scheduled 8:00 AM window. Delay caused by staffing gap during shift overlap. No adverse effects reported. Resident's BP measured 142/88 post-administration — within acceptable range.",
    injuries: "No injury. No adverse effects observed.",
    witnesses: ["RN Sarah Mitchell"],
    immediateActions: "Error identified during medication reconciliation at end of shift. RN notified immediately. Resident assessed — vital signs stable. Physician notified and approved continued monitoring. Error documented in eMAR.",
    stateReportable: false,
    familyNotified: false,
    physicianNotified: true,
    rootCause: "Medication pass delayed during shift change overlap. Staffing gap between 8:00 AM and 8:30 AM created coverage hole on West Wing. Med pass protocol does not include explicit handoff checklist for time-sensitive medications.",
    correctiveActions: [
      { action: "Implement time-sensitive medication handoff checklist for shift overlap", assignedTo: "Brenda Foster, DON", dueDate: "2026-05-30", completed: true },
      { action: "Update care plan to note medication sensitivity and timing", assignedTo: "RN Sarah Mitchell", dueDate: "2026-05-29", completed: true },
      { action: "Staff education: medication pass protocol during shift change", assignedTo: "Lisa Park, Med Tech", dueDate: "2026-05-31", completed: true },
    ],
    carePlanUpdated: true,
  },
  {
    id: "inc005",
    type: "altercation",
    residentName: "Raymond Kowalski",
    residentRoom: "E-118",
    date: "2026-05-22",
    time: "2:33 PM",
    reportedBy: "Brenda Foster, DON",
    severity: 1,
    status: "closed",
    location: "Dining Room, East Wing",
    description: "Resident made an escalating verbal complaint to a neighboring resident during lunch, objecting to the television volume. Raised voice and pointed finger. No physical contact. Situation de-escalated by dining staff within 90 seconds. Both residents returned to eating.",
    injuries: "No injuries. No physical contact.",
    witnesses: ["Tracy Alvarez, CNA", "Jordan Kim, Volunteer"],
    immediateActions: "Staff intervened immediately. Both residents separated briefly. Raymond was redirected to quiet table near window. TV volume adjusted. Incident documented.",
    stateReportable: false,
    familyNotified: false,
    physicianNotified: false,
    rootCause: "Sensory sensitivity — resident has documented low tolerance for loud noise environments (dining room often has elevated TV volume at lunch). Preference documentation not communicated to dining staff.",
    correctiveActions: [
      { action: "Add dining seating preference to care plan (low-noise zone)", assignedTo: "Brenda Foster, DON", dueDate: "2026-05-25", completed: true },
      { action: "Brief dining staff on resident sensory preferences", assignedTo: "Brenda Foster, DON", dueDate: "2026-05-24", completed: true },
    ],
    carePlanUpdated: true,
    closedDate: "2026-05-26",
    closedBy: "Brenda Foster, DON",
  },
  {
    id: "inc006",
    type: "fall",
    residentName: "Dorothy Hayes",
    residentRoom: "E-102",
    date: "2026-05-18",
    time: "10:55 AM",
    reportedBy: "Tracy Alvarez, CNA",
    severity: 1,
    status: "closed",
    location: "Hallway, East Wing — near Room E-102",
    description: "Resident lost balance while walking to activities room without her walker. Found on floor by CNA. Alert and oriented. States she 'forgot' her walker and 'thought it was a short walk.'",
    injuries: "Minor abrasion to left palm. No other injuries. X-ray not indicated.",
    witnesses: ["Tracy Alvarez, CNA"],
    immediateActions: "Resident assisted to standing. Vital signs stable. RN assessed. Wound cleaned and bandaged. Family notified by phone. Physician notified and approved monitoring plan.",
    stateReportable: false,
    familyNotified: true,
    familyNotifiedDate: "2026-05-18",
    physicianNotified: true,
    rootCause: "Walker non-compliance is a documented pattern. Current care plan addresses walker use but does not include reminder protocol or fall prevention check at room departure.",
    correctiveActions: [
      { action: "Add walker reminder checklist to morning care routine", assignedTo: "Tracy Alvarez, CNA", dueDate: "2026-05-20", completed: true },
      { action: "Update care plan: activity transport protocol (CNA escort to activities)", assignedTo: "RN Sarah Mitchell", dueDate: "2026-05-20", completed: true },
    ],
    carePlanUpdated: true,
    closedDate: "2026-05-22",
    closedBy: "Brenda Foster, DON",
  },
];

// ── Survey deficiencies ───────────────────────────────────────────────────────

export const PAST_DEFICIENCIES: Deficiency[] = [
  {
    id: "def001",
    surveyDate: "2026-03-12",
    tag: "Tag 0226",
    category: "Staffing",
    description: "Facility failed to obtain a complete criminal background check for one newly hired CNA prior to resident contact. Record indicated a 6-day gap between hire date and background check completion.",
    scope: "isolated",
    severity: "C",
    status: "accepted",
    pocDeadline: "2026-03-22",
    pocSubmittedDate: "2026-03-20",
    pocAcceptedDate: "2026-03-28",
    owner: "Maria Santos, Administrator",
    pocSummary: "Implemented pre-hire background check requirement — no staff to have resident contact until check is complete and cleared. Updated HR intake checklist. Staff education provided to HR and scheduling. Corrective action accepted by state on March 28.",
  },
  {
    id: "def002",
    surveyDate: "2026-03-12",
    tag: "Tag 0582",
    category: "Medication Management",
    description: "Medication storage room temperature log had a 3-day documentation gap (February 12–14). Temperature was within acceptable range on the days preceding and following the gap but could not be confirmed for the gap period.",
    scope: "isolated",
    severity: "B",
    status: "accepted",
    pocDeadline: "2026-03-22",
    pocSubmittedDate: "2026-03-19",
    pocAcceptedDate: "2026-03-25",
    owner: "Brenda Foster, DON",
    pocSummary: "Implemented automated temperature monitoring with digital logging system (TempAlert Pro). Daily auto-log with alert sent to DON if temperature exceeds range. Continuous logging eliminates documentation gaps. Staff education on manual backup log requirements. Accepted March 25.",
  },
];

// ── QAPI indicators ───────────────────────────────────────────────────────────

export const QAPI_INDICATORS: QapiIndicator[] = [
  {
    id: "q001",
    name: "Fall Rate",
    value: 4.2,
    unit: "per 1,000 resident-days",
    benchmark: 3.0,
    target: 2.5,
    trend: "worsening",
    inAlert: true,
    description: "Total falls per 1,000 resident days. Includes all falls regardless of injury. Benchmark is the state average for AL communities of similar census.",
    history: [
      { month: "Dec", value: 2.8 },
      { month: "Jan", value: 3.0 },
      { month: "Feb", value: 3.4 },
      { month: "Mar", value: 3.9 },
      { month: "Apr", value: 4.0 },
      { month: "May", value: 4.2 },
      { month: "Jun", value: 4.3 },
    ],
  },
  {
    id: "q002",
    name: "Medication Error Rate",
    value: 0.8,
    unit: "per 1,000 doses administered",
    benchmark: 1.0,
    target: 0.5,
    trend: "stable",
    inAlert: false,
    description: "All medication errors per 1,000 doses. Includes wrong time, wrong dose, omissions. Excludes physician order errors. Benchmark is the national AL average.",
    history: [
      { month: "Dec", value: 0.9 },
      { month: "Jan", value: 0.8 },
      { month: "Feb", value: 0.7 },
      { month: "Mar", value: 0.9 },
      { month: "Apr", value: 0.8 },
      { month: "May", value: 0.8 },
      { month: "Jun", value: 0.8 },
    ],
  },
  {
    id: "q003",
    name: "Rehospitalization Rate",
    value: 8.3,
    unit: "% of census",
    benchmark: 10.0,
    target: 7.0,
    trend: "improving",
    inAlert: false,
    description: "Percentage of residents transferred to hospital in any given month. Tracks both planned and unplanned hospitalizations.",
    history: [
      { month: "Dec", value: 11.2 },
      { month: "Jan", value: 10.5 },
      { month: "Feb", value: 9.8 },
      { month: "Mar", value: 9.1 },
      { month: "Apr", value: 8.7 },
      { month: "May", value: 8.3 },
      { month: "Jun", value: 8.0 },
    ],
  },
  {
    id: "q004",
    name: "Unplanned Weight Loss",
    value: 4.2,
    unit: "% of census",
    benchmark: 5.0,
    target: 3.0,
    trend: "stable",
    inAlert: false,
    description: "Percentage of residents with unplanned weight loss of 5% or more in any 30-day period. Monitored via monthly weights.",
    history: [
      { month: "Dec", value: 4.8 },
      { month: "Jan", value: 4.6 },
      { month: "Feb", value: 4.2 },
      { month: "Mar", value: 4.4 },
      { month: "Apr", value: 4.1 },
      { month: "May", value: 4.2 },
      { month: "Jun", value: 4.2 },
    ],
  },
  {
    id: "q005",
    name: "Resident / Family Complaint Rate",
    value: 2.1,
    unit: "complaints per month",
    benchmark: 3.0,
    target: 2.0,
    trend: "improving",
    inAlert: false,
    description: "Total formal complaints received from residents or family members in a calendar month. Tracked via grievance log.",
    history: [
      { month: "Dec", value: 4.1 },
      { month: "Jan", value: 3.8 },
      { month: "Feb", value: 3.5 },
      { month: "Mar", value: 3.1 },
      { month: "Apr", value: 2.6 },
      { month: "May", value: 2.1 },
      { month: "Jun", value: 1.9 },
    ],
  },
];

export const ACTIVE_PIPS: QapiPip[] = [
  {
    id: "pip001",
    title: "Fall Reduction Initiative",
    openedDate: "2026-03-15",
    targetDate: "2026-08-31",
    lead: "Brenda Foster, DON",
    goal: "Reduce fall rate from 3.9 to below 2.5 per 1,000 resident-days by August 2026.",
    baselineValue: 3.9,
    currentValue: 4.2,
    targetValue: 2.5,
    unit: "per 1,000 res-days",
    interventions: [
      { text: "Hourly rounding protocol during day/evening shifts (implemented Apr 1)", completed: true },
      { text: "Universal bed alarm audit — all high-risk residents (completed Apr 15)", completed: true },
      { text: "PT referral protocol for all falls with injury (implemented Apr 20)", completed: true },
      { text: "Environmental hazard walk-through monthly (first completed May 1)", completed: false },
      { text: "Fall Risk Score review at every care conference (ongoing)", completed: false },
    ],
    status: "active",
  },
];

export const QAPI_MEETINGS: QapiMeeting[] = [
  {
    date: "2026-03-31",
    attendees: ["Maria Santos (Admin)", "Brenda Foster (DON)", "Dr. Evans (Medical Director)", "Brenda McCarthy (Social Work)", "Brenda Foster (Activity Dir.)"],
    highlights: [
      "Reviewed March 12 survey deficiencies — both POCs accepted",
      "Opened Fall Reduction PIP in response to rising fall rate",
      "Rehospitalization rate trending down — continue monitoring",
      "Scheduled next meeting for August 31, 2026",
    ],
  },
];

// ── Survey readiness checklist ────────────────────────────────────────────────

export const READINESS_DOMAINS: ReadinessDomainGroup[] = [
  {
    domain: "resident_rights",
    label: "Resident Rights",
    score: 95,
    items: [
      { id: "rr01", item: "Resident rights acknowledged and signed by all current residents", status: "complete", lastReviewed: "2026-05-01" },
      { id: "rr02", item: "Grievance procedure documented and posted", status: "complete", lastReviewed: "2026-04-15" },
      { id: "rr03", item: "Discharge and rate change notice procedures in policy", status: "complete", lastReviewed: "2026-04-15" },
      { id: "rr04", item: "Privacy notices (HIPAA) on file for all residents", status: "complete", lastReviewed: "2026-05-01" },
      { id: "rr05", item: "Grievance log current and reviewed monthly", status: "needs_attention", lastReviewed: "2026-04-30", notes: "April log reviewed; May log not yet opened" },
    ],
  },
  {
    domain: "assessment_care_plan",
    label: "Assessment & Care Planning",
    score: 88,
    items: [
      { id: "ac01", item: "Move-in assessments completed within required timeframe (14 days)", status: "complete", lastReviewed: "2026-05-15" },
      { id: "ac02", item: "Quarterly care plan reviews completed on schedule", status: "needs_attention", lastReviewed: "2026-05-01", notes: "2 residents overdue for quarterly review: Doris Lambert (due Apr 28), Howard Ingram (due May 3)" },
      { id: "ac03", item: "Annual reassessments completed for all long-term residents", status: "complete", lastReviewed: "2026-05-01" },
      { id: "ac04", item: "Post-incident care plan updates documented within 72 hours", status: "needs_attention", lastReviewed: "2026-05-16", notes: "Margaret Olson fall care plan not yet updated — due May 17" },
      { id: "ac05", item: "Significant change reassessments initiated within required window", status: "complete", lastReviewed: "2026-05-10" },
    ],
  },
  {
    domain: "medication",
    label: "Medication Management",
    score: 90,
    items: [
      { id: "med01", item: "Medication storage room temperature logs current (no gaps)", status: "complete", lastReviewed: "2026-05-16" },
      { id: "med02", item: "Controlled substance count log complete and co-signed", status: "complete", lastReviewed: "2026-05-16" },
      { id: "med03", item: "All physician medication orders current and renewed", status: "complete", lastReviewed: "2026-05-15" },
      { id: "med04", item: "eMAR reconciliation completed for current month", status: "complete", lastReviewed: "2026-05-15" },
      { id: "med05", item: "Medication error log reviewed and corrective actions documented", status: "needs_attention", lastReviewed: "2026-05-12", notes: "Robert Chen medication error — corrective actions complete but formal error log not closed out" },
    ],
  },
  {
    domain: "staffing",
    label: "Staffing Compliance",
    score: 74,
    items: [
      { id: "st01", item: "All staff background checks current (pre-hire, no gaps)", status: "needs_attention", lastReviewed: "2026-05-10", notes: "3 staff members approaching 5-year background check renewal due Jun–Jul 2026" },
      { id: "st02", item: "Active state licenses on file for all licensed staff", status: "missing", lastReviewed: "2026-05-10", notes: "Carol Nguyen CNA license expired May 8, 2026 — removed from med pass pending renewal" },
      { id: "st03", item: "TB test results on file for all staff (annual)", status: "complete", lastReviewed: "2026-04-01" },
      { id: "st04", item: "CPR / First Aid certifications current for required staff", status: "complete", lastReviewed: "2026-04-15" },
      { id: "st05", item: "Staffing ratios documented and maintained per state minimum", status: "complete", lastReviewed: "2026-05-16" },
      { id: "st06", item: "Staff schedules retained and accessible for survey review", status: "complete", lastReviewed: "2026-05-01" },
    ],
  },
  {
    domain: "physical_environment",
    label: "Physical Environment",
    score: 85,
    items: [
      { id: "pe01", item: "Monthly fire drill completed and documented", status: "complete", lastReviewed: "2026-04-30" },
      { id: "pe02", item: "Fire extinguisher inspection current", status: "complete", lastReviewed: "2026-04-01" },
      { id: "pe03", item: "Emergency exit signage and lighting checked", status: "complete", lastReviewed: "2026-04-30" },
      { id: "pe04", item: "Evacuation plan posted in all common areas and resident rooms", status: "complete", lastReviewed: "2026-04-15" },
      { id: "pe05", item: "Preventive maintenance log current", status: "needs_attention", lastReviewed: "2026-05-01", notes: "Elevator inspection due May 31 — not yet scheduled" },
    ],
  },
  {
    domain: "infection_control",
    label: "Infection Control",
    score: 82,
    items: [
      { id: "ic01", item: "Infection Prevention and Control Program (IPCP) policy on file", status: "needs_attention", lastReviewed: "2026-03-01", notes: "Policy last updated March 2025 — 14 months ago. Requires annual review." },
      { id: "ic02", item: "Infection surveillance log current and reviewed monthly", status: "complete", lastReviewed: "2026-05-15" },
      { id: "ic03", item: "Hand hygiene audit completed within last 90 days", status: "complete", lastReviewed: "2026-04-20" },
      { id: "ic04", item: "Outbreak response protocol documented and accessible", status: "complete", lastReviewed: "2026-04-15" },
    ],
  },
  {
    domain: "activities",
    label: "Activities & Quality of Life",
    score: 92,
    items: [
      { id: "act01", item: "Resident activity preference assessment on file for all residents", status: "complete", lastReviewed: "2026-05-01" },
      { id: "act02", item: "Activity programming documented (calendar, attendance records)", status: "complete", lastReviewed: "2026-05-16" },
      { id: "act03", item: "One-to-one programming documented for Memory Care residents", status: "complete", lastReviewed: "2026-05-15" },
      { id: "act04", item: "Activity care plan integrated into resident service plan", status: "needs_attention", lastReviewed: "2026-05-10", notes: "Beverly Stone (new move-in May 15) — activity care plan not yet completed" },
    ],
  },
  {
    domain: "staff_training",
    label: "Staff Training Records",
    score: 78,
    items: [
      { id: "tr01", item: "Orientation training documented for all staff hired in last 12 months", status: "complete", lastReviewed: "2026-05-01" },
      { id: "tr02", item: "Annual in-service hours met for all staff (minimum 12 hrs)", status: "missing", lastReviewed: "2026-05-01", notes: "4 staff missing annual in-service completion: Lisa Park (4 hrs remaining), Tracy Alvarez (6 hrs), Jordan Kim (8 hrs), Robert Yee (2 hrs)" },
      { id: "tr03", item: "Dementia care training documented per state requirement", status: "complete", lastReviewed: "2026-04-01" },
      { id: "tr04", item: "Abuse/neglect prevention training current for all staff", status: "complete", lastReviewed: "2026-04-01" },
      { id: "tr05", item: "New staff training records filed within 30 days of hire", status: "needs_attention", lastReviewed: "2026-05-15", notes: "Beverly Stone's primary CNA (new hire Apr 28) — training record not yet fully filed" },
    ],
  },
];

// ── Regulatory calendar ───────────────────────────────────────────────────────

export const REGULATORY_EVENTS: RegulatoryEvent[] = [
  {
    id: "re001",
    title: "State Incident Report — Charles Wells (Injury Unknown Origin)",
    category: "clinical",
    dueDate: "2026-06-08",
    responsible: "Maria Santos, Administrator",
    status: "overdue",
    notes: "Form AL-1400 required. Incident occurred June 5 — 72-hour reporting window.",
    recurring: "one_time",
  },
  {
    id: "re002",
    title: "State Incident Report — Margaret Olson (Fall w/ Injury)",
    category: "clinical",
    dueDate: "2026-06-06",
    responsible: "Maria Santos, Administrator",
    status: "overdue",
    notes: "Form AL-1400. Fall occurred June 3 — x-ray results still pending. Report required regardless of injury confirmation.",
    recurring: "one_time",
  },
  {
    id: "re003",
    title: "Monthly Fire Drill — Building B (East Wing)",
    category: "safety",
    dueDate: "2026-06-20",
    responsible: "Facilities Manager, Dan Torres",
    status: "upcoming",
    notes: "Night shift drill. All exits to be tested. Drill record must include staff names and times.",
    recurring: "monthly",
  },
  {
    id: "re004",
    title: "Elevator Annual Inspection",
    category: "safety",
    dueDate: "2026-05-31",
    responsible: "Dan Torres, Facilities",
    status: "overdue",
    notes: "State-licensed elevator inspector required. Last inspection May 2025. Schedule immediately.",
    recurring: "annual",
  },
  {
    id: "re005",
    title: "Quarterly QAPI Committee Meeting",
    category: "administrative",
    dueDate: "2026-05-31",
    responsible: "Maria Santos, Administrator",
    status: "overdue",
    notes: "Review fall reduction PIP progress, Q2 quality indicators, incident trends. Minimum attendees: Admin, DON, Medical Director.",
    recurring: "quarterly",
  },
  {
    id: "re006",
    title: "CNA License Renewal — Carol Nguyen",
    category: "staffing",
    dueDate: "2026-06-01",
    responsible: "Maria Santos, Administrator",
    status: "overdue",
    notes: "License expired May 8 — already in violation. Carol removed from med pass. Renewal exam scheduled June 1.",
    recurring: "biennial",
  },
  {
    id: "re007",
    title: "Quarterly Care Plan Reviews — 14 Residents",
    category: "clinical",
    dueDate: "2026-06-15",
    responsible: "Brenda Foster, DON",
    status: "upcoming",
    notes: "14 residents due for quarterly review in June cycle. 2 already overdue (Lambert, Ingram) — complete immediately.",
    recurring: "quarterly",
  },
  {
    id: "re008",
    title: "Annual TB Testing — 8 Staff Members",
    category: "staffing",
    dueDate: "2026-07-01",
    responsible: "Brenda Foster, DON",
    status: "upcoming",
    notes: "8 staff members reach 12-month TB test anniversary in July. Schedule appointments now.",
    recurring: "annual",
  },
  {
    id: "re009",
    title: "Infection Control Policy Annual Review",
    category: "clinical",
    dueDate: "2026-07-01",
    responsible: "Brenda Foster, DON",
    status: "upcoming",
    notes: "IPCP policy last updated March 2025 — 14 months overdue. Complete by July 1 to clear readiness checklist item.",
    recurring: "annual",
  },
  {
    id: "re010",
    title: "Building Evacuation Drill — Full Facility",
    category: "safety",
    dueDate: "2026-07-15",
    responsible: "Dan Torres, Facilities",
    status: "upcoming",
    notes: "Semi-annual full facility evacuation. Coordinate with local fire department. All staff must participate.",
    recurring: "quarterly",
  },
  {
    id: "re011",
    title: "Quarterly QAPI Committee Meeting",
    category: "administrative",
    dueDate: "2026-08-31",
    responsible: "Maria Santos, Administrator",
    status: "upcoming",
    notes: "Q3 review. Fall PIP mid-point assessment — evaluate if interventions are achieving target reduction.",
    recurring: "quarterly",
  },
  {
    id: "re012",
    title: "Annual State Facility License Renewal",
    category: "administrative",
    dueDate: "2026-09-01",
    responsible: "Maria Santos, Administrator",
    status: "upcoming",
    notes: "Haven Gardens license #AL-2019-0447. Application window opens 90 days before expiration. Submit by August 1 to allow review time.",
    recurring: "annual",
  },
];

// ── Summary helpers ──────────────────────────────────────────────────────────

export const OPEN_INCIDENTS = INCIDENTS.filter((i) => i.status !== "closed");
export const STATE_REPORTABLE_PENDING = INCIDENTS.filter(
  (i) => i.stateReportable && !i.stateReportedDate && i.status !== "closed",
);
export const CRITICAL_INCIDENTS = INCIDENTS.filter((i) => i.severity === 3 && i.status !== "closed");

export const CREDENTIAL_COMPLIANCE_PCT = 94;
export const QAPI_IN_ALERT_COUNT = QAPI_INDICATORS.filter((q) => q.inAlert).length;

export const CATEGORY_CONFIG: Record<RegulatoryCategory, { label: string; color: string; dot: string }> = {
  staffing:      { label: "Staffing",      color: "bg-indigo-400/15 text-indigo-300 border-indigo-400/30",   dot: "bg-indigo-400" },
  safety:        { label: "Safety",        color: "bg-accent/10 text-accent border-accent/20",               dot: "bg-accent" },
  clinical:      { label: "Clinical",      color: "bg-primary/10 text-primary border-primary/20",            dot: "bg-primary" },
  administrative:{ label: "Administrative",color: "bg-secondary text-muted-foreground border-border",        dot: "bg-muted-foreground" },
  training:      { label: "Training",      color: "bg-purple-400/15 text-purple-300 border-purple-400/30",   dot: "bg-purple-400" },
};

export const STATUS_URGENCY: Record<RegulatoryStatus, { label: string; cls: string }> = {
  overdue:   { label: "Overdue",   cls: "bg-destructive/10 text-destructive border-destructive/20" },
  due_soon:  { label: "Due Soon",  cls: "bg-accent/10 text-accent border-accent/20" },
  upcoming:  { label: "Upcoming",  cls: "bg-secondary text-muted-foreground border-border" },
  completed: { label: "Completed", cls: "bg-success/10 text-success border-success/20" },
};
