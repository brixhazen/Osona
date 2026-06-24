// ── Types ─────────────────────────────────────────────────────────────────────

export type PacketStatus = "draft" | "sent" | "in_progress" | "complete" | "expired";
export type DocStatus    = "pending" | "viewed" | "signed";
export type DocCategory  = "legal" | "financial" | "clinical" | "administrative";
export type CareType     = "independent" | "assisted" | "memory_care" | "respite";

export interface DocumentTemplate {
  id:          string;
  name:        string;
  category:    DocCategory;
  description: string;
  pageCount:   number;
}

export interface PacketTemplate {
  id:          string;
  name:        string;
  description: string;
  careTypes:   CareType[];
  documentIds: string[];
}

export interface DocumentInstance {
  id:                string;
  templateId:        string;
  status:            DocStatus;
  signedAt?:         string;
  signerName?:       string;
  signatureDataUrl?: string;
}

export interface AuditEvent {
  id:        string;
  type:      "created" | "sent" | "opened" | "doc_signed" | "completed" | "reminder_sent" | "expired" | "viewed";
  actor:     string;
  timestamp: string;
  detail:    string;
}

export interface AdmissionPacket {
  id:                 string;
  residentName:       string;
  residentDob:        string;
  careType:           CareType;
  unit:               string;
  moveInDate:         string;
  packetTemplateId:   string;
  packetTemplateName: string;
  status:             PacketStatus;
  sentTo?:            string;
  signerName?:        string;
  sentAt?:            string;
  openedAt?:          string;
  completedAt?:       string;
  signingToken:       string;
  documents:          DocumentInstance[];
  auditLog:           AuditEvent[];
}

// ── Document Templates ────────────────────────────────────────────────────────

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: "dt1",
    name: "Admission Agreement",
    category: "legal",
    description: "Primary contract governing residency terms, services, and fees.",
    pageCount: 4,
  },
  {
    id: "dt2",
    name: "Financial Responsibility Agreement",
    category: "financial",
    description: "Outlines payment obligations, billing cycle, and late fees.",
    pageCount: 3,
  },
  {
    id: "dt3",
    name: "Resident Rights Acknowledgment",
    category: "legal",
    description: "State-mandated acknowledgment of resident rights and grievance process.",
    pageCount: 2,
  },
  {
    id: "dt4",
    name: "Health History & Physical Form",
    category: "clinical",
    description: "Medical history, current diagnoses, and functional assessment.",
    pageCount: 3,
  },
  {
    id: "dt5",
    name: "Medication Authorization",
    category: "clinical",
    description: "Authorization for staff to assist with or administer medications.",
    pageCount: 2,
  },
  {
    id: "dt6",
    name: "MOLST / POLST Form",
    category: "clinical",
    description: "Medical Orders for Life-Sustaining Treatment — physician-signed directive.",
    pageCount: 4,
  },
  {
    id: "dt7",
    name: "Arbitration Agreement",
    category: "legal",
    description: "Optional pre-dispute arbitration agreement for legal claims.",
    pageCount: 3,
  },
  {
    id: "dt8",
    name: "Emergency Contact & Responsible Party",
    category: "administrative",
    description: "Designates emergency contacts and authorized decision makers.",
    pageCount: 1,
  },
];

// ── Packet Templates ──────────────────────────────────────────────────────────

