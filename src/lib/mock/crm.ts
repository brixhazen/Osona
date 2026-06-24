// ── Types ────────────────────────────────────────────────────────────────────

export type LeadStage =
  | "inquiry"
  | "nurturing"
  | "toured"
  | "applied"
  | "deposit"
  | "moved_in"
  | "lost";

export type CareInterest =
  | "independent"
  | "assisted"
  | "memory_care"
  | "respite"
  | "undecided";

export type LeadSource =
  | "website"
  | "physician"
  | "hospital"
  | "family_referral"
  | "senior_advisor"
  | "event"
  | "walk_in"
  | "returning";

export type BudgetType = "private_pay" | "ltci" | "medicaid" | "va" | "unknown";

export type Urgency =
  | "immediate"
  | "within_1mo"
  | "1_3mo"
  | "3_6mo"
  | "exploring";

export type ActivityType =
  | "call"
  | "email"
  | "tour"
  | "visit"
  | "note"
  | "application"
  | "deposit"
  | "loss";

export interface Activity {
  id: string;
  type: ActivityType;
  date: string;
  time: string;
  by: string;
  subject: string;
  body: string;
  outcome?: string;
}

export interface PrimaryContact {
  name: string;
  relation: string;
  phone: string;
  email?: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  age?: number;
  phone?: string;
  email?: string;
  stage: LeadStage;
  careInterest: CareInterest;
  primaryContact: PrimaryContact;
  budget: BudgetType;
  source: LeadSource;
  assignedTo: string;
  createdAt: string;
  followUpDate?: string;
  urgency: Urgency;
  notes: string;
  activities: Activity[];
}

export interface ScheduledTour {
  id: string;
  leadId: string;
  leadName: string;
  contactName: string;
  date: string;
  time: string;
  duration: string;
  conductedBy: string;
  careInterest: CareInterest;
  partySize: number;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
}

// ── Config ────────────────────────────────────────────────────────────────────

export const PIPELINE_STAGES: LeadStage[] = [
  "inquiry",
  "nurturing",
  "toured",
  "applied",
  "deposit",
];

export const STAGE_CONFIG: Record<
  LeadStage,
  { label: string; headerCls: string; dotCls: string }
> = {
  inquiry: {
    label: "Inquiry",
    headerCls: "border-border text-foreground",
    dotCls: "bg-muted-foreground",
  },
  nurturing: {
    label: "Nurturing",
    headerCls: "border-primary/30 text-primary",
    dotCls: "bg-primary",
  },
  toured: {
    label: "Toured",
    headerCls: "border-accent/30 text-accent",
    dotCls: "bg-accent",
  },
  applied: {
    label: "Applied",
    headerCls: "border-warning/30 text-warning",
    dotCls: "bg-warning",
  },
  deposit: {
    label: "Deposit",
    headerCls: "border-success/30 text-success",
    dotCls: "bg-success",
  },
  moved_in: {
    label: "Moved In",
    headerCls: "border-success/30 text-success",
    dotCls: "bg-success",
  },
  lost: {
    label: "Lost",
    headerCls: "border-destructive/30 text-destructive",
    dotCls: "bg-destructive",
  },
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  website: "Website",
  physician: "Physician",
  hospital: "Hospital",
  family_referral: "Family Referral",
  senior_advisor: "Senior Advisor",
  event: "Event",
  walk_in: "Walk-In",
  returning: "Returning",
};

export const URGENCY_CONFIG: Record<
  Urgency,
  { label: string; cls: string }
> = {
  immediate: { label: "Immediate", cls: "bg-destructive/15 text-destructive border-destructive/25" },
  within_1mo: { label: "Within 1 mo", cls: "bg-warning/15 text-warning border-warning/25" },
  "1_3mo": { label: "1–3 months", cls: "bg-accent/15 text-accent border-accent/25" },
  "3_6mo": { label: "3–6 months", cls: "bg-muted/40 text-muted-foreground border-border" },
  exploring: { label: "Exploring", cls: "bg-muted/40 text-muted-foreground border-border" },
};

export const CARE_LABELS: Record<CareInterest, string> = {
  independent: "Independent",
  assisted: "Assisted Living",
  memory_care: "Memory Care",
  respite: "Respite",
  undecided: "Undecided",
};

export const CARE_COLORS: Record<CareInterest, string> = {
  independent: "bg-success/15 text-success border-success/25",
  assisted: "bg-primary/15 text-primary border-primary/25",
  memory_care: "bg-destructive/15 text-destructive border-destructive/25",
  respite: "bg-warning/15 text-warning border-warning/25",
  undecided: "bg-muted/40 text-muted-foreground border-border",
};

// ── Monthly rate estimates by care type ──────────────────────────────────────

export const RATE_ESTIMATES: Record<CareInterest, number> = {
  independent: 3200,
  assisted: 5800,
  memory_care: 7200,
  respite: 6500,
  undecided: 5500,
};

// ── Counselors ────────────────────────────────────────────────────────────────

export const COUNSELORS = ["Sarah Mitchell", "David Reyes"];

// ── Outreach templates ────────────────────────────────────────────────────────

