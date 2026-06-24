// ── Types ─────────────────────────────────────────────────────────────────────

export type PermissionLevel = "full" | "view" | "none";

export type ModuleKey =
  | "dashboard" | "emar" | "crm" | "billing" | "dining"
  | "compliance" | "clinical" | "workforce" | "engagement"
  | "finances" | "maintenance" | "training";

export type ModulePermissions = Record<ModuleKey, PermissionLevel>;

export interface Role {
  id: string;
  name: string;
  color: string;
  description: string;
  permissions: ModulePermissions;
  isCustom?: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  roleId: string;
  avatar: string;
  status: "active" | "invited" | "inactive";
  customPermissions?: ModulePermissions;
}

// ── Module metadata ───────────────────────────────────────────────────────────

export const MODULE_META: { key: ModuleKey; label: string; path: string }[] = [
  { key: "dashboard",   label: "Dashboard",           path: "/" },
  { key: "emar",        label: "eMAR",                path: "/emar" },
  { key: "crm",         label: "CRM / Sales",         path: "/crm" },
  { key: "billing",     label: "Billing",             path: "/billing" },
  { key: "dining",      label: "Dining & Nutrition",  path: "/dining" },
  { key: "compliance",  label: "Compliance",          path: "/compliance" },
  { key: "clinical",    label: "Clinical",            path: "/clinical" },
  { key: "workforce",   label: "Workforce",           path: "/workforce" },
  { key: "engagement",  label: "Engagement",          path: "/engagement" },
  { key: "finances",    label: "Finances",            path: "/finances" },
  { key: "maintenance", label: "Maintenance",         path: "/maintenance" },
  { key: "training",    label: "Training",            path: "/training" },
];

// ── Helper ────────────────────────────────────────────────────────────────────

function allFull(): ModulePermissions {
  return Object.fromEntries(MODULE_META.map((m) => [m.key, "full"])) as ModulePermissions;
}

function allNone(): ModulePermissions {
  return Object.fromEntries(MODULE_META.map((m) => [m.key, "none"])) as ModulePermissions;
}

function build(overrides: Partial<ModulePermissions>): ModulePermissions {
  return { ...allNone(), ...overrides };
}

// ── Roles ─────────────────────────────────────────────────────────────────────

export const ROLES: Role[] = [
  {
    id: "admin",
    name: "Administrator",
    color: "#8B5CF6",
    description: "Full access to all modules across the community.",
    permissions: allFull(),
  },
  {
    id: "don",
    name: "Director of Nursing",
    color: "#2BBFAA",
    description: "Clinical oversight, eMAR, compliance, and staffing.",
    permissions: build({
      dashboard: "view",
      emar: "full",
      clinical: "full",
      compliance: "full",
      dining: "full",
      workforce: "full",
      engagement: "view",
      maintenance: "view",
      training: "view",
    }),
  },
  {
    id: "charge_nurse",
    name: "Charge Nurse / LPN",
    color: "#60A5FA",
    description: "eMAR administration, clinical notes, and resident monitoring.",
    permissions: build({
      emar: "full",
      clinical: "full",
      dining: "view",
      compliance: "view",
      engagement: "view",
      training: "view",
    }),
  },
  {
    id: "cna",
    name: "CNA / Med Tech",
    color: "#34D399",
    description: "eMAR administration and basic resident care documentation.",
    permissions: build({
      emar: "full",
      dining: "view",
      clinical: "view",
      training: "view",
    }),
  },
  {
    id: "dietary",
    name: "Dietary Manager",
    color: "#FB923C",
    description: "Full access to dining operations and related compliance.",
    permissions: build({
      dining: "full",
      compliance: "view",
      training: "view",
    }),
  },
  {
    id: "activities",
    name: "Activities Director",
    color: "#F472B6",
    description: "Resident engagement, activity planning, and programming.",
    permissions: build({
      engagement: "full",
      dashboard: "view",
      clinical: "view",
      training: "view",
    }),
  },
  {
    id: "maintenance",
    name: "Maintenance",
    color: "#94A3B8",
    description: "Facility maintenance, work orders, and safety inspections.",
    permissions: build({
      maintenance: "full",
      training: "view",
    }),
  },
  {
    id: "business_office",
    name: "Business Office",
    color: "#F59E0B",
    description: "Billing, accounts receivable, CRM, and financial reporting.",
    permissions: build({
      billing: "full",
      finances: "full",
      crm: "full",
      dashboard: "view",
      training: "view",
    }),
  },
  {
    id: "social_services",
    name: "Social Services",
    color: "#A78BFA",
    description: "Resident intake, care coordination, and family communication.",
    permissions: build({
      crm: "full",
      clinical: "view",
      compliance: "view",
      engagement: "view",
      training: "view",
    }),
  },
];

// ── Staff ─────────────────────────────────────────────────────────────────────

export const STAFF_MEMBERS: StaffMember[] = [
  // Management
  { id: "s001", name: "Dana Alvarez",    email: "dana@sunriseseniorliving.com",    roleId: "admin",          avatar: "DA", status: "active" },
  { id: "s002", name: "Devon Park",      email: "devon@sunriseseniorliving.com",   roleId: "don",            avatar: "DP", status: "active" },
  { id: "s003", name: "Elena Ruiz",      email: "elena@sunriseseniorliving.com",   roleId: "business_office", avatar: "ER", status: "active" },
  { id: "s004", name: "Carmen Diaz",     email: "carmen@sunriseseniorliving.com",  roleId: "activities",     avatar: "CD", status: "active" },
  { id: "s005", name: "Alice Monroe",    email: "alice@sunriseseniorliving.com",   roleId: "social_services", avatar: "AM", status: "active" },
  { id: "s006", name: "Brandon Lee",     email: "brandon@sunriseseniorliving.com", roleId: "business_office", avatar: "BL", status: "active" },
  // Clinical
  { id: "s007", name: "Angela Chen",     email: "a.chen@sunriseseniorliving.com",  roleId: "charge_nurse",   avatar: "AC", status: "active" },
  { id: "s008", name: "Sanjay Patel",    email: "s.patel@sunriseseniorliving.com", roleId: "charge_nurse",   avatar: "SP", status: "active" },
  { id: "s009", name: "James Rivera",    email: "j.rivera@sunriseseniorliving.com",roleId: "cna",            avatar: "JR", status: "active" },
  { id: "s010", name: "Maria Torres",    email: "m.torres@sunriseseniorliving.com",roleId: "cna",            avatar: "MT", status: "active" },
  { id: "s011", name: "Kevin Williams",  email: "k.williams@sunriseseniorliving.com", roleId: "cna",         avatar: "KW", status: "active" },
  { id: "s012", name: "Marcus Webb",     email: "m.webb@sunriseseniorliving.com",  roleId: "charge_nurse",   avatar: "MW", status: "invited" },
  // Dietary / Maintenance
  { id: "s013", name: "Rosa Gutierrez",  email: "r.gutierrez@sunriseseniorliving.com", roleId: "dietary",   avatar: "RG", status: "active" },
  { id: "s014", name: "Tom Briggs",      email: "t.briggs@sunriseseniorliving.com",    roleId: "maintenance", avatar: "TB", status: "active" },
];
