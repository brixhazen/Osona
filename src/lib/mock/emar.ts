// ── Types ─────────────────────────────────────────────────────────────────────

export type PassTime = "AM" | "Noon" | "PM" | "HS";
export type AdminStatus = "given" | "refused" | "held" | "not_available" | "late";
export type MedRoute = "oral" | "topical" | "inhaled" | "sublingual" | "patch" | "injection" | "eye_drops";
export type MedFrequency = "daily" | "twice_daily" | "three_times_daily" | "as_needed";
export type ControlledSchedule = "II" | "III" | "IV" | "V";

export interface EmarResident {
  id: string;
  name: string;
  room: string;
  wing: string;
  dob: string;
  allergies: string[];
  primaryPhysician: string;
  pharmacyPhone: string;
}

export interface Medication {
  id: string;
  residentId: string;
  name: string;
  genericName: string;
  dose: string;
  route: MedRoute;
  frequency: MedFrequency;
  scheduledPasses: PassTime[];
  indication: string;
  prescriber: string;
  startDate: string;
  endDate?: string;
  isControlled: boolean;
  controlledSchedule?: ControlledSchedule;
  instructions?: string;
  isPrn: boolean;
  active: boolean;
}

export interface MedAdministration {
  id: string;
  medicationId: string;
  residentId: string;
  passTime: PassTime;
  date: string;
  status: AdminStatus;
  givenAt?: string;
  givenBy?: string;
  notes?: string;
  refusalReason?: string;
  heldReason?: string;
}

export interface PrnAdministration {
  id: string;
  medicationId: string;
  residentId: string;
  date: string;
  time: string;
  givenBy: string;
  reason: string;
  effectiveness?: string;
  followUpTime?: string;
  followUpBy?: string;
}

export interface ControlledCount {
  id: string;
  medicationId: string;
  residentId: string;
  date: string;
  shift: "day" | "evening" | "night";
  expectedCount: number;
  actualCount: number;
  oncomingStaff: string;
  offgoingStaff: string;
  notes?: string;
}

// ── Config ────────────────────────────────────────────────────────────────────

export const PASS_TIMES: PassTime[] = ["AM", "Noon", "PM", "HS"];

export const PASS_CONFIG: Record<PassTime, { label: string; time: string; cls: string }> = {
  AM:   { label: "AM Pass",   time: "08:00", cls: "text-warning border-warning/30 bg-warning/10" },
  Noon: { label: "Noon Pass", time: "12:00", cls: "text-primary border-primary/30 bg-primary/10" },
  PM:   { label: "PM Pass",   time: "16:00", cls: "text-accent border-accent/30 bg-accent/10" },
  HS:   { label: "HS Pass",   time: "20:00", cls: "text-muted-foreground border-border bg-muted/10" },
};

export const ROUTE_LABELS: Record<MedRoute, string> = {
  oral: "Oral", topical: "Topical", inhaled: "Inhaled",
  sublingual: "Sublingual", patch: "Patch", injection: "Injection", eye_drops: "Eye Drops",
};

export const STATUS_CONFIG: Record<AdminStatus, { label: string; cls: string }> = {
  given:         { label: "Given",         cls: "bg-success/15 text-success border-success/30" },
  refused:       { label: "Refused",       cls: "bg-destructive/15 text-destructive border-destructive/30" },
  held:          { label: "Held",          cls: "bg-warning/15 text-warning border-warning/30" },
  not_available: { label: "Not Available", cls: "bg-muted/40 text-muted-foreground border-border" },
  late:          { label: "Late",          cls: "bg-accent/15 text-accent border-accent/30" },
};

export const STAFF = ["J. Rivera, CNA", "M. Torres, CMA", "S. Patel, LPN", "K. Williams, CNA", "A. Chen, RN"];

// ── Residents ─────────────────────────────────────────────────────────────────

