// ── Types ────────────────────────────────────────────────────────────────────

export type CareLevel = "independent" | "assisted" | "memory_care";
export type RiskLevel = "low" | "moderate" | "high";
export type MedStatus = "given" | "refused" | "held" | "pending" | "na";
export type MedWindow = "AM" | "Noon" | "PM" | "HS";
export type AssistLevel = "independent" | "supervision" | "limited" | "extensive" | "total" | "na";
export type IncidentSeverity = "minor" | "moderate" | "major";
export type IncidentStatus = "open" | "in_review" | "closed";
export type NoteType = "shift" | "clinical" | "physician" | "family";
export type Wing = "East Wing" | "West Wing" | "Memory Care" | "Independent Living";
export type PayerType = "private_pay" | "medicaid" | "ltci" | "va";

export interface Allergy {
  substance: string;
  reaction: string;
  severity: "mild" | "moderate" | "severe";
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
  isPrimary: boolean;
}

export interface Resident {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  room: string;
  wing: Wing;
  dob: string;
  age: number;
  gender: "Male" | "Female";
  careLevel: CareLevel;
  primaryDx: string[];
  allergies: Allergy[];
  physician: string;
  moveInDate: string;
  payerType: PayerType;
  emergencyContacts: EmergencyContact[];
  dnr: boolean;
  codeStatus: string;
  healthcareProxy: string;
  fallRisk: RiskLevel;
  elopementRisk: RiskLevel;
  weightLbs: number;
  height: string;
  insurance: string;
}

export interface MedPass {
  window: MedWindow;
  status: MedStatus;
  administeredAt?: string;
  administeredBy?: string;
  note?: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  dose: string;
  route: string;
  indication: string;
  prescriber: string;
  windows: MedWindow[];
  isPRN?: boolean;
  prnIndication?: string;
  todayPasses: MedPass[];
}

export interface VitalRecord {
  date: string;
  time: string;
  bpSystolic: number;
  bpDiastolic: number;
  pulse: number;
  temp: number;
  o2Sat: number;
  weightLbs: number;
  painLevel: number;
  recordedBy: string;
}

export interface CarePlanProblem {
  id: string;
  problem: string;
  goal: string;
  interventions: string[];
  targetDate: string;
  status: "active" | "resolved";
  relatedDx: string;
  lastReviewed: string;
}

export interface Assessment {
  id: string;
  type: "fall_risk" | "cognitive" | "adl" | "pain" | "nutrition" | "skin" | "elopement";
  label: string;
  completedDate: string;
  completedBy: string;
  score?: number;
  maxScore?: number;
  riskLevel: RiskLevel;
  findings: string;
  nextDueDate: string;
}

export interface AdlEntry {
  bathing: AssistLevel;
  dressing: AssistLevel;
  grooming: AssistLevel;
  mobility: AssistLevel;
  eating: AssistLevel;
  toileting: AssistLevel;
}

export interface AdlRecord {
  date: string;
  shift: "Day" | "Evening" | "Night";
  adls: AdlEntry;
  documentedBy: string;
}

export interface NursingNote {
  id: string;
  date: string;
  time: string;
  type: NoteType;
  subject: string;
  body: string;
  author: string;
  authorRole: string;
}

export interface Incident {
  id: string;
  date: string;
  time: string;
  type: "fall" | "medication_error" | "elopement" | "altercation" | "injury" | "behavioral";
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: string;
  description: string;
  immediateActions: string;
  physicianNotified: boolean;
  familyNotified: boolean;
  stateReportable: boolean;
  investigationNote?: string;
  reportedBy: string;
}

export interface MedOverride {
  status: "given" | "refused" | "held";
  note: string;
  reason: string;
  time: string;
}

export interface ClinicalDocument {
  id: string;
  type: "physician_order" | "lab" | "advance_directive" | "assessment_pdf" | "consent";
  title: string;
  date: string;
  uploadedBy: string;
  fileSize: string;
}

export interface ResidentClinicalData {
  medications: Medication[];
  vitals: VitalRecord[];
  carePlan: CarePlanProblem[];
  assessments: Assessment[];
  adlRecords: AdlRecord[];
  notes: NursingNote[];
  incidents: Incident[];
  documents: ClinicalDocument[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const NURSES = ["R. Thompson, RN", "K. Yamamoto, LPN", "S. Davis, CNA", "M. Rivera, RN"];

function buildVitals(
  baseline: { sys: number; dia: number; wt: number; pulse: number; o2: number },
  days = 14,
): VitalRecord[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date("2026-05-14");
    d.setDate(d.getDate() - (days - 1 - i));
    const n = (seed: number) => Math.sin(i * 0.8 + seed);
    return {
      date: d.toISOString().slice(0, 10),
      time: `${6 + (i % 3)}:${i % 2 === 0 ? "00" : "30"} AM`,
      bpSystolic: Math.round(baseline.sys + n(1) * 10),
      bpDiastolic: Math.round(baseline.dia + n(2) * 6),
      pulse: Math.round(baseline.pulse + n(3) * 8),
      temp: parseFloat((98.2 + n(4) * 0.4).toFixed(1)),
      o2Sat: Math.min(100, Math.max(88, Math.round(baseline.o2 + n(5) * 2))),
      weightLbs: parseFloat((baseline.wt + n(6) * 1.2).toFixed(1)),
      painLevel: Math.max(0, Math.min(5, Math.round(Math.abs(n(7) * 2)))),
      recordedBy: NURSES[i % 4],
    };
  });
}

// ── Residents ─────────────────────────────────────────────────────────────────

