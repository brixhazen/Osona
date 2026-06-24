// ─── Types ────────────────────────────────────────────────────────────────────

export type Department = "nursing" | "dietary" | "activities" | "maintenance" | "administration";
export type CourseCategory = "mandatory" | "clinical" | "safety" | "dietary" | "hr" | "leadership";
export type CourseStatus = "not_started" | "in_progress" | "completed" | "overdue";
export type CertType =
  | "cna_license"
  | "lpn_license"
  | "rn_license"
  | "med_aide"
  | "food_handler"
  | "cpr_first_aid"
  | "dementia_specialist"
  | "activity_director";
export type CertStatus = "current" | "expiring_soon" | "expired";
export type SessionStatus = "upcoming" | "in_progress" | "completed";

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  durationHours: number;
  mandatory: boolean;
  applicableDepts: Department[];
  description: string;
  renewalYears: number | null;
}

export interface StaffCourseProgress {
  courseId: string;
  status: CourseStatus;
  completedDate: string | null;
  score: number | null;
  dueDate: string | null;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: Department;
  hireDate: string;
  isNewHire: boolean;
  inServiceHoursYTD: number;
  inServiceHoursRequired: number;
  courses: StaffCourseProgress[];
  certifications: StaffCert[];
}

export interface StaffCert {
  type: CertType;
  number: string | null;
  issuedDate: string;
  expiryDate: string;
  status: CertStatus;
  daysUntilExpiry: number;
}

export interface TrainingSession {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  durationHours: number;
  location: string;
  mandatory: boolean;
  department: Department | "all";
  enrolled: number;
  capacity: number;
  status: SessionStatus;
  courseId: string | null;
}

// ─── Course Library ───────────────────────────────────────────────────────────

export const COURSES: Course[] = [
  // Mandatory annual
  { id: "C-001", title: "Fire & Life Safety",                      category: "mandatory",  durationHours: 1.0, mandatory: true,  applicableDepts: ["nursing","dietary","activities","maintenance","administration"], description: "Fire prevention, evacuation procedures, use of fire extinguishers, and emergency notification protocols.", renewalYears: 1 },
  { id: "C-002", title: "Abuse, Neglect & Exploitation Prevention", category: "mandatory",  durationHours: 1.0, mandatory: true,  applicableDepts: ["nursing","dietary","activities","maintenance","administration"], description: "Recognizing and reporting all forms of resident abuse, neglect, and exploitation. Mandatory reporter obligations.", renewalYears: 1 },
  { id: "C-003", title: "Infection Control & Bloodborne Pathogens", category: "mandatory",  durationHours: 1.0, mandatory: true,  applicableDepts: ["nursing","dietary","activities","maintenance","administration"], description: "Standard precautions, PPE use, hand hygiene, isolation protocols, and bloodborne pathogen exposure procedures.", renewalYears: 1 },
  { id: "C-004", title: "Resident Rights & Dignity",                category: "mandatory",  durationHours: 0.5, mandatory: true,  applicableDepts: ["nursing","dietary","activities","maintenance","administration"], description: "OBRA resident rights, privacy, autonomy, grievance procedures, and dignity in care delivery.", renewalYears: 1 },
  { id: "C-005", title: "Emergency Preparedness",                   category: "mandatory",  durationHours: 0.5, mandatory: true,  applicableDepts: ["nursing","dietary","activities","maintenance","administration"], description: "Facility emergency plan, staff roles during emergencies, resident evacuation, and communication protocols.", renewalYears: 1 },
  { id: "C-006", title: "HIPAA & Privacy",                          category: "mandatory",  durationHours: 0.5, mandatory: true,  applicableDepts: ["nursing","dietary","activities","maintenance","administration"], description: "Protected health information, permissible disclosures, electronic records security, and breach reporting.", renewalYears: 1 },
  { id: "C-007", title: "Workplace Safety & Injury Prevention",     category: "safety",     durationHours: 0.5, mandatory: true,  applicableDepts: ["nursing","dietary","activities","maintenance","administration"], description: "Safe lifting and body mechanics, hazardous materials, incident reporting, and workers' compensation.", renewalYears: 1 },
  { id: "C-008", title: "Dementia Care Fundamentals",               category: "clinical",   durationHours: 1.0, mandatory: true,  applicableDepts: ["nursing","activities"],                                         description: "Person-centered dementia care, behavioral approaches, communication strategies, and environmental design.", renewalYears: 1 },
  // Clinical / role-specific
  { id: "C-009", title: "Medication Management & Safety",           category: "clinical",   durationHours: 2.0, mandatory: true,  applicableDepts: ["nursing"],                                                      description: "Six rights of medication administration, controlled substance handling, eMAR documentation, and error reporting.", renewalYears: 1 },
  { id: "C-010", title: "CNA Skills Competency Review",             category: "clinical",   durationHours: 2.0, mandatory: true,  applicableDepts: ["nursing"],                                                      description: "Annual hands-on competency validation: transfers, perineal care, vital signs, and wound care observation.", renewalYears: 1 },
  { id: "C-011", title: "Fall Prevention & Restraint Reduction",    category: "clinical",   durationHours: 1.0, mandatory: true,  applicableDepts: ["nursing"],                                                      description: "Fall risk assessment, environmental modifications, restraint alternatives, and post-fall protocols.", renewalYears: 1 },
  { id: "C-012", title: "Wound Care Documentation",                 category: "clinical",   durationHours: 0.5, mandatory: false, applicableDepts: ["nursing"],                                                      description: "Wound staging, measurement, photography, and care plan documentation for pressure injuries.", renewalYears: null },
  // Safety
  { id: "C-013", title: "Maintenance Safety & OSHA Compliance",     category: "safety",     durationHours: 1.0, mandatory: true,  applicableDepts: ["maintenance"],                                                  description: "Lockout/tagout, confined space, ladder safety, chemical hazards, and OSHA record-keeping.", renewalYears: 1 },
  // Dietary
  { id: "C-014", title: "Food Handler Safety & Sanitation",         category: "dietary",    durationHours: 1.0, mandatory: true,  applicableDepts: ["dietary"],                                                      description: "Safe food temperatures, cross-contamination prevention, allergen awareness, and health department requirements.", renewalYears: 1 },
  { id: "C-015", title: "Therapeutic Diets & Texture Modification", category: "dietary",    durationHours: 0.5, mandatory: false, applicableDepts: ["dietary","nursing"],                                            description: "IDDSI framework, diet types, thickening levels, and tray card verification for special dietary needs.", renewalYears: null },
  // HR / Leadership
  { id: "C-016", title: "New Hire Orientation",                     category: "hr",         durationHours: 4.0, mandatory: true,  applicableDepts: ["nursing","dietary","activities","maintenance","administration"], description: "Facility overview, policies and procedures, HRIS onboarding, benefits, and culture orientation.", renewalYears: null },
  { id: "C-017", title: "Supervisor Fundamentals",                  category: "leadership", durationHours: 3.0, mandatory: false, applicableDepts: ["nursing","administration"],                                     description: "Coaching and feedback, progressive discipline, scheduling basics, and regulatory accountability for charge staff.", renewalYears: null },
];

