// ── Types ─────────────────────────────────────────────────────────────────────

export type DietType =
  | "regular" | "low_sodium" | "diabetic" | "renal"
  | "mechanical_soft" | "pureed";

export type ThickeningLevel = "none" | "nectar" | "honey" | "pudding";

export type MealPeriod = "breakfast" | "lunch" | "dinner";

export type MealAbsenceReason = "refused" | "hospital" | "in_room" | "outing" | "npo";

export type WeightTrend = "stable" | "gaining" | "losing_minor" | "losing_alert" | "losing_critical";

export type AssessmentStatus = "current" | "due_soon" | "overdue";

// ── Diet config ───────────────────────────────────────────────────────────────

export const DIET_CONFIG: Record<DietType, { label: string; abbr: string; color: string; dot: string }> = {
  regular:        { label: "Regular",       abbr: "REG",  color: "bg-secondary text-muted-foreground border-border",         dot: "bg-muted-foreground" },
  low_sodium:     { label: "Low Sodium",    abbr: "LS",   color: "bg-primary/10 text-primary border-primary/20",             dot: "bg-primary" },
  diabetic:       { label: "Diabetic",      abbr: "DB",   color: "bg-accent/10 text-accent border-accent/20",                dot: "bg-accent" },
  renal:          { label: "Renal",         abbr: "REN",  color: "bg-purple-400/15 text-purple-300 border-purple-400/30",    dot: "bg-purple-400" },
  mechanical_soft:{ label: "Mech Soft",     abbr: "MS",   color: "bg-indigo-400/15 text-indigo-300 border-indigo-400/30",    dot: "bg-indigo-400" },
  pureed:         { label: "Pureed",        abbr: "PUR",  color: "bg-pink-400/15 text-pink-300 border-pink-400/30",          dot: "bg-pink-400" },
};

export const THICKENING_CONFIG: Record<ThickeningLevel, { label: string; color: string }> = {
  none:    { label: "Thin",   color: "" },
  nectar:  { label: "Nectar", color: "bg-amber-400/15 text-amber-300 border-amber-400/30" },
  honey:   { label: "Honey",  color: "bg-orange-400/15 text-orange-300 border-orange-400/30" },
  pudding: { label: "Pudding",color: "bg-destructive/10 text-destructive border-destructive/20" },
};

export const ABSENCE_LABELS: Record<MealAbsenceReason, string> = {
  refused: "Refused", hospital: "Hospital", in_room: "In Room",
  outing: "Outing", npo: "NPO",
};

// ── Resident diet profile ─────────────────────────────────────────────────────

export interface Allergy {
  allergen: string;
  severity: "severe" | "moderate" | "intolerance";
  notes?: string;
}

export interface WeightEntry {
  month: string;
  weight: number;
}

export interface ResidentDietProfile {
  id: string;
  name: string;
  room: string;
  wing: string;
  dietTypes: DietType[];
  thickening: ThickeningLevel;
  allergies: Allergy[];
  preferences: string[];
  dislikes: string[];
  fluidRestriction?: number; // mL/day, undefined = no restriction
  assistLevel: "independent" | "setup" | "partial" | "full";
  orderingPhysician: string;
  dietOrderDate: string;
  calorieCountOrdered: boolean;
  weightHistory: WeightEntry[];
  weightTrend: WeightTrend;
  lastAssessmentDate: string;
  nextAssessmentDue: string;
  assessmentStatus: AssessmentStatus;
  dietitianNotes?: string;
  trayCenterNotes?: string;
  alerts: string[];
}

// ── Meal attendance ───────────────────────────────────────────────────────────

export interface MealAbsence {
  residentId: string;
  residentName: string;
  room: string;
  reason: MealAbsenceReason;
  notes?: string;
}

export interface MealService {
  period: MealPeriod;
  time: string;
  status: "completed" | "in_progress" | "upcoming";
  totalCensus: number;
  attended: number;
  absences: MealAbsence[];
  dietBreakdown: Partial<Record<DietType, number>>;
}

// ── Menu items ────────────────────────────────────────────────────────────────

export interface MenuVariant {
  dietType: DietType | "all";
  label: string;
  items: string[];
}

export interface MenuMeal {
  period: MealPeriod;
  time: string;
  variants: MenuVariant[];
}

export interface MenuDay {
  dayOfWeek: string;
  date: string;
  dayNum: number;
  meals: MenuMeal[];
}

// ── Weight monitoring ─────────────────────────────────────────────────────────