export const STAGE_OUTREACH_TEMPLATES: Record<string, string> = {
  inquiry:   "Hi {{firstName}}, just following up on your interest in Haven. We'd love to schedule a time to chat or show you around — happy to answer any questions!",
  nurturing: "Hi {{firstName}}, wanted to check in and see how things are going on your end. We have some great availability coming up and would love to connect.",
  toured:    "Hi {{firstName}}, it was so great meeting you! Happy to answer any questions about what you saw. Feel free to reach out anytime.",
  applied:   "Hi {{firstName}}, your application is moving forward and we wanted to keep you in the loop. Please don't hesitate to reach out with any questions.",
  deposit:   "Hi {{firstName}}, we're so excited to welcome you to Haven! Reach out if you need anything as you prepare for move-in.",
};

// ── Leads ─────────────────────────────────────────────────────────────────────

export const LEADS: Lead[] = [
  // ── INQUIRY ──────────────────────────────────────────────────────────────
  {
    id: "l001",
    firstName: "Margaret",
    lastName: "Collins",
    age: 82,
    phone: "(801) 555-0201",
    stage: "inquiry",
    careInterest: "memory_care",
    primaryContact: {
      name: "Diane Collins",
      relation: "Daughter",
      phone: "(801) 555-0202",
      email: "d.collins@email.com",
    },
    budget: "private_pay",
    source: "website",
    assignedTo: "Sarah Mitchell",
    createdAt: "2026-05-12",
    followUpDate: "2026-05-15",
    urgency: "immediate",
    notes: "Mother recently diagnosed with moderate Alzheimer's. Daughter is primary caregiver — feeling burned out. Looking for a memory care placement ASAP. Husband passed last year. Tour scheduled today at 10 AM.",
    activities: [
      {
        id: "a001", type: "call", date: "2026-05-12", time: "2:15 PM", by: "Sarah Mitchell",
        subject: "Initial inquiry call",
        body: "Daughter Diane called after finding us through Google. Mother Margaret has moderate Alzheimer's — no longer safe at home. Diane is primary caregiver and is exhausted. Father passed in 2025. They have private pay funds. Looking for ASAP placement.",
        outcome: "Tour scheduled 5/15 at 10 AM. Send follow-up email with memory care brochure.",
      },
      {
        id: "a002", type: "email", date: "2026-05-12", time: "3:30 PM", by: "Sarah Mitchell",
        subject: "Welcome email + memory care brochure sent",
        body: "Sent welcome packet, memory care brochure, pricing guide, and virtual tour link. Confirmed 5/15 10 AM tour.",
      },
      {
        id: "a003", type: "call", date: "2026-05-14", time: "9:00 AM", by: "Sarah Mitchell",
        subject: "Tour confirmation call",
        body: "Called Diane to confirm tour tomorrow at 10 AM. She and her brother will both attend. Asked about Margaret's daily routine and preferences — loves music and gardens. Will route the tour through the memory garden.",
        outcome: "Confirmed. Party of 3.",
      },
    ],
  },
  {
    id: "l002",
    firstName: "Robert",
    lastName: "Tanner",
    age: 78,
    phone: "(801) 555-0310",
    email: "r.tanner@email.com",
    stage: "inquiry",
    careInterest: "assisted",
    primaryContact: {
      name: "Robert Tanner",
      relation: "Self",
      phone: "(801) 555-0310",
      email: "r.tanner@email.com",
    },
    budget: "private_pay",
    source: "physician",
    assignedTo: "David Reyes",
    createdAt: "2026-05-11",
    followUpDate: "2026-05-15",
    urgency: "within_1mo",
    notes: "Retired engineer, very sharp. Fell twice at home. Physician Dr. Rosen suggested assisted living. Wife passed 2022. Daughter in Seattle checks in weekly. Tour scheduled today 2 PM.",
    activities: [
      {
        id: "a101", type: "call", date: "2026-05-11", time: "10:00 AM", by: "David Reyes",
        subject: "Physician referral — Dr. Rosen",
        body: "Dr. Rosen's office called with referral for Robert Tanner. Two recent falls, physician concerned about safety living alone. Patient open to assisted living but initially resistant. Recommend a 'decision-maker' approach — frame it as his choice.",
        outcome: "Called Robert directly, left voicemail.",
      },
      {
        id: "a102", type: "call", date: "2026-05-12", time: "3:45 PM", by: "David Reyes",
        subject: "Connected with Robert",
        body: "Robert called back. Sharp and direct. Wants to know: 'Can I still have my independence?' Focused on the things he can do, not lose. Likes gardening, woodworking. Very budget-conscious — wants all-inclusive pricing breakdown. Tour scheduled 5/15 at 2 PM.",
        outcome: "Tour scheduled. Sending pricing info and sample floor plans.",
      },
    ],
  },
  {
    id: "l003",
    firstName: "Helen",
    lastName: "Park",
    age: 77,
    stage: "inquiry",
    careInterest: "memory_care",
    primaryContact: {
      name: "Kevin Park",
      relation: "Son",
      phone: "(801) 555-0421",
      email: "k.park@email.com",
    },
    budget: "ltci",
    source: "hospital",
    assignedTo: "Sarah Mitchell",
    createdAt: "2026-05-13",
    followUpDate: "2026-05-16",
    urgency: "immediate",
    notes: "Hospital social worker referral. Helen had a fall at home with mild TBI — discharging in 3 days. Son Kevin is frantic. Has LTC insurance through Genworth. Has vascular dementia diagnosis. Needs memory care or post-acute transitional placement.",
    activities: [
      {
        id: "a201", type: "call", date: "2026-05-13", time: "11:00 AM", by: "Sarah Mitchell",
        subject: "Hospital social worker referral",
        body: "SW Tamara Pines at St. Mark's called. Helen Park, 77F with vascular dementia and recent TBI from a fall at home. Discharging in ~3 days. Son Kevin is the primary decision maker and is stressed. LTC insurance confirmed — need to start authorization process. Memory care placement needed ASAP.",
        outcome: "Called Kevin immediately. Sent admission packet.",
      },
      {
        id: "a202", type: "call", date: "2026-05-13", time: "2:00 PM", by: "Sarah Mitchell",
        subject: "Call with Kevin Park",
        body: "Kevin very stressed — first experience with elder care placement. Walked him through our memory care program, staffing ratios, and security features. He has two other siblings (out of state) who want to weigh in via Zoom. Sent virtual tour link. Tour scheduled for 5/16.",
        outcome: "Tour 5/16. Family Zoom 5/17. Working on LTC pre-auth.",
      },
    ],
  },
  {
    id: "l004",
    firstName: "Frank",
    lastName: "Doyle",
    age: 81,
    phone: "(801) 555-0530",
    email: "frank.d@email.com",
    stage: "inquiry",
    careInterest: "independent",
    primaryContact: {
      name: "Frank Doyle",
      relation: "Self",
      phone: "(801) 555-0530",
      email: "frank.d@email.com",
    },
    budget: "private_pay",
    source: "event",
    assignedTo: "David Reyes",
    createdAt: "2026-05-10",
    followUpDate: "2026-05-19",
    urgency: "3_6mo",
    notes: "Attended our May 8 community open house. Retired physician — very independent, researching options well in advance. Wants an active community, pool access, and social activities. Interested in independent living but wants to know about AL upgrade path if needed.",
    activities: [
      {
        id: "a301", type: "visit", date: "2026-05-08", time: "11:00 AM", by: "David Reyes",
        subject: "Community open house — Frank attended",
        body: "Frank attended the open house with his daughter Karen. Both impressed with the common areas and activity calendar. Asked detailed questions about the contract structure and care escalation process. Daughter Karen initially more hesitant — focused on staff turnover question.",
        outcome: "Follow-up call scheduled 5/10.",
      },
      {
        id: "a302", type: "call", date: "2026-05-10", time: "1:00 PM", by: "David Reyes",
        subject: "Follow-up call",
        body: "Frank very engaged — asked about our physician relationships and how medical care is coordinated. Liked that we have Dr. Wu and Dr. Patel on site regularly. No urgency — planning 6-12 months out. Will tour when he feels ready.",
        outcome: "No tour yet. Sending monthly newsletter. Follow up 5/19.",
      },
    ],
  },
  {
    id: "l005",
    firstName: "Patricia",
    lastName: "Walsh",
    age: 85,
    stage: "inquiry",
    careInterest: "assisted",
    primaryContact: {
      name: "Anne Walsh-Owens",
      relation: "Daughter",
      phone: "(801) 555-0641",
      email: "a.walsh.owens@email.com",
    },
    budget: "private_pay",
    source: "senior_advisor",
    assignedTo: "Sarah Mitchell",
    createdAt: "2026-05-14",
    followUpDate: "2026-05-16",
    urgency: "within_1mo",
    notes: "Senior Living Advisors referral. Patricia's daughter Anne is coordinating. Mother lives alone in a large home — manageable now but declining. Two hospitalizations this year for UTIs. Daughter wants a placement within 4-6 weeks.",
    activities: [
      {
        id: "a401", type: "call", date: "2026-05-14", time: "4:00 PM", by: "Sarah Mitchell",
        subject: "Senior advisor referral — initial contact",
        body: "Advisor Tom Bright (Senior Living Advisors) sent the referral. Called Anne Walsh-Owens immediately. Mom Patricia, 85F, living alone with declining ADLs. 2 ER visits this year for UTIs. Daughter very motivated — wants her mother safe within 4-6 weeks. Strong private pay. Sent brochure.",
        outcome: "Tour being scheduled for next week. Follow up 5/16.",
      },
    ],
  },
  {
    id: "l006",
    firstName: "James",
    lastName: "Whitfield",
    age: 74,
    phone: "(801) 555-0752",
    stage: "inquiry",
    careInterest: "assisted",
    primaryContact: {
      name: "Carol Whitfield",
      relation: "Wife",
      phone: "(801) 555-0752",
    },
    budget: "private_pay",
    source: "family_referral",
    assignedTo: "David Reyes",
    createdAt: "2026-05-09",
    followUpDate: "2026-05-17",
    urgency: "1_3mo",
    notes: "Referred by Gerald Hayes's son (existing resident). James has Parkinson's — wife Carol is primary caregiver and struggling. They want to keep living together — asking about couples options.",
    activities: [
      {
        id: "a501", type: "call", date: "2026-05-09", time: "10:30 AM", by: "David Reyes",
        subject: "Family referral — Gerald Hayes connection",
        body: "Gerald Hayes Jr. referred the Whitfields. James (74) has Parkinson's — wife Carol (73) is full-time caregiver and exhausted. They want to remain together — asking if a couple can share a unit or if we have companion suites. Very motivated but want to explore options carefully.",
        outcome: "Invited to couples info session May 20. Follow up 5/17.",
      },
    ],
  },

  // ── NURTURING ────────────────────────────────────────────────────────────
  {
    id: "l007",
    firstName: "Ruth",
    lastName: "Nakamura",
    age: 79,
    stage: "nurturing",
    careInterest: "memory_care",
    primaryContact: {
      name: "Amy Nakamura",
      relation: "Daughter",
      phone: "(801) 555-0862",
      email: "a.nakamura@email.com",
    },
    budget: "private_pay",
    source: "hospital",
    assignedTo: "Sarah Mitchell",
    createdAt: "2026-04-28",
    followUpDate: "2026-05-16",
    urgency: "within_1mo",
    notes: "Hospital social worker referral from April. Mother has moderate dementia + recent wandering episodes — found outside her home at 2 AM. Daughter reluctant to place but knows it's necessary. Tour scheduled 5/16.",
    activities: [
      {
        id: "a601", type: "call", date: "2026-04-28", time: "3:00 PM", by: "Sarah Mitchell",
        subject: "Initial call — SW referral",
        body: "Hospital SW referral. Ruth, 79F, moderate dementia, wandering. Daughter Amy very emotional — guilt about placement. Emphasized that memory care is safer and provides meaningful engagement. Sent memory care guide.",
      },
      {
        id: "a602", type: "call", date: "2026-05-05", time: "10:00 AM", by: "Sarah Mitchell",
        subject: "Follow-up — Amy processing",
        body: "Amy called with more questions — focused on staffing ratios and elopement safety. Walked through our wander guard system and 24/7 staffing model. She is moving toward placement but wants siblings on board.",
        outcome: "Tour scheduled 5/16 — Amy + brother attending.",
      },
      {
        id: "a603", type: "email", date: "2026-05-10", time: "9:00 AM", by: "Sarah Mitchell",
        subject: "Tour confirmation + elopement safety overview sent",
        body: "Sent detailed overview of our memory care security features, activity programming, and staffing. Also sent pricing guide. Confirmed tour 5/16 at 11 AM.",
      },
    ],
  },
  {
    id: "l008",
    firstName: "Charles",
    lastName: "Brennan",
    age: 82,
    phone: "(801) 555-0973",
    stage: "nurturing",
    careInterest: "assisted",
    primaryContact: {
      name: "Michael Brennan",
      relation: "Son",
      phone: "(801) 555-0974",
      email: "m.brennan@email.com",
    },
    budget: "ltci",
    source: "senior_advisor",
    assignedTo: "David Reyes",
    createdAt: "2026-04-22",
    followUpDate: "2026-05-16",
    urgency: "1_3mo",
    notes: "Father has CHF + COPD, managing at home with a paid caregiver. Son Michael is comparing 3 communities. LTC insurance confirmed. Price-sensitive. Needs to feel the value is worth the move.",
    activities: [
      {
        id: "a701", type: "call", date: "2026-04-22", time: "2:00 PM", by: "David Reyes",
        subject: "Initial contact",
        body: "Senior advisor referral. Charles Brennan, 82M, CHF + COPD. Currently has a private paid caregiver but son Michael says costs are escalating. LTC insurance through Mutual of Omaha confirmed — need to verify benefit amount. Shopping 3 communities.",
      },
      {
        id: "a702", type: "call", date: "2026-05-02", time: "11:00 AM", by: "David Reyes",
        subject: "Follow-up — comparing communities",
        body: "Michael very analytical — asked for a detailed cost comparison vs. home care. Prepared a 12-month cost analysis showing home care ($9,200/mo) vs. our assisted living ($5,800/mo + LTC benefit) = significant savings. He was impressed.",
        outcome: "Tour scheduled 5/16 at 3 PM.",
      },
    ],
  },
  {
    id: "l009",
    firstName: "Evelyn",
    lastName: "Torres",
    age: 86,
    stage: "nurturing",
    careInterest: "memory_care",
    primaryContact: {
      name: "Rosa Torres",
      relation: "Daughter",
      phone: "(801) 555-0183",
      email: "r.torres@email.com",
    },
    budget: "private_pay",
    source: "physician",
    assignedTo: "Sarah Mitchell",
    createdAt: "2026-04-18",
    followUpDate: "2026-05-18",
    urgency: "immediate",
    notes: "Dr. Patel referral. Evelyn has advanced vascular dementia — no longer safe at home. Family has been resistant to placement for months. Daughter Rosa now on board but needs to convince brother Eduardo. Situation becoming urgent.",
    activities: [
      {
        id: "a801", type: "call", date: "2026-04-18", time: "9:30 AM", by: "Sarah Mitchell",
        subject: "Dr. Patel referral",
        body: "Dr. Patel called directly — very concerned about Evelyn Torres. Has seen 3x in 3 months. Left alone at home for hours at a time. Daughter Rosa is primary contact but family is divided on placement.",
      },
      {
        id: "a802", type: "call", date: "2026-04-25", time: "1:00 PM", by: "Sarah Mitchell",
        subject: "Call with Rosa",
        body: "Rosa tearful on the phone — she knows her mother needs care but brother Eduardo disagrees. I offered to meet with the whole family together. Urgent — Dr. Patel flagged safety concerns.",
      },
      {
        id: "a803", type: "call", date: "2026-05-08", time: "11:00 AM", by: "Sarah Mitchell",
        subject: "Family progress check",
        body: "Rosa says Eduardo is now open to 'at least looking.' Family dynamics still complicated. Scheduling a family call for 5/18. If they can agree, placement within 2-3 weeks possible.",
        outcome: "Family call 5/18. Following up.",
      },
    ],
  },
  {
    id: "l010",
    firstName: "Arthur",
    lastName: "Simmons",
    age: 77,
    phone: "(801) 555-0294",
    email: "asimmons@email.com",
    stage: "nurturing",
    careInterest: "independent",
    primaryContact: {
      name: "Arthur Simmons",
      relation: "Self",
      phone: "(801) 555-0294",
    },
    budget: "private_pay",
    source: "website",
    assignedTo: "David Reyes",
    createdAt: "2026-04-10",
    followUpDate: "2026-05-20",
    urgency: "3_6mo",
    notes: "Self-initiated web inquiry. Retired professor, very active. Planning proactively. Wants a community with a robust intellectual and social calendar. Not in any rush — doing research for 3-6 months out. Responded well to David.",
    activities: [
      {
        id: "a901", type: "email", date: "2026-04-10", time: "8:00 AM", by: "David Reyes",
        subject: "Web inquiry response",
        body: "Arthur submitted a web inquiry. Responded promptly with IL brochure and activity calendar. He emailed back within 2 hours with detailed questions about the dining program, library access, and transportation.",
      },
      {
        id: "a902", type: "call", date: "2026-04-14", time: "3:00 PM", by: "David Reyes",
        subject: "First call — great conversation",
        body: "45-minute call. Arthur is sharp, funny, and very intentional. Wants to move on his own terms. Asked about the resident council, guest speaker series, and golf/tennis access nearby. Sending monthly updates. Not ready to tour yet.",
      },
    ],
  },

  // ── TOURED ───────────────────────────────────────────────────────────────
  {
    id: "l011",
    firstName: "Louise",
    lastName: "Crawford",
    age: 84,
    stage: "toured",
    careInterest: "memory_care",
    primaryContact: {
      name: "Janet Crawford",
      relation: "Daughter",
      phone: "(801) 555-0305",
      email: "j.crawford@email.com",
    },
    budget: "private_pay",
    source: "family_referral",
    assignedTo: "Sarah Mitchell",
    createdAt: "2026-04-05",
    followUpDate: "2026-05-15",
    urgency: "immediate",
    notes: "Toured 5/8 — very positive reaction. Daughter Janet is sold; waiting on sister in Denver to agree. Follow up today — get both daughters on a call.",
    activities: [
      {
        id: "b101", type: "call", date: "2026-04-05", time: "1:00 PM", by: "Sarah Mitchell",
        subject: "Initial inquiry",
        body: "Janet Crawford called — mom Louise, 84, advanced dementia. Referred by neighbor whose mother lives here. Janet is primary — sister Barbara in Denver is co-decision maker.",
      },
      {
        id: "b102", type: "tour", date: "2026-05-08", time: "10:00 AM", by: "Sarah Mitchell",
        subject: "Community tour — Janet + Louise",
        body: "Janet brought Louise for a tour. Louise was calm and responded well to the memory care garden. Staff greeted her by name by end of tour. Janet was visibly moved — says this 'feels right.' Focused on 1:4 staffing ratio and activities program.",
        outcome: "Janet loves it. Needs Barbara to agree. 3-way call being set up.",
      },
      {
        id: "b103", type: "call", date: "2026-05-12", time: "2:00 PM", by: "Sarah Mitchell",
        subject: "Follow-up — Barbara still deciding",
        body: "Janet says Barbara has seen the virtual tour. Barbara's main concern is distance — Denver is far for visits. Sent info on our family communication system and monthly family meetings.",
        outcome: "Follow up 5/15 — targeting this week.",
      },
    ],
  },
  {
    id: "l012",
    firstName: "Frederick",
    lastName: "Barnes",
    age: 76,
    phone: "(801) 555-0416",
    stage: "toured",
    careInterest: "assisted",
    primaryContact: {
      name: "Frederick Barnes",
      relation: "Self",
      phone: "(801) 555-0416",
    },
    budget: "private_pay",
    source: "event",
    assignedTo: "David Reyes",
    createdAt: "2026-04-08",
    followUpDate: "2026-05-18",
    urgency: "within_1mo",
    notes: "Toured 5/7 with wife Dorothy. Both liked the community but price was a concern. David sent the cost-of-care comparison showing home care cost vs. community cost. Very close to decision.",
    activities: [
      {
        id: "b201", type: "visit", date: "2026-04-08", time: "1:00 PM", by: "David Reyes",
        subject: "Open house — Frederick + Dorothy attended",
        body: "Frederick and wife Dorothy came to April open house. Frederick has mild CHF and wants structured activity. Dorothy is very active caregiver but admits it's getting harder.",
      },
      {
        id: "b202", type: "tour", date: "2026-05-07", time: "11:00 AM", by: "David Reyes",
        subject: "Full tour — Frederick + Dorothy",
        body: "Great tour. Frederick liked the exercise room and library. Dorothy liked the dining options and that laundry is handled. Price was discussed — $5,800/mo was more than expected. Will compare with home care costs.",
        outcome: "Sent cost comparison. Follow up 5/18.",
      },
    ],
  },
  {
    id: "l013",
    firstName: "Virginia",
    lastName: "Hudson",
    age: 88,
    stage: "toured",
    careInterest: "memory_care",
    primaryContact: {
      name: "Thomas Hudson",
      relation: "Son",
      phone: "(801) 555-0527",
      email: "t.hudson@email.com",
    },
    budget: "ltci",
    source: "physician",
    assignedTo: "Sarah Mitchell",
    createdAt: "2026-03-28",
    followUpDate: "2026-05-16",
    urgency: "immediate",
    notes: "Toured 4/28. Son Thomas liked the facility but is conflicted — wife wants him to move mother closer to them in Phoenix. Needs to make a decision fast. LTC insurance confirmed. Sarah needs to stay close to this one.",
    activities: [
      {
        id: "b301", type: "call", date: "2026-03-28", time: "9:00 AM", by: "Sarah Mitchell",
        subject: "Physician referral — Dr. Patel",
        body: "Dr. Patel referral. Virginia Hudson, 88F, advanced dementia. Son Thomas is POA. Wife Kelly wants them to move Virginia to Phoenix near them. Thomas prefers to keep her local (Utah-based family).",
      },
      {
        id: "b302", type: "tour", date: "2026-04-28", time: "10:00 AM", by: "Sarah Mitchell",
        subject: "Tour — Thomas + Virginia",
        body: "Thomas toured with mother. Virginia was agitated initially but settled in the memory garden for 20 minutes. Thomas was impressed with staff interaction. Facility was his top choice of 3 toured. Wife Kelly is the obstacle.",
        outcome: "Thomas going back to discuss with Kelly. Follow-up 5/16.",
      },
      {
        id: "b303", type: "call", date: "2026-05-10", time: "11:00 AM", by: "Sarah Mitchell",
        subject: "Check-in — no decision yet",
        body: "Thomas says Kelly is warming up — offered to do a virtual call with Kelly to walk her through our family communication program. Agreed.",
        outcome: "Zoom with Kelly scheduled for 5/16 at 10 AM.",
      },
    ],
  },
  {
    id: "l014",
    firstName: "Thomas",
    lastName: "Garrett",
    age: 80,
    phone: "(801) 555-0638",
    stage: "toured",
    careInterest: "assisted",
    primaryContact: {
      name: "Lisa Garrett",
      relation: "Daughter",
      phone: "(801) 555-0639",
      email: "l.garrett@email.com",
    },
    budget: "private_pay",
    source: "senior_advisor",
    assignedTo: "David Reyes",
    createdAt: "2026-04-12",
    followUpDate: "2026-05-20",
    urgency: "1_3mo",
    notes: "Toured 5/3. Dad is independent-minded but needs help with meds and bathing. Still deciding between Sunrise Gardens and one other community across town. Pricing competitive. Not urgent.",
    activities: [
      {
        id: "b401", type: "call", date: "2026-04-12", time: "2:00 PM", by: "David Reyes",
        subject: "Initial contact",
        body: "Senior advisor referral. Thomas Garrett, 80M. Needs med management and bathing assist. Still very active — wants to maintain independence.",
      },
      {
        id: "b402", type: "tour", date: "2026-05-03", time: "1:00 PM", by: "David Reyes",
        subject: "Tour — Thomas + daughter Lisa",
        body: "Good tour. Thomas liked the 1-bedroom units and independent feel of assisted living wing. Lisa is the main driver. Comparing with Meadow Hills across town. David's follow-up strategy: invite Thomas to a community dinner.",
        outcome: "Community dinner invitation sent. Follow up 5/20.",
      },
    ],
  },

  // ── APPLIED ───────────────────────────────────────────────────────────────
  {
    id: "l015",
    firstName: "Eleanor",
    lastName: "Marsh",
    age: 83,
    stage: "applied",
    careInterest: "assisted",
    primaryContact: {
      name: "Carol Marsh",
      relation: "Daughter",
      phone: "(801) 555-0749",
      email: "c.marsh@email.com",
    },
    budget: "private_pay",
    source: "website",
    assignedTo: "Sarah Mitchell",
    createdAt: "2026-04-01",
    followUpDate: "2026-05-17",
    urgency: "within_1mo",
    notes: "Application received 5/10. Awaiting physician orders and prior medical records. Daughter Carol is very organized — good partner to work with. Target move-in June 1.",
    activities: [
      {
        id: "c101", type: "call", date: "2026-04-01", time: "11:00 AM", by: "Sarah Mitchell",
        subject: "Web inquiry",
        body: "Eleanor Marsh, 83F. Daughter Carol inquiring for mother. Needs med management, limited bathing assist.",
      },
      {
        id: "c102", type: "tour", date: "2026-04-15", time: "10:00 AM", by: "Sarah Mitchell",
        subject: "Tour — Carol + Eleanor",
        body: "Excellent tour. Eleanor cheerful and engaged with staff. Carol had detailed questions — toured the kitchen, activities room, and a 1-bedroom unit. Very positive.",
      },
      {
        id: "c103", type: "application", date: "2026-05-10", time: "2:00 PM", by: "Sarah Mitchell",
        subject: "Application received",
        body: "Carol submitted the completed application with deposit check. Awaiting physician orders from Dr. Nguyen and prior facility records. Pre-admission nurse assessment scheduled 5/20.",
        outcome: "Awaiting medical records. Target move-in June 1.",
      },
    ],
  },
  {
    id: "l016",
    firstName: "William",
    lastName: "Patterson",
    age: 79,
    stage: "applied",
    careInterest: "assisted",
    primaryContact: {
      name: "Sandra Patterson",
      relation: "Wife",
      phone: "(801) 555-0850",
      email: "s.patterson@email.com",
    },
    budget: "ltci",
    source: "hospital",
    assignedTo: "David Reyes",
    createdAt: "2026-03-20",
    followUpDate: "2026-05-16",
    urgency: "immediate",
    notes: "Application in. LTC insurance pre-auth submitted to Lincoln Financial. Waiting on benefit approval — Sandra anxious about the timeline. Application complete, pending financial clearance.",
    activities: [
      {
        id: "c201", type: "call", date: "2026-03-20", time: "3:00 PM", by: "David Reyes",
        subject: "Hospital referral — SW",
        body: "SW at LDS Hospital referred William after hip replacement surgery. Going to subacute rehab first, then assisted living. Wife Sandra is primary contact.",
      },
      {
        id: "c202", type: "tour", date: "2026-04-08", time: "2:00 PM", by: "David Reyes",
        subject: "Tour — Sandra + William",
        body: "William still using a walker post-surgery. Toured adapted room. Sandra loved the location — 10 min from their neighborhood. William reserved but positive.",
      },
      {
        id: "c203", type: "application", date: "2026-05-01", time: "10:00 AM", by: "David Reyes",
        subject: "Application submitted",
        body: "Application complete. LTC pre-auth submitted to Lincoln Financial — typical turnaround 5-10 business days. Medical records received from Primary Care and St. Mark's.",
        outcome: "Awaiting LTC auth. Target move-in June 7.",
      },
    ],
  },

  // ── DEPOSIT ───────────────────────────────────────────────────────────────
  {
    id: "l017",
    firstName: "Nancy",
    lastName: "Fitzgerald",
    age: 85,
    stage: "deposit",
    careInterest: "memory_care",
    primaryContact: {
      name: "Claire Fitzgerald",
      relation: "Daughter",
      phone: "(801) 555-0961",
      email: "c.fitzgerald@email.com",
    },
    budget: "private_pay",
    source: "physician",
    assignedTo: "Sarah Mitchell",
    createdAt: "2026-03-10",
    followUpDate: "2026-05-20",
    urgency: "immediate",
    notes: "Deposit received April 28. Move-in June 1 — room MC-110 assigned. Pre-admission assessment completed 5/8. Physician orders received. Admission paperwork 90% complete. On track.",
    activities: [
      {
        id: "d101", type: "tour", date: "2026-03-18", time: "10:00 AM", by: "Sarah Mitchell",
        subject: "Initial tour",
        body: "Excellent first tour. Claire very motivated — mother Nancy in memory care need for 6+ months. Knew immediately this was the right fit.",
      },
      {
        id: "d102", type: "application", date: "2026-04-10", time: "2:00 PM", by: "Sarah Mitchell",
        subject: "Application received",
        body: "Full application package submitted. Medical records complete. Nurse assessment scheduled.",
      },
      {
        id: "d103", type: "deposit", date: "2026-04-28", time: "11:00 AM", by: "Sarah Mitchell",
        subject: "Deposit received — move-in confirmed",
        body: "Deposit $1,500 received via check. Room MC-110 assigned. Move-in date June 1. Claire ecstatic. Referred us to a friend (Patricia Walsh — now in inquiry stage).",
        outcome: "Move-in prep underway. Welcome basket being prepared.",
      },
    ],
  },
  {
    id: "l018",
    firstName: "David",
    lastName: "Kim",
    age: 77,
    stage: "deposit",
    careInterest: "assisted",
    primaryContact: {
      name: "Jennifer Kim",
      relation: "Daughter",
      phone: "(801) 555-0172",
      email: "j.kim@email.com",
    },
    budget: "private_pay",
    source: "senior_advisor",
    assignedTo: "David Reyes",
    createdAt: "2026-03-15",
    followUpDate: "2026-05-22",
    urgency: "immediate",
    notes: "Deposit received May 2. Move-in May 28 — room E-310 assigned. All paperwork complete. Physician orders received from Dr. Wu. First resident from referral network this quarter.",
    activities: [
      {
        id: "d201", type: "tour", date: "2026-03-22", time: "1:00 PM", by: "David Reyes",
        subject: "Tour — Jennifer + David",
        body: "Thorough tour — David is a retired engineer and very detail-oriented. Wanted to inspect the plumbing in the room. Jennifer focused on care plan process and nutrition.",
      },
      {
        id: "d202", type: "deposit", date: "2026-05-02", time: "10:00 AM", by: "David Reyes",
        subject: "Deposit received — move-in May 28",
        body: "Deposit $1,500 received. Room E-310 assigned. Move-in May 28. Physician orders from Dr. Wu received. Pre-admission assessment scheduled 5/18.",
        outcome: "On track. Jennifer coordinating movers for 5/27.",
      },
    ],
  },

  // ── LOST ──────────────────────────────────────────────────────────────────
  {
    id: "l019",
    firstName: "Gerald",
    lastName: "Morrison",
    age: 80,
    stage: "lost",
    careInterest: "assisted",
    primaryContact: {
      name: "Rita Morrison",
      relation: "Wife",
      phone: "(801) 555-0283",
    },
    budget: "medicaid",
    source: "senior_advisor",
    assignedTo: "David Reyes",
    createdAt: "2026-03-05",
    urgency: "within_1mo",
    notes: "Lost 4/22 — chose Meadow Hills due to Medicaid acceptance. We don't accept Medicaid for new admissions. Budget mismatch from the start. Flag for future if policy changes.",
    activities: [
      {
        id: "e101", type: "tour", date: "2026-03-20", time: "2:00 PM", by: "David Reyes",
        subject: "Tour",
        body: "Good tour. Wife Rita liked the community. Gerald quiet but seemed comfortable.",
      },
      {
        id: "e102", type: "loss", date: "2026-04-22", time: "11:00 AM", by: "David Reyes",
        subject: "Lost — chose Meadow Hills",
        body: "Rita called to let us know they chose Meadow Hills, which accepts Medicaid. Primary loss reason: financial — we do not accept Medicaid for new move-ins. Thanked them for considering us.",
        outcome: "Loss reason: Financial / Medicaid. Market data noted.",
      },
    ],
  },
  {
    id: "l020",
    firstName: "Elizabeth",
    lastName: "Foster",
    age: 84,
    stage: "lost",
    careInterest: "memory_care",
    primaryContact: {
      name: "Gregory Foster",
      relation: "Son",
      phone: "(801) 555-0394",
      email: "g.foster@email.com",
    },
    budget: "private_pay",
    source: "website",
    assignedTo: "Sarah Mitchell",
    createdAt: "2026-02-20",
    urgency: "immediate",
    notes: "Lost 4/5 — son Greg decided to hire full-time live-in care and keep mother home. Family not ready for placement. Emotional decision. May re-surface in 3-6 months.",
    activities: [
      {
        id: "e201", type: "tour", date: "2026-03-05", time: "10:00 AM", by: "Sarah Mitchell",
        subject: "Tour — Gregory + Elizabeth",
        body: "Elizabeth upset during tour — repeatedly asked to 'go home.' Gregory distressed. Tour cut short. Sent follow-up information.",
      },
      {
        id: "e202", type: "loss", date: "2026-04-05", time: "2:00 PM", by: "Sarah Mitchell",
        subject: "Lost — family chose home care",
        body: "Gregory called — family decided to hire a live-in caregiver instead. Mother's resistance to placement was a major factor. Emotionally difficult for the family. I acknowledged this was a hard decision and left the door open.",
        outcome: "Loss reason: Not ready / family dynamic. Added to 90-day follow-up list.",
      },
    ],
  },
];