// ─── Staff ────────────────────────────────────────────────────────────────────

export const STAFF: StaffMember[] = [
  {
    id: "S-001",
    name: "Janet Morrison",
    role: "LPN — Charge Nurse",
    department: "nursing",
    hireDate: "2019-03-15",
    isNewHire: false,
    inServiceHoursYTD: 11.0,
    inServiceHoursRequired: 12,
    courses: [
      { courseId: "C-001", status: "completed", completedDate: "2026-01-10", score: 96, dueDate: null },
      { courseId: "C-002", status: "completed", completedDate: "2026-01-10", score: 100, dueDate: null },
      { courseId: "C-003", status: "completed", completedDate: "2026-01-10", score: 94, dueDate: null },
      { courseId: "C-004", status: "completed", completedDate: "2026-01-12", score: 98, dueDate: null },
      { courseId: "C-005", status: "completed", completedDate: "2026-01-12", score: 92, dueDate: null },
      { courseId: "C-006", status: "completed", completedDate: "2026-01-14", score: 100, dueDate: null },
      { courseId: "C-007", status: "completed", completedDate: "2026-01-14", score: 88, dueDate: null },
      { courseId: "C-008", status: "completed", completedDate: "2026-02-05", score: 91, dueDate: null },
      { courseId: "C-009", status: "completed", completedDate: "2026-02-10", score: 97, dueDate: null },
      { courseId: "C-010", status: "completed", completedDate: "2026-02-10", score: 93, dueDate: null },
      { courseId: "C-011", status: "completed", completedDate: "2026-02-12", score: 90, dueDate: null },
    ],
    certifications: [
      { type: "lpn_license", number: "LPN-84421", issuedDate: "2019-06-01", expiryDate: "2027-06-01", status: "current", daysUntilExpiry: 381 },
      { type: "cpr_first_aid", number: null, issuedDate: "2025-04-01", expiryDate: "2027-04-01", status: "current", daysUntilExpiry: 320 },
    ],
  },
  {
    id: "S-002",
    name: "Carol Nguyen",
    role: "RN — Director of Nursing",
    department: "nursing",
    hireDate: "2021-08-01",
    isNewHire: false,
    inServiceHoursYTD: 9.5,
    inServiceHoursRequired: 12,
    courses: [
      { courseId: "C-001", status: "completed", completedDate: "2026-01-10", score: 98, dueDate: null },
      { courseId: "C-002", status: "completed", completedDate: "2026-01-10", score: 100, dueDate: null },
      { courseId: "C-003", status: "completed", completedDate: "2026-01-10", score: 96, dueDate: null },
      { courseId: "C-004", status: "completed", completedDate: "2026-01-12", score: 100, dueDate: null },
      { courseId: "C-005", status: "completed", completedDate: "2026-01-12", score: 94, dueDate: null },
      { courseId: "C-006", status: "completed", completedDate: "2026-01-14", score: 100, dueDate: null },
      { courseId: "C-007", status: "completed", completedDate: "2026-01-14", score: 92, dueDate: null },
      { courseId: "C-008", status: "in_progress", completedDate: null, score: null, dueDate: "2026-05-31" },
      { courseId: "C-009", status: "completed", completedDate: "2026-02-10", score: 99, dueDate: null },
      { courseId: "C-010", status: "completed", completedDate: "2026-02-10", score: 97, dueDate: null },
      { courseId: "C-011", status: "completed", completedDate: "2026-02-12", score: 95, dueDate: null },
      { courseId: "C-017", status: "completed", completedDate: "2022-03-01", score: 89, dueDate: null },
    ],
    certifications: [
      { type: "rn_license", number: "RN-20814", issuedDate: "2021-06-01", expiryDate: "2026-06-01", status: "expiring_soon", daysUntilExpiry: 16 },
      { type: "cpr_first_aid", number: null, issuedDate: "2025-04-01", expiryDate: "2027-04-01", status: "current", daysUntilExpiry: 320 },
    ],
  },
  {
    id: "S-003",
    name: "Lisa Ortega",
    role: "CNA",
    department: "nursing",
    hireDate: "2023-05-01",
    isNewHire: false,
    inServiceHoursYTD: 7.0,
    inServiceHoursRequired: 12,
    courses: [
      { courseId: "C-001", status: "completed", completedDate: "2026-01-15", score: 88, dueDate: null },
      { courseId: "C-002", status: "overdue",   completedDate: null,         score: null, dueDate: "2026-04-30" },
      { courseId: "C-003", status: "completed", completedDate: "2026-01-15", score: 90, dueDate: null },
      { courseId: "C-004", status: "overdue",   completedDate: null,         score: null, dueDate: "2026-04-30" },
      { courseId: "C-005", status: "completed", completedDate: "2026-01-20", score: 85, dueDate: null },
      { courseId: "C-006", status: "completed", completedDate: "2026-01-20", score: 92, dueDate: null },
      { courseId: "C-007", status: "completed", completedDate: "2026-01-22", score: 80, dueDate: null },
      { courseId: "C-008", status: "completed", completedDate: "2026-02-10", score: 87, dueDate: null },
      { courseId: "C-010", status: "completed", completedDate: "2026-02-15", score: 85, dueDate: null },
      { courseId: "C-011", status: "not_started", completedDate: null, score: null, dueDate: "2026-05-31" },
    ],
    certifications: [
      { type: "cna_license", number: "CNA-77291", issuedDate: "2023-05-01", expiryDate: "2027-05-01", status: "current", daysUntilExpiry: 350 },
      { type: "cpr_first_aid", number: null, issuedDate: "2025-01-10", expiryDate: "2027-01-10", status: "current", daysUntilExpiry: 239 },
    ],
  },
  {
    id: "S-004",
    name: "Patricia Wells",
    role: "CNA",
    department: "nursing",
    hireDate: "2022-11-01",
    isNewHire: false,
    inServiceHoursYTD: 10.5,
    inServiceHoursRequired: 12,
    courses: [
      { courseId: "C-001", status: "completed", completedDate: "2026-01-15", score: 91, dueDate: null },
      { courseId: "C-002", status: "completed", completedDate: "2026-01-15", score: 95, dueDate: null },
      { courseId: "C-003", status: "completed", completedDate: "2026-01-15", score: 89, dueDate: null },
      { courseId: "C-004", status: "completed", completedDate: "2026-01-17", score: 93, dueDate: null },
      { courseId: "C-005", status: "completed", completedDate: "2026-01-17", score: 88, dueDate: null },
      { courseId: "C-006", status: "completed", completedDate: "2026-01-20", score: 96, dueDate: null },
      { courseId: "C-007", status: "completed", completedDate: "2026-01-20", score: 84, dueDate: null },
      { courseId: "C-008", status: "completed", completedDate: "2026-02-08", score: 90, dueDate: null },
      { courseId: "C-010", status: "completed", completedDate: "2026-02-15", score: 87, dueDate: null },
      { courseId: "C-011", status: "not_started", completedDate: null, score: null, dueDate: "2026-05-31" },
    ],
    certifications: [
      { type: "cna_license", number: "CNA-63844", issuedDate: "2022-12-01", expiryDate: "2026-12-01", status: "current", daysUntilExpiry: 199 },
      { type: "cpr_first_aid", number: null, issuedDate: "2025-03-01", expiryDate: "2027-03-01", status: "current", daysUntilExpiry: 289 },
    ],
  },
  {
    id: "S-005",
    name: "Sandra Park",
    role: "CNA",
    department: "nursing",
    hireDate: "2024-02-15",
    isNewHire: false,
    inServiceHoursYTD: 6.5,
    inServiceHoursRequired: 12,
    courses: [
      { courseId: "C-001", status: "completed", completedDate: "2026-01-20", score: 82, dueDate: null },
      { courseId: "C-002", status: "completed", completedDate: "2026-01-20", score: 88, dueDate: null },
      { courseId: "C-003", status: "overdue",   completedDate: null,         score: null, dueDate: "2026-04-30" },
      { courseId: "C-004", status: "completed", completedDate: "2026-01-22", score: 90, dueDate: null },
      { courseId: "C-005", status: "overdue",   completedDate: null,         score: null, dueDate: "2026-04-30" },
      { courseId: "C-006", status: "completed", completedDate: "2026-01-24", score: 86, dueDate: null },
      { courseId: "C-007", status: "not_started", completedDate: null, score: null, dueDate: "2026-05-31" },
      { courseId: "C-008", status: "not_started", completedDate: null, score: null, dueDate: "2026-05-31" },
      { courseId: "C-010", status: "completed", completedDate: "2026-03-01", score: 80, dueDate: null },
      { courseId: "C-011", status: "not_started", completedDate: null, score: null, dueDate: "2026-05-31" },
    ],
    certifications: [
      { type: "cna_license", number: "CNA-91022", issuedDate: "2024-02-01", expiryDate: "2028-02-01", status: "current", daysUntilExpiry: 626 },
      { type: "cpr_first_aid", number: null, issuedDate: "2024-03-01", expiryDate: "2026-03-01", status: "expired", daysUntilExpiry: -76 },
    ],
  },
  {
    id: "S-006",
    name: "Robert Kim",
    role: "Medication Aide",
    department: "nursing",
    hireDate: "2023-09-01",
    isNewHire: false,
    inServiceHoursYTD: 8.0,
    inServiceHoursRequired: 12,
    courses: [
      { courseId: "C-001", status: "completed", completedDate: "2026-01-20", score: 90, dueDate: null },
      { courseId: "C-002", status: "completed", completedDate: "2026-01-20", score: 94, dueDate: null },
      { courseId: "C-003", status: "completed", completedDate: "2026-01-22", score: 88, dueDate: null },
      { courseId: "C-004", status: "completed", completedDate: "2026-01-22", score: 92, dueDate: null },
      { courseId: "C-005", status: "completed", completedDate: "2026-01-24", score: 86, dueDate: null },
      { courseId: "C-006", status: "completed", completedDate: "2026-01-24", score: 96, dueDate: null },
      { courseId: "C-007", status: "completed", completedDate: "2026-01-26", score: 82, dueDate: null },
      { courseId: "C-009", status: "completed", completedDate: "2026-02-14", score: 95, dueDate: null },
    ],
    certifications: [
      { type: "med_aide", number: "MA-33019", issuedDate: "2023-09-15", expiryDate: "2026-07-15", status: "expiring_soon", daysUntilExpiry: 60 },
      { type: "cpr_first_aid", number: null, issuedDate: "2025-06-01", expiryDate: "2027-06-01", status: "current", daysUntilExpiry: 381 },
    ],
  },
  {
    id: "S-007",
    name: "Maria Santos",
    role: "CNA",
    department: "nursing",
    hireDate: "2026-04-01",
    isNewHire: true,
    inServiceHoursYTD: 4.0,
    inServiceHoursRequired: 12,
    courses: [
      { courseId: "C-016", status: "completed", completedDate: "2026-04-03", score: 88, dueDate: null },
      { courseId: "C-001", status: "completed", completedDate: "2026-04-05", score: 84, dueDate: null },
      { courseId: "C-002", status: "completed", completedDate: "2026-04-05", score: 90, dueDate: null },
      { courseId: "C-003", status: "in_progress", completedDate: null, score: null, dueDate: "2026-05-20" },
      { courseId: "C-004", status: "not_started", completedDate: null, score: null, dueDate: "2026-05-31" },
      { courseId: "C-005", status: "not_started", completedDate: null, score: null, dueDate: "2026-05-31" },
      { courseId: "C-006", status: "not_started", completedDate: null, score: null, dueDate: "2026-05-31" },
      { courseId: "C-007", status: "not_started", completedDate: null, score: null, dueDate: "2026-05-31" },
      { courseId: "C-010", status: "not_started", completedDate: null, score: null, dueDate: "2026-06-30" },
    ],
    certifications: [
      { type: "cna_license", number: "CNA-88104", issuedDate: "2025-10-01", expiryDate: "2029-10-01", status: "current", daysUntilExpiry: 868 },
      { type: "cpr_first_aid", number: null, issuedDate: "2025-10-15", expiryDate: "2027-10-15", status: "current", daysUntilExpiry: 517 },
    ],
  },
  {
    id: "S-008",
    name: "Amy Chen",
    role: "Activities Director",
    department: "activities",
    hireDate: "2020-06-01",
    isNewHire: false,
    inServiceHoursYTD: 10.0,
    inServiceHoursRequired: 12,
    courses: [
      { courseId: "C-001", status: "completed", completedDate: "2026-01-15", score: 93, dueDate: null },
      { courseId: "C-002", status: "completed", completedDate: "2026-01-15", score: 98, dueDate: null },
      { courseId: "C-003", status: "completed", completedDate: "2026-01-15", score: 91, dueDate: null },
      { courseId: "C-004", status: "completed", completedDate: "2026-01-17", score: 97, dueDate: null },
      { courseId: "C-005", status: "completed", completedDate: "2026-01-17", score: 89, dueDate: null },
      { courseId: "C-006", status: "completed", completedDate: "2026-01-20", score: 95, dueDate: null },
      { courseId: "C-007", status: "completed", completedDate: "2026-01-20", score: 86, dueDate: null },
      { courseId: "C-008", status: "completed", completedDate: "2026-02-12", score: 94, dueDate: null },
    ],
    certifications: [
      { type: "activity_director", number: "ACD-5512", issuedDate: "2020-07-01", expiryDate: "2028-07-01", status: "current", daysUntilExpiry: 776 },
      { type: "cpr_first_aid", number: null, issuedDate: "2025-02-01", expiryDate: "2027-02-01", status: "current", daysUntilExpiry: 261 },
    ],
  },
  {
    id: "S-009",
    name: "Terry Walsh",
    role: "Kitchen Supervisor",
    department: "dietary",
    hireDate: "2021-03-01",
    isNewHire: false,
    inServiceHoursYTD: 6.0,
    inServiceHoursRequired: 12,
    courses: [
      { courseId: "C-001", status: "completed", completedDate: "2026-01-20", score: 85, dueDate: null },
      { courseId: "C-002", status: "completed", completedDate: "2026-01-20", score: 90, dueDate: null },
      { courseId: "C-003", status: "completed", completedDate: "2026-01-22", score: 82, dueDate: null },
      { courseId: "C-004", status: "overdue",   completedDate: null,         score: null, dueDate: "2026-04-30" },
      { courseId: "C-005", status: "completed", completedDate: "2026-01-24", score: 80, dueDate: null },
      { courseId: "C-006", status: "overdue",   completedDate: null,         score: null, dueDate: "2026-04-30" },
      { courseId: "C-007", status: "completed", completedDate: "2026-01-26", score: 78, dueDate: null },
      { courseId: "C-014", status: "completed", completedDate: "2026-03-01", score: 92, dueDate: null },
    ],
    certifications: [
      { type: "food_handler", number: "FH-22819", issuedDate: "2025-03-01", expiryDate: "2028-03-01", status: "current", daysUntilExpiry: 289 },
      { type: "cpr_first_aid", number: null, issuedDate: "2024-05-01", expiryDate: "2026-05-01", status: "expired", daysUntilExpiry: -15 },
    ],
  },
  {
    id: "S-010",
    name: "Tom Bradley",
    role: "Dietary Aide",
    department: "dietary",
    hireDate: "2022-07-01",
    isNewHire: false,
    inServiceHoursYTD: 5.5,
    inServiceHoursRequired: 12,
    courses: [
      { courseId: "C-001", status: "completed", completedDate: "2026-01-22", score: 80, dueDate: null },
      { courseId: "C-002", status: "overdue",   completedDate: null,         score: null, dueDate: "2026-04-30" },
      { courseId: "C-003", status: "completed", completedDate: "2026-01-22", score: 78, dueDate: null },
      { courseId: "C-004", status: "not_started", completedDate: null, score: null, dueDate: "2026-05-31" },
      { courseId: "C-005", status: "completed", completedDate: "2026-01-24", score: 75, dueDate: null },
      { courseId: "C-006", status: "not_started", completedDate: null, score: null, dueDate: "2026-05-31" },
      { courseId: "C-007", status: "completed", completedDate: "2026-01-26", score: 77, dueDate: null },
      { courseId: "C-014", status: "overdue",   completedDate: null,         score: null, dueDate: "2026-04-30" },
    ],
    certifications: [
      { type: "food_handler", number: "FH-31044", issuedDate: "2024-07-01", expiryDate: "2027-07-01", status: "current", daysUntilExpiry: 411 },
    ],
  },
  {
    id: "S-011",
    name: "Dave Hensley",
    role: "Maintenance Lead",
    department: "maintenance",
    hireDate: "2020-01-15",
    isNewHire: false,
    inServiceHoursYTD: 5.0,
    inServiceHoursRequired: 12,
    courses: [
      { courseId: "C-001", status: "overdue",   completedDate: null,         score: null, dueDate: "2026-04-30" },
      { courseId: "C-002", status: "completed", completedDate: "2026-01-28", score: 87, dueDate: null },
      { courseId: "C-003", status: "completed", completedDate: "2026-01-28", score: 84, dueDate: null },
      { courseId: "C-004", status: "overdue",   completedDate: null,         score: null, dueDate: "2026-04-30" },
      { courseId: "C-005", status: "completed", completedDate: "2026-01-30", score: 82, dueDate: null },
      { courseId: "C-006", status: "completed", completedDate: "2026-01-30", score: 90, dueDate: null },
      { courseId: "C-007", status: "completed", completedDate: "2026-02-01", score: 88, dueDate: null },
      { courseId: "C-013", status: "overdue",   completedDate: null,         score: null, dueDate: "2026-04-30" },
    ],
    certifications: [
      { type: "cpr_first_aid", number: null, issuedDate: "2025-01-15", expiryDate: "2027-01-15", status: "current", daysUntilExpiry: 244 },
    ],
  },
  {
    id: "S-012",
    name: "James Tucker",
    role: "Maintenance Technician",
    department: "maintenance",
    hireDate: "2026-03-01",
    isNewHire: true,
    inServiceHoursYTD: 4.0,
    inServiceHoursRequired: 12,
    courses: [
      { courseId: "C-016", status: "completed", completedDate: "2026-03-03", score: 82, dueDate: null },
      { courseId: "C-001", status: "completed", completedDate: "2026-03-05", score: 78, dueDate: null },
      { courseId: "C-002", status: "completed", completedDate: "2026-03-05", score: 85, dueDate: null },
      { courseId: "C-003", status: "overdue",   completedDate: null,         score: null, dueDate: "2026-04-30" },
      { courseId: "C-004", status: "not_started", completedDate: null, score: null, dueDate: "2026-05-31" },
      { courseId: "C-005", status: "not_started", completedDate: null, score: null, dueDate: "2026-05-31" },
      { courseId: "C-006", status: "not_started", completedDate: null, score: null, dueDate: "2026-05-31" },
      { courseId: "C-007", status: "not_started", completedDate: null, score: null, dueDate: "2026-05-31" },
      { courseId: "C-013", status: "not_started", completedDate: null, score: null, dueDate: "2026-06-30" },
    ],
    certifications: [
      { type: "cpr_first_aid", number: null, issuedDate: "2026-03-10", expiryDate: "2028-03-10", status: "current", daysUntilExpiry: 663 },
    ],
  },
];

