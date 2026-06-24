// ── Types ────────────────────────────────────────────────────────────────────

export type ShiftPeriod = "Day" | "Evening" | "Night";
export type StaffRole = "RN" | "LPN" | "CNA" | "Med Tech" | "Activities" | "Dietary" | "Maintenance";
export type EmployeeStatus = "full_time" | "part_time" | "prn" | "agency";
export type SlotStatus = "scheduled" | "open" | "called_out" | "agency_fill";
export type NotifResponse = "accepted" | "declined" | "no_response";
export type CertStatus = "current" | "expiring_soon" | "expired";

export interface Certification {
  name: string;
  expires: string;
  status: CertStatus;
}

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  status: EmployeeStatus;
  primaryUnit: string;
  hireDate: string;
  phone: string;
  hoursThisWeek: number;
  overtimeThreshold: number; // 40 FT, 24 PT
  consecutiveDays: number;
  calloutCount30d?: number;
  certifications: Certification[];
  todayShift: ShiftPeriod | null;
}

export interface ShiftSlot {
  staffId: string | null; // null = open or callout
  role: StaffRole;
  unit: string;
  status: SlotStatus;
  calloutReason?: string;
  agencyName?: string;
}

export interface DailyShift {
  period: ShiftPeriod;
  timeRange: string;
  slots: ShiftSlot[];
}

export interface OpenShift {
  id: string;
  period: ShiftPeriod;
  role: StaffRole;
  unit: string;
  openedAt: string;
  reason: "callout" | "unfilled" | "census_increase";
  notified: { staffId: string; name: string; response: NotifResponse }[];
}

export interface CalloutRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: StaffRole;
  period: ShiftPeriod;
  unit: string;
  reportedAt: string;
  reason: string;
  covered: boolean;
  coveredBy?: string;
}

// ── Census anchor (mirrors clinical module) ───────────────────────────────────

export const CENSUS_TODAY = 87;
export const BEDS_TOTAL = 102;

// ── PPD Thresholds (per facility policy — AL, not SNF) ───────────────────────

export const PPD_TARGET = 3.0;
export const PPD_MINIMUM = 2.4;

// ── Staff ─────────────────────────────────────────────────────────────────────