// ── Scheduled Tours ────────────────────────────────────────────────────────────

export const SCHEDULED_TOURS: ScheduledTour[] = [
  {
    id: "t001",
    leadId: "l001",
    leadName: "Margaret Collins",
    contactName: "Diane Collins (daughter)",
    date: "2026-05-15",
    time: "10:00 AM",
    duration: "90 min",
    conductedBy: "Sarah Mitchell",
    careInterest: "memory_care",
    partySize: 3,
    notes: "Route through memory care garden. Diane + brother attending. Family has private pay.",
    status: "scheduled",
  },
  {
    id: "t002",
    leadId: "l002",
    leadName: "Robert Tanner",
    contactName: "Self",
    date: "2026-05-15",
    time: "2:00 PM",
    duration: "60 min",
    conductedBy: "David Reyes",
    careInterest: "assisted",
    partySize: 1,
    notes: "Focus on independence and what he can do. Show east wing 1-bedroom. Bring pricing comparison to home care.",
    status: "scheduled",
  },
  {
    id: "t003",
    leadId: "l007",
    leadName: "Ruth Nakamura",
    contactName: "Amy Nakamura (daughter)",
    date: "2026-05-16",
    time: "11:00 AM",
    duration: "90 min",
    conductedBy: "Sarah Mitchell",
    careInterest: "memory_care",
    partySize: 2,
    notes: "Amy + brother attending. Emphasize elopement safety. Amy is guilt-driven — focus on quality of life.",
    status: "scheduled",
  },
  {
    id: "t004",
    leadId: "l008",
    leadName: "Charles Brennan",
    contactName: "Michael Brennan (son)",
    date: "2026-05-16",
    time: "3:00 PM",
    duration: "60 min",
    conductedBy: "David Reyes",
    careInterest: "assisted",
    partySize: 2,
    notes: "Michael is cost-focused. Bring LTC cost analysis. Show east wing. Emphasize CHF monitoring capability.",
    status: "scheduled",
  },
  {
    id: "t005",
    leadId: "l003",
    leadName: "Helen Park",
    contactName: "Kevin Park (son)",
    date: "2026-05-18",
    time: "9:30 AM",
    duration: "90 min",
    conductedBy: "Sarah Mitchell",
    careInterest: "memory_care",
    partySize: 3,
    notes: "Kevin + 2 siblings. Hospital discharge in ~2 days. Urgent placement. Pre-admission assessment should happen same day if possible.",
    status: "scheduled",
  },
  {
    id: "t006",
    leadId: "l018",
    leadName: "David Kim",
    contactName: "Jennifer Kim (daughter)",
    date: "2026-05-18",
    time: "1:00 PM",
    duration: "30 min",
    conductedBy: "David Reyes",
    careInterest: "assisted",
    partySize: 2,
    notes: "Pre-admission visit — deposit already placed. Walk through room E-310, confirm move-in details for 5/28.",
    status: "scheduled",
  },
];
