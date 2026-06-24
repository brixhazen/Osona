// ── Types ─────────────────────────────────────────────────────────────────────

export type ActivityDomain =
  | "physical" | "cognitive" | "social" | "creative"
  | "spiritual" | "one_to_one" | "volunteer";

export type EngagementQuality = "excellent" | "good" | "fair" | "refused" | "slept";
export type ActivityStatus = "completed" | "in_progress" | "upcoming";
export type RiskLevel = "critical" | "at_risk" | "monitoring" | "good" | "excellent_eng";

export interface AttendanceRecord {
  residentId: string;
  residentName: string;
  quality: EngagementQuality;
  notes?: string;
  familyNotified: boolean;
  documentedBy: string;
  documentedAt: string;
}

export interface ActivityEvent {
  id: string;
  title: string;
  domain: ActivityDomain;
  time: string;
  durationMin: number;
  location: string;
  leadStaff: string;
  status: ActivityStatus;
  expectedCount: number;
  attendanceRecords: AttendanceRecord[];
  totalAttended: number;
  recurring: boolean;
  recurringPattern?: string;
}

export interface PreferenceDomain {
  domain: ActivityDomain;
  score: number; // 0-10
}

export interface ParticipationWeek {
  week: string; // "Apr 14"
  count: number;
  avgQuality: number; // 1=slept 2=refused 3=fair 4=good 5=excellent
}

export interface OneToOneVisit {
  date: string;
  staff: string;
  durationMin: number;
  quality: EngagementQuality;
  notes: string;
}

export interface ResidentEngagementProfile {
  id: string;
  name: string;
  room: string;
  wing: string;
  cognitiveStatus: string;
  engagementScore: number; // 0-100
  riskLevel: RiskLevel;
  weeklyBaseline: number; // avg activities/week over last 4 weeks
  thisWeekCount: number;
  lastActivityDate: string;
  lastActivityName: string;
  missedMealsThisWeek: number;
  daysSinceSignificantParticipation: number;
  preferences: PreferenceDomain[];
  preferenceNotes: string;
  participationHistory: ParticipationWeek[];
  oneToOneLogs: OneToOneVisit[];
  alerts: string[];
}

export interface FamilyNotification {
  id: string;
  date: string;
  message: string;
  channel: "push" | "email" | "text";
  opened: boolean;
}

export interface FamilyAccount {
  residentId: string;
  residentName: string;
  room: string;
  familyName: string;
  relationship: string;
  email: string;
  phone: string;
  hasPortalAccount: boolean;
  lastLogin: string | null;
  notificationsThisMonth: number;
  messagesThisMonth: number;
  photosSharedThisMonth: number;
  preferredChannel: "push" | "email" | "text" | "call";
  notifications: FamilyNotification[];
  flagged: boolean;
  flagReason?: string;
}

export interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  hoursThisMonth: number;
  hoursYTD: number;
  primaryActivity: string;
  lastVisit: string;
  nextScheduled: string | null;
}

export interface CalendarEvent {
  id: string;
  day: number;
  title: string;
  domain: ActivityDomain;
  time: string;
  recurring: boolean;
}

// ── Domain config ──────────────────────────────────────────────────────────────

export const DOMAIN_CONFIG: Record<ActivityDomain, { label: string; hex: string; tw: string }> = {
  physical:   { label: "Physical",   hex: "#2BBFAA", tw: "bg-primary/80" },
  cognitive:  { label: "Cognitive",  hex: "#F5A623", tw: "bg-accent/80" },
  social:     { label: "Social",     hex: "#4DB896", tw: "bg-success/80" },
  creative:   { label: "Creative",   hex: "#E879A6", tw: "bg-pink-400" },
  spiritual:  { label: "Spiritual",  hex: "#818CF8", tw: "bg-indigo-400" },
  one_to_one: { label: "1:1 Visit",  hex: "#8A9BB0", tw: "bg-muted-foreground/60" },
  volunteer:  { label: "Volunteer",  hex: "#FB923C", tw: "bg-orange-400" },
};

export const QUALITY_CONFIG: Record<EngagementQuality, { label: string; score: number; cls: string }> = {
  excellent: { label: "Excellent", score: 5, cls: "bg-success/15 text-success" },
  good:      { label: "Good",      score: 4, cls: "bg-primary/15 text-primary" },
  fair:      { label: "Fair",      score: 3, cls: "bg-accent/15 text-accent" },
  refused:   { label: "Refused",   score: 2, cls: "bg-destructive/15 text-destructive" },
  slept:     { label: "Slept",     score: 1, cls: "bg-muted text-muted-foreground" },
};

// ── Community metrics ─────────────────────────────────────────────────────────

export const COMMUNITY_METRICS = {
  participationRate: 74,          // % of residents attended ≥1 activity this week
  avgProgramsPerResident: 4.2,    // this week
  qualityDistribution: {
    excellent: 38,
    good: 23,
    fair: 28,
    refused: 8,
    slept: 3,
  },
  preferenceMatchRate: 67,        // % of programming aligned to documented preferences
  atRiskCritical: 2,
  atRiskMonitoring: 3,
  familyPortalActive: 62,         // of 87 residents
  avgFamilyLastLogin: 2.1,        // days ago
  totalActivitiesToday: 10,
  totalActivitiesThisMonth: 87,
  volunteerHoursThisMonth: 21,
};