export const STAFF: StaffMember[] = [
  // ── RNs ──────────────────────────────────────────────────────────────────
  {
    id: "s001", name: "Rachel Thompson, RN", role: "RN", status: "full_time",
    primaryUnit: "East / West Wing Float", hireDate: "2022-03-14", phone: "(801) 555-3001",
    hoursThisWeek: 38, overtimeThreshold: 40, consecutiveDays: 4,
    todayShift: "Day",
    certifications: [
      { name: "RN License (UT)", expires: "2027-03-31", status: "current" },
      { name: "BLS / CPR", expires: "2026-09-15", status: "current" },
      { name: "Dementia Care Certification", expires: "2026-11-01", status: "current" },
    ],
  },
  {
    id: "s002", name: "Maria Rivera, RN", role: "RN", status: "full_time",
    primaryUnit: "West Wing", hireDate: "2021-08-01", phone: "(801) 555-3002",
    hoursThisWeek: 32, overtimeThreshold: 40, consecutiveDays: 4,
    todayShift: "Day",
    certifications: [
      { name: "RN License (UT)", expires: "2026-07-31", status: "expiring_soon" },
      { name: "BLS / CPR", expires: "2027-02-28", status: "current" },
      { name: "Wound Care Certification", expires: "2027-04-15", status: "current" },
    ],
  },
  {
    id: "s003", name: "Jennifer Walsh, RN", role: "RN", status: "full_time",
    primaryUnit: "Memory Care", hireDate: "2020-05-18", phone: "(801) 555-3003",
    hoursThisWeek: 36, overtimeThreshold: 40, consecutiveDays: 3,
    todayShift: "Evening",
    certifications: [
      { name: "RN License (UT)", expires: "2027-05-31", status: "current" },
      { name: "BLS / CPR", expires: "2026-08-01", status: "expiring_soon" },
      { name: "Dementia Specialist (CADDCT)", expires: "2027-01-15", status: "current" },
    ],
  },
  {
    id: "s004", name: "Lisa Park, LPN", role: "LPN", status: "full_time",
    primaryUnit: "East Wing", hireDate: "2023-01-10", phone: "(801) 555-3004",
    hoursThisWeek: 40, overtimeThreshold: 40, consecutiveDays: 6, calloutCount30d: 2,
    todayShift: "Night",
    certifications: [
      { name: "LPN License (UT)", expires: "2026-06-30", status: "expiring_soon" },
      { name: "BLS / CPR", expires: "2027-06-30", status: "current" },
    ],
  },
  // ── LPNs ─────────────────────────────────────────────────────────────────
  {
    id: "s005", name: "Kim Yamamoto, LPN", role: "LPN", status: "full_time",
    primaryUnit: "East Wing", hireDate: "2022-11-07", phone: "(801) 555-3005",
    hoursThisWeek: 40, overtimeThreshold: 40, consecutiveDays: 5,
    todayShift: "Day",
    certifications: [
      { name: "LPN License (UT)", expires: "2027-01-31", status: "current" },
      { name: "BLS / CPR", expires: "2026-12-01", status: "current" },
      { name: "Medication Administration", expires: "2027-05-01", status: "current" },
    ],
  },
  {
    id: "s006", name: "David Santos, LPN", role: "LPN", status: "full_time",
    primaryUnit: "West Wing", hireDate: "2023-06-19", phone: "(801) 555-3006",
    hoursThisWeek: 32, overtimeThreshold: 40, consecutiveDays: 4,
    todayShift: "Evening",
    certifications: [
      { name: "LPN License (UT)", expires: "2027-08-31", status: "current" },
      { name: "BLS / CPR", expires: "2027-01-15", status: "current" },
    ],
  },
  // ── CNAs ─────────────────────────────────────────────────────────────────
  {
    id: "s007", name: "Sandra Davis, CNA", role: "CNA", status: "full_time",
    primaryUnit: "Memory Care", hireDate: "2021-02-22", phone: "(801) 555-3007",
    hoursThisWeek: 38, overtimeThreshold: 40, consecutiveDays: 5, calloutCount30d: 3,
    todayShift: "Day",
    certifications: [
      { name: "CNA Certification (UT)", expires: "2026-09-30", status: "current" },
      { name: "BLS / CPR", expires: "2026-09-15", status: "current" },
    ],
  },
  {
    id: "s008", name: "Michael Torres, CNA", role: "CNA", status: "full_time",
    primaryUnit: "East Wing", hireDate: "2024-01-08", phone: "(801) 555-3008",
    hoursThisWeek: 36, overtimeThreshold: 40, consecutiveDays: 4,
    todayShift: "Day",
    certifications: [
      { name: "CNA Certification (UT)", expires: "2027-03-31", status: "current" },
      { name: "BLS / CPR", expires: "2027-03-01", status: "current" },
    ],
  },
  {
    id: "s009", name: "Amanda Kim, CNA", role: "CNA", status: "full_time",
    primaryUnit: "West Wing", hireDate: "2023-09-11", phone: "(801) 555-3009",
    hoursThisWeek: 30, overtimeThreshold: 40, consecutiveDays: 3,
    todayShift: "Evening",
    certifications: [
      { name: "CNA Certification (UT)", expires: "2027-01-31", status: "current" },
      { name: "BLS / CPR", expires: "2026-10-15", status: "current" },
    ],
  },
  {
    id: "s010", name: "James Wilson, CNA", role: "CNA", status: "full_time",
    primaryUnit: "Memory Care", hireDate: "2022-07-25", phone: "(801) 555-3010",
    hoursThisWeek: 32, overtimeThreshold: 40, consecutiveDays: 4, calloutCount30d: 2,
    todayShift: "Evening",
    certifications: [
      { name: "CNA Certification (UT)", expires: "2026-07-31", status: "expiring_soon" },
      { name: "BLS / CPR", expires: "2026-12-31", status: "current" },
    ],
  },
  {
    id: "s011", name: "Emily Martinez, CNA", role: "CNA", status: "part_time",
    primaryUnit: "East Wing", hireDate: "2024-08-05", phone: "(801) 555-3011",
    hoursThisWeek: 16, overtimeThreshold: 24, consecutiveDays: 2,
    todayShift: "Evening",
    certifications: [
      { name: "CNA Certification (UT)", expires: "2027-09-30", status: "current" },
      { name: "BLS / CPR", expires: "2027-08-01", status: "current" },
    ],
  },
  {
    id: "s012", name: "Robert Garcia, CNA", role: "CNA", status: "full_time",
    primaryUnit: "West / East Wing", hireDate: "2023-03-14", phone: "(801) 555-3012",
    hoursThisWeek: 32, overtimeThreshold: 40, consecutiveDays: 4,
    todayShift: "Night",
    certifications: [
      { name: "CNA Certification (UT)", expires: "2027-06-30", status: "current" },
      { name: "BLS / CPR", expires: "2027-01-01", status: "current" },
    ],
  },
  {
    id: "s013", name: "Patricia Lee, CNA", role: "CNA", status: "prn",
    primaryUnit: "Float", hireDate: "2023-10-02", phone: "(801) 555-3013",
    hoursThisWeek: 8, overtimeThreshold: 40, consecutiveDays: 1,
    todayShift: null,
    certifications: [
      { name: "CNA Certification (UT)", expires: "2027-04-30", status: "current" },
      { name: "BLS / CPR", expires: "2027-04-01", status: "current" },
    ],
  },
  {
    id: "s014", name: "Thomas Brown, CNA", role: "CNA", status: "prn",
    primaryUnit: "Float", hireDate: "2025-01-20", phone: "(801) 555-3014",
    hoursThisWeek: 0, overtimeThreshold: 40, consecutiveDays: 0,
    todayShift: "Night",
    certifications: [
      { name: "CNA Certification (UT)", expires: "2027-12-31", status: "current" },
      { name: "BLS / CPR", expires: "2027-11-15", status: "current" },
    ],
  },
  {
    id: "s015", name: "Carol Nguyen, CNA", role: "CNA", status: "full_time",
    primaryUnit: "Memory Care", hireDate: "2022-04-11", phone: "(801) 555-3015",
    hoursThisWeek: 36, overtimeThreshold: 40, consecutiveDays: 4,
    todayShift: "Day",
    certifications: [
      { name: "CNA Certification (UT)", expires: "2025-12-31", status: "expired" },
      { name: "BLS / CPR", expires: "2026-11-30", status: "current" },
    ],
  },
  // ── Med Techs ─────────────────────────────────────────────────────────────
  {
    id: "s016", name: "Aisha Johnson, Med Tech", role: "Med Tech", status: "full_time",
    primaryUnit: "East Wing", hireDate: "2023-05-15", phone: "(801) 555-3016",
    hoursThisWeek: 36, overtimeThreshold: 40, consecutiveDays: 4,
    todayShift: "Day",
    certifications: [
      { name: "Medication Aide Certification", expires: "2027-02-28", status: "current" },
      { name: "BLS / CPR", expires: "2026-11-01", status: "current" },
    ],
  },
  {
    id: "s017", name: "Carlos Reyes, Med Tech", role: "Med Tech", status: "full_time",
    primaryUnit: "West Wing", hireDate: "2024-04-01", phone: "(801) 555-3017",
    hoursThisWeek: 28, overtimeThreshold: 40, consecutiveDays: 3,
    todayShift: "Evening",
    certifications: [
      { name: "Medication Aide Certification", expires: "2027-10-31", status: "current" },
      { name: "BLS / CPR", expires: "2027-04-15", status: "current" },
    ],
  },
  // ── Activities ────────────────────────────────────────────────────────────
  {
    id: "s018", name: "Brenda Foster, Activities", role: "Activities", status: "full_time",
    primaryUnit: "All Units", hireDate: "2021-10-04", phone: "(801) 555-3018",
    hoursThisWeek: 32, overtimeThreshold: 40, consecutiveDays: 4,
    todayShift: "Day",
    certifications: [
      { name: "Activity Director Certification", expires: "2027-03-01", status: "current" },
    ],
  },
  // ── Dietary ───────────────────────────────────────────────────────────────
  {
    id: "s019", name: "Mark Chen, Dietary", role: "Dietary", status: "full_time",
    primaryUnit: "Dining", hireDate: "2022-02-14", phone: "(801) 555-3019",
    hoursThisWeek: 40, overtimeThreshold: 40, consecutiveDays: 5,
    todayShift: "Day",
    certifications: [
      { name: "Food Handler Certification", expires: "2026-08-31", status: "expiring_soon" },
      { name: "ServSafe Manager", expires: "2027-09-15", status: "current" },
    ],
  },
  // ── Maintenance ───────────────────────────────────────────────────────────
  {
    id: "s020", name: "Gary Phillips, Maintenance", role: "Maintenance", status: "full_time",
    primaryUnit: "All Units", hireDate: "2020-09-08", phone: "(801) 555-3020",
    hoursThisWeek: 38, overtimeThreshold: 40, consecutiveDays: 5,
    todayShift: "Day",
    certifications: [
      { name: "Boiler Operator License", expires: "2027-01-31", status: "current" },
      { name: "Fire Safety Certification", expires: "2026-06-30", status: "expiring_soon" },
    ],
  },
];