export interface WeightAlert {
  residentId: string;
  residentName: string;
  room: string;
  wing: string;
  currentWeight: number;
  previousWeight: number;
  previousDate: string;
  pctChange30Day: number;
  pctChange90Day: number;
  trend: WeightTrend;
  dietitianReviewDate?: string;
  calorieCountOrdered: boolean;
  history: WeightEntry[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

// ── Community metrics ─────────────────────────────────────────────────────────

export const DINING_METRICS = {
  totalCensus: 87,
  breakfastAttendance: 79,
  lunchAttendance: 82,
  specialDietCount: 31,
  weightAlertCount: 3,
  nextDietitianVisit: "2026-06-25",
  nutritionAssessmentsDue: 7,
  avgMealParticipation: 92,
};

// ── Resident diet profiles ────────────────────────────────────────────────────

export const RESIDENT_DIETS: ResidentDietProfile[] = [
  {
    id: "d001",
    name: "Doris Lambert",
    room: "MC-205",
    wing: "Memory Care",
    dietTypes: ["mechanical_soft", "low_sodium"],
    thickening: "nectar",
    allergies: [{ allergen: "Shellfish", severity: "severe", notes: "EpiPen in room — staff must verify all soups and sauces" }],
    preferences: ["Gospel music during meals", "Decaf coffee", "Oatmeal for breakfast"],
    dislikes: ["Fish", "Strong spices"],
    fluidRestriction: undefined,
    assistLevel: "partial",
    orderingPhysician: "Dr. Evans",
    dietOrderDate: "2026-02-14",
    calorieCountOrdered: false,
    weightHistory: [
      { month: "Dec", weight: 138 }, { month: "Jan", weight: 137 },
      { month: "Feb", weight: 137 }, { month: "Mar", weight: 138 },
      { month: "Apr", weight: 137 }, { month: "May", weight: 137 }, { month: "Jun", weight: 137 },
    ],
    weightTrend: "stable",
    lastAssessmentDate: "2026-02-28",
    nextAssessmentDue: "2026-05-28",
    assessmentStatus: "overdue",
    dietitianNotes: "Weight stable. Mechanical soft and nectar thick appropriate for dysphagia with moderate dementia. Ensure adequate protein intake — add protein powder to AM oatmeal.",
    trayCenterNotes: "Always blend nectar thick into decaf coffee. Do not serve shrimp bisque or clam chowder. Staff-assist with cup and utensils.",
    alerts: [],
  },
  {
    id: "d002",
    name: "Vivian Marsh",
    room: "MC-201",
    wing: "Memory Care",
    dietTypes: ["pureed", "low_sodium"],
    thickening: "honey",
    allergies: [],
    preferences: ["Warm foods", "Familiar comfort foods", "Small portions served frequently"],
    dislikes: ["Cold foods", "Strong smells"],
    fluidRestriction: undefined,
    assistLevel: "full",
    orderingPhysician: "Dr. Evans",
    dietOrderDate: "2026-03-01",
    calorieCountOrdered: true,
    weightHistory: [
      { month: "Dec", weight: 109 }, { month: "Jan", weight: 108 },
      { month: "Feb", weight: 107 }, { month: "Mar", weight: 106 },
      { month: "Apr", weight: 105 }, { month: "May", weight: 101 }, { month: "Jun", weight: 101 },
    ],
    weightTrend: "losing_critical",
    lastAssessmentDate: "2026-04-15",
    nextAssessmentDue: "2026-05-16",
    assessmentStatus: "overdue",
    dietitianNotes: "ALERT: 7.2% weight loss in 90 days. Pureed diet + honey thick ordered after failed swallow study March 2026. Calorie count ordered April 15 — confirm all meals are documented. Consider oral nutrition supplement (Ensure) BID between meals. Escalate if < 98 lbs. Recommend depression screening — psychosocial factors may be contributing.",
    trayCenterNotes: "Full staff assist for all meals. Serve pureed items warm. Try 3–4 small meals/snacks vs. 3 large. Ensure honey-thick is added to all beverages including coffee and water. Family has requested no fish items.",
    alerts: [
      "7.2% weight loss in 90 days — CRITICAL",
      "Calorie count order active — document every meal",
      "Nutrition assessment overdue",
      "2 consecutive meals missed today",
    ],
  },
  {
    id: "d003",
    name: "Gerald Hayes",
    room: "W-118",
    wing: "West Wing",
    dietTypes: ["diabetic", "low_sodium"],
    thickening: "none",
    allergies: [],
    preferences: ["Strong black coffee", "Eggs for breakfast", "No substitutions — likes consistency"],
    dislikes: ["Fish", "Decaf coffee"],
    fluidRestriction: undefined,
    assistLevel: "independent",
    orderingPhysician: "Dr. Evans",
    dietOrderDate: "2026-01-10",
    calorieCountOrdered: false,
    weightHistory: [
      { month: "Dec", weight: 187 }, { month: "Jan", weight: 186 },
      { month: "Feb", weight: 185 }, { month: "Mar", weight: 185 },
      { month: "Apr", weight: 184 }, { month: "May", weight: 184 }, { month: "Jun", weight: 184 },
    ],
    weightTrend: "stable",
    lastAssessmentDate: "2026-06-05",
    nextAssessmentDue: "2026-09-05",
    assessmentStatus: "current",
    dietitianNotes: "Consistent carb diet well-tolerated. Weight stable. A1C reviewed March 2026 — within target. No sugar-added desserts; monitor carb portions at each meal.",
    trayCenterNotes: "No sugar-added desserts or juices. Regular coffee only (not decaf). Consistent carb portions — do not substitute white bread for whole grain without checking.",
    alerts: [],
  },
  {
    id: "d004",
    name: "Raymond Kowalski",
    room: "E-118",
    wing: "East Wing",
    dietTypes: ["regular"],
    thickening: "none",
    allergies: [{ allergen: "Peanuts", severity: "severe", notes: "Anaphylaxis risk. EpiPen in room E-118 and nursing station. Verify all baked goods, sauces, and Asian cuisine." }],
    preferences: ["Decaf coffee", "Blueberries", "Chicken and fish over red meat"],
    dislikes: ["Liver", "Brussels sprouts"],
    fluidRestriction: undefined,
    assistLevel: "independent",
    orderingPhysician: "Dr. Evans",
    dietOrderDate: "2026-01-05",
    calorieCountOrdered: false,
    weightHistory: [
      { month: "Dec", weight: 162 }, { month: "Jan", weight: 163 },
      { month: "Feb", weight: 162 }, { month: "Mar", weight: 163 },
      { month: "Apr", weight: 162 }, { month: "May", weight: 163 }, { month: "Jun", weight: 163 },
    ],
    weightTrend: "stable",
    lastAssessmentDate: "2026-03-15",
    nextAssessmentDue: "2026-06-15",
    assessmentStatus: "due_soon",
    dietitianNotes: "Weight stable. No clinical nutrition concerns. Peanut allergy well-documented — staff briefed. No dietary modifications required beyond allergy management.",
    trayCenterNotes: "PEANUT ALLERGY — ANAPHYLAXIS RISK. Verify all desserts, Asian dishes, satay sauces, and baked goods. Never serve peanut butter. If any doubt about ingredient, substitute.",
    alerts: [],
  },
  {
    id: "d005",
    name: "Eleanor Bradford",
    room: "W-108",
    wing: "West Wing",
    dietTypes: ["regular"],
    thickening: "none",
    allergies: [],
    preferences: ["Vegetarian options preferred", "Salads", "Fresh fruit", "Herbal tea over coffee"],
    dislikes: ["Red meat (prefers not to eat)", "Fried foods"],
    fluidRestriction: undefined,
    assistLevel: "independent",
    orderingPhysician: "Dr. Evans",
    dietOrderDate: "2026-01-05",
    calorieCountOrdered: false,
    weightHistory: [
      { month: "Dec", weight: 134 }, { month: "Jan", weight: 134 },
      { month: "Feb", weight: 135 }, { month: "Mar", weight: 134 },
      { month: "Apr", weight: 135 }, { month: "May", weight: 135 }, { month: "Jun", weight: 135 },
    ],
    weightTrend: "stable",
    lastAssessmentDate: "2026-03-15",
    nextAssessmentDue: "2026-06-15",
    assessmentStatus: "due_soon",
    dietitianNotes: "Weight stable. Vegetarian preference noted — ensure adequate protein from alternate sources (eggs, legumes, dairy). No clinical nutrition concerns.",
    trayCenterNotes: "Offer vegetarian protein option when available. Prefers salad bar items and fresh fruit. Herbal tea at all meals if available.",
    alerts: [],
  },
  {
    id: "d006",
    name: "Beverly Stone",
    room: "W-304",
    wing: "West Wing",
    dietTypes: ["regular"],
    thickening: "none",
    allergies: [],
    preferences: ["Assessment pending"],
    dislikes: [],
    fluidRestriction: undefined,
    assistLevel: "independent",
    orderingPhysician: "Dr. Evans",
    dietOrderDate: "2026-05-15",
    calorieCountOrdered: false,
    weightHistory: [
      { month: "May", weight: 148 }, { month: "Jun", weight: 148 },
    ],
    weightTrend: "stable",
    lastAssessmentDate: "2026-05-15",
    nextAssessmentDue: "2026-05-29",
    assessmentStatus: "overdue",
    dietitianNotes: "New admission May 15. Initial diet order: Regular pending full nutrition assessment. Assessment overdue — required within 14 days of admission (May 29 deadline passed).",
    trayCenterNotes: "New resident. Preferences and dislikes not yet documented — ask at each meal. Complete tray card preferences form.",
    alerts: ["Nutrition assessment overdue — required within 14 days of admission (May 29 deadline passed)"],
  },
  {
    id: "d007",
    name: "Margaret Olson",
    room: "E-114",
    wing: "East Wing",
    dietTypes: ["renal"],
    thickening: "none",
    allergies: [{ allergen: "Shellfish", severity: "moderate" }],
    preferences: ["Mild flavors", "Decaf coffee", "Oatmeal"],
    dislikes: ["Spicy food", "Carbonated drinks"],
    fluidRestriction: 1200,
    assistLevel: "setup",
    orderingPhysician: "Dr. Evans",
    dietOrderDate: "2026-01-20",
    calorieCountOrdered: false,
    weightHistory: [
      { month: "Dec", weight: 162 }, { month: "Jan", weight: 161 },
      { month: "Feb", weight: 160 }, { month: "Mar", weight: 158 },
      { month: "Apr", weight: 155 }, { month: "May", weight: 154 }, { month: "Jun", weight: 154 },
    ],
    weightTrend: "losing_alert",
    lastAssessmentDate: "2026-04-01",
    nextAssessmentDue: "2026-05-20",
    assessmentStatus: "overdue",
    dietitianNotes: "5.1% weight loss over 45 days — monitoring. Renal diet with 1,200 mL/day fluid restriction due to Stage 4 CKD. Low K, low P diet. No salt substitute (contains K). Limit dairy, bananas, oranges, potatoes. Track fluid intake each meal.",
    trayCenterNotes: "FLUID RESTRICTION: 1,200 mL/day. Log all fluid at each meal. No salt substitute. Avoid high-potassium foods (banana, orange, potato). No carbonated beverages. Shellfish allergy — verify soups/sauces.",
    alerts: ["5.1% weight loss — monitoring", "Fluid restriction: 1,200 mL/day — document all fluids", "Nutrition assessment overdue (due May 20)"],
  },
  {
    id: "d008",
    name: "Howard Ingram",
    room: "E-220",
    wing: "East Wing",
    dietTypes: ["low_sodium"],
    thickening: "none",
    allergies: [],
    preferences: ["Comfort foods", "Hot meals", "Coffee with meals"],
    dislikes: ["Salads", "Cold sandwiches"],
    fluidRestriction: undefined,
    assistLevel: "independent",
    orderingPhysician: "Dr. Evans",
    dietOrderDate: "2026-02-01",
    calorieCountOrdered: false,
    weightHistory: [
      { month: "Dec", weight: 211 }, { month: "Jan", weight: 210 },
      { month: "Feb", weight: 210 }, { month: "Mar", weight: 209 },
      { month: "Apr", weight: 209 }, { month: "May", weight: 208 }, { month: "Jun", weight: 208 },
    ],
    weightTrend: "stable",
    lastAssessmentDate: "2026-02-15",
    nextAssessmentDue: "2026-05-15",
    assessmentStatus: "overdue",
    dietitianNotes: "Weight stable. Low sodium diet ordered for HTN management. Encourage hot meals and comfort items for engagement support — resident has been showing mild social withdrawal.",
    trayCenterNotes: "Low sodium — no salt packets, no high-Na condiments. Prefers comfort food over salads. Hot meals at all times. Coffee at all meals.",
    alerts: ["Nutrition assessment past due (May 15)"],
  },
  {
    id: "d009",
    name: "Robert Chen",
    room: "W-204",
    wing: "West Wing",
    dietTypes: ["diabetic"],
    thickening: "none",
    allergies: [{ allergen: "Dairy", severity: "intolerance", notes: "Lactose intolerant — use dairy-free alternatives for milk, cream, butter where possible" }],
    preferences: ["Asian cuisine", "Rice", "Mild soups", "Green tea"],
    dislikes: ["Heavy cream sauces", "Very sweet desserts"],
    fluidRestriction: undefined,
    assistLevel: "independent",
    orderingPhysician: "Dr. Evans",
    dietOrderDate: "2026-01-10",
    calorieCountOrdered: false,
    weightHistory: [
      { month: "Dec", weight: 155 }, { month: "Jan", weight: 154 },
      { month: "Feb", weight: 154 }, { month: "Mar", weight: 155 },
      { month: "Apr", weight: 154 }, { month: "May", weight: 154 }, { month: "Jun", weight: 154 },
    ],
    weightTrend: "stable",
    lastAssessmentDate: "2026-06-05",
    nextAssessmentDue: "2026-09-05",
    assessmentStatus: "current",
    dietitianNotes: "Weight stable. Diabetic diet well-managed. Use dairy-free milk alternatives for hot cereal and beverages. No sugar-added desserts. Consistent carb portions.",
    trayCenterNotes: "DAIRY INTOLERANCE: use almond or oat milk in oatmeal and beverages. No cream sauces. Sugar-free desserts only. Green tea if available.",
    alerts: [],
  },
  {
    id: "d010",
    name: "Dorothy Hayes",
    room: "E-102",
    wing: "East Wing",
    dietTypes: ["mechanical_soft"],
    thickening: "none",
    allergies: [{ allergen: "Shellfish", severity: "moderate" }],
    preferences: ["Breakfast foods any time of day", "Decaf", "Simple flavors"],
    dislikes: ["Fish", "Spicy foods"],
    fluidRestriction: undefined,
    assistLevel: "setup",
    orderingPhysician: "Dr. Evans",
    dietOrderDate: "2026-02-20",
    calorieCountOrdered: false,
    weightHistory: [
      { month: "Dec", weight: 142 }, { month: "Jan", weight: 141 },
      { month: "Feb", weight: 142 }, { month: "Mar", weight: 141 },
      { month: "Apr", weight: 142 }, { month: "May", weight: 142 }, { month: "Jun", weight: 142 },
    ],
    weightTrend: "stable",
    lastAssessmentDate: "2026-06-05",
    nextAssessmentDue: "2026-09-05",
    assessmentStatus: "current",
    dietitianNotes: "Weight stable. Mechanical soft diet for mild dysphagia and poor dentition. All items chopped or minced — no tough meats. Thin liquids tolerated.",
    trayCenterNotes: "All items chopped/minced. No whole raw vegetables, tough meats, or crusty bread. Decaf coffee. Shellfish allergy — verify soups.",
    alerts: [],
  },
];

// ── Today's meal services ────────────────────────────────────────────────────

export const TODAYS_MEALS: MealService[] = [
  {
    period: "breakfast",
    time: "7:30 AM",
    status: "completed",
    totalCensus: 87,
    attended: 79,
    absences: [
      { residentId: "d002", residentName: "Vivian Marsh",    room: "MC-201", reason: "refused",  notes: "Staff offered warm oatmeal — declined" },
      { residentId: "d007", residentName: "Margaret Olson",  room: "E-114",  reason: "hospital", notes: "Admitted for hip X-ray follow-up" },
      { residentId: "ext1", residentName: "Charles Wells",   room: "W-310",  reason: "hospital", notes: "Overnight observation — injury of unknown origin" },
      { residentId: "ext2", residentName: "Harold Foster",   room: "E-206",  reason: "in_room",  notes: "Requested breakfast in room" },
      { residentId: "ext3", residentName: "Irene Walsh",     room: "W-215",  reason: "in_room",  notes: "Not feeling well — nurse notified" },
      { residentId: "ext4", residentName: "Thomas Reyes",    room: "E-312",  reason: "outing",   notes: "Family outing — expected back for lunch" },
      { residentId: "ext5", residentName: "Patricia Moore",  room: "W-104",  reason: "refused",  notes: "Not hungry, had snack at 6 AM" },
      { residentId: "ext6", residentName: "Albert Gibson",   room: "E-220",  reason: "refused",  notes: "Preferred to sleep in" },
    ],
    dietBreakdown: { regular: 44, low_sodium: 14, diabetic: 8, mechanical_soft: 7, pureed: 3, renal: 1, },
  },
  {
    period: "lunch",
    time: "12:00 PM",
    status: "completed",
    totalCensus: 87,
    attended: 82,
    absences: [
      { residentId: "d002", residentName: "Vivian Marsh",    room: "MC-201", reason: "refused",  notes: "2nd consecutive miss — charge nurse notified" },
      { residentId: "d007", residentName: "Margaret Olson",  room: "E-114",  reason: "hospital", notes: "Still at hospital" },
      { residentId: "ext1", residentName: "Charles Wells",   room: "W-310",  reason: "hospital", notes: "Still admitted" },
      { residentId: "ext5", residentName: "Patricia Moore",  room: "W-104",  reason: "in_room",  notes: "Ate in room" },
      { residentId: "ext7", residentName: "Norma Solis",     room: "MC-208", reason: "npo",      notes: "NPO for lab draw at 2 PM — physician order" },
    ],
    dietBreakdown: { regular: 48, low_sodium: 14, diabetic: 8, mechanical_soft: 7, pureed: 2, renal: 1, },
  },
  {
    period: "dinner",
    time: "5:30 PM",
    status: "upcoming",
    totalCensus: 87,
    attended: 0,
    absences: [],
    dietBreakdown: {},
  },
];

// ── Weekly menu (week of May 13–19, 2026) ────────────────────────────────────

export const WEEKLY_MENU: MenuDay[] = [
  {
    dayOfWeek: "Sun", date: "May 11", dayNum: 11,
    meals: [
      { period: "breakfast", time: "7:30 AM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Scrambled eggs", "Turkey sausage link", "Whole wheat toast", "Orange juice", "Coffee / Decaf / Tea"] },
        { dietType: "low_sodium",     label: "Low Sodium",   items: ["Same — no added salt, low-Na sausage"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Same — diet OJ, sugar-free jam on toast"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Scrambled eggs (soft)", "Sausage (minced)", "Soft buttered toast", "Thickened OJ"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed scrambled egg", "Pureed toast", "Honey-thick OJ"] },
      ]},
      { period: "lunch", time: "12:00 PM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Chicken noodle soup", "Grilled chicken sandwich on wheat", "Garden salad", "Chocolate pudding", "Water / Lemonade"] },
        { dietType: "low_sodium",     label: "Low Sodium",   items: ["Low-Na soup, no salt packet", "Same sandwich, no added salt"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Same — sugar-free pudding"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Chicken noodle soup", "Minced chicken on soft bread", "Soft diced vegetables", "Pudding"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed chicken", "Pureed potato", "Pureed carrot", "Pureed bread"] },
      ]},
      { period: "dinner", time: "5:30 PM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Pot roast", "Mashed potatoes", "Green beans", "Dinner roll", "Strawberry shortcake"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Same — sugar-free dessert substitute"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Tender minced pot roast", "Mashed potatoes", "Soft green beans", "Soft roll"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed roast", "Pureed potato", "Pureed green beans", "Honey-thick beverage"] },
      ]},
    ],
  },
  {
    dayOfWeek: "Mon", date: "May 12", dayNum: 12,
    meals: [
      { period: "breakfast", time: "7:30 AM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Oatmeal w/ brown sugar & raisins", "Hard-boiled egg", "Banana", "Coffee / Decaf / Tea"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Plain oatmeal, no added sugar", "Hard-boiled egg", "½ banana"] },
        { dietType: "renal",          label: "Renal",        items: ["Oatmeal plain, no banana (high K)", "Hard-boiled egg", "White toast", "Fluid limit noted"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Soft oatmeal w/ banana mashed in", "Soft scrambled egg"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed oatmeal", "Pureed egg", "Honey-thick beverage"] },
      ]},
      { period: "lunch", time: "12:00 PM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Tomato bisque", "BLT on whole wheat", "Coleslaw", "Apple slices", "Iced tea"] },
        { dietType: "low_sodium",     label: "Low Sodium",   items: ["Low-Na bisque, no bacon on BLT — substitute turkey"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Tomato bisque", "Minced turkey sandwich on soft bread", "Soft slaw"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed tomato soup", "Pureed turkey", "Pureed apple"] },
      ]},
      { period: "dinner", time: "5:30 PM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Baked salmon", "Wild rice pilaf", "Steamed broccoli", "Dinner roll", "Lemon sorbet"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Same — skip sorbet or sugar-free alternative"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Tender flaked salmon", "Wild rice", "Soft steamed broccoli", "Soft roll"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed salmon", "Pureed rice", "Pureed broccoli"] },
      ]},
    ],
  },
  {
    dayOfWeek: "Tue", date: "May 13", dayNum: 13,
    meals: [
      { period: "breakfast", time: "7:30 AM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["French toast w/ maple syrup", "Turkey bacon strips", "Mixed berry cup", "Coffee / Decaf / Tea"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["French toast — sugar-free syrup", "Turkey bacon", "½ berry cup"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Soft French toast (no crust)", "Turkey bacon (minced)", "Soft berry cup"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed egg custard base", "Pureed berries", "Honey-thick beverage"] },
      ]},
      { period: "lunch", time: "12:00 PM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Beef vegetable soup", "Grilled cheese on wheat", "Dill pickle spear", "Peach cobbler"] },
        { dietType: "low_sodium",     label: "Low Sodium",   items: ["Low-Na soup, low-Na cheese", "No pickle"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Same — sugar-free cobbler"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Beef vegetable soup (soft veg)", "Soft grilled cheese", "Soft peach cobbler"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed beef soup", "Pureed cheese bread", "Pureed peaches"] },
      ]},
      { period: "dinner", time: "5:30 PM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Baked chicken thigh", "Sweet potato mash", "Glazed carrots", "Cornbread", "Vanilla ice cream"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Same — skip glaze on carrots, sugar-free ice cream"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Tender chicken (minced)", "Sweet potato mash", "Soft glazed carrots", "Soft cornbread"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed chicken", "Pureed sweet potato", "Pureed carrot"] },
      ]},
    ],
  },
  {
    dayOfWeek: "Wed", date: "May 14", dayNum: 14,
    meals: [
      { period: "breakfast", time: "7:30 AM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Pancakes w/ butter & syrup", "Sausage patty", "Grapefruit half", "Coffee / Decaf / Tea"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Same — sugar-free syrup, skip grapefruit (medication interaction check)"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Soft pancakes", "Sausage (minced)", "Grapefruit segments"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed pancake batter custard", "Pureed sausage", "Honey-thick OJ"] },
      ]},
      { period: "lunch", time: "12:00 PM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Minestrone soup", "Italian sub on hoagie roll", "Pasta salad", "Tiramisu"] },
        { dietType: "low_sodium",     label: "Low Sodium",   items: ["Low-Na soup, no deli meat — substitute grilled chicken"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Same — skip dessert or sugar-free option"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Minestrone (soft veg, no large beans)", "Soft chicken on soft hoagie", "Soft pasta salad"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed minestrone", "Pureed chicken", "Pureed pasta"] },
      ]},
      { period: "dinner", time: "5:30 PM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Meatloaf w/ brown gravy", "Mashed potatoes", "Corn", "Dinner roll", "Cherry Jell-O"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Same — sugar-free Jell-O"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Tender meatloaf (minced)", "Mashed potatoes", "Soft corn", "Soft roll"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed meatloaf", "Pureed potato", "Pureed corn", "Jell-O (thin liquid OK)"] },
      ]},
    ],
  },
  {
    dayOfWeek: "Thu", date: "May 15", dayNum: 15,
    meals: [
      { period: "breakfast", time: "7:30 AM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Yogurt parfait w/ granola & berries", "Bagel w/ cream cheese", "Orange slices", "Coffee / Decaf / Tea"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Plain yogurt, no granola (sugar)", "Plain bagel, light cream cheese"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Soft yogurt (no granola)", "Soft bagel with cream cheese", "Soft orange segments"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed yogurt", "Pureed cream cheese toast", "Honey-thick OJ"] },
      ]},
      { period: "lunch", time: "12:00 PM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Clam chowder", "Tuna salad sandwich", "Kettle chips", "Lemon bars"] },
        { dietType: "low_sodium",     label: "Low Sodium",   items: ["Low-Na chowder, no chips", "Low-Na tuna — NOTE: Shellfish allergy residents must have alternate soup"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Chowder (soft, no chewy clams)", "Tuna salad on soft bread", "Soft lemon bar"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed potato base soup", "Pureed tuna mix", "Pureed lemon curd"] },
      ]},
      { period: "dinner", time: "5:30 PM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Pork chop w/ applesauce", "Au gratin potatoes", "Green bean almondine", "Dinner roll", "Chocolate cake"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Same — unsweetened applesauce, sugar-free cake"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Tender pork (minced)", "Au gratin potatoes (soft)", "Soft green beans (no almonds)", "Soft roll"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed pork", "Pureed potato", "Pureed green beans", "Pureed cake"] },
      ]},
    ],
  },
  {
    dayOfWeek: "Fri", date: "May 16", dayNum: 16,
    meals: [
      { period: "breakfast", time: "7:30 AM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Scrambled eggs", "Turkey sausage link", "Whole wheat toast", "Orange juice", "Coffee / Decaf / Tea"] },
        { dietType: "low_sodium",     label: "Low Sodium",   items: ["Same — no added salt, low-Na sausage"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Same — diet OJ, sugar-free jam"] },
        { dietType: "renal",          label: "Renal",        items: ["Eggs, white toast, no OJ — fluid restriction noted. Decaf only."] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Scrambled eggs (soft)", "Sausage (minced)", "Soft buttered toast", "Nectar-thick OJ"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed scrambled egg", "Pureed toast", "Honey-thick OJ"] },
      ]},
      { period: "lunch", time: "12:00 PM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Chicken noodle soup", "Grilled chicken sandwich on wheat", "Garden salad w/ ranch", "Chocolate pudding", "Water / Lemonade"] },
        { dietType: "low_sodium",     label: "Low Sodium",   items: ["Low-Na soup, no dressing — olive oil/vinegar only, low-Na bread"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Same — sugar-free pudding"] },
        { dietType: "renal",          label: "Renal",        items: ["Low-Na soup (no tomatoes), grilled chicken plain, no salad dressing, no pudding (dairy)"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Chicken noodle soup", "Minced chicken on soft bread", "Soft diced tomato salad", "Pudding"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed chicken", "Pureed potato", "Pureed carrot", "Honey-thick beverage"] },
      ]},
      { period: "dinner", time: "5:30 PM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Pot roast w/ gravy", "Mashed potatoes", "Green beans", "Dinner roll", "Strawberry shortcake", "Coffee / Decaf / Tea"] },
        { dietType: "low_sodium",     label: "Low Sodium",   items: ["Low-Na gravy, no added salt"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Same — skip shortcake or sugar-free substitute"] },
        { dietType: "renal",          label: "Renal",        items: ["Pot roast (no gravy — high Na/P), plain mashed potatoes (no skin), green beans, white roll, fluid tracked"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Tender minced pot roast", "Mashed potatoes", "Soft green beans", "Soft roll"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed roast", "Pureed potato", "Pureed green beans", "Honey-thick beverage"] },
      ]},
    ],
  },
  {
    dayOfWeek: "Sat", date: "May 17", dayNum: 17,
    meals: [
      { period: "breakfast", time: "7:30 AM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Waffles w/ mixed berry compote", "Turkey bacon", "Cantaloupe", "Coffee / Decaf / Tea"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Waffles — sugar-free syrup, plain berries", "Turkey bacon"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Soft waffles", "Turkey bacon (minced)", "Soft cantaloupe"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed waffle custard", "Pureed berries", "Honey-thick beverage"] },
      ]},
      { period: "lunch", time: "12:00 PM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Tomato basil soup", "Turkey club sandwich", "Fruit salad", "Oatmeal cookie"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Same — skip cookie or sugar-free option"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Tomato soup", "Minced turkey on soft bread", "Soft fruit salad"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed tomato soup", "Pureed turkey", "Pureed fruit"] },
      ]},
      { period: "dinner", time: "5:30 PM", variants: [
        { dietType: "all",            label: "All Diets",    items: ["Baked tilapia w/ lemon butter", "Rice pilaf", "Roasted asparagus", "Dinner roll", "Peach cobbler"] },
        { dietType: "low_sodium",     label: "Low Sodium",   items: ["No butter sauce — lemon/herb only", "Low-Na roll"] },
        { dietType: "diabetic",       label: "Diabetic",     items: ["Same — sugar-free cobbler"] },
        { dietType: "mechanical_soft",label: "Mech Soft",    items: ["Flaked tilapia (tender)", "Rice pilaf", "Soft roasted asparagus tips", "Soft roll"] },
        { dietType: "pureed",         label: "Pureed",       items: ["Pureed tilapia", "Pureed rice", "Pureed asparagus"] },
      ]},
    ],
  },
];