// ─── Training Sessions ─────────────────────────────────────────────────────────

export const SESSIONS: TrainingSession[] = [
  {
    id: "TS-001",
    title: "Dementia Care Fundamentals — In-Service",
    instructor: "Carol Nguyen, RN",
    date: "2026-05-20",
    time: "2:00 PM",
    durationHours: 1.0,
    location: "Conference Room A",
    mandatory: true,
    department: "nursing",
    enrolled: 5,
    capacity: 20,
    status: "upcoming",
    courseId: "C-008",
  },
  {
    id: "TS-002",
    title: "Fall Prevention & Restraint Reduction",
    instructor: "Janet Morrison, LPN",
    date: "2026-05-21",
    time: "10:00 AM",
    durationHours: 1.0,
    location: "Conference Room A",
    mandatory: true,
    department: "nursing",
    enrolled: 6,
    capacity: 20,
    status: "upcoming",
    courseId: "C-011",
  },
  {
    id: "TS-003",
    title: "Mandatory Annual Make-Up — All Staff",
    instructor: "Carol Nguyen, RN",
    date: "2026-05-28",
    time: "9:00 AM",
    durationHours: 3.0,
    location: "Multipurpose Room",
    mandatory: true,
    department: "all",
    enrolled: 8,
    capacity: 30,
    status: "upcoming",
    courseId: null,
  },
  {
    id: "TS-004",
    title: "Food Handler Safety Refresher",
    instructor: "External — Health Dept.",
    date: "2026-06-05",
    time: "1:00 PM",
    durationHours: 1.0,
    location: "Kitchen Training Area",
    mandatory: true,
    department: "dietary",
    enrolled: 2,
    capacity: 10,
    status: "upcoming",
    courseId: "C-014",
  },
  {
    id: "TS-005",
    title: "Maintenance Safety & OSHA",
    instructor: "Dave Hensley",
    date: "2026-06-10",
    time: "8:00 AM",
    durationHours: 1.0,
    location: "Maintenance Shop",
    mandatory: true,
    department: "maintenance",
    enrolled: 2,
    capacity: 5,
    status: "upcoming",
    courseId: "C-013",
  },
  {
    id: "TS-006",
    title: "Abuse Prevention Annual In-Service",
    instructor: "External Trainer",
    date: "2026-05-10",
    time: "2:00 PM",
    durationHours: 1.0,
    location: "Conference Room A",
    mandatory: true,
    department: "all",
    enrolled: 18,
    capacity: 30,
    status: "completed",
    courseId: "C-002",
  },
];