// ── Today's Schedule ─────────────────────────────────────────────────────────

export const TODAY_SHIFTS: DailyShift[] = [
  {
    period: "Day",
    timeRange: "7:00 AM – 3:00 PM",
    slots: [
      { staffId: "s001", role: "RN", unit: "Charge RN / Float", status: "scheduled" },
      { staffId: "s002", role: "RN", unit: "West Wing", status: "scheduled" },
      { staffId: "s005", role: "LPN", unit: "East Wing", status: "scheduled" },
      { staffId: "s007", role: "CNA", unit: "Memory Care", status: "scheduled" },
      { staffId: "s015", role: "CNA", unit: "Memory Care", status: "scheduled" },
      { staffId: "s008", role: "CNA", unit: "East Wing", status: "scheduled" },
      { staffId: "s016", role: "Med Tech", unit: "East Wing (eMAR)", status: "scheduled" },
      { staffId: "s018", role: "Activities", unit: "All Units", status: "scheduled" },
      { staffId: "s019", role: "Dietary", unit: "Dining", status: "scheduled" },
      { staffId: "s020", role: "Maintenance", unit: "Facility", status: "scheduled" },
      // West Wing Med Tech covered by agency (Day shift)
      { staffId: null, role: "Med Tech", unit: "West Wing (eMAR)", status: "agency_fill", agencyName: "Premier Staffing" },
      { staffId: null, role: "CNA", unit: "West Wing", status: "called_out",
        calloutReason: "Personal emergency — L. Monroe called out at 5:48 AM" },
    ],
  },
  {
    period: "Evening",
    timeRange: "3:00 PM – 11:00 PM",
    slots: [
      { staffId: "s003", role: "RN", unit: "Memory Care / Float", status: "scheduled" },
      { staffId: "s006", role: "LPN", unit: "West Wing", status: "scheduled" },
      { staffId: "s009", role: "CNA", unit: "West Wing", status: "scheduled" },
      { staffId: "s010", role: "CNA", unit: "Memory Care", status: "scheduled" },
      { staffId: "s011", role: "CNA", unit: "East Wing", status: "scheduled" },
      { staffId: "s017", role: "Med Tech", unit: "East / West eMAR", status: "scheduled" },
      { staffId: null, role: "CNA", unit: "Independent Living", status: "open" },
      { staffId: null, role: "Activities", unit: "Memory Care", status: "open" },
      { staffId: "s019", role: "Dietary", unit: "Dining", status: "scheduled" },
      { staffId: "s020", role: "Maintenance", unit: "On-call", status: "scheduled" },
    ],
  },
  {
    period: "Night",
    timeRange: "11:00 PM – 7:00 AM",
    slots: [
      { staffId: "s004", role: "LPN", unit: "All Wings (supervisor)", status: "scheduled" },
      { staffId: "s012", role: "CNA", unit: "East / West Wing", status: "scheduled" },
      { staffId: "s014", role: "CNA", unit: "Memory Care", status: "scheduled" },
      { staffId: null, role: "CNA", unit: "East / West Wing", status: "open" },
    ],
  },
];