// ── Weight alerts ─────────────────────────────────────────────────────────────

export const WEIGHT_ALERTS: WeightAlert[] = [
  {
    residentId: "d002",
    residentName: "Vivian Marsh",
    room: "MC-201",
    wing: "Memory Care",
    currentWeight: 101,
    previousWeight: 109,
    previousDate: "2025-12-01",
    pctChange30Day: -3.8,
    pctChange90Day: -7.2,
    trend: "losing_critical",
    dietitianReviewDate: "2026-06-25",
    calorieCountOrdered: true,
    history: [
      { month: "Dec", weight: 109 }, { month: "Jan", weight: 108 },
      { month: "Feb", weight: 107 }, { month: "Mar", weight: 106 },
      { month: "Apr", weight: 105 }, { month: "May", weight: 101 }, { month: "Jun", weight: 101 },
    ],
  },
  {
    residentId: "d007",
    residentName: "Margaret Olson",
    room: "E-114",
    wing: "East Wing",
    currentWeight: 154,
    previousWeight: 162,
    previousDate: "2025-12-01",
    pctChange30Day: -0.6,
    pctChange90Day: -5.1,
    trend: "losing_alert",
    dietitianReviewDate: "2026-06-25",
    calorieCountOrdered: false,
    history: [
      { month: "Dec", weight: 162 }, { month: "Jan", weight: 161 },
      { month: "Feb", weight: 160 }, { month: "Mar", weight: 158 },
      { month: "Apr", weight: 155 }, { month: "May", weight: 154 }, { month: "Jun", weight: 154 },
    ],
  },
  {
    residentId: "ext1",
    residentName: "Charles Wells",
    room: "W-310",
    wing: "West Wing",
    currentWeight: 195,
    previousWeight: 198,
    previousDate: "2025-12-01",
    pctChange30Day: -0.5,
    pctChange90Day: -1.5,
    trend: "losing_minor",
    calorieCountOrdered: false,
    history: [
      { month: "Dec", weight: 198 }, { month: "Jan", weight: 197 },
      { month: "Feb", weight: 196 }, { month: "Mar", weight: 197 },
      { month: "Apr", weight: 196 }, { month: "May", weight: 195 }, { month: "Jun", weight: 195 },
    ],
  },
];

