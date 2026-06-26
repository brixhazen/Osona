import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Stethoscope, ClipboardList, ClipboardCheck,
  Pill, HeartHandshake, Users, DollarSign, Landmark, ShieldCheck,
  CalendarDays, UtensilsCrossed, Wrench, AlertTriangle, GraduationCap, BarChart3,
} from "lucide-react";

export interface SectionTab {
  id: string;
  label: string;
}

export interface SectionDef {
  path: string;
  label: string;
  icon: LucideIcon;
  defaultTab: string;
  tabs: SectionTab[];
  category?: "Resident Care" | "Business" | "Operations" | "Quality / Learning";
  routeBased?: boolean;
}

export const SECTIONS: SectionDef[] = [
  { path: "/",              label: "Dashboard",     icon: LayoutDashboard, defaultTab: "overview",
    tabs: [{ id: "overview", label: "Overview" }] },

  { path: "/residents",     label: "Residents",     icon: Users,           defaultTab: "roster",
    category: "Resident Care",
    routeBased: true,
    tabs: [
      { id: "roster",      label: "Roster" },
      { id: "profiles",    label: "Profiles" },
      { id: "admissions",  label: "Admissions" },
    ] },

  { path: "/clinical",      label: "Clinical",      icon: Stethoscope,     defaultTab: "charts",
    category: "Resident Care",
    tabs: [{ id: "charts", label: "Charts" }] },

  { path: "/crm",           label: "CRM / Sales",   icon: ClipboardList,   defaultTab: "pipeline",
    category: "Business",
    tabs: [
      { id: "pipeline",    label: "Pipeline" },
      { id: "leads",       label: "Leads" },
      { id: "activities",  label: "Activities" },
      { id: "referrals",   label: "Referral Sources" },
      { id: "reports",     label: "Reports" },
    ] },

  { path: "/care-plans",    label: "Care Plans",    icon: ClipboardCheck,  defaultTab: "builder",
    category: "Resident Care",
    tabs: [
      { id: "builder",   label: "Plan Builder" },
      { id: "schedule",  label: "Review Schedule" },
      { id: "tracker",   label: "Active Problems" },
      { id: "templates", label: "Templates" },
    ] },

  { path: "/emar",          label: "eMAR",          icon: Pill,            defaultTab: "overview",
    category: "Resident Care",
    tabs: [
      { id: "overview",    label: "Overview" },
      { id: "pass",        label: "Med Pass" },
      { id: "orders",      label: "Orders" },
      { id: "prn",         label: "PRN Log" },
      { id: "exceptions",  label: "Exceptions" },
    ] },

  { path: "/family-portal", label: "Family Portal", icon: HeartHandshake,  defaultTab: "overview",
    category: "Resident Care",
    tabs: [
      { id: "overview",    label: "Overview" },
      { id: "updates",     label: "Updates" },
      { id: "messages",    label: "Messages" },
      { id: "billing",     label: "Billing" },
      { id: "documents",   label: "Documents" },
    ] },

  { path: "/workforce",     label: "Workforce",     icon: Users,           defaultTab: "today",
    category: "Business",
    tabs: [
      { id: "today",       label: "Today" },
      { id: "schedule",    label: "Schedule" },
      { id: "staff",       label: "Staff" },
      { id: "timeclock",   label: "Time Clock" },
      { id: "credentials", label: "Credentials" },
    ] },

  { path: "/billing",       label: "Billing",       icon: DollarSign,      defaultTab: "overview",
    category: "Business",
    tabs: [
      { id: "overview",   label: "Overview" },
      { id: "residents",  label: "Residents" },
      { id: "rate-cards", label: "Rate Cards" },
      { id: "approvals",  label: "Approvals" },
      { id: "statements", label: "Statements" },
      { id: "payments",   label: "Payments" },
      { id: "ar",         label: "A/R" },
      { id: "reports",    label: "Reports" },
    ] },

  { path: "/finances",      label: "Finances",      icon: Landmark,        defaultTab: "overview",
    category: "Business",
    tabs: [
      { id: "overview",    label: "Overview" },
      { id: "ledger",      label: "Ledger" },
      { id: "payables",    label: "Payables" },
      { id: "payroll",     label: "Payroll" },
      { id: "reports",     label: "Reports" },
    ] },

  { path: "/compliance",    label: "Compliance",    icon: ShieldCheck,     defaultTab: "overview",
    category: "Operations",
    tabs: [
      { id: "overview",    label: "Overview" },
      { id: "policies",    label: "Policies" },
      { id: "audits",      label: "Audits" },
      { id: "incidents",   label: "Incidents" },
      { id: "training",    label: "Training" },
    ] },

  { path: "/activities",    label: "Activities",    icon: CalendarDays,    defaultTab: "calendar",
    category: "Operations",
    tabs: [
      { id: "calendar",    label: "Calendar" },
      { id: "programs",    label: "Programs" },
      { id: "attendance",  label: "Attendance" },
      { id: "outings",     label: "Outings" },
      { id: "engagement",  label: "Engagement" },
    ] },

  { path: "/dining",        label: "Dining",        icon: UtensilsCrossed, defaultTab: "overview",
    category: "Operations",
    tabs: [
      { id: "overview",    label: "Overview" },
      { id: "menus",       label: "Menus" },
      { id: "preferences", label: "Preferences" },
      { id: "service",     label: "Meal Service" },
      { id: "inventory",   label: "Inventory" },
    ] },

  { path: "/maintenance",   label: "Maintenance",   icon: Wrench,          defaultTab: "overview",
    category: "Operations",
    tabs: [
      { id: "overview",    label: "Overview" },
      { id: "work-orders", label: "Work Orders" },
      { id: "preventive",  label: "Preventive" },
      { id: "assets",      label: "Assets" },
      { id: "vendors",     label: "Vendors" },
    ] },

  { path: "/safety",        label: "Safety",        icon: AlertTriangle,   defaultTab: "incidents",
    category: "Operations",
    tabs: [
      { id: "incidents",   label: "Incident Log" },
      { id: "falls",       label: "Falls" },
      { id: "drills",      label: "Drills" },
      { id: "hazards",     label: "Hazards" },
      { id: "reports",     label: "Reports" },
    ] },

  { path: "/training",      label: "Training",      icon: GraduationCap,   defaultTab: "overview",
    category: "Quality / Learning",
    tabs: [
      { id: "overview",    label: "Overview" },
      { id: "courses",     label: "Courses" },
      { id: "assignments", label: "Assignments" },
      { id: "certs",       label: "Certifications" },
      { id: "compliance",  label: "Compliance" },
    ] },

  { path: "/analytics",     label: "Analytics",     icon: BarChart3,       defaultTab: "overview",
    category: "Quality / Learning",
    tabs: [
      { id: "overview",    label: "Overview" },
      { id: "occupancy",   label: "Occupancy" },
      { id: "clinical",    label: "Clinical" },
      { id: "financial",   label: "Financial" },
      { id: "workforce",   label: "Workforce" },
    ] },
];

export function findSection(pathname: string): SectionDef | null {
  if (pathname === "/") return SECTIONS[0];
  const candidates = SECTIONS.filter((s) => s.path !== "/" && pathname.startsWith(s.path));
  return candidates.sort((a, b) => b.path.length - a.path.length)[0] ?? null;
}