export const EMAR_RESIDENTS: EmarResident[] = [
  { id: "er001", name: "Gerald Hayes",     room: "E-214", wing: "East Wing",         dob: "1941-03-12", allergies: ["Penicillin"],            primaryPhysician: "Dr. Susan Okafor",  pharmacyPhone: "(801) 555-7100" },
  { id: "er002", name: "Eleanor Bradford", room: "W-108", wing: "West Wing",         dob: "1938-07-24", allergies: ["Sulfa"],                  primaryPhysician: "Dr. Marcus Webb",   pharmacyPhone: "(801) 555-7100" },
  { id: "er003", name: "Raymond Kowalski", room: "E-118", wing: "East Wing",         dob: "1943-11-05", allergies: ["Aspirin", "Codeine"],     primaryPhysician: "Dr. Susan Okafor",  pharmacyPhone: "(801) 555-7100" },
  { id: "er004", name: "Howard Ingram",    room: "E-220", wing: "East Wing",         dob: "1940-02-18", allergies: [],                         primaryPhysician: "Dr. James Ruiz",    pharmacyPhone: "(801) 555-7101" },
  { id: "er005", name: "Beverly Stone",    room: "W-304", wing: "West Wing",         dob: "1936-09-30", allergies: ["Latex"],                  primaryPhysician: "Dr. Marcus Webb",   pharmacyPhone: "(801) 555-7100" },
  { id: "er006", name: "Ruth Novak",       room: "W-215", wing: "West Wing",         dob: "1944-05-14", allergies: [],                         primaryPhysician: "Dr. Susan Okafor",  pharmacyPhone: "(801) 555-7101" },
  { id: "er007", name: "Patricia Cross",   room: "W-312", wing: "West Wing",         dob: "1939-12-01", allergies: ["Ibuprofen"],              primaryPhysician: "Dr. James Ruiz",    pharmacyPhone: "(801) 555-7101" },
  { id: "er008", name: "Doris Lambert",    room: "MC-205", wing: "Memory Care",      dob: "1937-08-22", allergies: ["Penicillin", "Sulfa"],    primaryPhysician: "Dr. Nina Pham",     pharmacyPhone: "(801) 555-7102" },
  { id: "er009", name: "Vivian Marsh",     room: "MC-201", wing: "Memory Care",      dob: "1935-04-07", allergies: [],                         primaryPhysician: "Dr. Nina Pham",     pharmacyPhone: "(801) 555-7102" },
  { id: "er010", name: "James Caldwell",   room: "IL-104", wing: "Independent Living", dob: "1948-06-19", allergies: ["Morphine"],            primaryPhysician: "Dr. Marcus Webb",   pharmacyPhone: "(801) 555-7100" },
];

// ── Medications ───────────────────────────────────────────────────────────────