// ── Diet census summary ───────────────────────────────────────────────────────

export const DIET_CENSUS: { dietType: DietType; count: number; pct: number }[] = [
  { dietType: "regular",         count: 44, pct: 51 },
  { dietType: "low_sodium",      count: 14, pct: 16 },
  { dietType: "diabetic",        count:  8, pct:  9 },
  { dietType: "mechanical_soft", count:  7, pct:  8 },
  { dietType: "renal",           count:  2, pct:  2 },
  { dietType: "pureed",          count:  4, pct:  5 },
];

export const THICKENING_CENSUS = [
  { level: "nectar" as ThickeningLevel, count: 6 },
  { level: "honey"  as ThickeningLevel, count: 3 },
  { level: "pudding" as ThickeningLevel, count: 1 },
];

// ── Procurement types ─────────────────────────────────────────────────────────

export type POStatus = "draft" | "submitted" | "in_transit" | "delivered" | "partial";

export type ProductCategory =
  | "protein" | "produce" | "dairy" | "dry_goods"
  | "frozen" | "beverages" | "supplements" | "bakery";

export interface POLineItem {
  id: string;
  description: string;
  category: ProductCategory;
  unit: string;
  qtyOrdered: number;
  qtyReceived: number;
  unitCost: number;
  shortageNote?: string;
}

