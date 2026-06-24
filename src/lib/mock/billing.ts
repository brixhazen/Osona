// ── Types ─────────────────────────────────────────────────────────────────────

export type PayerType = "private_pay" | "medicaid" | "ltci" | "va" | "other";
export type PaymentMethod = "ach" | "check" | "credit_card" | "eft";
export type StatementStatus = "pending" | "generated" | "sent" | "paid" | "in_collections";
export type ArBucket = "current" | "30_60" | "60_90" | "90_plus";
export type CollectionStatus = "none" | "first_notice" | "second_notice" | "escalated" | "collections";

export interface PayerSource {
  type: PayerType;
  label: string;
  coveragePct?: number;
  coverageAmt?: number;
  policyNumber?: string;
  caseNumber?: string;
  contact?: string;
  paymentMethod: PaymentMethod;
}

export interface RateRecord {
  effectiveDate: string;
  baseRate: number;
  locTier: string;
  locRate: number;
  total: number;
  reason: string;
}

export interface AncillaryCharge {
  id: string;
  item: string;
  category: string;
  amount: number;
  date: string;
  postedBy: string;
  recurring: boolean;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  note?: string;
}

export interface TrustTransaction {
  id: string;
  date: string;
  type: "deposit" | "withdrawal";
  amount: number;
  purpose: string;
  staff: string;
  runningBalance: number;
}

export interface ResidentBilling {
  id: string;
  name: string;
  room: string;
  wing: string;
  locTier: string;
  moveInDate: string;
  baseRate: number;
  locRate: number;
  monthlyTotal: number;
  payers: PayerSource[];
  responsibleParty: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
    autopay: boolean;
  };
  currentBalance: number;
  arBucket: ArBucket;
  collectionStatus: CollectionStatus;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  statementStatus: StatementStatus;
  ancillaryCharges: AncillaryCharge[];
  paymentHistory: Payment[];
  trustBalance?: number;
  trustTransactions?: TrustTransaction[];
  rateHistory: RateRecord[];
  prorationNote?: string;
  notes?: string;
}

export interface BillingAlert {
  id: string;
  type: "danger" | "warn" | "info";
  title: string;
  sub: string;
  residentId: string | null;
}

// ── Community-wide constants ───────────────────────────────────────────────────

export const BILLING_MONTH = "May 2026";
export const MONTHLY_REVENUE_TOTAL = 414_300;
export const AR_OUTSTANDING_TOTAL = 38_400;
export const AR_CURRENT = 18_200;
export const AR_30_60 = 11_400;
export const AR_60_90 = 5_800;
export const AR_90_PLUS = 3_000;
export const DSO_DAYS = 22;
export const CENSUS_BILLING = 87;

export const CYCLE_STATS = {
  chargesPosted: 87,
  generated: 87,
  reviewed: 85,
  sent: 84,
  paid: 81,
};

// ── Payer mix (community-wide) ─────────────────────────────────────────────────

export const PAYER_MIX = [
  { name: "Private Pay", pct: 68, amount: 281_724, key: "private_pay" },
  { name: "Medicaid", pct: 15, amount: 62_145, key: "medicaid" },
  { name: "LTCI", pct: 10, amount: 41_430, key: "ltci" },
  { name: "VA Benefits", pct: 5, amount: 20_715, key: "va" },
  { name: "Other", pct: 2, amount: 8_286, key: "other" },
];

// ── Recent payments (community-wide, last 5) ───────────────────────────────────

export const RECENT_PAYMENTS = [
  { id: "rp001", residentName: "Gerald Hayes", room: "E-214", amount: 6_250, date: "May 1", method: "ACH" as PaymentMethod },
  { id: "rp002", residentName: "Patricia Cross", room: "W-312", amount: 4_800, date: "May 1", method: "ACH" as PaymentMethod },
  { id: "rp003", residentName: "James Caldwell", room: "IL-104", amount: 3_105, date: "May 1", method: "ACH" as PaymentMethod },
  { id: "rp004", residentName: "Raymond Kowalski", room: "E-118", amount: 2_600, date: "May 1", method: "credit_card" as PaymentMethod },
  { id: "rp005", residentName: "Eleanor Bradford", room: "W-108", amount: 5_250, date: "May 5", method: "check" as PaymentMethod },
];

// ── Billing alerts ─────────────────────────────────────────────────────────────

export const BILLING_ALERTS: BillingAlert[] = [
  {
    id: "ba001", type: "danger",
    title: "Ruth Novak — 94 days overdue",
    sub: "$3,000 outstanding · Referred to collections",
    residentId: "r007",
  },
  {
    id: "ba002", type: "warn",
    title: "Howard Ingram — 62 days overdue",
    sub: "$5,800 outstanding · Escalated to Director",
    residentId: "r006",
  },
  {
    id: "ba003", type: "warn",
    title: "Beverly Stone — First invoice not yet paid",
    sub: "$6,461.29 · Move-in May 15 · Statement generated",
    residentId: "r010",
  },
  {
    id: "ba004", type: "info",
    title: "Vivian Marsh — Medicaid spend-down in progress",
    sub: "$1,200 balance · Medicaid application pending review",
    residentId: "r005",
  },
  {
    id: "ba005", type: "info",
    title: "2 statements pending review before sending",
    sub: "Beverly Stone and Vivian Marsh — review proration and payer split",
    residentId: null,
  },
];