// ── Today's activities (June 11, 2026) ────────────────────────────────────────

export const TODAY_ACTIVITIES: ActivityEvent[] = [
  {
    id: "ae001",
    title: "Morning Devotions",
    domain: "spiritual",
    time: "7:30 AM",
    durationMin: 30,
    location: "Chapel / Sunroom",
    leadStaff: "Pastor David Wheeler (Volunteer)",
    status: "completed",
    expectedCount: 10,
    totalAttended: 8,
    recurring: true,
    recurringPattern: "Daily",
    attendanceRecords: [
      { residentId: "r002", residentName: "Doris Lambert", quality: "excellent", familyNotified: true, documentedBy: "Brenda Foster", documentedAt: "7:58 AM" },
      { residentId: "r003", residentName: "Eleanor Bradford", quality: "excellent", familyNotified: true, documentedBy: "Brenda Foster", documentedAt: "7:58 AM" },
      { residentId: "r010", residentName: "Beverly Stone", quality: "good", notes: "First devotions since move-in — participated enthusiastically", familyNotified: true, documentedBy: "Brenda Foster", documentedAt: "7:58 AM" },
      { residentId: "r005", residentName: "Vivian Marsh", quality: "fair", notes: "Attended but quiet, appeared distracted", familyNotified: false, documentedBy: "Brenda Foster", documentedAt: "7:59 AM" },
    ],
  },
  {
    id: "ae002",
    title: "Chair Yoga & Stretch",
    domain: "physical",
    time: "9:00 AM",
    durationMin: 45,
    location: "Wellness Room",
    leadStaff: "Brenda Foster",
    status: "completed",
    expectedCount: 14,
    totalAttended: 11,
    recurring: true,
    recurringPattern: "Mon / Wed / Fri",
    attendanceRecords: [
      { residentId: "r003", residentName: "Eleanor Bradford", quality: "excellent", familyNotified: true, documentedBy: "Brenda Foster", documentedAt: "9:47 AM" },
      { residentId: "r010", residentName: "Beverly Stone", quality: "good", familyNotified: true, documentedBy: "Brenda Foster", documentedAt: "9:47 AM" },
      { residentId: "r006", residentName: "Howard Ingram", quality: "fair", notes: "Participated in seated stretches only, left early", familyNotified: false, documentedBy: "Brenda Foster", documentedAt: "9:48 AM" },
      { residentId: "r001", residentName: "Gerald Hayes", quality: "refused", notes: "Declined — cited pain from fall. Encouraged 1:1 later today.", familyNotified: false, documentedBy: "Brenda Foster", documentedAt: "9:48 AM" },
    ],
  },
  {
    id: "ae003",
    title: "Brain Games & Trivia",
    domain: "cognitive",
    time: "10:00 AM",
    durationMin: 60,
    location: "Activity Room A",
    leadStaff: "Brenda Foster",
    status: "completed",
    expectedCount: 16,
    totalAttended: 14,
    recurring: true,
    recurringPattern: "Tue / Thu",
    attendanceRecords: [
      { residentId: "r001", residentName: "Gerald Hayes", quality: "good", notes: "Joined after initial hesitation. Answered several WWII trivia questions — lit up discussing Navy history.", familyNotified: true, documentedBy: "Brenda Foster", documentedAt: "11:02 AM" },
      { residentId: "r004", residentName: "Raymond Kowalski", quality: "excellent", notes: "Tied for first place. Highly engaged — asked to lead next week's round.", familyNotified: true, documentedBy: "Brenda Foster", documentedAt: "11:02 AM" },
      { residentId: "r003", residentName: "Eleanor Bradford", quality: "excellent", familyNotified: true, documentedBy: "Brenda Foster", documentedAt: "11:02 AM" },
      { residentId: "r006", residentName: "Howard Ingram", quality: "good", familyNotified: false, documentedBy: "Brenda Foster", documentedAt: "11:03 AM" },
      { residentId: "r010", residentName: "Beverly Stone", quality: "good", familyNotified: true, documentedBy: "Brenda Foster", documentedAt: "11:03 AM" },
    ],
  },
  {
    id: "ae004",
    title: "1:1 Visit — Gerald Hayes",
    domain: "one_to_one",
    time: "10:30 AM",
    durationMin: 30,
    location: "Room E-214",
    leadStaff: "Brenda Foster",
    status: "completed",
    expectedCount: 1,
    totalAttended: 1,
    recurring: false,
    attendanceRecords: [
      {
        residentId: "r001",
        residentName: "Gerald Hayes",
        quality: "good",
        notes: "Discussed recent fall and resulting frustration with physical limitations. Gerald expressed that he feels 'useless.' Reviewed photo album from family visit last Sunday — mood visibly improved. Spent 10 min discussing his Navy service. Responded well to reminiscence approach. Plan: daily check-ins, gentle re-engagement with physical programming when cleared by MD.",
        familyNotified: true,
        documentedBy: "Brenda Foster",
        documentedAt: "11:04 AM",
      },
    ],
  },
  {
    id: "ae005",
    title: "Garden Club",
    domain: "physical",
    time: "11:00 AM",
    durationMin: 60,
    location: "Courtyard Garden",
    leadStaff: "Brenda Foster",
    status: "completed",
    expectedCount: 8,
    totalAttended: 7,
    recurring: true,
    recurringPattern: "Mon / Wed",
    attendanceRecords: [
      { residentId: "r003", residentName: "Eleanor Bradford", quality: "excellent", notes: "Led seed-planting station. Other residents gravitate toward her.", familyNotified: true, documentedBy: "Brenda Foster", documentedAt: "12:03 PM" },
      { residentId: "r010", residentName: "Beverly Stone", quality: "excellent", notes: "Mentioned gardening is her favorite hobby. Immediate rapport with Eleanor.", familyNotified: true, documentedBy: "Brenda Foster", documentedAt: "12:03 PM" },
    ],
  },
  {
    id: "ae006",
    title: "Watercolor Art Class",
    domain: "creative",
    time: "2:00 PM",
    durationMin: 60,
    location: "Art Room",
    leadStaff: "Margaret Simmons (Volunteer)",
    status: "in_progress",
    expectedCount: 12,
    totalAttended: 0,
    recurring: true,
    recurringPattern: "Tue / Fri",
    attendanceRecords: [],
  },
  {
    id: "ae007",
    title: "Family Video Calls (Zoom)",
    domain: "social",
    time: "2:30 PM",
    durationMin: 60,
    location: "Family Room",
    leadStaff: "Brenda Foster",
    status: "upcoming",
    expectedCount: 5,
    totalAttended: 0,
    recurring: true,
    recurringPattern: "Sat",
    attendanceRecords: [],
  },
  {
    id: "ae008",
    title: "Music & Sing-Along",
    domain: "social",
    time: "3:30 PM",
    durationMin: 60,
    location: "Main Lounge",
    leadStaff: "Brenda Foster",
    status: "upcoming",
    expectedCount: 20,
    totalAttended: 0,
    recurring: true,
    recurringPattern: "Sat / Wed",
    attendanceRecords: [],
  },
  {
    id: "ae009",
    title: "Happy Hour Social",
    domain: "social",
    time: "4:30 PM",
    durationMin: 60,
    location: "Main Lounge",
    leadStaff: "Brenda Foster",
    status: "upcoming",
    expectedCount: 24,
    totalAttended: 0,
    recurring: true,
    recurringPattern: "Fri",
    attendanceRecords: [],
  },
  {
    id: "ae010",
    title: "Movie Night — The Sound of Music",
    domain: "social",
    time: "6:30 PM",
    durationMin: 140,
    location: "Theater Room",
    leadStaff: "Evening Staff",
    status: "upcoming",
    expectedCount: 16,
    totalAttended: 0,
    recurring: false,
    attendanceRecords: [],
  },
];