export interface PurchaseOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  status: POStatus;
  lineItems: POLineItem[];
  invoiceNumber?: string;
  notes?: string;
}

export interface DiningVendor {
  id: string;
  name: string;
  rep: string;
  phone: string;
  accountNumber: string;
  leadDays: number;
  category: string;
}

export interface ParItem {
  id: string;
  description: string;
  category: ProductCategory;
  unit: string;
  parLevel: number;
  onHand: number;
  reorderQty: number;
  vendorId: string;
  vendorName: string;
}

// ── Vendors ───────────────────────────────────────────────────────────────────

export const DINING_VENDORS: DiningVendor[] = [
  { id: "v001", name: "Sysco Foods",       rep: "Mike Torrez",     phone: "(614) 555-0142", accountNumber: "SYS-44872", leadDays: 2, category: "Full-line distributor" },
  { id: "v002", name: "Gordon Food Svc",   rep: "Diane Park",      phone: "(614) 555-0289", accountNumber: "GFS-19043", leadDays: 2, category: "Full-line distributor" },
  { id: "v003", name: "Abbott Nutrition",  rep: "James Whitfield", phone: "(800) 555-0311", accountNumber: "ABT-00771", leadDays: 7, category: "Medical nutrition" },
  { id: "v004", name: "Village Bakery",    rep: "Carol Hensley",   phone: "(614) 555-0094", accountNumber: "VB-LOCAL",  leadDays: 1, category: "Local bakery" },
];