// ── Ancillary charge catalog ──────────────────────────────────────────────────

export interface ChargeItem {
  id: string;
  name: string;
  category: string;
  defaultPrice: number;
  recurring: boolean;
  unit: string;
}

export const CHARGE_CATALOG: ChargeItem[] = [
  { id: "cat01", name: "Cable TV", category: "Amenities", defaultPrice: 35, recurring: true, unit: "per month" },
  { id: "cat02", name: "Phone Line", category: "Amenities", defaultPrice: 28, recurring: true, unit: "per month" },
  { id: "cat03", name: "Laundry Service", category: "Amenities", defaultPrice: 85, recurring: true, unit: "per month" },
  { id: "cat04", name: "Storage Unit", category: "Amenities", defaultPrice: 75, recurring: true, unit: "per month" },
  { id: "cat05", name: "Beautician / Hair", category: "Personal Care", defaultPrice: 45, recurring: false, unit: "per visit" },
  { id: "cat06", name: "Barber Service", category: "Personal Care", defaultPrice: 25, recurring: false, unit: "per visit" },
  { id: "cat07", name: "Pet Care", category: "Personal Care", defaultPrice: 150, recurring: true, unit: "per month" },
  { id: "cat08", name: "Incontinence Supplies", category: "Medical", defaultPrice: 65, recurring: true, unit: "per month" },
  { id: "cat09", name: "Pharmacy Delivery", category: "Medical", defaultPrice: 15, recurring: false, unit: "per delivery" },
  { id: "cat10", name: "Guest Meal", category: "Dining", defaultPrice: 12, recurring: false, unit: "per meal" },
  { id: "cat11", name: "Transportation", category: "Services", defaultPrice: 35, recurring: false, unit: "per trip" },
  { id: "cat12", name: "Extra Housekeeping", category: "Services", defaultPrice: 45, recurring: false, unit: "per session" },
  { id: "cat13", name: "Personal Shopping", category: "Services", defaultPrice: 60, recurring: false, unit: "per trip" },
  { id: "cat14", name: "Dry Cleaning", category: "Amenities", defaultPrice: 25, recurring: false, unit: "per order" },
  { id: "cat15", name: "Activity Fee", category: "Activities", defaultPrice: 20, recurring: false, unit: "per event" },
  { id: "cat16", name: "Community Fee (one-time)", category: "Move-In", defaultPrice: 3_500, recurring: false, unit: "one-time" },
];

// ── Resident billing profiles ──────────────────────────────────────────────────