// ─── Configs ──────────────────────────────────────────────────────────────────

export const DEPT_CONFIG: Record<Department, { label: string; color: string }> = {
  nursing:        { label: "Nursing",        color: "bg-primary/10 text-primary border-primary/20" },
  dietary:        { label: "Dietary",        color: "bg-accent/10 text-accent border-accent/20" },
  activities:     { label: "Activities",     color: "bg-success/10 text-success border-success/20" },
  maintenance:    { label: "Maintenance",    color: "bg-purple-400/15 text-purple-300 border-purple-400/30" },
  administration: { label: "Administration", color: "bg-indigo-400/15 text-indigo-300 border-indigo-400/30" },
};

export const COURSE_CATEGORY_CONFIG: Record<CourseCategory, { label: string; color: string }> = {
  mandatory:  { label: "Mandatory",   color: "bg-destructive/10 text-destructive border-destructive/20" },
  clinical:   { label: "Clinical",    color: "bg-primary/10 text-primary border-primary/20" },
  safety:     { label: "Safety",      color: "bg-accent/10 text-accent border-accent/20" },
  dietary:    { label: "Dietary",     color: "bg-success/10 text-success border-success/20" },
  hr:         { label: "HR",          color: "bg-purple-400/15 text-purple-300 border-purple-400/30" },
  leadership: { label: "Leadership",  color: "bg-indigo-400/15 text-indigo-300 border-indigo-400/30" },
};