// ── Resident engagement profiles ───────────────────────────────────────────────

export const RESIDENT_PROFILES: ResidentEngagementProfile[] = [
  {
    id: "r001",
    name: "Gerald Hayes",
    room: "E-214",
    wing: "East Wing",
    cognitiveStatus: "Mild cognitive impairment",
    engagementScore: 42,
    riskLevel: "at_risk",
    weeklyBaseline: 6.2,
    thisWeekCount: 3,
    lastActivityDate: "2026-06-11",
    lastActivityName: "Brain Games & Trivia",
    missedMealsThisWeek: 1,
    daysSinceSignificantParticipation: 3,
    alerts: ["44% below 4-week participation baseline", "Declined chair yoga citing fall pain — follow up with MD", "Family notified of 1:1 visit today"],
    preferences: [
      { domain: "cognitive", score: 9 },
      { domain: "social", score: 7 },
      { domain: "physical", score: 6 },
      { domain: "spiritual", score: 4 },
      { domain: "creative", score: 3 },
      { domain: "volunteer", score: 5 },
      { domain: "one_to_one", score: 8 },
    ],
    preferenceNotes: "Former Navy officer — responds very well to WWII history, nautical themes, leadership roles. Prefers small groups over large events. Previously led the community book club. Strong preference for structured cognitive activities. Physical limitations increasing post-fall.",
    participationHistory: [
      { week: "Jun 9", count: 7, avgQuality: 4.4 },
      { week: "May 19", count: 6, avgQuality: 4.2 },
      { week: "May 26", count: 6, avgQuality: 4.0 },
      { week: "Jun 2", count: 4, avgQuality: 3.5 },
      { week: "Jun 9", count: 3, avgQuality: 3.1 },
    ],
    oneToOneLogs: [
      {
        date: "2026-06-11",
        staff: "Brenda Foster",
        durationMin: 30,
        quality: "good",
        notes: "Discussed recent fall and resulting frustration with physical limitations. Gerald expressed that he feels 'useless.' Reviewed photo album from family visit last Sunday — mood visibly improved. Spent 10 min discussing his Navy service. Responded well to reminiscence approach. Plan: daily check-ins, gentle re-engagement with physical programming when cleared by MD.",
      },
      {
        date: "2026-06-04",
        staff: "Brenda Foster",
        durationMin: 25,
        quality: "fair",
        notes: "Gerald was quiet and withdrawn today. Declined group activity invitations multiple times. Focused session on military history documentaries — showed moderate engagement. Expressed missing his independence. Refer to social work for depression screening.",
      },
    ],
  },
  {
    id: "r002",
    name: "Doris Lambert",
    room: "MC-205",
    wing: "Memory Care",
    cognitiveStatus: "Moderate dementia",
    engagementScore: 78,
    riskLevel: "good",
    weeklyBaseline: 4.5,
    thisWeekCount: 4,
    lastActivityDate: "2026-06-11",
    lastActivityName: "Morning Devotions",
    missedMealsThisWeek: 0,
    daysSinceSignificantParticipation: 0,
    alerts: [],
    preferences: [
      { domain: "spiritual", score: 10 },
      { domain: "social", score: 8 },
      { domain: "creative", score: 7 },
      { domain: "cognitive", score: 5 },
      { domain: "physical", score: 4 },
      { domain: "one_to_one", score: 9 },
      { domain: "volunteer", score: 2 },
    ],
    preferenceNotes: "Deeply religious — attends every devotion service. Responds beautifully to hymns and gospel music. Enjoys simple creative activities (painting, flower arranging). 1:1 visits twice weekly are essential for her wellbeing. Loves talking about her grandchildren. Best engagement in small groups of 4 or fewer. Avoid loud or overstimulating environments.",
    participationHistory: [
      { week: "Jun 9", count: 5, avgQuality: 4.6 },
      { week: "May 19", count: 4, avgQuality: 4.4 },
      { week: "May 26", count: 5, avgQuality: 4.7 },
      { week: "Jun 2", count: 4, avgQuality: 4.5 },
      { week: "Jun 9", count: 4, avgQuality: 4.6 },
    ],
    oneToOneLogs: [
      {
        date: "2026-06-09",
        staff: "Brenda Foster",
        durationMin: 20,
        quality: "excellent",
        notes: "Played favorite gospel hymns on tablet. Doris sang along to several songs and was very animated. Shared stories about her church choir. Excellent mood throughout.",
      },
      {
        date: "2026-06-02",
        staff: "Brenda Foster",
        durationMin: 20,
        quality: "good",
        notes: "Flower arrangement activity for Mother's Day. Chose pink flowers — said they're her daughter's favorite. Happy and engaged throughout.",
      },
    ],
  },
  {
    id: "r003",
    name: "Eleanor Bradford",
    room: "W-108",
    wing: "West Wing",
    cognitiveStatus: "No impairment",
    engagementScore: 91,
    riskLevel: "excellent_eng",
    weeklyBaseline: 7.8,
    thisWeekCount: 8,
    lastActivityDate: "2026-06-11",
    lastActivityName: "Garden Club",
    missedMealsThisWeek: 0,
    daysSinceSignificantParticipation: 0,
    alerts: [],
    preferences: [
      { domain: "social", score: 10 },
      { domain: "cognitive", score: 9 },
      { domain: "physical", score: 8 },
      { domain: "creative", score: 9 },
      { domain: "spiritual", score: 7 },
      { domain: "volunteer", score: 10 },
      { domain: "one_to_one", score: 5 },
    ],
    preferenceNotes: "Community ambassador — naturally draws other residents into activities. Former high school English teacher. Leads volunteer reading program every Thursday. Loves gardening, watercolor, book club, trivia. Highly social; prefers to be a helper rather than just a participant. Excellent candidate for peer-mentoring new residents like Beverly Stone.",
    participationHistory: [
      { week: "Jun 9", count: 8, avgQuality: 4.9 },
      { week: "May 19", count: 8, avgQuality: 4.8 },
      { week: "May 26", count: 7, avgQuality: 4.9 },
      { week: "Jun 2", count: 8, avgQuality: 4.8 },
      { week: "Jun 9", count: 8, avgQuality: 4.9 },
    ],
    oneToOneLogs: [],
  },
  {
    id: "r004",
    name: "Raymond Kowalski",
    room: "E-118",
    wing: "East Wing",
    cognitiveStatus: "Mild cognitive impairment",
    engagementScore: 65,
    riskLevel: "monitoring",
    weeklyBaseline: 4.1,
    thisWeekCount: 3,
    lastActivityDate: "2026-06-11",
    lastActivityName: "Brain Games & Trivia",
    missedMealsThisWeek: 0,
    daysSinceSignificantParticipation: 0,
    alerts: ["Slightly below weekly baseline — monitor"],
    preferences: [
      { domain: "cognitive", score: 10 },
      { domain: "social", score: 4 },
      { domain: "physical", score: 3 },
      { domain: "creative", score: 2 },
      { domain: "spiritual", score: 5 },
      { domain: "volunteer", score: 6 },
      { domain: "one_to_one", score: 7 },
    ],
    preferenceNotes: "Retired engineer. Strongly prefers structured cognitive activities — trivia, puzzles, strategy games. Dislikes loud music and large social events. Comfortable in groups of 4–6. Requested to help lead trivia next session. 1:1 preferred when activity involves a project or problem-solving. Wife visits every Tuesday and Friday.",
    participationHistory: [
      { week: "Jun 9", count: 4, avgQuality: 4.5 },
      { week: "May 19", count: 5, avgQuality: 4.6 },
      { week: "May 26", count: 4, avgQuality: 4.4 },
      { week: "Jun 2", count: 4, avgQuality: 4.3 },
      { week: "Jun 9", count: 3, avgQuality: 4.5 },
    ],
    oneToOneLogs: [
      {
        date: "2026-06-06",
        staff: "Brenda Foster",
        durationMin: 35,
        quality: "excellent",
        notes: "Chess and conversation. Raymond taught me two new openings. Very engaged and talkative. Expressed that he wishes there were more small-group intellectual activities. Will add a weekly strategy game session.",
      },
    ],
  },
  {
    id: "r005",
    name: "Vivian Marsh",
    room: "MC-201",
    wing: "Memory Care",
    cognitiveStatus: "Moderate dementia",
    engagementScore: 31,
    riskLevel: "critical",
    weeklyBaseline: 5.8,
    thisWeekCount: 1,
    lastActivityDate: "2026-06-11",
    lastActivityName: "Morning Devotions",
    missedMealsThisWeek: 3,
    daysSinceSignificantParticipation: 4,
    alerts: [
      "CRITICAL: 83% below 4-week participation baseline",
      "3 missed communal meals this week",
      "4 days since meaningful engagement",
      "Family not notified of decline — contact Kevin Marsh immediately",
      "Medicaid application stress may be contributing factor — coordinate with social work",
    ],
    preferences: [
      { domain: "spiritual", score: 9 },
      { domain: "creative", score: 8 },
      { domain: "social", score: 6 },
      { domain: "physical", score: 5 },
      { domain: "cognitive", score: 4 },
      { domain: "one_to_one", score: 10 },
      { domain: "volunteer", score: 2 },
    ],
    preferenceNotes: "Was previously a very engaged resident — loved watercolor painting and devotions. Significant decline over last 3 weeks, coinciding with Medicaid application stress and family communication changes. 1:1 visits are the highest-value intervention. Responds to gentle music and touch. Prefer morning programming before fatigue sets in. Son Kevin visits inconsistently.",
    participationHistory: [
      { week: "Jun 9", count: 6, avgQuality: 4.2 },
      { week: "May 19", count: 6, avgQuality: 4.0 },
      { week: "May 26", count: 4, avgQuality: 3.5 },
      { week: "Jun 2", count: 2, avgQuality: 3.0 },
      { week: "Jun 9", count: 1, avgQuality: 2.5 },
    ],
    oneToOneLogs: [
      {
        date: "2026-06-08",
        staff: "Brenda Foster",
        durationMin: 20,
        quality: "fair",
        notes: "Vivian was tearful and not forthcoming. Played soft hymns — she calmed somewhat. Did not want to paint today. Held her hand for most of the visit. Will escalate to care team for depression screening and coordinate with social work re: Medicaid stress.",
      },
    ],
  },
  {
    id: "r006",
    name: "Howard Ingram",
    room: "E-220",
    wing: "East Wing",
    cognitiveStatus: "No impairment",
    engagementScore: 55,
    riskLevel: "at_risk",
    weeklyBaseline: 4.8,
    thisWeekCount: 2,
    lastActivityDate: "2026-06-11",
    lastActivityName: "Brain Games & Trivia",
    missedMealsThisWeek: 0,
    daysSinceSignificantParticipation: 1,
    alerts: [
      "40% below 4-week participation baseline",
      "Gradual decline over 6 weeks — possible financial/family stress",
    ],
    preferences: [
      { domain: "social", score: 8 },
      { domain: "physical", score: 7 },
      { domain: "cognitive", score: 6 },
      { domain: "volunteer", score: 7 },
      { domain: "creative", score: 3 },
      { domain: "spiritual", score: 4 },
      { domain: "one_to_one", score: 5 },
    ],
    preferenceNotes: "Formerly very active — helped with setting up events and fixing small things around the community (unofficial volunteer). Loves baseball, cards, trivia, woodworking. Decline appears stress-related (financial situation). Best re-engagement approach: give him a task or helper role rather than passive participation.",
    participationHistory: [
      { week: "Jun 9", count: 5, avgQuality: 4.1 },
      { week: "May 19", count: 5, avgQuality: 4.0 },
      { week: "May 26", count: 4, avgQuality: 3.8 },
      { week: "Jun 2", count: 3, avgQuality: 3.5 },
      { week: "Jun 9", count: 2, avgQuality: 3.2 },
    ],
    oneToOneLogs: [],
  },
];