export const RESIDENTS: Resident[] = [
  {
    id: "r001",
    firstName: "Dorothy",
    lastName: "Chen",
    preferredName: "Dot",
    room: "MC-108",
    wing: "Memory Care",
    dob: "1942-02-14",
    age: 84,
    gender: "Female",
    careLevel: "memory_care",
    primaryDx: ["Alzheimer's disease (moderate)", "Hypertension", "Osteoporosis"],
    allergies: [
      { substance: "Penicillin", reaction: "Hives, rash", severity: "moderate" },
      { substance: "Sulfa drugs", reaction: "Rash", severity: "mild" },
    ],
    physician: "Dr. Sarah Patel",
    moveInDate: "2023-06-01",
    payerType: "private_pay",
    emergencyContacts: [
      { name: "Michael Chen", relation: "Son", phone: "(801) 555-0192", isPrimary: true },
      { name: "Linda Chen", relation: "Daughter-in-law", phone: "(801) 555-0301", isPrimary: false },
    ],
    dnr: true,
    codeStatus: "DNR / DNI",
    healthcareProxy: "Michael Chen",
    fallRisk: "high",
    elopementRisk: "high",
    weightLbs: 126,
    height: "5'1\"",
    insurance: "Aetna Medicare Advantage",
  },
  {
    id: "r002",
    firstName: "Gerald",
    lastName: "Hayes",
    room: "E-214",
    wing: "East Wing",
    dob: "1950-07-22",
    age: 75,
    gender: "Male",
    careLevel: "assisted",
    primaryDx: ["Congestive heart failure (systolic, EF 40%)", "Atrial fibrillation", "Hypertension", "Chronic kidney disease (Stage 3)"],
    allergies: [
      { substance: "Lisinopril", reaction: "Persistent dry cough", severity: "mild" },
    ],
    physician: "Dr. Sarah Patel",
    moveInDate: "2024-01-18",
    payerType: "ltci",
    emergencyContacts: [
      { name: "Gerald Hayes Jr.", relation: "Son", phone: "(801) 555-0471", isPrimary: true },
    ],
    dnr: false,
    codeStatus: "Full Code",
    healthcareProxy: "Gerald Hayes Jr.",
    fallRisk: "high",
    elopementRisk: "low",
    weightLbs: 183,
    height: "5'10\"",
    insurance: "Genworth LTC Insurance",
  },
  {
    id: "r003",
    firstName: "Eleanor",
    lastName: "Santos",
    preferredName: "Ellie",
    room: "W-118",
    wing: "West Wing",
    dob: "1945-11-08",
    age: 80,
    gender: "Female",
    careLevel: "assisted",
    primaryDx: ["Parkinson's disease (Stage III)", "Type 2 diabetes mellitus", "Osteoarthritis (bilateral knees)"],
    allergies: [
      { substance: "Codeine", reaction: "Nausea, vomiting", severity: "moderate" },
    ],
    physician: "Dr. James Wu",
    moveInDate: "2022-09-14",
    payerType: "private_pay",
    emergencyContacts: [
      { name: "Maria Santos-Rivera", relation: "Daughter", phone: "(801) 555-0822", isPrimary: true },
      { name: "Carlos Santos", relation: "Son", phone: "(801) 555-0933", isPrimary: false },
    ],
    dnr: true,
    codeStatus: "DNR",
    healthcareProxy: "Maria Santos-Rivera",
    fallRisk: "high",
    elopementRisk: "low",
    weightLbs: 142,
    height: "5'4\"",
    insurance: "UnitedHealthcare Medicare",
  },
  {
    id: "r004",
    firstName: "James",
    lastName: "Morrison",
    room: "E-308",
    wing: "East Wing",
    dob: "1948-04-03",
    age: 78,
    gender: "Male",
    careLevel: "assisted",
    primaryDx: ["COPD (Stage II, GOLD)", "Hypertension", "Hyperlipidemia"],
    allergies: [],
    physician: "Dr. James Wu",
    moveInDate: "2023-11-20",
    payerType: "medicaid",
    emergencyContacts: [
      { name: "Patricia Morrison", relation: "Wife", phone: "(801) 555-0261", isPrimary: true },
    ],
    dnr: false,
    codeStatus: "Full Code",
    healthcareProxy: "Patricia Morrison",
    fallRisk: "moderate",
    elopementRisk: "low",
    weightLbs: 178,
    height: "5'9\"",
    insurance: "Utah Medicaid",
  },
  {
    id: "r005",
    firstName: "Doris",
    lastName: "Lambert",
    preferredName: "Dottie",
    room: "MC-205",
    wing: "Memory Care",
    dob: "1938-09-30",
    age: 87,
    gender: "Female",
    careLevel: "memory_care",
    primaryDx: ["Vascular dementia (moderate-severe)", "Hypertension", "History of TIA (2021)"],
    allergies: [
      { substance: "Morphine", reaction: "Respiratory depression, confusion", severity: "severe" },
    ],
    physician: "Dr. Sarah Patel",
    moveInDate: "2022-03-07",
    payerType: "private_pay",
    emergencyContacts: [
      { name: "Susan Lambert-Boyd", relation: "Daughter", phone: "(801) 555-0655", isPrimary: true },
      { name: "Thomas Lambert", relation: "Son", phone: "(801) 555-0788", isPrimary: false },
    ],
    dnr: true,
    codeStatus: "DNR / Comfort Care",
    healthcareProxy: "Susan Lambert-Boyd",
    fallRisk: "high",
    elopementRisk: "high",
    weightLbs: 118,
    height: "5'2\"",
    insurance: "Aetna Medicare Advantage",
  },
  {
    id: "r006",
    firstName: "Harold",
    lastName: "Kim",
    room: "IL-102",
    wing: "Independent Living",
    dob: "1952-12-15",
    age: 73,
    gender: "Male",
    careLevel: "independent",
    primaryDx: ["Hypertension", "Osteoarthritis (lumbar spine, bilateral hips)", "Hyperlipidemia"],
    allergies: [
      { substance: "Shellfish", reaction: "Hives, throat tightening", severity: "severe" },
    ],
    physician: "Dr. James Wu",
    moveInDate: "2025-02-01",
    payerType: "private_pay",
    emergencyContacts: [
      { name: "Grace Kim", relation: "Wife", phone: "(801) 555-0112", isPrimary: true },
    ],
    dnr: false,
    codeStatus: "Full Code",
    healthcareProxy: "Grace Kim",
    fallRisk: "low",
    elopementRisk: "low",
    weightLbs: 195,
    height: "5'8\"",
    insurance: "AARP Medicare Supplement",
  },
];

// ── Clinical Data ──────────────────────────────────────────────────────────────