export const RESIDENTS_BILLING: ResidentBilling[] = [
  // ── 1. Gerald Hayes — Private pay ACH autopay, current ────────────────────
  {
    id: "r001",
    name: "Gerald Hayes",
    room: "E-214",
    wing: "East Wing",
    locTier: "Enhanced",
    moveInDate: "2023-07-14",
    baseRate: 5_400,
    locRate: 850,
    monthlyTotal: 6_250,
    payers: [{
      type: "private_pay",
      label: "Private Pay",
      coveragePct: 100,
      paymentMethod: "ach",
    }],
    responsibleParty: {
      name: "Thomas Hayes",
      relationship: "Son",
      phone: "(801) 555-4101",
      email: "t.hayes@email.com",
      autopay: true,
    },
    currentBalance: 0,
    arBucket: "current",
    collectionStatus: "none",
    lastPaymentDate: "2026-05-01",
    lastPaymentAmount: 6_250,
    statementStatus: "paid",
    ancillaryCharges: [
      { id: "ac001", item: "Cable TV", category: "Amenities", amount: 35, date: "2026-05-01", postedBy: "System", recurring: true },
      { id: "ac002", item: "Pharmacy Delivery", category: "Medical", amount: 15, date: "2026-05-08", postedBy: "Maria Rivera, RN", recurring: false },
    ],
    paymentHistory: [
      { id: "p001", date: "2026-05-01", amount: 6_250, method: "ach", reference: "ACH-09412", note: "Autopay" },
      { id: "p002", date: "2026-04-01", amount: 6_250, method: "ach", reference: "ACH-08876", note: "Autopay" },
      { id: "p003", date: "2026-03-01", amount: 6_250, method: "ach", reference: "ACH-08341", note: "Autopay" },
    ],
    rateHistory: [
      { effectiveDate: "2026-01-01", baseRate: 5_400, locTier: "Enhanced", locRate: 850, total: 6_250, reason: "Annual 4% rate increase" },
      { effectiveDate: "2025-01-01", baseRate: 5_100, locTier: "Enhanced", locRate: 800, total: 5_900, reason: "Annual 3.5% rate increase" },
      { effectiveDate: "2023-07-14", baseRate: 4_800, locTier: "Moderate", locRate: 500, total: 5_300, reason: "Move-in rate" },
    ],
    trustBalance: 347.50,
    trustTransactions: [
      { id: "tt001", date: "2026-05-05", type: "withdrawal", amount: 20.00, purpose: "Personal items — CVS Pharmacy", staff: "Sandra Davis, CNA", runningBalance: 347.50 },
      { id: "tt002", date: "2026-04-28", type: "deposit", amount: 200.00, purpose: "Family deposit", staff: "Admin", runningBalance: 367.50 },
      { id: "tt003", date: "2026-04-15", type: "withdrawal", amount: 19.50, purpose: "Beautician tip", staff: "Rachel Thompson, RN", runningBalance: 167.50 },
      { id: "tt004", date: "2026-04-01", type: "deposit", amount: 150.00, purpose: "Family deposit", staff: "Admin", runningBalance: 187.00 },
    ],
  },

  // ── 2. Doris Lambert — Medicaid waiver + personal needs supplement ─────────
  {
    id: "r002",
    name: "Doris Lambert",
    room: "MC-205",
    wing: "Memory Care",
    locTier: "Memory Care",
    moveInDate: "2024-01-22",
    baseRate: 3_200,
    locRate: 0,
    monthlyTotal: 3_200,
    payers: [
      {
        type: "medicaid",
        label: "Utah Medicaid Waiver",
        coverageAmt: 3_200,
        caseNumber: "UT-WVR-2024-0841",
        contact: "Case Manager: Denise Park (801) 555-9200",
        paymentMethod: "eft",
      },
      {
        type: "private_pay",
        label: "Private Pay (Personal Needs)",
        coverageAmt: 180,
        paymentMethod: "check",
      },
    ],
    responsibleParty: {
      name: "Sandra Lambert",
      relationship: "Daughter",
      phone: "(801) 555-4202",
      email: "s.lambert@email.com",
      autopay: false,
    },
    currentBalance: 0,
    arBucket: "current",
    collectionStatus: "none",
    lastPaymentDate: "2026-05-12",
    lastPaymentAmount: 3_200,
    statementStatus: "sent",
    ancillaryCharges: [
      { id: "ac010", item: "Incontinence Supplies", category: "Medical", amount: 65, date: "2026-05-01", postedBy: "System", recurring: true },
    ],
    paymentHistory: [
      { id: "p010", date: "2026-05-12", amount: 3_200, method: "eft", reference: "EFT-UT-0512", note: "Utah Medicaid — May remittance" },
      { id: "p011", date: "2026-04-14", amount: 3_200, method: "eft", reference: "EFT-UT-0414", note: "Utah Medicaid — Apr remittance" },
      { id: "p012", date: "2026-03-13", amount: 3_200, method: "eft", reference: "EFT-UT-0313", note: "Utah Medicaid — Mar remittance" },
    ],
    rateHistory: [
      { effectiveDate: "2026-01-01", baseRate: 3_200, locTier: "Memory Care", locRate: 0, total: 3_200, reason: "Utah Medicaid waiver rate (FY2026)" },
      { effectiveDate: "2024-01-22", baseRate: 3_100, locTier: "Memory Care", locRate: 0, total: 3_100, reason: "Move-in — Medicaid waiver rate (FY2024)" },
    ],
    trustBalance: 892.00,
    trustTransactions: [
      { id: "tt010", date: "2026-05-01", type: "deposit", amount: 50.00, purpose: "UT Medicaid personal needs allowance", staff: "Admin", runningBalance: 892.00 },
      { id: "tt011", date: "2026-04-10", type: "withdrawal", amount: 25.00, purpose: "Birthday cards and stamps", staff: "Brenda Foster, Activities", runningBalance: 842.00 },
      { id: "tt012", date: "2026-04-01", type: "deposit", amount: 50.00, purpose: "UT Medicaid personal needs allowance", staff: "Admin", runningBalance: 867.00 },
      { id: "tt013", date: "2026-03-14", type: "withdrawal", amount: 12.00, purpose: "Craft supplies — activity program", staff: "Brenda Foster, Activities", runningBalance: 817.00 },
    ],
    notes: "Medicaid case number up for annual review June 1 — verify with case manager.",
  },

  // ── 3. Eleanor Bradford — Private pay check, current ──────────────────────
  {
    id: "r003",
    name: "Eleanor Bradford",
    room: "W-108",
    wing: "West Wing",
    locTier: "Moderate",
    moveInDate: "2022-11-03",
    baseRate: 4_800,
    locRate: 450,
    monthlyTotal: 5_250,
    payers: [{
      type: "private_pay",
      label: "Private Pay",
      coveragePct: 100,
      paymentMethod: "check",
    }],
    responsibleParty: {
      name: "William Bradford",
      relationship: "Husband",
      phone: "(801) 555-4303",
      email: "w.bradford@email.com",
      autopay: false,
    },
    currentBalance: 0,
    arBucket: "current",
    collectionStatus: "none",
    lastPaymentDate: "2026-05-05",
    lastPaymentAmount: 5_250,
    statementStatus: "paid",
    ancillaryCharges: [
      { id: "ac020", item: "Cable TV", category: "Amenities", amount: 35, date: "2026-05-01", postedBy: "System", recurring: true },
      { id: "ac021", item: "Beautician / Hair", category: "Personal Care", amount: 65, date: "2026-05-07", postedBy: "Admin", recurring: false },
    ],
    paymentHistory: [
      { id: "p020", date: "2026-05-05", amount: 5_250, method: "check", reference: "Check #4421", note: "" },
      { id: "p021", date: "2026-04-07", amount: 5_250, method: "check", reference: "Check #4398", note: "" },
      { id: "p022", date: "2026-03-06", amount: 5_250, method: "check", reference: "Check #4372", note: "" },
    ],
    rateHistory: [
      { effectiveDate: "2026-01-01", baseRate: 4_800, locTier: "Moderate", locRate: 450, total: 5_250, reason: "Annual 4% rate increase" },
      { effectiveDate: "2025-01-01", baseRate: 4_600, locTier: "Moderate", locRate: 425, total: 5_025, reason: "Annual 3.5% rate increase" },
      { effectiveDate: "2022-11-03", baseRate: 4_100, locTier: "Basic", locRate: 0, total: 4_100, reason: "Move-in rate" },
    ],
  },

  // ── 4. Raymond Kowalski — LTCI + Private pay split ────────────────────────
  {
    id: "r004",
    name: "Raymond Kowalski",
    room: "E-118",
    wing: "East Wing",
    locTier: "Enhanced",
    moveInDate: "2023-04-01",
    baseRate: 5_400,
    locRate: 1_100,
    monthlyTotal: 6_500,
    payers: [
      {
        type: "ltci",
        label: "Mutual of Omaha LTCI",
        coverageAmt: 3_900,
        coveragePct: 60,
        policyNumber: "MOO-4782913",
        contact: "Claims: (800) 555-2600",
        paymentMethod: "eft",
      },
      {
        type: "private_pay",
        label: "Private Pay",
        coverageAmt: 2_600,
        coveragePct: 40,
        paymentMethod: "credit_card",
      },
    ],
    responsibleParty: {
      name: "Diana Kowalski",
      relationship: "Wife",
      phone: "(801) 555-4404",
      email: "d.kowalski@email.com",
      autopay: true,
    },
    currentBalance: 0,
    arBucket: "current",
    collectionStatus: "none",
    lastPaymentDate: "2026-05-01",
    lastPaymentAmount: 6_500,
    statementStatus: "paid",
    ancillaryCharges: [
      { id: "ac030", item: "Cable TV", category: "Amenities", amount: 35, date: "2026-05-01", postedBy: "System", recurring: true },
      { id: "ac031", item: "Transportation", category: "Services", amount: 70, date: "2026-05-06", postedBy: "Gary Phillips, Maintenance", recurring: false },
      { id: "ac032", item: "Guest Meal", category: "Dining", amount: 36, date: "2026-05-10", postedBy: "Mark Chen, Dietary", recurring: false },
    ],
    paymentHistory: [
      { id: "p030", date: "2026-05-01", amount: 3_900, method: "eft", reference: "MOO-EFT-0501", note: "LTCI — Mutual of Omaha" },
      { id: "p031", date: "2026-05-01", amount: 2_600, method: "credit_card", reference: "CC-5841", note: "Private pay autopay" },
      { id: "p032", date: "2026-04-01", amount: 3_900, method: "eft", reference: "MOO-EFT-0401", note: "LTCI — Mutual of Omaha" },
      { id: "p033", date: "2026-04-01", amount: 2_600, method: "credit_card", reference: "CC-5734", note: "Private pay autopay" },
    ],
    rateHistory: [
      { effectiveDate: "2026-01-01", baseRate: 5_400, locTier: "Enhanced", locRate: 1_100, total: 6_500, reason: "Annual 4% increase + LOC upgrade to Enhanced+" },
      { effectiveDate: "2025-06-15", baseRate: 5_100, locTier: "Enhanced", locRate: 900, total: 6_000, reason: "LOC upgrade — reassessment" },
      { effectiveDate: "2023-04-01", baseRate: 4_800, locTier: "Moderate", locRate: 450, total: 5_250, reason: "Move-in rate" },
    ],
  },

  // ── 5. Vivian Marsh — Spend-down transitioning to Medicaid ───────────────
  {
    id: "r005",
    name: "Vivian Marsh",
    room: "MC-201",
    wing: "Memory Care",
    locTier: "Memory Care",
    moveInDate: "2024-08-05",
    baseRate: 5_400,
    locRate: 1_100,
    monthlyTotal: 6_500,
    payers: [
      {
        type: "private_pay",
        label: "Private Pay (spend-down in progress)",
        coveragePct: 100,
        paymentMethod: "check",
      },
    ],
    responsibleParty: {
      name: "Kevin Marsh",
      relationship: "Son",
      phone: "(801) 555-4505",
      email: "k.marsh@email.com",
      autopay: false,
    },
    currentBalance: 1_200,
    arBucket: "30_60",
    collectionStatus: "first_notice",
    lastPaymentDate: "2026-04-02",
    lastPaymentAmount: 6_500,
    statementStatus: "generated",
    ancillaryCharges: [
      { id: "ac040", item: "Cable TV", category: "Amenities", amount: 35, date: "2026-05-01", postedBy: "System", recurring: true },
      { id: "ac041", item: "Incontinence Supplies", category: "Medical", amount: 65, date: "2026-05-01", postedBy: "System", recurring: true },
    ],
    paymentHistory: [
      { id: "p040", date: "2026-04-02", amount: 6_500, method: "check", reference: "Check #3201", note: "Partial month — Medicaid application in process" },
      { id: "p041", date: "2026-03-01", amount: 6_500, method: "check", reference: "Check #3188", note: "" },
      { id: "p042", date: "2026-02-01", amount: 6_500, method: "check", reference: "Check #3172", note: "" },
    ],
    rateHistory: [
      { effectiveDate: "2026-01-01", baseRate: 5_400, locTier: "Memory Care", locRate: 1_100, total: 6_500, reason: "Annual 4% increase" },
      { effectiveDate: "2024-08-05", baseRate: 5_100, locTier: "Memory Care", locRate: 900, total: 6_000, reason: "Move-in rate" },
    ],
    notes: "Medicaid application submitted April 8 — UT DHS case pending. Expect determination within 45 days. Billing on hold at private-pay rate pending Medicaid approval. Coordinate with social worker.",
  },

  // ── 6. Howard Ingram — 62-day A/R, escalated ─────────────────────────────
  {
    id: "r006",
    name: "Howard Ingram",
    room: "E-220",
    wing: "East Wing",
    locTier: "Moderate",
    moveInDate: "2023-09-18",
    baseRate: 4_800,
    locRate: 600,
    monthlyTotal: 5_400,
    payers: [{
      type: "private_pay",
      label: "Private Pay",
      coveragePct: 100,
      paymentMethod: "check",
    }],
    responsibleParty: {
      name: "Linda Ingram",
      relationship: "Wife",
      phone: "(801) 555-4606",
      email: "l.ingram@email.com",
      autopay: false,
    },
    currentBalance: 5_800,
    arBucket: "60_90",
    collectionStatus: "escalated",
    lastPaymentDate: "2026-03-01",
    lastPaymentAmount: 5_400,
    statementStatus: "sent",
    ancillaryCharges: [
      { id: "ac050", item: "Cable TV", category: "Amenities", amount: 35, date: "2026-05-01", postedBy: "System", recurring: true },
    ],
    paymentHistory: [
      { id: "p050", date: "2026-03-01", amount: 5_400, method: "check", reference: "Check #8821", note: "" },
      { id: "p051", date: "2026-02-01", amount: 5_400, method: "check", reference: "Check #8804", note: "" },
      { id: "p052", date: "2026-01-03", amount: 5_400, method: "check", reference: "Check #8786", note: "" },
    ],
    rateHistory: [
      { effectiveDate: "2026-01-01", baseRate: 4_800, locTier: "Moderate", locRate: 600, total: 5_400, reason: "Annual 4% rate increase" },
      { effectiveDate: "2023-09-18", baseRate: 4_500, locTier: "Basic", locRate: 0, total: 4_500, reason: "Move-in rate" },
    ],
    notes: "April and May invoices unpaid. Phone calls placed May 2 and May 9. Wife states financial hardship — estate issues. Escalated to Executive Director May 10. Payment plan discussion scheduled May 20.",
  },

  // ── 7. Ruth Novak — 91+ days, in collections ──────────────────────────────
  {
    id: "r007",
    name: "Ruth Novak",
    room: "W-215",
    wing: "West Wing",
    locTier: "Basic",
    moveInDate: "2024-06-10",
    baseRate: 4_800,
    locRate: 0,
    monthlyTotal: 4_800,
    payers: [{
      type: "private_pay",
      label: "Private Pay",
      coveragePct: 100,
      paymentMethod: "check",
    }],
    responsibleParty: {
      name: "James Novak",
      relationship: "Son",
      phone: "(801) 555-4707",
      email: "j.novak@email.com",
      autopay: false,
    },
    currentBalance: 3_000,
    arBucket: "90_plus",
    collectionStatus: "collections",
    lastPaymentDate: "2026-01-15",
    lastPaymentAmount: 4_800,
    statementStatus: "in_collections",
    ancillaryCharges: [],
    paymentHistory: [
      { id: "p060", date: "2026-01-15", amount: 4_800, method: "check", reference: "Check #2204", note: "Late payment — Jan invoice" },
      { id: "p061", date: "2025-12-03", amount: 4_800, method: "check", reference: "Check #2191", note: "" },
      { id: "p062", date: "2025-11-01", amount: 4_800, method: "check", reference: "Check #2178", note: "" },
    ],
    rateHistory: [
      { effectiveDate: "2026-01-01", baseRate: 4_800, locTier: "Basic", locRate: 0, total: 4_800, reason: "Annual 4% rate increase" },
      { effectiveDate: "2024-06-10", baseRate: 4_200, locTier: "Basic", locRate: 0, total: 4_200, reason: "Move-in rate" },
    ],
    notes: "Feb, Mar, Apr invoices unpaid — total $14,400 cumulative. Partial payment $3,000 received (unclear date?). Referred to collections agency April 28. Family unresponsive to calls and letters.",
  },

  // ── 8. Patricia Cross — Private pay ACH (daughter), current ──────────────
  {
    id: "r008",
    name: "Patricia Cross",
    room: "W-312",
    wing: "West Wing",
    locTier: "Moderate",
    moveInDate: "2022-04-15",
    baseRate: 4_800,
    locRate: 0,
    monthlyTotal: 4_800,
    payers: [{
      type: "private_pay",
      label: "Private Pay",
      coveragePct: 100,
      paymentMethod: "ach",
    }],
    responsibleParty: {
      name: "Carol Martinez",
      relationship: "Daughter",
      phone: "(801) 555-4808",
      email: "c.martinez@email.com",
      autopay: true,
    },
    currentBalance: 0,
    arBucket: "current",
    collectionStatus: "none",
    lastPaymentDate: "2026-05-01",
    lastPaymentAmount: 4_800,
    statementStatus: "paid",
    ancillaryCharges: [
      { id: "ac070", item: "Cable TV", category: "Amenities", amount: 35, date: "2026-05-01", postedBy: "System", recurring: true },
      { id: "ac071", item: "Laundry Service", category: "Amenities", amount: 85, date: "2026-05-01", postedBy: "System", recurring: true },
      { id: "ac072", item: "Beautician / Hair", category: "Personal Care", amount: 45, date: "2026-05-13", postedBy: "Admin", recurring: false },
    ],
    paymentHistory: [
      { id: "p070", date: "2026-05-01", amount: 4_800, method: "ach", reference: "ACH-09418", note: "Autopay — Carol Martinez" },
      { id: "p071", date: "2026-04-01", amount: 4_800, method: "ach", reference: "ACH-08882", note: "Autopay — Carol Martinez" },
      { id: "p072", date: "2026-03-01", amount: 4_800, method: "ach", reference: "ACH-08347", note: "Autopay — Carol Martinez" },
    ],
    rateHistory: [
      { effectiveDate: "2026-01-01", baseRate: 4_800, locTier: "Moderate", locRate: 0, total: 4_800, reason: "Annual 4% rate increase" },
      { effectiveDate: "2022-04-15", baseRate: 3_900, locTier: "Basic", locRate: 0, total: 3_900, reason: "Move-in rate" },
    ],
    trustBalance: 215.75,
    trustTransactions: [
      { id: "tt070", date: "2026-05-02", type: "withdrawal", amount: 45.00, purpose: "Beautician service", staff: "Admin", runningBalance: 215.75 },
      { id: "tt071", date: "2026-05-01", type: "deposit", amount: 100.00, purpose: "Daughter deposit", staff: "Admin", runningBalance: 260.75 },
      { id: "tt072", date: "2026-04-14", type: "withdrawal", amount: 34.25, purpose: "Personal items — pharmacy", staff: "Rachel Thompson, RN", runningBalance: 160.75 },
    ],
  },

  // ── 9. James Caldwell — VA Aid & Attendance + Private pay ────────────────
  {
    id: "r009",
    name: "James Caldwell",
    room: "IL-104",
    wing: "Independent Living",
    locTier: "Moderate",
    moveInDate: "2023-11-12",
    baseRate: 4_800,
    locRate: 600,
    monthlyTotal: 5_400,
    payers: [
      {
        type: "va",
        label: "VA Aid & Attendance",
        coverageAmt: 2_295,
        policyNumber: "VA-SLC-2023-7741",
        contact: "VA Regional Office: (800) 827-1000",
        paymentMethod: "eft",
      },
      {
        type: "private_pay",
        label: "Private Pay",
        coverageAmt: 3_105,
        paymentMethod: "ach",
      },
    ],
    responsibleParty: {
      name: "Margaret Caldwell",
      relationship: "Wife",
      phone: "(801) 555-4909",
      email: "m.caldwell@email.com",
      autopay: true,
    },
    currentBalance: 0,
    arBucket: "current",
    collectionStatus: "none",
    lastPaymentDate: "2026-05-01",
    lastPaymentAmount: 5_400,
    statementStatus: "paid",
    ancillaryCharges: [
      { id: "ac080", item: "Cable TV", category: "Amenities", amount: 35, date: "2026-05-01", postedBy: "System", recurring: true },
      { id: "ac081", item: "Barber Service", category: "Personal Care", amount: 25, date: "2026-05-03", postedBy: "Admin", recurring: false },
      { id: "ac082", item: "Personal Shopping", category: "Services", amount: 60, date: "2026-05-09", postedBy: "Brenda Foster, Activities", recurring: false },
    ],
    paymentHistory: [
      { id: "p080", date: "2026-05-01", amount: 2_295, method: "eft", reference: "VA-EFT-0501", note: "VA Aid & Attendance — May" },
      { id: "p081", date: "2026-05-01", amount: 3_105, method: "ach", reference: "ACH-09421", note: "Private pay autopay" },
      { id: "p082", date: "2026-04-01", amount: 2_295, method: "eft", reference: "VA-EFT-0401", note: "VA Aid & Attendance — Apr" },
      { id: "p083", date: "2026-04-01", amount: 3_105, method: "ach", reference: "ACH-08885", note: "Private pay autopay" },
    ],
    rateHistory: [
      { effectiveDate: "2026-01-01", baseRate: 4_800, locTier: "Moderate", locRate: 600, total: 5_400, reason: "Annual 4% rate increase" },
      { effectiveDate: "2023-11-12", baseRate: 4_500, locTier: "Basic", locRate: 0, total: 4_500, reason: "Move-in rate" },
    ],
    trustBalance: 1_104.00,
    trustTransactions: [
      { id: "tt080", date: "2026-05-03", type: "withdrawal", amount: 25.00, purpose: "Barber service", staff: "Admin", runningBalance: 1_104.00 },
      { id: "tt081", date: "2026-05-01", type: "deposit", amount: 100.00, purpose: "Family deposit", staff: "Admin", runningBalance: 1_129.00 },
      { id: "tt082", date: "2026-04-28", type: "withdrawal", amount: 60.00, purpose: "Personal shopping trip", staff: "Brenda Foster, Activities", runningBalance: 1_029.00 },
      { id: "tt083", date: "2026-04-01", type: "deposit", amount: 100.00, purpose: "Family deposit", staff: "Admin", runningBalance: 1_089.00 },
    ],
  },

  // ── 10. Beverly Stone — New move-in May 15, prorated first month ──────────
  {
    id: "r010",
    name: "Beverly Stone",
    room: "W-304",
    wing: "West Wing",
    locTier: "Enhanced",
    moveInDate: "2026-05-15",
    baseRate: 5_400,
    locRate: 0,
    monthlyTotal: 5_400,
    payers: [{
      type: "private_pay",
      label: "Private Pay",
      coveragePct: 100,
      paymentMethod: "check",
    }],
    responsibleParty: {
      name: "Daniel Stone",
      relationship: "Son",
      phone: "(801) 555-5010",
      email: "d.stone@email.com",
      autopay: false,
    },
    currentBalance: 6_461.29,
    arBucket: "current",
    collectionStatus: "none",
    lastPaymentDate: "—",
    lastPaymentAmount: 0,
    statementStatus: "generated",
    ancillaryCharges: [],
    paymentHistory: [],
    rateHistory: [
      { effectiveDate: "2026-05-15", baseRate: 5_400, locTier: "Basic", locRate: 0, total: 5_400, reason: "Move-in rate" },
    ],
    prorationNote: "May 15–31 = 17 days × ($5,400 ÷ 31 days) = $2,961.29 + Community Fee $3,500.00 = $6,461.29 due",
    notes: "First invoice generated May 15. Statement pending review before sending. Community fee collected at signing.",
  },
];