// ── Family portal accounts ─────────────────────────────────────────────────────

export const FAMILY_ACCOUNTS: FamilyAccount[] = [
  {
    residentId: "r001",
    residentName: "Gerald Hayes",
    room: "E-214",
    familyName: "Thomas Hayes",
    relationship: "Son",
    email: "t.hayes@email.com",
    phone: "(801) 555-4101",
    hasPortalAccount: true,
    lastLogin: "2026-06-09",
    notificationsThisMonth: 11,
    messagesThisMonth: 3,
    photosSharedThisMonth: 8,
    preferredChannel: "push",
    flagged: false,
    notifications: [
      { id: "fn001", date: "Jun 11 11:02 AM", message: "Gerald attended Brain Games & Trivia — staff note: Great participation today, discussed Navy history.", channel: "push", opened: true },
      { id: "fn002", date: "Jun 11 11:04 AM", message: "Gerald's daily 1:1 visit was completed by Brenda Foster. Tap to view notes.", channel: "push", opened: true },
      { id: "fn003", date: "Jun 9 9:48 AM", message: "Gerald attended Chair Yoga & Stretch this morning.", channel: "push", opened: true },
    ],
  },
  {
    residentId: "r002",
    residentName: "Doris Lambert",
    room: "MC-205",
    familyName: "Sandra Lambert",
    relationship: "Daughter",
    email: "s.lambert@email.com",
    phone: "(801) 555-4202",
    hasPortalAccount: true,
    lastLogin: "2026-06-11",
    notificationsThisMonth: 14,
    messagesThisMonth: 5,
    photosSharedThisMonth: 12,
    preferredChannel: "push",
    flagged: false,
    notifications: [
      { id: "fn010", date: "Jun 11 7:58 AM", message: "Doris attended Morning Devotions — she was singing along beautifully today.", channel: "push", opened: true },
      { id: "fn011", date: "Jun 9 2:22 PM", message: "Doris just finished her weekly 1:1 visit with Brenda — had a wonderful time with gospel music.", channel: "push", opened: true },
      { id: "fn012", date: "Jun 8 10:15 AM", message: "Doris attended Watercolor Art Class. Photo attached.", channel: "push", opened: false },
    ],
  },
  {
    residentId: "r003",
    residentName: "Eleanor Bradford",
    room: "W-108",
    familyName: "William Bradford",
    relationship: "Husband",
    email: "w.bradford@email.com",
    phone: "(801) 555-4303",
    hasPortalAccount: true,
    lastLogin: "2026-06-11",
    notificationsThisMonth: 22,
    messagesThisMonth: 8,
    photosSharedThisMonth: 18,
    preferredChannel: "push",
    flagged: false,
    notifications: [
      { id: "fn020", date: "Jun 11 12:03 PM", message: "Eleanor led today's Garden Club — other residents followed her lead planting herbs.", channel: "push", opened: true },
      { id: "fn021", date: "Jun 11 11:02 AM", message: "Eleanor attended Brain Games & Trivia — top scorer again!", channel: "push", opened: true },
      { id: "fn022", date: "Jun 11 9:47 AM", message: "Eleanor attended Chair Yoga & Stretch.", channel: "push", opened: true },
    ],
  },
  {
    residentId: "r005",
    residentName: "Vivian Marsh",
    room: "MC-201",
    familyName: "Kevin Marsh",
    relationship: "Son",
    email: "k.marsh@email.com",
    phone: "(801) 555-4505",
    hasPortalAccount: true,
    lastLogin: "2026-06-03",
    notificationsThisMonth: 4,
    messagesThisMonth: 1,
    photosSharedThisMonth: 2,
    preferredChannel: "email",
    flagged: true,
    flagReason: "No login in 8 days while resident is in critical decline — proactive outreach needed immediately",
    notifications: [
      { id: "fn030", date: "Jun 11 7:59 AM", message: "Vivian attended Morning Devotions.", channel: "email", opened: false },
      { id: "fn031", date: "Jun 8 3:15 PM", message: "Vivian's 1:1 visit was completed by Brenda Foster. Activity staff would like to connect with you.", channel: "email", opened: false },
    ],
  },
  {
    residentId: "r010",
    residentName: "Beverly Stone",
    room: "W-304",
    familyName: "Daniel Stone",
    relationship: "Son",
    email: "d.stone@email.com",
    phone: "(801) 555-5010",
    hasPortalAccount: false,
    lastLogin: null,
    notificationsThisMonth: 0,
    messagesThisMonth: 0,
    photosSharedThisMonth: 0,
    preferredChannel: "text",
    flagged: true,
    flagReason: "No family portal account set up — new move-in Jun 10, invite pending",
    notifications: [],
  },
];