export const COURSE_STATUS_CONFIG: Record<CourseStatus, { label: string; color: string }> = {
  completed:   { label: "Completed",   color: "text-success" },
  in_progress: { label: "In Progress", color: "text-primary" },
  not_started: { label: "Not Started", color: "text-muted-foreground" },
  overdue:     { label: "Overdue",     color: "text-destructive" },
};

export const CERT_CONFIG: Record<CertType, { label: string; abbr: string }> = {
  cna_license:        { label: "CNA License",                abbr: "CNA" },
  lpn_license:        { label: "LPN License",                abbr: "LPN" },
  rn_license:         { label: "RN License",                 abbr: "RN" },
  med_aide:           { label: "Medication Aide Cert.",       abbr: "MA" },
  food_handler:       { label: "Food Handler Card",           abbr: "FH" },
  cpr_first_aid:      { label: "CPR / First Aid",             abbr: "CPR" },
  dementia_specialist:{ label: "Dementia Care Specialist",    abbr: "DCS" },
  activity_director:  { label: "Activity Director Cert.",     abbr: "ACD" },
};

export const CERT_STATUS_CONFIG: Record<CertStatus, { label: string; color: string; border: string }> = {
  current:       { label: "Current",       color: "bg-success/10 text-success border-success/20",           border: "border-border" },
  expiring_soon: { label: "Expiring Soon", color: "bg-accent/10 text-accent border-accent/20",              border: "border-accent/30" },
  expired:       { label: "Expired",       color: "bg-destructive/10 text-destructive border-destructive/20", border: "border-destructive/30" },
};