// ── Purchase orders ───────────────────────────────────────────────────────────

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "PO-2026-041",
    vendorId: "v001",
    vendorName: "Sysco Foods",
    orderDate: "2026-06-03",
    expectedDelivery: "2026-06-05",
    status: "in_transit",
    notes: "Driver ETA 10–11 AM. Dock door B.",
    lineItems: [
      { id: "li01", description: "Chicken Breast IQF 40lb Case",   category: "protein",   unit: "case",  qtyOrdered: 8, qtyReceived: 0, unitCost:  89.50 },
      { id: "li02", description: "Ground Beef 80/20 10lb pkg",     category: "protein",   unit: "case",  qtyOrdered: 6, qtyReceived: 0, unitCost:  54.75 },
      { id: "li03", description: "Fresh Produce Seasonal Bundle",  category: "produce",   unit: "case",  qtyOrdered: 4, qtyReceived: 0, unitCost:  42.00 },
      { id: "li04", description: "Large Eggs Grade A 15-doz case", category: "dairy",     unit: "case",  qtyOrdered: 4, qtyReceived: 0, unitCost:  38.20 },
      { id: "li05", description: "Unsalted Butter 1lb prints 30ct",category: "dairy",     unit: "case",  qtyOrdered: 3, qtyReceived: 0, unitCost:  67.90 },
      { id: "li06", description: "Whole Milk 1gal jugs 6ct",       category: "dairy",     unit: "case",  qtyOrdered: 5, qtyReceived: 0, unitCost:  29.40 },
    ],
  },
  {
    id: "PO-2026-040",
    vendorId: "v004",
    vendorName: "Village Bakery",
    orderDate: "2026-06-04",
    expectedDelivery: "2026-06-06",
    status: "submitted",
    lineItems: [
      { id: "li10", description: "Sliced White Bread 22oz loaf",  category: "bakery", unit: "loaf", qtyOrdered: 18, qtyReceived: 0, unitCost: 3.25 },
      { id: "li11", description: "Dinner Rolls pkg/24",           category: "bakery", unit: "pkg",  qtyOrdered:  8, qtyReceived: 0, unitCost: 9.50 },
      { id: "li12", description: "English Muffins pkg/12",        category: "bakery", unit: "pkg",  qtyOrdered:  6, qtyReceived: 0, unitCost: 6.75 },
      { id: "li13", description: "Hamburger Buns pkg/12",         category: "bakery", unit: "pkg",  qtyOrdered:  4, qtyReceived: 0, unitCost: 5.20 },
    ],
  },
  {
    id: "PO-2026-039",
    vendorId: "v003",
    vendorName: "Abbott Nutrition",
    orderDate: "2026-06-01",
    expectedDelivery: "2026-06-08",
    status: "submitted",
    invoiceNumber: "ABT-81044",
    lineItems: [
      { id: "li20", description: "Ensure Plus Vanilla 8oz 24ct",   category: "supplements", unit: "case", qtyOrdered:  6, qtyReceived: 0, unitCost: 58.40 },
      { id: "li21", description: "Boost High Protein Choc 24ct",   category: "supplements", unit: "case", qtyOrdered:  4, qtyReceived: 0, unitCost: 52.80 },
      { id: "li22", description: "Thick-It Original Powder 10oz",  category: "supplements", unit: "jar",  qtyOrdered: 12, qtyReceived: 0, unitCost: 12.90 },
    ],
  },
  {
    id: "PO-2026-037",
    vendorId: "v001",
    vendorName: "Sysco Foods",
    orderDate: "2026-05-27",
    expectedDelivery: "2026-05-30",
    actualDelivery: "2026-05-30",
    status: "partial",
    invoiceNumber: "SYS-290471",
    notes: "Follow up with Mike Torrez re: lettuce credit by June 10.",
    lineItems: [
      { id: "li30", description: "Chicken Thighs Bone-In 40lb",   category: "protein", unit: "case", qtyOrdered: 10, qtyReceived: 7, unitCost: 72.00,
        shortageNote: "3 cases shorted — supplier allocation. Credit applied to next invoice." },
      { id: "li31", description: "Iceberg Lettuce 24ct case",     category: "produce", unit: "case", qtyOrdered:  6, qtyReceived: 0, unitCost: 28.50,
        shortageNote: "Full shortage — weather damage to crop. Romaine substituted. Credit issued." },
      { id: "li32", description: "Romaine Hearts 12ct case",      category: "produce", unit: "case", qtyOrdered:  0, qtyReceived: 4, unitCost: 24.00 },
      { id: "li33", description: "Pork Loin Boneless 10lb pkg",   category: "protein", unit: "case", qtyOrdered:  4, qtyReceived: 4, unitCost: 61.30 },
      { id: "li34", description: "Heavy Cream 1qt 12ct",          category: "dairy",   unit: "case", qtyOrdered:  3, qtyReceived: 3, unitCost: 44.80 },
    ],
  },
  {
    id: "PO-2026-036",
    vendorId: "v002",
    vendorName: "Gordon Food Svc",
    orderDate: "2026-05-30",
    expectedDelivery: "2026-06-02",
    actualDelivery: "2026-06-02",
    status: "delivered",
    invoiceNumber: "GFS-88234",
    lineItems: [
      { id: "li40", description: "Canned Diced Tomatoes 28oz 12ct", category: "dry_goods", unit: "case", qtyOrdered: 6, qtyReceived: 6, unitCost: 31.20 },
      { id: "li41", description: "Dry Penne Pasta 20lb bag",         category: "dry_goods", unit: "bag",  qtyOrdered: 4, qtyReceived: 4, unitCost: 22.50 },
      { id: "li42", description: "Long-Grain White Rice 50lb bag",   category: "dry_goods", unit: "bag",  qtyOrdered: 3, qtyReceived: 3, unitCost: 38.75 },
      { id: "li43", description: "All-Purpose Flour 50lb bag",       category: "dry_goods", unit: "bag",  qtyOrdered: 2, qtyReceived: 2, unitCost: 29.40 },
      { id: "li44", description: "Granulated Sugar 50lb bag",        category: "dry_goods", unit: "bag",  qtyOrdered: 2, qtyReceived: 2, unitCost: 32.00 },
      { id: "li45", description: "Canola Oil 35lb jug",              category: "dry_goods", unit: "jug",  qtyOrdered: 2, qtyReceived: 2, unitCost: 41.60 },
    ],
  },
];