// ── Volunteers ─────────────────────────────────────────────────────────────────

export const VOLUNTEERS: Volunteer[] = [
  {
    id: "v001",
    name: "Carol Bradford",
    skills: ["Reading", "Literature", "Teaching"],
    hoursThisMonth: 8,
    hoursYTD: 38,
    primaryActivity: "Volunteer Reading Program (Thu 10:00 AM)",
    lastVisit: "2026-06-10",
    nextScheduled: "2026-06-17",
  },
  {
    id: "v002",
    name: "Margaret Simmons",
    skills: ["Watercolor", "Art instruction", "Crafts"],
    hoursThisMonth: 6,
    hoursYTD: 28,
    primaryActivity: "Watercolor Art Class (Tue/Fri 2:00 PM)",
    lastVisit: "2026-06-11",
    nextScheduled: "2026-06-13",
  },
  {
    id: "v003",
    name: "Pastor David Wheeler",
    skills: ["Chaplaincy", "Music", "Counseling"],
    hoursThisMonth: 4,
    hoursYTD: 20,
    primaryActivity: "Morning Devotions (Daily 7:30 AM, Sat/Sun)",
    lastVisit: "2026-06-11",
    nextScheduled: "2026-06-12",
  },
  {
    id: "v004",
    name: "Jordan Kim",
    skills: ["Games", "Technology assist", "General support"],
    hoursThisMonth: 3,
    hoursYTD: 9,
    primaryActivity: "Brain Games & Happy Hour (as needed)",
    lastVisit: "2026-06-08",
    nextScheduled: "2026-06-15",
  },
];