// ─── Derived Metrics ──────────────────────────────────────────────────────────

function countOverdueCourses(staff: StaffMember): number {
  return staff.courses.filter((c) => c.status === "overdue").length;
}

function calcCompletionPct(staff: StaffMember): number {
  const total = staff.courses.length;
  if (total === 0) return 0;
  const done = staff.courses.filter((c) => c.status === "completed").length;
  return Math.round((done / total) * 100);
}

export function getStaffCompletionPct(s: StaffMember) { return calcCompletionPct(s); }
export function getStaffOverdueCount(s: StaffMember) { return countOverdueCourses(s); }

export const TRAINING_METRICS = {
  totalStaff: STAFF.length,
  overallCompliancePct: Math.round(STAFF.reduce((acc, s) => acc + calcCompletionPct(s), 0) / STAFF.length),
  staffWithOverdue: STAFF.filter((s) => countOverdueCourses(s) > 0).length,
  totalOverdueCourses: STAFF.reduce((acc, s) => acc + countOverdueCourses(s), 0),
  avgInServiceHoursYTD: Math.round(STAFF.reduce((acc, s) => acc + s.inServiceHoursYTD, 0) / STAFF.length * 10) / 10,
  inServiceHoursRequired: 12,
  expiringCerts: STAFF.flatMap((s) => s.certifications).filter((c) => c.status === "expiring_soon").length,
  expiredCerts: STAFF.flatMap((s) => s.certifications).filter((c) => c.status === "expired").length,
  newHires: STAFF.filter((s) => s.isNewHire).length,
  upcomingSessions: SESSIONS.filter((s) => s.status === "upcoming").length,
};