// ── Open Shifts ────────────────────────────────────────────────────────────────

export const OPEN_SHIFTS: OpenShift[] = [
  {
    id: "os001",
    period: "Day",
    role: "CNA",
    unit: "West Wing",
    openedAt: "2026-06-10T05:48:00",
    reason: "callout",
    notified: [
      { staffId: "s013", name: "Patricia Lee", response: "declined" },
      { staffId: "s014", name: "Thomas Brown", response: "no_response" },
      { staffId: "s011", name: "Emily Martinez", response: "no_response" },
    ],
  },
  {
    id: "os002",
    period: "Evening",
    role: "CNA",
    unit: "Independent Living",
    openedAt: "2026-06-09T14:00:00",
    reason: "unfilled",
    notified: [
      { staffId: "s013", name: "Patricia Lee", response: "no_response" },
      { staffId: "s014", name: "Thomas Brown", response: "no_response" },
    ],
  },
  {
    id: "os003",
    period: "Evening",
    role: "Activities",
    unit: "Memory Care",
    openedAt: "2026-06-09T09:00:00",
    reason: "unfilled",
    notified: [
      { staffId: "s018", name: "Brenda Foster", response: "declined" },
    ],
  },
  {
    id: "os004",
    period: "Night",
    role: "CNA",
    unit: "East / West Wing",
    openedAt: "2026-06-07T11:00:00",
    reason: "unfilled",
    notified: [
      { staffId: "s013", name: "Patricia Lee", response: "declined" },
      { staffId: "s014", name: "Thomas Brown", response: "no_response" },
      { staffId: "s011", name: "Emily Martinez", response: "declined" },
    ],
  },
];