// ── Par level inventory ───────────────────────────────────────────────────────

export const PAR_ITEMS: ParItem[] = [
  { id: "par01", description: "Chicken Breast IQF 40lb",  category: "protein",     unit: "case",      parLevel: 15, onHand:  3, reorderQty: 12, vendorId: "v001", vendorName: "Sysco Foods"      },
  { id: "par02", description: "Fresh Lettuce (Romaine)",  category: "produce",     unit: "case",      parLevel: 10, onHand:  2, reorderQty: 10, vendorId: "v001", vendorName: "Sysco Foods"      },
  { id: "par03", description: "Whole Milk 1gal",          category: "dairy",       unit: "case (6)",  parLevel: 20, onHand:  8, reorderQty: 15, vendorId: "v001", vendorName: "Sysco Foods"      },
  { id: "par04", description: "Large Eggs Grade A",       category: "dairy",       unit: "case",      parLevel:  8, onHand:  3, reorderQty:  6, vendorId: "v001", vendorName: "Sysco Foods"      },
  { id: "par05", description: "Ensure Plus 24ct Case",    category: "supplements", unit: "case",      parLevel: 12, onHand:  4, reorderQty:  8, vendorId: "v003", vendorName: "Abbott Nutrition" },
  { id: "par06", description: "Thick-It Original 10oz",  category: "supplements", unit: "jar",       parLevel: 12, onHand:  9, reorderQty:  6, vendorId: "v003", vendorName: "Abbott Nutrition" },
  { id: "par07", description: "Sliced White Bread",       category: "bakery",      unit: "loaf",      parLevel: 20, onHand: 14, reorderQty: 18, vendorId: "v004", vendorName: "Village Bakery"   },
  { id: "par08", description: "Long-Grain Rice 50lb bag", category: "dry_goods",   unit: "bag",       parLevel:  5, onHand:  4, reorderQty:  3, vendorId: "v002", vendorName: "Gordon Food Svc"  },
  { id: "par09", description: "Ground Beef 80/20",        category: "protein",     unit: "case",      parLevel:  8, onHand:  6, reorderQty:  6, vendorId: "v001", vendorName: "Sysco Foods"      },
  { id: "par10", description: "Unsalted Butter 1lb",      category: "dairy",       unit: "case (30)", parLevel:  8, onHand:  7, reorderQty:  6, vendorId: "v001", vendorName: "Sysco Foods"      },
];