// ─── Report Definitions ───────────────────────────────────────────────────────

export interface TrainingReportDef {
  id: string;
  category: "compliance" | "individual" | "certification" | "operations";
  title: string;
  description: string;
  lastGenerated: string;
  format: string;
}

export const TRAINING_REPORTS: TrainingReportDef[] = [
  { id: "tr01", category: "compliance",    title: "Annual In-Service Compliance Report",       description: "Staff-by-staff completion status for all required annual in-service hours. State survey–ready format.",                    lastGenerated: "May 16, 2026", format: "PDF / Excel" },
  { id: "tr02", category: "compliance",    title: "Mandatory Course Completion Matrix",        description: "Grid view of all mandatory courses vs. all staff. Color-coded for complete, in-progress, and overdue.",                   lastGenerated: "May 16, 2026", format: "PDF / Excel" },
  { id: "tr03", category: "compliance",    title: "Overdue Training Report",                   description: "All staff with overdue mandatory training. Includes course name, original due date, and days past due.",                  lastGenerated: "May 16, 2026", format: "PDF" },
  { id: "tr04", category: "compliance",    title: "New Hire Orientation Checklist",            description: "Per-employee orientation completion tracker with sign-off status for each onboarding module.",                            lastGenerated: "May 10, 2026", format: "PDF" },
  { id: "tr05", category: "certification", title: "Staff Certification & License Register",    description: "All active certifications by staff member with expiry dates, renewal status, and licensing body.",                        lastGenerated: "May 16, 2026", format: "PDF / Excel" },
  { id: "tr06", category: "certification", title: "Expiring Credentials — 60-Day Outlook",    description: "All certifications expiring within 60 days. Grouped by urgency with renewal action items.",                               lastGenerated: "May 16, 2026", format: "PDF" },
  { id: "tr07", category: "individual",    title: "Employee Training Transcript",              description: "Complete training history for a selected staff member. Includes course name, date, score, and CEU credit.",               lastGenerated: "May 10, 2026", format: "PDF" },
  { id: "tr08", category: "individual",    title: "Department Training Summary",               description: "Completion rates and overdue counts grouped by department. Useful for department head reviews.",                          lastGenerated: "May 1, 2026",  format: "PDF / Excel" },
  { id: "tr09", category: "operations",    title: "Training Session Attendance Log",           description: "All in-person training sessions with roster, sign-in sheet, and instructor documentation.",                               lastGenerated: "May 12, 2026", format: "PDF" },
  { id: "tr10", category: "operations",    title: "Course Completion Rate Report",             description: "Pass rates, average scores, and completion times by course. Identifies courses with low performance.",                    lastGenerated: "May 1, 2026",  format: "PDF / Excel" },
];