// ── Callout Log (today) ────────────────────────────────────────────────────────

export const CALLOUT_LOG: CalloutRecord[] = [
  {
    id: "co001",
    staffId: "s999", // departed employee
    staffName: "L. Monroe, CNA",
    role: "CNA",
    period: "Day",
    unit: "West Wing",
    reportedAt: "5:48 AM",
    reason: "Personal emergency",
    covered: false,
    coveredBy: undefined,
  },
];

// ── Week-to-date callout summary ──────────────────────────────────────────────

export const CALLOUTS_THIS_WEEK = 3; // Monday–Thursday callouts
export const AGENCY_HOURS_THIS_WEEK = 8; // one agency Med Tech shift (Day, Premier Staffing)
export const AGENCY_HOURS_THIS_MONTH = 32; // 4 shifts last week

// ── PPD calculation helper ─────────────────────────────────────────────────────

export function calcPPD(census: number, totalScheduledHours: number): number {
  return totalScheduledHours / census;
}

export function calcTodayHours(shifts: DailyShift[]): {
  scheduled: number;
  open: number;
} {
  let scheduled = 0;
  let open = 0;
  for (const shift of shifts) {
    for (const slot of shift.slots) {
      if (slot.status === "scheduled" || slot.status === "agency_fill") scheduled += 8;
      else if (slot.status === "open" || slot.status === "called_out") open += 8;
    }
  }
  return { scheduled, open };
}