export const MEDICATIONS: Medication[] = [
  // Gerald Hayes — E-214
  { id: "m001", residentId: "er001", name: "Lisinopril",    genericName: "Lisinopril",          dose: "10mg",   route: "oral",  frequency: "daily",        scheduledPasses: ["AM"],           indication: "Hypertension",         prescriber: "Dr. Susan Okafor", startDate: "2025-01-15", isControlled: false, isPrn: false, active: true },
  { id: "m002", residentId: "er001", name: "Metoprolol",    genericName: "Metoprolol Succinate", dose: "25mg",   route: "oral",  frequency: "twice_daily",  scheduledPasses: ["AM", "PM"],      indication: "Heart failure",         prescriber: "Dr. Susan Okafor", startDate: "2025-01-15", isControlled: false, isPrn: false, active: true },
  { id: "m003", residentId: "er001", name: "Warfarin",      genericName: "Warfarin",             dose: "5mg",    route: "oral",  frequency: "daily",        scheduledPasses: ["PM"],           indication: "A-fib / DVT prophylaxis", prescriber: "Dr. Susan Okafor", startDate: "2025-03-01", isControlled: false, isPrn: false, active: true, instructions: "Check INR monthly" },
  { id: "m004", residentId: "er001", name: "Donepezil",     genericName: "Donepezil HCl",        dose: "10mg",   route: "oral",  frequency: "daily",        scheduledPasses: ["HS"],           indication: "Mild cognitive impairment", prescriber: "Dr. Susan Okafor", startDate: "2025-06-01", isControlled: false, isPrn: false, active: true, instructions: "Give at bedtime" },

  // Eleanor Bradford — W-108
  { id: "m005", residentId: "er002", name: "Amlodipine",    genericName: "Amlodipine Besylate",  dose: "5mg",    route: "oral",  frequency: "daily",        scheduledPasses: ["AM"],           indication: "Hypertension",         prescriber: "Dr. Marcus Webb", startDate: "2024-11-10", isControlled: false, isPrn: false, active: true },
  { id: "m006", residentId: "er002", name: "Sertraline",    genericName: "Sertraline HCl",       dose: "50mg",   route: "oral",  frequency: "daily",        scheduledPasses: ["AM"],           indication: "Depression / anxiety", prescriber: "Dr. Marcus Webb", startDate: "2025-02-01", isControlled: false, isPrn: false, active: true, instructions: "Take with food" },
  { id: "m007", residentId: "er002", name: "Omeprazole",    genericName: "Omeprazole",           dose: "20mg",   route: "oral",  frequency: "daily",        scheduledPasses: ["AM"],           indication: "GERD",                 prescriber: "Dr. Marcus Webb", startDate: "2024-11-10", isControlled: false, isPrn: false, active: true, instructions: "Take 30 min before meals" },
  { id: "m008", residentId: "er002", name: "Melatonin",     genericName: "Melatonin",            dose: "5mg",    route: "oral",  frequency: "daily",        scheduledPasses: ["HS"],           indication: "Sleep",                prescriber: "Dr. Marcus Webb", startDate: "2025-01-01", isControlled: false, isPrn: false, active: true },

  // Raymond Kowalski — E-118
  { id: "m009", residentId: "er003", name: "Metformin",     genericName: "Metformin HCl",        dose: "500mg",  route: "oral",  frequency: "twice_daily",  scheduledPasses: ["AM", "PM"],      indication: "Type 2 Diabetes",      prescriber: "Dr. Susan Okafor", startDate: "2024-09-01", isControlled: false, isPrn: false, active: true, instructions: "Take with meals" },
  { id: "m010", residentId: "er003", name: "Glipizide",     genericName: "Glipizide",            dose: "5mg",    route: "oral",  frequency: "daily",        scheduledPasses: ["AM"],           indication: "Type 2 Diabetes",      prescriber: "Dr. Susan Okafor", startDate: "2024-09-01", isControlled: false, isPrn: false, active: true, instructions: "30 min before breakfast" },
  { id: "m011", residentId: "er003", name: "Tramadol",      genericName: "Tramadol HCl",         dose: "50mg",   route: "oral",  frequency: "twice_daily",  scheduledPasses: ["AM", "PM"],      indication: "Chronic back pain",    prescriber: "Dr. Susan Okafor", startDate: "2025-04-01", isControlled: true, controlledSchedule: "IV", isPrn: false, active: true },
  { id: "m012", residentId: "er003", name: "Lisinopril",    genericName: "Lisinopril",           dose: "5mg",    route: "oral",  frequency: "daily",        scheduledPasses: ["AM"],           indication: "Hypertension",         prescriber: "Dr. Susan Okafor", startDate: "2024-09-01", isControlled: false, isPrn: false, active: true },

  // Howard Ingram — E-220
  { id: "m013", residentId: "er004", name: "Furosemide",    genericName: "Furosemide",           dose: "40mg",   route: "oral",  frequency: "daily",        scheduledPasses: ["AM"],           indication: "CHF / Edema",          prescriber: "Dr. James Ruiz", startDate: "2025-01-20", isControlled: false, isPrn: false, active: true, instructions: "Monitor weight daily" },
  { id: "m014", residentId: "er004", name: "Potassium Cl",  genericName: "Potassium Chloride",   dose: "20mEq",  route: "oral",  frequency: "twice_daily",  scheduledPasses: ["AM", "PM"],      indication: "Hypokalemia / diuretic", prescriber: "Dr. James Ruiz", startDate: "2025-01-20", isControlled: false, isPrn: false, active: true, instructions: "Take with large glass of water" },
  { id: "m015", residentId: "er004", name: "Carvedilol",    genericName: "Carvedilol",           dose: "6.25mg", route: "oral",  frequency: "twice_daily",  scheduledPasses: ["AM", "PM"],      indication: "CHF",                  prescriber: "Dr. James Ruiz", startDate: "2025-01-20", isControlled: false, isPrn: false, active: true, instructions: "Take with food" },

  // Beverly Stone — W-304
  { id: "m016", residentId: "er005", name: "Donepezil",     genericName: "Donepezil HCl",        dose: "10mg",   route: "oral",  frequency: "daily",        scheduledPasses: ["HS"],           indication: "Alzheimer's disease",  prescriber: "Dr. Marcus Webb", startDate: "2024-08-15", isControlled: false, isPrn: false, active: true, instructions: "Give at bedtime" },
  { id: "m017", residentId: "er005", name: "Escitalopram",  genericName: "Escitalopram Oxalate", dose: "10mg",   route: "oral",  frequency: "daily",        scheduledPasses: ["AM"],           indication: "Depression",           prescriber: "Dr. Marcus Webb", startDate: "2024-08-15", isControlled: false, isPrn: false, active: true },
  { id: "m018", residentId: "er005", name: "Oxycodone",     genericName: "Oxycodone HCl",        dose: "5mg",    route: "oral",  frequency: "twice_daily",  scheduledPasses: ["AM", "PM"],      indication: "Chronic pain (osteoarthritis)", prescriber: "Dr. Marcus Webb", startDate: "2025-05-10", isControlled: true, controlledSchedule: "II", isPrn: false, active: true },

  // Ruth Novak — W-215
  { id: "m019", residentId: "er006", name: "Levothyroxine", genericName: "Levothyroxine Sodium", dose: "75mcg",  route: "oral",  frequency: "daily",        scheduledPasses: ["AM"],           indication: "Hypothyroidism",       prescriber: "Dr. Susan Okafor", startDate: "2023-05-01", isControlled: false, isPrn: false, active: true, instructions: "Take on empty stomach, 30 min before food" },
  { id: "m020", residentId: "er006", name: "Atorvastatin",  genericName: "Atorvastatin Calcium", dose: "40mg",   route: "oral",  frequency: "daily",        scheduledPasses: ["HS"],           indication: "Hyperlipidemia",       prescriber: "Dr. Susan Okafor", startDate: "2023-05-01", isControlled: false, isPrn: false, active: true },
  { id: "m021", residentId: "er006", name: "Amlodipine",    genericName: "Amlodipine Besylate",  dose: "10mg",   route: "oral",  frequency: "daily",        scheduledPasses: ["AM"],           indication: "Hypertension",         prescriber: "Dr. Susan Okafor", startDate: "2024-01-10", isControlled: false, isPrn: false, active: true },

  // Patricia Cross — W-312
  { id: "m022", residentId: "er007", name: "Metoprolol",    genericName: "Metoprolol Succinate", dose: "50mg",   route: "oral",  frequency: "daily",        scheduledPasses: ["AM"],           indication: "Hypertension",         prescriber: "Dr. James Ruiz", startDate: "2024-06-01", isControlled: false, isPrn: false, active: true },
  { id: "m023", residentId: "er007", name: "Gabapentin",    genericName: "Gabapentin",           dose: "300mg",  route: "oral",  frequency: "three_times_daily", scheduledPasses: ["AM", "Noon", "HS"], indication: "Neuropathic pain",   prescriber: "Dr. James Ruiz", startDate: "2025-02-15", isControlled: false, isPrn: false, active: true },
  { id: "m024", residentId: "er007", name: "Tramadol",      genericName: "Tramadol HCl",         dose: "50mg",   route: "oral",  frequency: "twice_daily",  scheduledPasses: ["AM", "PM"],      indication: "Arthritis pain",       prescriber: "Dr. James Ruiz", startDate: "2025-03-01", isControlled: true, controlledSchedule: "IV", isPrn: false, active: true },

  // Doris Lambert — MC-205
  { id: "m025", residentId: "er008", name: "Memantine",     genericName: "Memantine HCl",        dose: "10mg",   route: "oral",  frequency: "twice_daily",  scheduledPasses: ["AM", "PM"],      indication: "Moderate-severe Alzheimer's", prescriber: "Dr. Nina Pham", startDate: "2024-04-01", isControlled: false, isPrn: false, active: true },
  { id: "m026", residentId: "er008", name: "Donepezil",     genericName: "Donepezil HCl",        dose: "10mg",   route: "oral",  frequency: "daily",        scheduledPasses: ["HS"],           indication: "Alzheimer's disease",  prescriber: "Dr. Nina Pham", startDate: "2024-04-01", isControlled: false, isPrn: false, active: true, instructions: "Give at bedtime" },
  { id: "m027", residentId: "er008", name: "Lorazepam",     genericName: "Lorazepam",            dose: "0.5mg",  route: "oral",  frequency: "daily",        scheduledPasses: ["HS"],           indication: "Anxiety / agitation",  prescriber: "Dr. Nina Pham", startDate: "2025-01-15", isControlled: true, controlledSchedule: "IV", isPrn: false, active: true, instructions: "Give only if agitated at bedtime" },

  // Vivian Marsh — MC-201
  { id: "m028", residentId: "er009", name: "Donepezil",     genericName: "Donepezil HCl",        dose: "5mg",    route: "oral",  frequency: "daily",        scheduledPasses: ["HS"],           indication: "Alzheimer's disease",  prescriber: "Dr. Nina Pham", startDate: "2024-02-10", isControlled: false, isPrn: false, active: true },
  { id: "m029", residentId: "er009", name: "Sertraline",    genericName: "Sertraline HCl",       dose: "25mg",   route: "oral",  frequency: "daily",        scheduledPasses: ["AM"],           indication: "Depression",           prescriber: "Dr. Nina Pham", startDate: "2024-02-10", isControlled: false, isPrn: false, active: true },
  { id: "m030", residentId: "er009", name: "Melatonin",     genericName: "Melatonin",            dose: "3mg",    route: "oral",  frequency: "daily",        scheduledPasses: ["HS"],           indication: "Sleep / sundowning",   prescriber: "Dr. Nina Pham", startDate: "2024-06-01", isControlled: false, isPrn: false, active: true },

  // James Caldwell — IL-104
  { id: "m031", residentId: "er010", name: "Lisinopril",    genericName: "Lisinopril",           dose: "20mg",   route: "oral",  frequency: "daily",        scheduledPasses: ["AM"],           indication: "Hypertension",         prescriber: "Dr. Marcus Webb", startDate: "2024-03-01", isControlled: false, isPrn: false, active: true },
  { id: "m032", residentId: "er010", name: "Atorvastatin",  genericName: "Atorvastatin Calcium", dose: "20mg",   route: "oral",  frequency: "daily",        scheduledPasses: ["HS"],           indication: "Hyperlipidemia",       prescriber: "Dr. Marcus Webb", startDate: "2024-03-01", isControlled: false, isPrn: false, active: true },

  // PRN medications (shared across residents)
  { id: "prn001", residentId: "er001", name: "Acetaminophen", genericName: "Acetaminophen",  dose: "650mg",  route: "oral", frequency: "as_needed", scheduledPasses: [], indication: "Pain / fever",     prescriber: "Dr. Susan Okafor", startDate: "2025-01-15", isControlled: false, isPrn: true, active: true, instructions: "Max 4 doses/day, not within 4 hrs" },
  { id: "prn002", residentId: "er002", name: "Ondansetron",   genericName: "Ondansetron HCl", dose: "4mg",   route: "oral", frequency: "as_needed", scheduledPasses: [], indication: "Nausea / vomiting", prescriber: "Dr. Marcus Webb",  startDate: "2024-11-10", isControlled: false, isPrn: true, active: true, instructions: "May repeat q8h, max 3/day" },
  { id: "prn003", residentId: "er008", name: "Lorazepam",     genericName: "Lorazepam",      dose: "0.5mg", route: "oral", frequency: "as_needed", scheduledPasses: [], indication: "Acute agitation",   prescriber: "Dr. Nina Pham",    startDate: "2025-01-15", isControlled: true, controlledSchedule: "IV", isPrn: true, active: true, instructions: "Use only if behavioral interventions fail" },
  { id: "prn004", residentId: "er005", name: "Acetaminophen", genericName: "Acetaminophen",  dose: "650mg", route: "oral", frequency: "as_needed", scheduledPasses: [], indication: "Pain",              prescriber: "Dr. Marcus Webb",  startDate: "2024-08-15", isControlled: false, isPrn: true, active: true, instructions: "Max 4 doses/day" },
  { id: "prn005", residentId: "er004", name: "Ondansetron",   genericName: "Ondansetron HCl", dose: "4mg",  route: "oral", frequency: "as_needed", scheduledPasses: [], indication: "Nausea",            prescriber: "Dr. James Ruiz",   startDate: "2025-01-20", isControlled: false, isPrn: true, active: true },
];