export const PACKET_TEMPLATES: PacketTemplate[] = [
  {
    id: "pt1",
    name: "Standard Admission",
    description: "6-document packet for assisted living and independent residents.",
    careTypes: ["independent", "assisted"],
    documentIds: ["dt1", "dt2", "dt3", "dt4", "dt5", "dt8"],
  },
  {
    id: "pt2",
    name: "Memory Care Admission",
    description: "Full 8-document packet with MOLST and arbitration for memory care residents.",
    careTypes: ["memory_care"],
    documentIds: ["dt1", "dt2", "dt3", "dt4", "dt5", "dt6", "dt7", "dt8"],
  },
  {
    id: "pt3",
    name: "Respite Care",
    description: "Streamlined 3-document packet for short-term respite stays.",
    careTypes: ["respite"],
    documentIds: ["dt1", "dt2", "dt8"],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function docInstances(templateIds: string[], overrides: Partial<DocumentInstance>[] = []): DocumentInstance[] {
  return templateIds.map((tid, i) => ({
    id: `di-${tid}-${Math.random().toString(36).slice(2, 7)}`,
    templateId: tid,
    status: "pending",
    ...overrides[i],
  }));
}

// ── Admission Packets ─────────────────────────────────────────────────────────

export const ADMISSION_PACKETS: AdmissionPacket[] = [
  // ── COMPLETE ──────────────────────────────────────────────────────────────
  {
    id: "ap1",
    residentName: "Eleanor Whitfield",
    residentDob: "1938-04-22",
    careType: "memory_care",
    unit: "MC-12",
    moveInDate: "2026-05-15",
    packetTemplateId: "pt2",
    packetTemplateName: "Memory Care Admission",
    status: "complete",
    sentTo: "s.whitfield@gmail.com",
    signerName: "Susan Whitfield (daughter)",
    sentAt: "2026-05-08T10:14:00",
    openedAt: "2026-05-08T11:32:00",
    completedAt: "2026-05-12T14:47:00",
    signingToken: "tok_ew_8812",
    documents: docInstances(["dt1","dt2","dt3","dt4","dt5","dt6","dt7","dt8"], [
      { status: "signed", signedAt: "2026-05-09T09:12:00", signerName: "Susan Whitfield" },
      { status: "signed", signedAt: "2026-05-09T09:14:00", signerName: "Susan Whitfield" },
      { status: "signed", signedAt: "2026-05-09T09:16:00", signerName: "Susan Whitfield" },
      { status: "signed", signedAt: "2026-05-10T14:02:00", signerName: "Susan Whitfield" },
      { status: "signed", signedAt: "2026-05-10T14:05:00", signerName: "Susan Whitfield" },
      { status: "signed", signedAt: "2026-05-12T14:40:00", signerName: "Dr. R. Patel (physician)" },
      { status: "signed", signedAt: "2026-05-12T14:44:00", signerName: "Susan Whitfield" },
      { status: "signed", signedAt: "2026-05-12T14:47:00", signerName: "Susan Whitfield" },
    ]),
    auditLog: [
      { id: "al1", type: "created",    actor: "Dana Alvarez",      timestamp: "2026-05-07T16:30:00", detail: "Packet created from Memory Care Admission template" },
      { id: "al2", type: "sent",       actor: "Dana Alvarez",      timestamp: "2026-05-08T10:14:00", detail: "Signing link sent to s.whitfield@gmail.com" },
      { id: "al3", type: "opened",     actor: "Susan Whitfield",   timestamp: "2026-05-08T11:32:00", detail: "Recipient opened signing link" },
      { id: "al4", type: "doc_signed", actor: "Susan Whitfield",   timestamp: "2026-05-09T09:16:00", detail: "Signed: Admission Agreement, Financial Responsibility, Resident Rights" },
      { id: "al5", type: "doc_signed", actor: "Susan Whitfield",   timestamp: "2026-05-10T14:05:00", detail: "Signed: Health History, Medication Authorization" },
      { id: "al6", type: "doc_signed", actor: "Dr. R. Patel",      timestamp: "2026-05-12T14:40:00", detail: "Signed: MOLST / POLST Form (physician)" },
      { id: "al7", type: "doc_signed", actor: "Susan Whitfield",   timestamp: "2026-05-12T14:47:00", detail: "Signed: Arbitration Agreement, Emergency Contact" },
      { id: "al8", type: "completed",  actor: "System",            timestamp: "2026-05-12T14:47:00", detail: "All 8 documents signed — packet complete" },
    ],
  },

  {
    id: "ap2",
    residentName: "Robert Tanaka",
    residentDob: "1942-11-03",
    careType: "assisted",
    unit: "AL-07",
    moveInDate: "2026-05-28",
    packetTemplateId: "pt1",
    packetTemplateName: "Standard Admission",
    status: "complete",
    sentTo: "rtanaka1942@yahoo.com",
    signerName: "Robert Tanaka",
    sentAt: "2026-05-20T09:00:00",
    openedAt: "2026-05-20T09:45:00",
    completedAt: "2026-05-23T11:20:00",
    signingToken: "tok_rt_4421",
    documents: docInstances(["dt1","dt2","dt3","dt4","dt5","dt8"], [
      { status: "signed", signedAt: "2026-05-21T10:00:00", signerName: "Robert Tanaka" },
      { status: "signed", signedAt: "2026-05-21T10:03:00", signerName: "Robert Tanaka" },
      { status: "signed", signedAt: "2026-05-21T10:06:00", signerName: "Robert Tanaka" },
      { status: "signed", signedAt: "2026-05-23T11:10:00", signerName: "Robert Tanaka" },
      { status: "signed", signedAt: "2026-05-23T11:15:00", signerName: "Robert Tanaka" },
      { status: "signed", signedAt: "2026-05-23T11:20:00", signerName: "Robert Tanaka" },
    ]),
    auditLog: [
      { id: "bl1", type: "created",    actor: "Elena Ruiz",    timestamp: "2026-05-19T14:00:00", detail: "Packet created from Standard Admission template" },
      { id: "bl2", type: "sent",       actor: "Elena Ruiz",    timestamp: "2026-05-20T09:00:00", detail: "Signing link sent to rtanaka1942@yahoo.com" },
      { id: "bl3", type: "opened",     actor: "Robert Tanaka", timestamp: "2026-05-20T09:45:00", detail: "Recipient opened signing link" },
      { id: "bl4", type: "doc_signed", actor: "Robert Tanaka", timestamp: "2026-05-21T10:06:00", detail: "Signed: Admission Agreement, Financial Responsibility, Resident Rights" },
      { id: "bl5", type: "doc_signed", actor: "Robert Tanaka", timestamp: "2026-05-23T11:20:00", detail: "Signed: Health History, Medication Authorization, Emergency Contact" },
      { id: "bl6", type: "completed",  actor: "System",        timestamp: "2026-05-23T11:20:00", detail: "All 6 documents signed — packet complete" },
    ],
  },

  // ── IN PROGRESS ───────────────────────────────────────────────────────────
  {
    id: "ap3",
    residentName: "Patricia Chen",
    residentDob: "1945-07-18",
    careType: "assisted",
    unit: "AL-14",
    moveInDate: "2026-06-25",
    packetTemplateId: "pt1",
    packetTemplateName: "Standard Admission",
    status: "in_progress",
    sentTo: "dchen.family@gmail.com",
    signerName: "David Chen (son)",
    sentAt: "2026-06-15T11:00:00",
    openedAt: "2026-06-15T13:22:00",
    signingToken: "tok_pc_7733",
    documents: docInstances(["dt1","dt2","dt3","dt4","dt5","dt8"], [
      { status: "signed", signedAt: "2026-06-16T09:30:00", signerName: "David Chen" },
      { status: "signed", signedAt: "2026-06-16T09:33:00", signerName: "David Chen" },
      { status: "signed", signedAt: "2026-06-16T09:36:00", signerName: "David Chen" },
      { status: "signed", signedAt: "2026-06-17T14:10:00", signerName: "David Chen" },
      { status: "pending" },
      { status: "pending" },
    ]),
    auditLog: [
      { id: "cl1", type: "created",    actor: "Elena Ruiz",  timestamp: "2026-06-14T15:00:00", detail: "Packet created from Standard Admission template" },
      { id: "cl2", type: "sent",       actor: "Elena Ruiz",  timestamp: "2026-06-15T11:00:00", detail: "Signing link sent to dchen.family@gmail.com" },
      { id: "cl3", type: "opened",     actor: "David Chen",  timestamp: "2026-06-15T13:22:00", detail: "Recipient opened signing link" },
      { id: "cl4", type: "doc_signed", actor: "David Chen",  timestamp: "2026-06-16T09:36:00", detail: "Signed: Admission Agreement, Financial Responsibility, Resident Rights" },
      { id: "cl5", type: "doc_signed", actor: "David Chen",  timestamp: "2026-06-17T14:10:00", detail: "Signed: Health History & Physical Form" },
    ],
  },

  // ── SENT ──────────────────────────────────────────────────────────────────
  {
    id: "ap4",
    residentName: "James Holloway",
    residentDob: "1936-02-14",
    careType: "memory_care",
    unit: "MC-08",
    moveInDate: "2026-07-01",
    packetTemplateId: "pt2",
    packetTemplateName: "Memory Care Admission",
    status: "sent",
    sentTo: "c.holloway@icloud.com",
    signerName: "Carol Holloway (daughter)",
    sentAt: "2026-06-17T09:30:00",
    openedAt: "2026-06-17T10:05:00",
    signingToken: "tok_jh_9910",
    documents: docInstances(["dt1","dt2","dt3","dt4","dt5","dt6","dt7","dt8"]),
    auditLog: [
      { id: "dl1", type: "created", actor: "Dana Alvarez",    timestamp: "2026-06-16T14:00:00", detail: "Packet created from Memory Care Admission template" },
      { id: "dl2", type: "sent",    actor: "Dana Alvarez",    timestamp: "2026-06-17T09:30:00", detail: "Signing link sent to c.holloway@icloud.com" },
      { id: "dl3", type: "opened",  actor: "Carol Holloway",  timestamp: "2026-06-17T10:05:00", detail: "Recipient opened signing link — no documents signed yet" },
    ],
  },

  // ── DRAFT ─────────────────────────────────────────────────────────────────
  {
    id: "ap5",
    residentName: "Beverly Morrison",
    residentDob: "1950-09-30",
    careType: "assisted",
    unit: "AL-22",
    moveInDate: "2026-07-10",
    packetTemplateId: "pt1",
    packetTemplateName: "Standard Admission",
    status: "draft",
    signingToken: "tok_bm_1155",
    documents: docInstances(["dt1","dt2","dt3","dt4","dt5","dt8"]),
    auditLog: [
      { id: "el1", type: "created", actor: "Elena Ruiz", timestamp: "2026-06-17T16:45:00", detail: "Packet created from Standard Admission template — not yet sent" },
    ],
  },

  // ── EXPIRED ───────────────────────────────────────────────────────────────
  {
    id: "ap6",
    residentName: "Thomas Wright",
    residentDob: "1948-12-07",
    careType: "respite",
    unit: "RS-04",
    moveInDate: "2026-06-20",
    packetTemplateId: "pt3",
    packetTemplateName: "Respite Care",
    status: "expired",
    sentTo: "t.wright.family@gmail.com",
    signerName: "Linda Wright (wife)",
    sentAt: "2026-06-05T10:00:00",
    signingToken: "tok_tw_6644",
    documents: docInstances(["dt1","dt2","dt8"]),
    auditLog: [
      { id: "fl1", type: "created", actor: "Dana Alvarez", timestamp: "2026-06-04T11:30:00", detail: "Packet created from Respite Care template" },
      { id: "fl2", type: "sent",    actor: "Dana Alvarez", timestamp: "2026-06-05T10:00:00", detail: "Signing link sent to t.wright.family@gmail.com" },
      { id: "fl3", type: "expired", actor: "System",       timestamp: "2026-06-12T10:00:00", detail: "Signing link expired after 7 days — resend required" },
    ],
  },
];

// ── Prospect list for New Admission modal ─────────────────────────────────────

export const ADMIT_PROSPECTS = [
  { name: "Carol Edmonds",   dob: "1944-03-15", careType: "assisted"    as CareType },
  { name: "Philip Webb",     dob: "1939-08-22", careType: "memory_care" as CareType },
  { name: "Nancy Ostrowski", dob: "1953-01-10", careType: "independent" as CareType },
  { name: "Gerald Simmons",  dob: "1941-06-29", careType: "assisted"    as CareType },
];