// ── May 2026 calendar events ──────────────────────────────────────────────────

export const CALENDAR_EVENTS: CalendarEvent[] = [
  // Week 1 (May 1 = Fri)
  { id: "c001", day: 1, title: "Morning Devotions", domain: "spiritual", time: "7:30 AM", recurring: true },
  { id: "c002", day: 1, title: "Chair Yoga", domain: "physical", time: "9:00 AM", recurring: true },
  { id: "c003", day: 1, title: "Happy Hour Social", domain: "social", time: "4:30 PM", recurring: true },
  { id: "c004", day: 2, title: "Morning Devotions", domain: "spiritual", time: "7:30 AM", recurring: true },
  { id: "c005", day: 2, title: "Music & Sing-Along", domain: "social", time: "3:30 PM", recurring: true },
  { id: "c006", day: 3, title: "Morning Devotions", domain: "spiritual", time: "7:30 AM", recurring: true },
  { id: "c007", day: 3, title: "Religious Service", domain: "spiritual", time: "10:00 AM", recurring: true },
  // Week 2
  { id: "c010", day: 4, title: "Morning Devotions", domain: "spiritual", time: "7:30 AM", recurring: true },
  { id: "c011", day: 4, title: "Chair Yoga", domain: "physical", time: "9:00 AM", recurring: true },
  { id: "c012", day: 4, title: "Garden Club", domain: "physical", time: "11:00 AM", recurring: true },
  { id: "c013", day: 5, title: "Morning Devotions", domain: "spiritual", time: "7:30 AM", recurring: true },
  { id: "c014", day: 5, title: "Brain Games & Trivia", domain: "cognitive", time: "10:00 AM", recurring: true },
  { id: "c015", day: 5, title: "Watercolor Art Class", domain: "creative", time: "2:00 PM", recurring: true },
  { id: "c016", day: 6, title: "Morning Devotions", domain: "spiritual", time: "7:30 AM", recurring: true },
  { id: "c017", day: 6, title: "Chair Yoga", domain: "physical", time: "9:00 AM", recurring: true },
  { id: "c018", day: 6, title: "Music & Sing-Along", domain: "social", time: "3:30 PM", recurring: true },
  { id: "c019", day: 7, title: "Cooking Class", domain: "creative", time: "10:00 AM", recurring: true },
  { id: "c020", day: 7, title: "Brain Games & Trivia", domain: "cognitive", time: "10:00 AM", recurring: true },
  { id: "c021", day: 8, title: "Chair Yoga", domain: "physical", time: "9:00 AM", recurring: true },
  { id: "c022", day: 8, title: "Happy Hour Social", domain: "social", time: "4:30 PM", recurring: true },
  { id: "c023", day: 8, title: "Movie Night", domain: "social", time: "6:30 PM", recurring: false },
  { id: "c024", day: 9, title: "Music & Sing-Along", domain: "social", time: "3:30 PM", recurring: true },
  { id: "c025", day: 10, title: "Religious Service", domain: "spiritual", time: "10:00 AM", recurring: true },
  // Week 3
  { id: "c030", day: 11, title: "Chair Yoga", domain: "physical", time: "9:00 AM", recurring: true },
  { id: "c031", day: 11, title: "Garden Club", domain: "physical", time: "11:00 AM", recurring: true },
  { id: "c032", day: 12, title: "Brain Games & Trivia", domain: "cognitive", time: "10:00 AM", recurring: true },
  { id: "c033", day: 12, title: "Watercolor Art Class", domain: "creative", time: "2:00 PM", recurring: true },
  { id: "c034", day: 13, title: "Chair Yoga", domain: "physical", time: "9:00 AM", recurring: true },
  { id: "c035", day: 13, title: "Garden Club", domain: "physical", time: "11:00 AM", recurring: true },
  { id: "c036", day: 13, title: "Music & Sing-Along", domain: "social", time: "3:30 PM", recurring: true },
  { id: "c037", day: 14, title: "Cooking Class", domain: "creative", time: "10:00 AM", recurring: true },
  { id: "c038", day: 14, title: "Brain Games & Trivia", domain: "cognitive", time: "10:00 AM", recurring: true },
  { id: "c039", day: 14, title: "Volunteer Reading Program", domain: "volunteer", time: "10:00 AM", recurring: true },
  { id: "c040", day: 15, title: "Chair Yoga", domain: "physical", time: "9:00 AM", recurring: true },
  { id: "c041", day: 15, title: "Happy Hour Social", domain: "social", time: "4:30 PM", recurring: true },
  // Today May 16
  { id: "c050", day: 16, title: "Morning Devotions", domain: "spiritual", time: "7:30 AM", recurring: true },
  { id: "c051", day: 16, title: "Chair Yoga", domain: "physical", time: "9:00 AM", recurring: true },
  { id: "c052", day: 16, title: "Brain Games & Trivia", domain: "cognitive", time: "10:00 AM", recurring: true },
  { id: "c053", day: 16, title: "Garden Club", domain: "physical", time: "11:00 AM", recurring: true },
  { id: "c054", day: 16, title: "Watercolor Art Class", domain: "creative", time: "2:00 PM", recurring: true },
  { id: "c055", day: 16, title: "Music & Sing-Along", domain: "social", time: "3:30 PM", recurring: true },
  { id: "c056", day: 16, title: "Movie Night", domain: "social", time: "6:30 PM", recurring: false },
  // Week 4+
  { id: "c060", day: 17, title: "Religious Service", domain: "spiritual", time: "10:00 AM", recurring: true },
  { id: "c061", day: 18, title: "Chair Yoga", domain: "physical", time: "9:00 AM", recurring: true },
  { id: "c062", day: 18, title: "Garden Club", domain: "physical", time: "11:00 AM", recurring: true },
  { id: "c063", day: 19, title: "Brain Games & Trivia", domain: "cognitive", time: "10:00 AM", recurring: true },
  { id: "c064", day: 19, title: "Watercolor Art Class", domain: "creative", time: "2:00 PM", recurring: true },
  { id: "c065", day: 20, title: "Chair Yoga", domain: "physical", time: "9:00 AM", recurring: true },
  { id: "c066", day: 20, title: "Garden Club", domain: "physical", time: "11:00 AM", recurring: true },
  { id: "c067", day: 20, title: "Music & Sing-Along", domain: "social", time: "3:30 PM", recurring: true },
  { id: "c068", day: 21, title: "Brain Games & Trivia", domain: "cognitive", time: "10:00 AM", recurring: true },
  { id: "c069", day: 21, title: "Volunteer Reading Program", domain: "volunteer", time: "10:00 AM", recurring: true },
  { id: "c070", day: 21, title: "Spring Concert — Local High School Choir", domain: "social", time: "3:00 PM", recurring: false },
  { id: "c071", day: 22, title: "Chair Yoga", domain: "physical", time: "9:00 AM", recurring: true },
  { id: "c072", day: 22, title: "Happy Hour Social", domain: "social", time: "4:30 PM", recurring: true },
  { id: "c073", day: 23, title: "Music & Sing-Along", domain: "social", time: "3:30 PM", recurring: true },
  { id: "c074", day: 24, title: "Religious Service", domain: "spiritual", time: "10:00 AM", recurring: true },
  { id: "c075", day: 25, title: "Memorial Day Tribute", domain: "social", time: "10:30 AM", recurring: false },
  { id: "c076", day: 26, title: "Brain Games & Trivia", domain: "cognitive", time: "10:00 AM", recurring: true },
  { id: "c077", day: 27, title: "Watercolor Art Class", domain: "creative", time: "2:00 PM", recurring: true },
  { id: "c078", day: 28, title: "Chair Yoga", domain: "physical", time: "9:00 AM", recurring: true },
  { id: "c079", day: 28, title: "Volunteer Reading Program", domain: "volunteer", time: "10:00 AM", recurring: true },
  { id: "c080", day: 29, title: "Brain Games & Trivia", domain: "cognitive", time: "10:00 AM", recurring: true },
  { id: "c081", day: 29, title: "Happy Hour Social", domain: "social", time: "4:30 PM", recurring: true },
  { id: "c082", day: 30, title: "Music & Sing-Along", domain: "social", time: "3:30 PM", recurring: true },
  { id: "c083", day: 31, title: "Religious Service", domain: "spiritual", time: "10:00 AM", recurring: true },
  { id: "c084", day: 31, title: "End of Month Celebration", domain: "social", time: "3:00 PM", recurring: false },
];