// ── Today's administrations (June 17, 2026) ──────────────────────────────────

const TODAY = "2026-06-17";

export const AM_ADMINISTRATIONS: MedAdministration[] = [
  // Gerald Hayes
  { id: "adm001", medicationId: "m001", residentId: "er001", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:04", givenBy: "J. Rivera, CNA" },
  { id: "adm002", medicationId: "m002", residentId: "er001", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:04", givenBy: "J. Rivera, CNA" },
  // Eleanor Bradford
  { id: "adm003", medicationId: "m005", residentId: "er002", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:11", givenBy: "J. Rivera, CNA" },
  { id: "adm004", medicationId: "m006", residentId: "er002", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:11", givenBy: "J. Rivera, CNA" },
  { id: "adm005", medicationId: "m007", residentId: "er002", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:11", givenBy: "J. Rivera, CNA" },
  // Raymond Kowalski
  { id: "adm006", medicationId: "m009", residentId: "er003", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:18", givenBy: "M. Torres, CMA" },
  { id: "adm007", medicationId: "m010", residentId: "er003", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:18", givenBy: "M. Torres, CMA" },
  { id: "adm008", medicationId: "m011", residentId: "er003", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:19", givenBy: "M. Torres, CMA" },
  { id: "adm009", medicationId: "m012", residentId: "er003", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:19", givenBy: "M. Torres, CMA" },
  // Howard Ingram
  { id: "adm010", medicationId: "m013", residentId: "er004", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:25", givenBy: "M. Torres, CMA" },
  { id: "adm011", medicationId: "m014", residentId: "er004", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:25", givenBy: "M. Torres, CMA" },
  { id: "adm012", medicationId: "m015", residentId: "er004", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:26", givenBy: "M. Torres, CMA" },
  // Beverly Stone — refused this morning
  { id: "adm013", medicationId: "m017", residentId: "er005", passTime: "AM", date: TODAY, status: "refused", refusalReason: "Resident said she felt nauseous and did not want to take meds", givenBy: "S. Patel, LPN" },
  { id: "adm014", medicationId: "m018", residentId: "er005", passTime: "AM", date: TODAY, status: "refused", refusalReason: "Same — resident refused all morning meds", givenBy: "S. Patel, LPN" },
  // Ruth Novak
  { id: "adm015", medicationId: "m019", residentId: "er006", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:35", givenBy: "S. Patel, LPN" },
  { id: "adm016", medicationId: "m021", residentId: "er006", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:35", givenBy: "S. Patel, LPN" },
  // Patricia Cross
  { id: "adm017", medicationId: "m022", residentId: "er007", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:42", givenBy: "K. Williams, CNA" },
  { id: "adm018", medicationId: "m023", residentId: "er007", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:42", givenBy: "K. Williams, CNA" },
  { id: "adm019", medicationId: "m024", residentId: "er007", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:43", givenBy: "K. Williams, CNA" },
  // Doris Lambert — held (NPO for labs)
  { id: "adm020", medicationId: "m025", residentId: "er008", passTime: "AM", date: TODAY, status: "held",    heldReason: "NPO for morning lab draw", givenBy: "K. Williams, CNA" },
  { id: "adm021", medicationId: "m026", residentId: "er008", passTime: "AM", date: TODAY, status: "held",    heldReason: "NPO for morning lab draw", givenBy: "K. Williams, CNA" },
  // Vivian Marsh
  { id: "adm022", medicationId: "m029", residentId: "er009", passTime: "AM", date: TODAY, status: "given",   givenAt: "08:55", givenBy: "A. Chen, RN" },
  // James Caldwell
  { id: "adm023", medicationId: "m031", residentId: "er010", passTime: "AM", date: TODAY, status: "given",   givenAt: "09:02", givenBy: "A. Chen, RN" },
];

export const NOON_ADMINISTRATIONS: MedAdministration[] = [
  { id: "nadm001", medicationId: "m023", residentId: "er007", passTime: "Noon", date: TODAY, status: "given", givenAt: "12:05", givenBy: "M. Torres, CMA" },
];

export const PRN_ADMINISTRATIONS: PrnAdministration[] = [
  {
    id: "prnadm001",
    medicationId: "prn004",
    residentId: "er005",
    date: TODAY,
    time: "10:15",
    givenBy: "S. Patel, LPN",
    reason: "Resident complained of right knee pain, rated 5/10",
    effectiveness: "Resident reported pain decreased to 2/10 at 11:00",
    followUpTime: "11:00",
    followUpBy: "S. Patel, LPN",
  },
  {
    id: "prnadm002",
    medicationId: "prn002",
    residentId: "er002",
    date: TODAY,
    time: "09:45",
    givenBy: "J. Rivera, CNA",
    reason: "Resident reported nausea after breakfast",
    effectiveness: "Nausea resolved within 45 min",
    followUpTime: "10:30",
    followUpBy: "J. Rivera, CNA",
  },
];

// ── Controlled substance counts ───────────────────────────────────────────────

export const CONTROLLED_COUNTS: ControlledCount[] = [
  // Tramadol — Raymond Kowalski
  { id: "cc001", medicationId: "m011", residentId: "er003", date: TODAY, shift: "day",     expectedCount: 28, actualCount: 28, oncomingStaff: "M. Torres, CMA",   offgoingStaff: "J. Rivera, CNA" },
  // Tramadol — Patricia Cross
  { id: "cc002", medicationId: "m024", residentId: "er007", date: TODAY, shift: "day",     expectedCount: 16, actualCount: 16, oncomingStaff: "K. Williams, CNA", offgoingStaff: "M. Torres, CMA" },
  // Lorazepam — Doris Lambert (scheduled)
  { id: "cc003", medicationId: "m027", residentId: "er008", date: TODAY, shift: "day",     expectedCount: 22, actualCount: 22, oncomingStaff: "K. Williams, CNA", offgoingStaff: "A. Chen, RN" },
  // Lorazepam — Doris Lambert (PRN)
  { id: "cc004", medicationId: "prn003", residentId: "er008", date: TODAY, shift: "day",   expectedCount: 14, actualCount: 14, oncomingStaff: "K. Williams, CNA", offgoingStaff: "A. Chen, RN" },
  // Oxycodone — Beverly Stone
  { id: "cc005", medicationId: "m018", residentId: "er005", date: TODAY, shift: "day",     expectedCount: 44, actualCount: 42, oncomingStaff: "S. Patel, LPN",    offgoingStaff: "J. Rivera, CNA", notes: "Count discrepancy — 2 tablets. Evening shift notified. DON aware." },
];