// ── Invoices ──────────────────────────────────────────────────────────────────

export type InvoiceStatus = "draft" | "sent" | "paid" | "void";

export interface InvoiceLineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  residentId: string;
  residentName: string;
  room: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  total: number;
  notes?: string;
  paymentLinkSent: boolean;
  paymentLinkSentAt?: string;
  paidAt?: string;
  paidAmount?: number;
  paidMethod?: PaymentMethod;
  voidReason?: string;
}

export const INVOICES: Invoice[] = [
  {
    id: "inv001",
    invoiceNumber: "INV-2026-041",
    residentId: "r010",
    residentName: "Beverly Stone",
    room: "W-304",
    issueDate: "2026-05-15",
    dueDate: "2026-06-01",
    status: "sent",
    lineItems: [
      { id: "li001a", description: "Monthly Room & Board — June 2026", qty: 1, unitPrice: 5_400, total: 5_400 },
      { id: "li001b", description: "Community Fee (one-time)", qty: 1, unitPrice: 3_500, total: 3_500 },
      { id: "li001c", description: "Pro-ration credit (May 15–31, 17 of 31 days)", qty: 1, unitPrice: -2_961.29, total: -2_961.29 },
    ],
    subtotal: 5_938.71,
    total: 5_938.71,
    notes: "First invoice — prorated for move-in May 15, 2026. Community fee collected at signing.",
    paymentLinkSent: true,
    paymentLinkSentAt: "2026-05-15T14:32:00Z",
  },
  {
    id: "inv002",
    invoiceNumber: "INV-2026-042",
    residentId: "r005",
    residentName: "Vivian Marsh",
    room: "MC-201",
    issueDate: "2026-05-01",
    dueDate: "2026-05-15",
    status: "sent",
    lineItems: [
      { id: "li002a", description: "Medicaid Spend-Down Balance — May 2026", qty: 1, unitPrice: 1_200, total: 1_200 },
    ],
    subtotal: 1_200,
    total: 1_200,
    notes: "Medicaid application pending review. Balance due while application processes.",
    paymentLinkSent: false,
  },
  {
    id: "inv003",
    invoiceNumber: "INV-2026-040",
    residentId: "r004",
    residentName: "Raymond Kowalski",
    room: "E-118",
    issueDate: "2026-05-01",
    dueDate: "2026-05-20",
    status: "sent",
    lineItems: [
      { id: "li003a", description: "LOC Tier Adjustment — April retroactive", qty: 1, unitPrice: 450, total: 450 },
      { id: "li003b", description: "Incontinence Supplies — April", qty: 1, unitPrice: 65, total: 65 },
      { id: "li003c", description: "Pet Care — April", qty: 1, unitPrice: 150, total: 150 },
    ],
    subtotal: 665,
    total: 665,
    paymentLinkSent: true,
    paymentLinkSentAt: "2026-05-01T08:00:00Z",
  },
  {
    id: "inv004",
    invoiceNumber: "INV-2026-038",
    residentId: "r001",
    residentName: "Gerald Hayes",
    room: "E-214",
    issueDate: "2026-04-01",
    dueDate: "2026-04-15",
    status: "paid",
    lineItems: [
      { id: "li004a", description: "Cable TV — April 2026", qty: 1, unitPrice: 35, total: 35 },
      { id: "li004b", description: "Laundry Service — April 2026", qty: 1, unitPrice: 85, total: 85 },
      { id: "li004c", description: "Transportation — Medical appointments", qty: 3, unitPrice: 35, total: 105 },
      { id: "li004d", description: "Guest Meals", qty: 4, unitPrice: 12, total: 48 },
    ],
    subtotal: 273,
    total: 273,
    paymentLinkSent: false,
    paidAt: "2026-04-12T09:15:00Z",
    paidAmount: 273,
    paidMethod: "ach",
  },
  {
    id: "inv005",
    invoiceNumber: "INV-2026-039",
    residentId: "r003",
    residentName: "Eleanor Bradford",
    room: "W-108",
    issueDate: "2026-04-01",
    dueDate: "2026-04-15",
    status: "paid",
    lineItems: [
      { id: "li005a", description: "Beautician / Hair — April visits", qty: 2, unitPrice: 45, total: 90 },
      { id: "li005b", description: "Pharmacy Delivery", qty: 2, unitPrice: 15, total: 30 },
      { id: "li005c", description: "Activity Fee — Family Dinner Event", qty: 1, unitPrice: 20, total: 20 },
    ],
    subtotal: 140,
    total: 140,
    paymentLinkSent: true,
    paymentLinkSentAt: "2026-04-02T10:00:00Z",
    paidAt: "2026-04-10T11:30:00Z",
    paidAmount: 140,
    paidMethod: "credit_card",
  },
  {
    id: "inv006",
    invoiceNumber: "INV-2026-043",
    residentId: "r006",
    residentName: "Howard Ingram",
    room: "E-220",
    issueDate: "2026-05-01",
    dueDate: "2026-05-20",
    status: "draft",
    lineItems: [
      { id: "li006a", description: "Monthly Room & Board — May 2026", qty: 1, unitPrice: 4_800, total: 4_800 },
      { id: "li006b", description: "Level of Care — Enhanced+", qty: 1, unitPrice: 1_100, total: 1_100 },
    ],
    subtotal: 5_900,
    total: 5_900,
    notes: "Family requested itemized invoice before payment. Director review required before sending.",
    paymentLinkSent: false,
  },
  {
    id: "inv007",
    invoiceNumber: "INV-2026-044",
    residentId: "r009",
    residentName: "James Caldwell",
    room: "IL-104",
    issueDate: "2026-05-20",
    dueDate: "2026-06-05",
    status: "draft",
    lineItems: [
      { id: "li007a", description: "Extra Housekeeping — May", qty: 2, unitPrice: 45, total: 90 },
      { id: "li007b", description: "Personal Shopping", qty: 1, unitPrice: 60, total: 60 },
      { id: "li007c", description: "Dry Cleaning — May", qty: 1, unitPrice: 25, total: 25 },
    ],
    subtotal: 175,
    total: 175,
    paymentLinkSent: false,
  },
  {
    id: "inv008",
    invoiceNumber: "INV-2026-035",
    residentId: "r007",
    residentName: "Ruth Novak",
    room: "W-215",
    issueDate: "2026-03-01",
    dueDate: "2026-03-15",
    status: "void",
    lineItems: [
      { id: "li008a", description: "Monthly Room & Board — March 2026", qty: 1, unitPrice: 3_000, total: 3_000 },
    ],
    subtotal: 3_000,
    total: 3_000,
    notes: "Voided — incorrect rate applied at time of generation.",
    paymentLinkSent: false,
    voidReason: "Incorrect rate — replaced by corrected invoice INV-2026-036",
  },
];