export const CLINICAL_DATA: Record<string, ResidentClinicalData> = {
  r001: {
    medications: [
      {
        id: "m001", name: "Aricept", genericName: "Donepezil", dose: "10 mg", route: "Oral",
        indication: "Alzheimer's dementia", prescriber: "Dr. Patel", windows: ["HS"],
        todayPasses: [{ window: "HS", status: "pending" }],
      },
      {
        id: "m002", name: "Namenda", genericName: "Memantine", dose: "10 mg", route: "Oral",
        indication: "Alzheimer's dementia", prescriber: "Dr. Patel", windows: ["AM", "PM"],
        todayPasses: [
          { window: "AM", status: "given", administeredAt: "7:45 AM", administeredBy: "K. Yamamoto, LPN" },
          { window: "PM", status: "pending" },
        ],
      },
      {
        id: "m003", name: "Lisinopril", genericName: "Lisinopril", dose: "10 mg", route: "Oral",
        indication: "Hypertension", prescriber: "Dr. Patel", windows: ["AM"],
        todayPasses: [{ window: "AM", status: "given", administeredAt: "7:45 AM", administeredBy: "K. Yamamoto, LPN" }],
      },
      {
        id: "m004", name: "Calcium + Vitamin D", genericName: "Calcium Carbonate / Cholecalciferol",
        dose: "600 mg / 400 IU", route: "Oral", indication: "Osteoporosis prevention", prescriber: "Dr. Patel",
        windows: ["AM", "PM"],
        todayPasses: [
          { window: "AM", status: "given", administeredAt: "7:45 AM", administeredBy: "K. Yamamoto, LPN" },
          { window: "PM", status: "pending" },
        ],
      },
      {
        id: "m005", name: "Melatonin", genericName: "Melatonin", dose: "3 mg", route: "Oral",
        indication: "Sleep initiation", prescriber: "Dr. Patel", windows: ["HS"],
        todayPasses: [{ window: "HS", status: "pending" }],
      },
      {
        id: "m006", name: "Acetaminophen", genericName: "Acetaminophen", dose: "325 mg", route: "Oral",
        indication: "Pain", prescriber: "Dr. Patel", windows: [], isPRN: true,
        prnIndication: "Pain or discomfort — may repeat Q4H, max 4 doses/day",
        todayPasses: [],
      },
    ],
    vitals: buildVitals({ sys: 148, dia: 88, wt: 126, pulse: 72, o2: 97 }),
    carePlan: [
      {
        id: "cp001", problem: "Risk for falls related to cognitive impairment (Alzheimer's dementia)",
        goal: "Resident will remain free from falls throughout stay.",
        interventions: [
          "Non-slip footwear at all times when out of bed",
          "Bed and chair alarms activated each shift and documented",
          "Hourly rounding during day shift; Q2H on evening and night",
          "Night light on at all times; room free of clutter",
          "Wheelchair for transport outside Memory Care unit",
        ],
        targetDate: "2026-07-01", status: "active", relatedDx: "Alzheimer's disease", lastReviewed: "2026-04-15",
      },
      {
        id: "cp002", problem: "Risk for elopement related to Alzheimer's dementia and wandering behavior",
        goal: "Resident will remain within secure Memory Care unit and be safely redirected.",
        interventions: [
          "Wander guard device in place — checked and documented each shift",
          "Memory Care unit exit door alarms activated at all times",
          "Document all wandering episodes each shift (time, location, behavior, response)",
          "Engage in structured activities to reduce restlessness and sundowning",
          "Family educated: do not prop doors; ensure wander guard is secure during visits",
        ],
        targetDate: "2026-07-01", status: "active", relatedDx: "Alzheimer's disease", lastReviewed: "2026-04-15",
      },
      {
        id: "cp003", problem: "Impaired memory and cognition related to Alzheimer's disease",
        goal: "Resident will participate in at least one structured activity daily with verbal cueing.",
        interventions: [
          "Consistent daily routine; introduce changes gradually",
          "Reminiscence therapy using family photos 3×/week",
          "Simple one-step verbal instructions with gentle redirection as needed",
          "Music therapy — resident enjoys 1940s–50s popular music",
          "Cognitive stimulation group Mondays and Wednesdays at 10 AM",
        ],
        targetDate: "2026-07-01", status: "active", relatedDx: "Alzheimer's disease", lastReviewed: "2026-04-15",
      },
      {
        id: "cp004", problem: "Risk for nutritional deficit related to poor appetite and dementia",
        goal: "Resident will maintain weight within ±5 lbs of baseline (126 lbs).",
        interventions: [
          "Small, frequent meals and snacks; finger foods offered",
          "Ensure Plus supplement each morning",
          "Weigh weekly; notify physician for >2 lb change in 7 days",
          "Seat resident with familiar peers during meals to encourage eating",
          "Dietary consult Q90 days",
        ],
        targetDate: "2026-07-01", status: "active", relatedDx: "Alzheimer's disease", lastReviewed: "2026-04-15",
      },
    ],
    assessments: [
      {
        id: "as001", type: "fall_risk", label: "Fall Risk — Morse Scale",
        completedDate: "2026-04-15", completedBy: "K. Yamamoto, LPN",
        score: 75, maxScore: 125, riskLevel: "high",
        findings: "History of falls; ambulatory aid (wheelchair); secondary diagnosis (Alzheimer's); limited awareness of fall risk. HIGH RISK protocol in place.",
        nextDueDate: "2026-07-15",
      },
      {
        id: "as002", type: "cognitive", label: "Cognitive Screening — SLUMS",
        completedDate: "2026-03-01", completedBy: "R. Thompson, RN",
        score: 11, maxScore: 30, riskLevel: "high",
        findings: "Score 11/30 — severe neurocognitive disorder. Significant impairment in orientation, memory recall, and executive function. Unable to state current year. Cannot recall 3 words after 5 minutes.",
        nextDueDate: "2026-09-01",
      },
      {
        id: "as003", type: "adl", label: "ADL Level of Care Assessment",
        completedDate: "2026-04-15", completedBy: "K. Yamamoto, LPN",
        riskLevel: "high",
        findings: "Requires extensive to total assistance with all ADLs. Bathing: total dependence. Dressing: extensive assist. Grooming: extensive assist. Mobility: extensive assist with wheelchair. Eating: supervision with finger foods set up.",
        nextDueDate: "2026-07-15",
      },
      {
        id: "as004", type: "nutrition", label: "Nutritional Screening — MNA-SF",
        completedDate: "2026-04-20", completedBy: "M. Rivera, RN",
        score: 7, maxScore: 14, riskLevel: "moderate",
        findings: "Score 7 — at risk for malnutrition. Weight loss of 3 lbs over last 3 months. Reduced appetite observed at meals. Dietary consult placed; Ensure Plus ordered.",
        nextDueDate: "2026-07-20",
      },
      {
        id: "as005", type: "elopement", label: "Elopement Risk Assessment",
        completedDate: "2026-04-15", completedBy: "R. Thompson, RN",
        riskLevel: "high",
        findings: "History of attempting to exit unit. Wander guard device in place. Does not reliably respond to first-attempt redirection. Family educated about elopement risk and door safety.",
        nextDueDate: "2026-07-15",
      },
      {
        id: "as006", type: "skin", label: "Skin / Wound — Braden Scale",
        completedDate: "2026-05-01", completedBy: "K. Yamamoto, LPN",
        score: 18, maxScore: 23, riskLevel: "moderate",
        findings: "Score 18 — mild risk. Skin intact throughout. No areas of breakdown or redness. Repositioning assist provided Q2H overnight by night staff. Continue to monitor.",
        nextDueDate: "2026-08-01",
      },
    ],
    adlRecords: [
      {
        date: "2026-05-14", shift: "Day",
        adls: { bathing: "total", dressing: "extensive", grooming: "extensive", mobility: "extensive", eating: "supervision", toileting: "extensive" },
        documentedBy: "K. Yamamoto, LPN",
      },
      {
        date: "2026-05-13", shift: "Day",
        adls: { bathing: "total", dressing: "extensive", grooming: "extensive", mobility: "extensive", eating: "supervision", toileting: "extensive" },
        documentedBy: "K. Yamamoto, LPN",
      },
      {
        date: "2026-05-13", shift: "Evening",
        adls: { bathing: "na", dressing: "extensive", grooming: "limited", mobility: "extensive", eating: "extensive", toileting: "total" },
        documentedBy: "S. Davis, CNA",
      },
      {
        date: "2026-05-12", shift: "Day",
        adls: { bathing: "total", dressing: "extensive", grooming: "extensive", mobility: "extensive", eating: "limited", toileting: "extensive" },
        documentedBy: "M. Rivera, RN",
      },
      {
        date: "2026-05-11", shift: "Day",
        adls: { bathing: "total", dressing: "extensive", grooming: "extensive", mobility: "extensive", eating: "supervision", toileting: "extensive" },
        documentedBy: "K. Yamamoto, LPN",
      },
      {
        date: "2026-05-10", shift: "Day",
        adls: { bathing: "total", dressing: "total", grooming: "extensive", mobility: "extensive", eating: "supervision", toileting: "extensive" },
        documentedBy: "K. Yamamoto, LPN",
      },
      {
        date: "2026-05-09", shift: "Day",
        adls: { bathing: "total", dressing: "extensive", grooming: "extensive", mobility: "extensive", eating: "limited", toileting: "extensive" },
        documentedBy: "M. Rivera, RN",
      },
    ],
    notes: [
      {
        id: "n001", date: "2026-05-14", time: "8:15 AM", type: "shift",
        subject: "Morning shift — agitation overnight",
        body: "Resident awoke agitated at approximately 0300 per night staff handoff. Redirected to room x3. Morning routine completed with extensive assistance — cooperative with cueing. Ate 75% of breakfast; required hand-over-hand guidance for cup. Participated in morning music group for 15 minutes before becoming restless and escorted to room. Wander guard in place and checked.",
        author: "K. Yamamoto, LPN", authorRole: "LPN",
      },
      {
        id: "n002", date: "2026-05-12", time: "3:30 PM", type: "clinical",
        subject: "Blood pressure elevated — physician notified",
        body: "Routine vitals taken at 1520. BP 158/94 — elevated from recent baseline. Resident calm, denies headache or visual changes. Dr. Patel notified via phone at 1535. Continue current Lisinopril 10mg; repeat BP check tomorrow AM. Dr. Patel will reassess at scheduled visit on 5/20. Son Michael was on-site and informed.",
        author: "R. Thompson, RN", authorRole: "RN",
      },
      {
        id: "n003", date: "2026-05-10", time: "10:00 AM", type: "physician",
        subject: "Dr. Patel monthly visit",
        body: "Dr. Patel visited resident at 1000. Brief cognitive assessment performed. Medications reviewed — no changes at this time. Concern noted for early nutritional decline; weight down 3 lbs since last visit. Dietary consult placed. Ensure Plus added to medication pass. Plan: repeat SLUMS in September. Family conference scheduled May 28 at 2:00 PM.",
        author: "R. Thompson, RN", authorRole: "RN (transcribing physician visit note)",
      },
      {
        id: "n004", date: "2026-05-08", time: "6:45 PM", type: "family",
        subject: "Family visit — son Michael Chen",
        body: "Son Michael Chen visited 1700–1845. Resident happy to see family; called son by name x1 during visit. Engaged with family photo album for 30 minutes. Son expressed concern about apparent weight loss. Educated on current nutrition interventions including Ensure supplementation and finger food offerings. Son will attend family conference May 28.",
        author: "S. Davis, CNA", authorRole: "CNA",
      },
    ],
    incidents: [],
    documents: [
      { id: "d001", type: "advance_directive", title: "POLST / DNR Form", date: "2024-01-15", uploadedBy: "R. Thompson, RN", fileSize: "284 KB" },
      { id: "d002", type: "physician_order", title: "Physician Orders — May 2026", date: "2026-05-01", uploadedBy: "R. Thompson, RN", fileSize: "112 KB" },
      { id: "d003", type: "assessment_pdf", title: "SLUMS Cognitive Assessment — March 2026", date: "2026-03-01", uploadedBy: "R. Thompson, RN", fileSize: "88 KB" },
      { id: "d004", type: "consent", title: "Admission Agreement & Consents", date: "2023-06-01", uploadedBy: "Admin", fileSize: "540 KB" },
    ],
  },

  r002: {
    medications: [
      {
        id: "m101", name: "Carvedilol", genericName: "Carvedilol", dose: "12.5 mg", route: "Oral",
        indication: "CHF / AFib rate control", prescriber: "Dr. Patel", windows: ["AM", "PM"],
        todayPasses: [
          { window: "AM", status: "given", administeredAt: "8:12 AM", administeredBy: "R. Thompson, RN" },
          { window: "PM", status: "pending" },
        ],
      },
      {
        id: "m102", name: "Furosemide", genericName: "Furosemide", dose: "40 mg", route: "Oral",
        indication: "CHF — fluid management", prescriber: "Dr. Patel", windows: ["AM"],
        todayPasses: [{ window: "AM", status: "given", administeredAt: "8:12 AM", administeredBy: "R. Thompson, RN" }],
      },
      {
        id: "m103", name: "Digoxin", genericName: "Digoxin", dose: "0.125 mg", route: "Oral",
        indication: "AFib — rate control", prescriber: "Dr. Patel", windows: ["AM"],
        todayPasses: [{ window: "AM", status: "given", administeredAt: "8:12 AM", administeredBy: "R. Thompson, RN" }],
      },
      {
        id: "m104", name: "Warfarin", genericName: "Warfarin", dose: "4 mg", route: "Oral",
        indication: "AFib — anticoagulation (target INR 2.0–3.0)", prescriber: "Dr. Patel", windows: ["HS"],
        todayPasses: [{ window: "HS", status: "pending" }],
      },
      {
        id: "m105", name: "Atorvastatin", genericName: "Atorvastatin", dose: "40 mg", route: "Oral",
        indication: "Cardiovascular risk / hyperlipidemia", prescriber: "Dr. Patel", windows: ["HS"],
        todayPasses: [{ window: "HS", status: "pending" }],
      },
      {
        id: "m106", name: "Potassium Chloride", genericName: "Potassium Chloride", dose: "20 mEq", route: "Oral",
        indication: "Potassium supplement (furosemide)", prescriber: "Dr. Patel", windows: ["AM"],
        todayPasses: [{ window: "AM", status: "given", administeredAt: "8:12 AM", administeredBy: "R. Thompson, RN" }],
      },
      {
        id: "m107", name: "Albuterol MDI", genericName: "Albuterol", dose: "2 puffs (90 mcg/puff)", route: "Inhaled",
        indication: "Dyspnea or wheezing", prescriber: "Dr. Patel", windows: [], isPRN: true,
        prnIndication: "Dyspnea or wheezing — may repeat Q4H",
        todayPasses: [],
      },
    ],
    vitals: (() => {
      const base = buildVitals({ sys: 136, dia: 82, wt: 183, pulse: 72, o2: 96 });
      base[base.length - 1] = {
        ...base[base.length - 1],
        time: "6:50 AM", bpSystolic: 138, bpDiastolic: 82,
        pulse: 88, o2Sat: 96, painLevel: 2, recordedBy: "R. Thompson, RN",
      };
      return base;
    })(),
    carePlan: [
      {
        id: "cp101", problem: "Activity intolerance related to congestive heart failure (EF 40%)",
        goal: "Resident will ambulate 100 feet with rolling walker without dyspnea exacerbation.",
        interventions: [
          "Daily weights at 0700 — same scale, same time; report >2 lb gain in 24 hrs to physician",
          "Elevate HOB 30 degrees at rest and during sleep",
          "Fluid restriction: 1,500 ml/day per physician order",
          "Monitor bilateral lower extremities for pitting edema each shift",
          "Ambulate Q shift with supervision, rest periods as needed; stop with SOB",
        ],
        targetDate: "2026-08-01", status: "active", relatedDx: "CHF", lastReviewed: "2026-05-14",
      },
      {
        id: "cp102", problem: "Risk for bleeding related to anticoagulation therapy (Warfarin)",
        goal: "INR maintained therapeutic (2.0–3.0); no bleeding events.",
        interventions: [
          "INR check weekly per physician standing order; report results to Dr. Patel same day",
          "Maintain consistent Vitamin K dietary intake — avoid large changes in green leafy vegetable consumption",
          "Monitor for signs of bleeding: bruising, hematuria, melena, prolonged bleeding from cuts",
          "Educate resident on fall precautions given anticoagulation status",
        ],
        targetDate: "2026-08-01", status: "active", relatedDx: "AFib", lastReviewed: "2026-05-01",
      },
      {
        id: "cp103", problem: "Risk for falls related to cardiac medications, deconditioning, and diuresis",
        goal: "Resident will remain free from injurious falls.",
        interventions: [
          "Call light within reach at all times; resident educated on use",
          "Fall mat at bedside",
          "Bed alarm activated each shift and documented",
          "No unsupervised nighttime ambulation; urinal at bedside per new physician order",
          "Walker readily accessible — do not ambulate without walker",
          "Post-fall neurological checks Q2H × 24 hrs following any fall event",
        ],
        targetDate: "2026-08-01", status: "active", relatedDx: "CHF, AFib", lastReviewed: "2026-05-14",
      },
    ],
    assessments: [
      {
        id: "as101", type: "fall_risk", label: "Fall Risk — Morse Scale (post-fall)",
        completedDate: "2026-05-14", completedBy: "R. Thompson, RN",
        score: 85, maxScore: 125, riskLevel: "high",
        findings: "Post-fall reassessment: Score 85 — HIGH RISK. Contributing factors: CHF medications (diuretics, cardiac meds), history of falls, impaired gait, deconditioning. Fall prevention care plan updated.",
        nextDueDate: "2026-08-14",
      },
      {
        id: "as102", type: "adl", label: "ADL Level of Care Assessment",
        completedDate: "2026-05-01", completedBy: "R. Thompson, RN",
        riskLevel: "moderate",
        findings: "Independent with grooming and eating. Limited assist with bathing (lower body). Supervision for dressing and mobility. Uses rolling walker independently on level surfaces.",
        nextDueDate: "2026-08-01",
      },
      {
        id: "as103", type: "cognitive", label: "Cognitive Screening — SLUMS",
        completedDate: "2026-02-15", completedBy: "M. Rivera, RN",
        score: 24, maxScore: 30, riskLevel: "low",
        findings: "Score 24/30 — normal cognitive function for age. Oriented x4. Mild short-term memory delay only. No deficits affecting ADL safety or decision-making.",
        nextDueDate: "2026-08-15",
      },
      {
        id: "as104", type: "nutrition", label: "Nutritional Screening — MNA-SF",
        completedDate: "2026-04-20", completedBy: "M. Rivera, RN",
        score: 11, maxScore: 14, riskLevel: "low",
        findings: "Score 11 — normal nutritional status. Weight stable. Good appetite. No significant dietary concerns.",
        nextDueDate: "2026-07-20",
      },
    ],
    adlRecords: [
      {
        date: "2026-05-14", shift: "Day",
        adls: { bathing: "limited", dressing: "supervision", grooming: "independent", mobility: "limited", eating: "independent", toileting: "supervision" },
        documentedBy: "R. Thompson, RN",
      },
      {
        date: "2026-05-13", shift: "Day",
        adls: { bathing: "limited", dressing: "supervision", grooming: "independent", mobility: "supervision", eating: "independent", toileting: "supervision" },
        documentedBy: "R. Thompson, RN",
      },
      {
        date: "2026-05-12", shift: "Day",
        adls: { bathing: "limited", dressing: "supervision", grooming: "independent", mobility: "supervision", eating: "independent", toileting: "supervision" },
        documentedBy: "K. Yamamoto, LPN",
      },
      {
        date: "2026-05-11", shift: "Day",
        adls: { bathing: "limited", dressing: "supervision", grooming: "independent", mobility: "limited", eating: "independent", toileting: "supervision" },
        documentedBy: "K. Yamamoto, LPN",
      },
      {
        date: "2026-05-10", shift: "Day",
        adls: { bathing: "limited", dressing: "supervision", grooming: "independent", mobility: "supervision", eating: "independent", toileting: "supervision" },
        documentedBy: "M. Rivera, RN",
      },
      {
        date: "2026-05-09", shift: "Day",
        adls: { bathing: "limited", dressing: "supervision", grooming: "independent", mobility: "supervision", eating: "independent", toileting: "supervision" },
        documentedBy: "K. Yamamoto, LPN",
      },
      {
        date: "2026-05-08", shift: "Day",
        adls: { bathing: "limited", dressing: "supervision", grooming: "independent", mobility: "supervision", eating: "independent", toileting: "supervision" },
        documentedBy: "M. Rivera, RN",
      },
    ],
    notes: [
      {
        id: "n101", date: "2026-05-14", time: "7:00 AM", type: "clinical",
        subject: "Fall incident — Room E-214, 6:42 AM",
        body: "Resident found on floor beside bed at 0642 by K. Yamamoto, LPN. Alert and oriented x2. States 'I was trying to go to the bathroom.' Denies loss of consciousness. Full assessment: no visible injuries, no head or neck pain, no extremity deformity or crepitus. VS: BP 138/82, P 88, RR 16, O2Sat 96%, Pain 2/10. Fall mat was in place; bed alarm was activated. Assisted back to bed using Sara lift with 2-person assist. Neurological checks initiated Q2H × 24 hrs. Dr. Patel notified at 0715. Son Gerald Hayes Jr. notified at 0715. Incident report completed.",
        author: "R. Thompson, RN", authorRole: "RN",
      },
      {
        id: "n102", date: "2026-05-13", time: "3:00 PM", type: "shift",
        subject: "Afternoon — stable, ambulated twice",
        body: "Resident in good spirits. Ambulated in hallway x2, approximately 75 feet each with rolling walker and supervision. Slight dyspnea on exertion noted — rested 3 minutes, fully resolved. Daily weight: 183.0 lbs (down 1 lb from yesterday; within normal variation, no intervention). No bilateral lower extremity edema. Ate 90% of lunch. Wife called at 1400 for update.",
        author: "S. Davis, CNA", authorRole: "CNA",
      },
      {
        id: "n103", date: "2026-05-11", time: "10:00 AM", type: "clinical",
        subject: "INR result — therapeutic range",
        body: "INR result received from SLC Laboratory: 2.4 (therapeutic range 2.0–3.0). Dr. Patel notified via secure message. No Warfarin dose change at this time; continue 4mg QHS. Next INR scheduled 2026-05-18.",
        author: "R. Thompson, RN", authorRole: "RN",
      },
    ],
    incidents: [
      {
        id: "i101", date: "2026-05-14", time: "6:42 AM",
        type: "fall", severity: "minor", status: "open",
        location: "Bedroom — beside bed (Room E-214)",
        description: "Resident found on floor beside bed. States he was attempting to reach the bathroom and felt 'dizzy for a second.' Denies loss of consciousness. No visible injuries on full assessment. Bed alarm was activated; fall mat was in place.",
        immediateActions: "Resident assessed — no injuries. Vital signs stable. Assisted back to bed. Neurological checks Q2H initiated. Care plan updated. Physician and family notified. Urinal to be placed at bedside — order pending Dr. Patel response.",
        physicianNotified: true, familyNotified: true, stateReportable: false,
        investigationNote: "Reviewing placement of urinal at bedside to reduce nighttime ambulation risk. Will discuss with Dr. Patel at next contact.",
        reportedBy: "R. Thompson, RN",
      },
    ],
    documents: [
      { id: "d101", type: "lab", title: "INR Result — 5/11/2026", date: "2026-05-11", uploadedBy: "R. Thompson, RN", fileSize: "45 KB" },
      { id: "d102", type: "lab", title: "BMP / CMP — 4/15/2026", date: "2026-04-15", uploadedBy: "R. Thompson, RN", fileSize: "62 KB" },
      { id: "d103", type: "physician_order", title: "Physician Orders — May 2026", date: "2026-05-01", uploadedBy: "R. Thompson, RN", fileSize: "98 KB" },
      { id: "d104", type: "consent", title: "Admission Agreement & Consents", date: "2024-01-18", uploadedBy: "Admin", fileSize: "492 KB" },
    ],
  },

  r003: {
    medications: [
      {
        id: "m201", name: "Carbidopa / Levodopa", genericName: "Carbidopa / Levodopa", dose: "25/100 mg", route: "Oral",
        indication: "Parkinson's disease", prescriber: "Dr. Wu", windows: ["AM", "Noon", "PM"],
        todayPasses: [
          { window: "AM", status: "given", administeredAt: "7:30 AM", administeredBy: "M. Rivera, RN" },
          { window: "Noon", status: "given", administeredAt: "12:00 PM", administeredBy: "S. Davis, CNA" },
          { window: "PM", status: "pending" },
        ],
      },
      {
        id: "m202", name: "Metformin", genericName: "Metformin", dose: "1,000 mg", route: "Oral",
        indication: "Type 2 diabetes mellitus", prescriber: "Dr. Wu", windows: ["AM", "PM"],
        todayPasses: [
          { window: "AM", status: "given", administeredAt: "7:30 AM", administeredBy: "M. Rivera, RN" },
          { window: "PM", status: "pending" },
        ],
      },
      {
        id: "m203", name: "Lisinopril", genericName: "Lisinopril", dose: "10 mg", route: "Oral",
        indication: "Hypertension", prescriber: "Dr. Wu", windows: ["AM"],
        todayPasses: [{ window: "AM", status: "given", administeredAt: "7:30 AM", administeredBy: "M. Rivera, RN" }],
      },
      {
        id: "m204", name: "Atorvastatin", genericName: "Atorvastatin", dose: "20 mg", route: "Oral",
        indication: "Hyperlipidemia", prescriber: "Dr. Wu", windows: ["HS"],
        todayPasses: [{ window: "HS", status: "pending" }],
      },
      {
        id: "m205", name: "Vitamin D3", genericName: "Cholecalciferol", dose: "1,000 IU", route: "Oral",
        indication: "Vitamin D deficiency prevention", prescriber: "Dr. Wu", windows: ["AM"],
        todayPasses: [{ window: "AM", status: "given", administeredAt: "7:30 AM", administeredBy: "M. Rivera, RN" }],
      },
    ],
    vitals: buildVitals({ sys: 132, dia: 78, wt: 142, pulse: 68, o2: 97 }),
    carePlan: [
      {
        id: "cp201", problem: "Impaired physical mobility related to Parkinson's disease (Stage III)",
        goal: "Resident will ambulate with rolling walker in hallway 2× daily without falls.",
        interventions: [
          "PT evaluation Q90 days; PT exercise program daily per current plan",
          "Carbidopa/Levodopa administered on strict schedule — do not delay or skip doses",
          "Fall prevention protocol: chair alarm, non-slip footwear, clear pathways",
          "Allow adequate time for ADLs; do not rush resident",
          "Movement/exercise group participation encouraged",
        ],
        targetDate: "2026-08-01", status: "active", relatedDx: "Parkinson's disease", lastReviewed: "2026-04-01",
      },
      {
        id: "cp202", problem: "Blood glucose management related to Type 2 diabetes mellitus",
        goal: "Fasting blood glucose maintained 80–180 mg/dL consistently.",
        interventions: [
          "Fasting blood glucose each morning per standing order; document in chart",
          "Diabetic diet per physician order; carbohydrate consistency at meals",
          "Report fasting glucose <70 or >300 mg/dL to physician immediately",
          "Monitor for hypoglycemia symptoms each shift: diaphoresis, confusion, tremor",
          "Annual podiatry consult; foot inspection at each nursing assessment",
        ],
        targetDate: "2026-08-01", status: "active", relatedDx: "Type 2 diabetes mellitus", lastReviewed: "2026-04-01",
      },
    ],
    assessments: [
      {
        id: "as201", type: "fall_risk", label: "Fall Risk — Morse Scale",
        completedDate: "2026-04-01", completedBy: "M. Rivera, RN",
        score: 70, maxScore: 125, riskLevel: "high",
        findings: "Parkinson's disease with impaired gait and balance; history of 2 falls in prior facility. Uses rolling walker. HIGH RISK — fall prevention protocol in place.",
        nextDueDate: "2026-07-01",
      },
      {
        id: "as202", type: "cognitive", label: "Cognitive Screening — SLUMS",
        completedDate: "2026-02-01", completedBy: "M. Rivera, RN",
        score: 22, maxScore: 30, riskLevel: "low",
        findings: "Score 22/30 — mild cognitive impairment. Some delay in recall. Oriented x3. Functional for decision-making and ADL direction.",
        nextDueDate: "2026-08-01",
      },
      {
        id: "as203", type: "adl", label: "ADL Level of Care Assessment",
        completedDate: "2026-04-01", completedBy: "M. Rivera, RN",
        riskLevel: "moderate",
        findings: "Limited assist with bathing and dressing. Supervision for mobility. Independent with eating when set up. Supervised toileting due to urgency from Parkinson's.",
        nextDueDate: "2026-07-01",
      },
    ],
    adlRecords: [
      {
        date: "2026-05-14", shift: "Day",
        adls: { bathing: "limited", dressing: "limited", grooming: "supervision", mobility: "limited", eating: "supervision", toileting: "limited" },
        documentedBy: "M. Rivera, RN",
      },
      {
        date: "2026-05-13", shift: "Day",
        adls: { bathing: "limited", dressing: "limited", grooming: "supervision", mobility: "supervision", eating: "supervision", toileting: "limited" },
        documentedBy: "M. Rivera, RN",
      },
      {
        date: "2026-05-12", shift: "Day",
        adls: { bathing: "limited", dressing: "limited", grooming: "supervision", mobility: "limited", eating: "supervision", toileting: "limited" },
        documentedBy: "K. Yamamoto, LPN",
      },
    ],
    notes: [
      {
        id: "n201", date: "2026-05-14", time: "8:00 AM", type: "shift",
        subject: "Morning — stable, good participation",
        body: "Resident up with assistance. AM Carbidopa/Levodopa given at 0730 on schedule — no delays. Ate 85% of breakfast. Fasting blood glucose 112 mg/dL (within goal). Participated in morning exercise group 0900–0945 with therapist. No falls or near-falls. Daughter Maria called at 1000 — planning Saturday visit.",
        author: "M. Rivera, RN", authorRole: "RN",
      },
      {
        id: "n202", date: "2026-05-12", time: "2:30 PM", type: "clinical",
        subject: "PT progress update — ambulation improved",
        body: "Physical therapist Kristin Olsen, PT visited. Good progress noted. Resident can now ambulate 150 feet without rest using rolling walker. Balance improved from last month. No falls in 14 days. PT program continuing 3×/week. Next reassessment 6/1/26.",
        author: "M. Rivera, RN", authorRole: "RN (transcribing PT visit note)",
      },
    ],
    incidents: [],
    documents: [
      { id: "d201", type: "physician_order", title: "Physician Orders — May 2026", date: "2026-05-01", uploadedBy: "M. Rivera, RN", fileSize: "102 KB" },
      { id: "d202", type: "advance_directive", title: "DNR Physician Order", date: "2023-01-20", uploadedBy: "Admin", fileSize: "156 KB" },
      { id: "d203", type: "assessment_pdf", title: "PT Evaluation — April 2026", date: "2026-04-01", uploadedBy: "M. Rivera, RN", fileSize: "220 KB" },
    ],
  },

  r004: {
    medications: [
      {
        id: "m301", name: "Spiriva", genericName: "Tiotropium", dose: "18 mcg", route: "Inhaled (Handihaler)",
        indication: "COPD maintenance bronchodilation", prescriber: "Dr. Wu", windows: ["AM"],
        todayPasses: [{ window: "AM", status: "given", administeredAt: "8:00 AM", administeredBy: "K. Yamamoto, LPN" }],
      },
      {
        id: "m302", name: "Advair Diskus", genericName: "Fluticasone / Salmeterol", dose: "250/50 mcg", route: "Inhaled",
        indication: "COPD maintenance", prescriber: "Dr. Wu", windows: ["AM", "PM"],
        todayPasses: [
          { window: "AM", status: "given", administeredAt: "8:00 AM", administeredBy: "K. Yamamoto, LPN" },
          { window: "PM", status: "pending" },
        ],
      },
      {
        id: "m303", name: "Metoprolol Succinate", genericName: "Metoprolol Succinate", dose: "50 mg", route: "Oral",
        indication: "Hypertension", prescriber: "Dr. Wu", windows: ["AM"],
        todayPasses: [{ window: "AM", status: "given", administeredAt: "8:00 AM", administeredBy: "K. Yamamoto, LPN" }],
      },
      {
        id: "m304", name: "Lisinopril", genericName: "Lisinopril", dose: "10 mg", route: "Oral",
        indication: "Hypertension", prescriber: "Dr. Wu", windows: ["AM"],
        todayPasses: [{ window: "AM", status: "given", administeredAt: "8:00 AM", administeredBy: "K. Yamamoto, LPN" }],
      },
      {
        id: "m305", name: "Atorvastatin", genericName: "Atorvastatin", dose: "40 mg", route: "Oral",
        indication: "Hyperlipidemia", prescriber: "Dr. Wu", windows: ["HS"],
        todayPasses: [{ window: "HS", status: "pending" }],
      },
      {
        id: "m306", name: "Albuterol MDI", genericName: "Albuterol", dose: "2 puffs", route: "Inhaled",
        indication: "Acute bronchospasm / dyspnea", prescriber: "Dr. Wu", windows: [], isPRN: true,
        prnIndication: "Wheezing or dyspnea — Q4H PRN",
        todayPasses: [],
      },
    ],
    vitals: buildVitals({ sys: 138, dia: 84, wt: 178, pulse: 74, o2: 94 }),
    carePlan: [
      {
        id: "cp301", problem: "Impaired gas exchange related to COPD (Stage II, GOLD)",
        goal: "O2 saturation maintained ≥92% on room air at rest.",
        interventions: [
          "O2 saturation check at each nursing encounter; document each shift",
          "Scheduled inhalers administered on time — do not delay",
          "Elevate HOB during waking hours",
          "Report O2Sat <90% or acute dyspnea change from baseline to physician immediately",
          "Flu and pneumonia vaccines per schedule",
        ],
        targetDate: "2026-08-01", status: "active", relatedDx: "COPD", lastReviewed: "2026-04-20",
      },
    ],
    assessments: [
      {
        id: "as301", type: "fall_risk", label: "Fall Risk — Morse Scale",
        completedDate: "2026-04-20", completedBy: "K. Yamamoto, LPN",
        score: 45, maxScore: 125, riskLevel: "moderate",
        findings: "Secondary diagnoses (COPD, HTN). Ambulates independently; occasional SOB on exertion. No fall history in 6 months. Fall prevention education provided.",
        nextDueDate: "2026-07-20",
      },
      {
        id: "as302", type: "adl", label: "ADL Level of Care Assessment",
        completedDate: "2026-04-20", completedBy: "K. Yamamoto, LPN",
        riskLevel: "low",
        findings: "Independent with most ADLs. Occasional setup assistance requested due to SOB on sustained activity. No functional deficits.",
        nextDueDate: "2026-07-20",
      },
    ],
    adlRecords: [
      {
        date: "2026-05-14", shift: "Day",
        adls: { bathing: "supervision", dressing: "supervision", grooming: "independent", mobility: "independent", eating: "independent", toileting: "independent" },
        documentedBy: "K. Yamamoto, LPN",
      },
    ],
    notes: [
      {
        id: "n301", date: "2026-05-14", time: "8:30 AM", type: "shift",
        subject: "Routine shift — productive cough noted",
        body: "Resident up independently. AM medications given without issue. O2Sat 94% on room air at rest — within baseline. Mild productive cough noted this morning, non-bloody. Resident declined full breakfast; ate 60% of morning snack. Reports feeling 'a little under the weather.' Will monitor closely for respiratory changes. Wife Patricia visited at 1400.",
        author: "K. Yamamoto, LPN", authorRole: "LPN",
      },
    ],
    incidents: [],
    documents: [
      { id: "d301", type: "physician_order", title: "Physician Orders — May 2026", date: "2026-05-01", uploadedBy: "K. Yamamoto, LPN", fileSize: "88 KB" },
      { id: "d302", type: "lab", title: "Pulmonary Function Tests — Jan 2026", date: "2026-01-10", uploadedBy: "K. Yamamoto, LPN", fileSize: "310 KB" },
    ],
  },

  r005: {
    medications: [
      {
        id: "m401", name: "Memantine", genericName: "Memantine", dose: "10 mg", route: "Oral",
        indication: "Vascular dementia", prescriber: "Dr. Patel", windows: ["AM", "PM"],
        todayPasses: [
          { window: "AM", status: "given", administeredAt: "7:50 AM", administeredBy: "S. Davis, CNA" },
          { window: "PM", status: "pending" },
        ],
      },
      {
        id: "m402", name: "Quetiapine", genericName: "Quetiapine", dose: "25 mg", route: "Oral",
        indication: "Behavioral symptoms of dementia (agitation)", prescriber: "Dr. Patel", windows: ["HS"],
        todayPasses: [{ window: "HS", status: "pending" }],
      },
      {
        id: "m403", name: "Amlodipine", genericName: "Amlodipine", dose: "5 mg", route: "Oral",
        indication: "Hypertension", prescriber: "Dr. Patel", windows: ["AM"],
        todayPasses: [{ window: "AM", status: "given", administeredAt: "7:50 AM", administeredBy: "S. Davis, CNA" }],
      },
      {
        id: "m404", name: "Clopidogrel", genericName: "Clopidogrel", dose: "75 mg", route: "Oral",
        indication: "TIA prevention — antiplatelet therapy", prescriber: "Dr. Patel", windows: ["AM"],
        todayPasses: [{ window: "AM", status: "given", administeredAt: "7:50 AM", administeredBy: "S. Davis, CNA" }],
      },
      {
        id: "m405", name: "Acetaminophen", genericName: "Acetaminophen", dose: "500 mg", route: "Oral",
        indication: "Pain or discomfort", prescriber: "Dr. Patel", windows: [], isPRN: true,
        prnIndication: "Pain or discomfort — Q6H PRN",
        todayPasses: [],
      },
    ],
    vitals: buildVitals({ sys: 142, dia: 86, wt: 118, pulse: 76, o2: 97 }),
    carePlan: [
      {
        id: "cp401", problem: "Risk for elopement related to vascular dementia and prior elopement attempt",
        goal: "Resident will remain safely within Memory Care unit.",
        interventions: [
          "Wander guard device in place — checked every shift and integrity documented",
          "Memory Care exit doors alarmed; check alarm function daily",
          "Document all exit-seeking attempts each shift",
          "Evening structured programming to reduce peak sundowning agitation (4–7 PM)",
          "Family educated: do not prop doors; ensure wander guard secured during visits",
        ],
        targetDate: "2026-08-01", status: "active", relatedDx: "Vascular dementia", lastReviewed: "2026-05-14",
      },
      {
        id: "cp402", problem: "Behavioral symptoms of dementia — agitation and sundowning",
        goal: "Resident will have ≤1 episode of significant agitation per shift.",
        interventions: [
          "Consistent daily routine; minimize environmental changes",
          "Redirect to preferred activities: family photo albums, classical music",
          "Dim lighting and quiet environment in evenings; minimize stimulation",
          "Quetiapine 25mg QHS per physician order for breakthrough agitation",
          "Document behavioral episodes: time, possible trigger, staff response",
        ],
        targetDate: "2026-08-01", status: "active", relatedDx: "Vascular dementia", lastReviewed: "2026-05-14",
      },
    ],
    assessments: [
      {
        id: "as401", type: "elopement", label: "Elopement Risk Assessment (post-incident)",
        completedDate: "2026-05-14", completedBy: "R. Thompson, RN",
        riskLevel: "high",
        findings: "Post-elopement reassessment: Resident attempted exit 5/13 at 2318. Wander guard found disengaged — device replaced. HIGH RISK. Additional monitoring implemented. State incident report filed.",
        nextDueDate: "2026-08-14",
      },
      {
        id: "as402", type: "fall_risk", label: "Fall Risk — Morse Scale",
        completedDate: "2026-04-01", completedBy: "S. Davis, CNA",
        score: 80, maxScore: 125, riskLevel: "high",
        findings: "Vascular dementia with disorientation, impaired gait, and history of falls. Secondary diagnoses (HTN, TIA history). HIGH RISK — fall prevention protocol active.",
        nextDueDate: "2026-07-01",
      },
      {
        id: "as403", type: "cognitive", label: "Cognitive Screening — SLUMS",
        completedDate: "2026-03-01", completedBy: "S. Davis, CNA",
        score: 8, maxScore: 30, riskLevel: "high",
        findings: "Score 8/30 — severe neurocognitive disorder. Disoriented to time and place. Cannot recall any of 3 words after 5 minutes. Requires full cognitive support for all activities.",
        nextDueDate: "2026-09-01",
      },
    ],
    adlRecords: [
      {
        date: "2026-05-14", shift: "Day",
        adls: { bathing: "total", dressing: "extensive", grooming: "extensive", mobility: "limited", eating: "extensive", toileting: "extensive" },
        documentedBy: "S. Davis, CNA",
      },
      {
        date: "2026-05-13", shift: "Day",
        adls: { bathing: "total", dressing: "extensive", grooming: "extensive", mobility: "limited", eating: "extensive", toileting: "extensive" },
        documentedBy: "S. Davis, CNA",
      },
    ],
    notes: [
      {
        id: "n401", date: "2026-05-14", time: "7:00 AM", type: "clinical",
        subject: "Post-elopement follow-up — calm this AM",
        body: "Follow-up assessment after elopement attempt last evening (2318 on 5/13). New wander guard issued and double-checked at 0700 — secure. Resident calm this morning, ate 70% of breakfast. No agitation noted on day shift so far. Elopement risk assessment updated. State incident report filed per Utah ALF 24-hour reporting requirement. Daughter Susan notified by administrator at 0715.",
        author: "R. Thompson, RN", authorRole: "RN",
      },
      {
        id: "n402", date: "2026-05-13", time: "11:30 PM", type: "clinical",
        subject: "Elopement attempt — 2318",
        body: "At 2318 resident found at north corridor exit door by night CNA on rounds. Wearing daytime clothing (had changed from nightgown). States she is 'going home to make dinner for my children.' Redirected to room — required 3 calm verbal attempts. Wander guard device found disengaged on floor near exit. New wander guard applied and secured. VS post-incident: BP 144/90, P 82, O2Sat 97%. No injuries. Administrator and daughter Susan notified at 2335. Incident report completed. Additional bed checks ordered rest of night.",
        author: "M. Rivera, RN", authorRole: "RN",
      },
    ],
    incidents: [
      {
        id: "i401", date: "2026-05-13", time: "11:18 PM",
        type: "elopement", severity: "moderate", status: "in_review",
        location: "Memory Care unit — north corridor exit door",
        description: "Resident found at exit door attempting to leave facility. Wearing daytime clothing. Stated she was 'going home to cook dinner.' Wander guard device found disengaged on floor near exit door. Unknown how device was removed.",
        immediateActions: "Resident redirected to room. VS taken — stable. New wander guard issued and double-checked. Administrator notified. Family (daughter Susan) notified at 2335. State incident report filed per 24-hr reporting requirement.",
        physicianNotified: true, familyNotified: true, stateReportable: true,
        investigationNote: "Under investigation: how wander guard was disengaged. Reviewing unit camera footage. Assessing need for door reinforcement or additional wander guard model.",
        reportedBy: "M. Rivera, RN",
      },
    ],
    documents: [
      { id: "d401", type: "advance_directive", title: "POLST / DNR — Comfort Care", date: "2023-05-15", uploadedBy: "Admin", fileSize: "195 KB" },
      { id: "d402", type: "physician_order", title: "Physician Orders — May 2026", date: "2026-05-01", uploadedBy: "S. Davis, CNA", fileSize: "92 KB" },
      { id: "d403", type: "assessment_pdf", title: "State Incident Report — Elopement 5/13/26", date: "2026-05-14", uploadedBy: "R. Thompson, RN", fileSize: "188 KB" },
    ],
  },

  r006: {
    medications: [
      {
        id: "m501", name: "Lisinopril", genericName: "Lisinopril", dose: "20 mg", route: "Oral",
        indication: "Hypertension", prescriber: "Dr. Wu", windows: ["AM"],
        todayPasses: [{ window: "AM", status: "given", administeredAt: "8:15 AM", administeredBy: "M. Rivera, RN" }],
      },
      {
        id: "m502", name: "Amlodipine", genericName: "Amlodipine", dose: "5 mg", route: "Oral",
        indication: "Hypertension", prescriber: "Dr. Wu", windows: ["AM"],
        todayPasses: [{ window: "AM", status: "given", administeredAt: "8:15 AM", administeredBy: "M. Rivera, RN" }],
      },
      {
        id: "m503", name: "Atorvastatin", genericName: "Atorvastatin", dose: "20 mg", route: "Oral",
        indication: "Hyperlipidemia", prescriber: "Dr. Wu", windows: ["HS"],
        todayPasses: [{ window: "HS", status: "pending" }],
      },
      {
        id: "m504", name: "Omeprazole", genericName: "Omeprazole", dose: "20 mg", route: "Oral",
        indication: "GI protection (NSAID use)", prescriber: "Dr. Wu", windows: ["AM"],
        todayPasses: [{ window: "AM", status: "given", administeredAt: "8:15 AM", administeredBy: "M. Rivera, RN" }],
      },
      {
        id: "m505", name: "Aspirin", genericName: "Aspirin", dose: "81 mg", route: "Oral",
        indication: "Cardiovascular prevention", prescriber: "Dr. Wu", windows: ["AM"],
        todayPasses: [{ window: "AM", status: "given", administeredAt: "8:15 AM", administeredBy: "M. Rivera, RN" }],
      },
      {
        id: "m506", name: "Naproxen Sodium", genericName: "Naproxen Sodium", dose: "500 mg", route: "Oral",
        indication: "Osteoarthritis pain", prescriber: "Dr. Wu", windows: [], isPRN: true,
        prnIndication: "Arthritis pain — Q12H PRN; must be taken with food",
        todayPasses: [],
      },
    ],
    vitals: buildVitals({ sys: 130, dia: 78, wt: 195, pulse: 70, o2: 98 }),
    carePlan: [
      {
        id: "cp501", problem: "Chronic pain related to osteoarthritis (lumbar spine and bilateral hips)",
        goal: "Resident will report pain ≤3/10 on numeric rating scale with current management.",
        interventions: [
          "Pain assessment at each nursing encounter; document using 0–10 NRS",
          "Naproxen PRN per physician order — ensure taken with food to prevent GI upset",
          "Warm compress or heat therapy to affected joints as tolerated",
          "Encourage gentle ROM exercises; avoid prolonged sedentary positioning",
          "Physical therapy referral if pain worsening or functional decline noted",
        ],
        targetDate: "2026-08-01", status: "active", relatedDx: "Osteoarthritis", lastReviewed: "2026-03-01",
      },
    ],
    assessments: [
      {
        id: "as501", type: "fall_risk", label: "Fall Risk — Morse Scale",
        completedDate: "2026-03-01", completedBy: "M. Rivera, RN",
        score: 25, maxScore: 125, riskLevel: "low",
        findings: "Ambulatory without assistive devices. No history of falls. Secondary diagnoses (HTN, OA). Low risk at this time. Reassess in 6 months or with any status change.",
        nextDueDate: "2026-09-01",
      },
      {
        id: "as502", type: "adl", label: "ADL Level of Care Assessment",
        completedDate: "2026-03-01", completedBy: "M. Rivera, RN",
        riskLevel: "low",
        findings: "Independent with all ADLs. Occasionally requests setup assistance due to hip pain with bending. No functional deficits identified.",
        nextDueDate: "2026-09-01",
      },
    ],
    adlRecords: [
      {
        date: "2026-05-14", shift: "Day",
        adls: { bathing: "independent", dressing: "independent", grooming: "independent", mobility: "independent", eating: "independent", toileting: "independent" },
        documentedBy: "M. Rivera, RN",
      },
    ],
    notes: [
      {
        id: "n501", date: "2026-05-14", time: "9:00 AM", type: "shift",
        subject: "Routine morning — mild hip pain",
        body: "Resident in excellent spirits. Attended community breakfast independently. Medications taken without issue at 0815. Reports mild left hip pain this morning (3/10) — Naproxen offered and declined per resident: 'I'll take it later if it gets worse.' Reassess at afternoon check-in. Attending afternoon bingo activity.",
        author: "M. Rivera, RN", authorRole: "RN",
      },
    ],
    incidents: [],
    documents: [
      { id: "d501", type: "physician_order", title: "Physician Orders — May 2026", date: "2026-05-01", uploadedBy: "M. Rivera, RN", fileSize: "76 KB" },
      { id: "d502", type: "consent", title: "Admission Agreement & Consents", date: "2025-02-01", uploadedBy: "Admin", fileSize: "488 KB" },
    ],
  },
};
