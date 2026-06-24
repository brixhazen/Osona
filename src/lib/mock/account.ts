export const ACCOUNT = {
  org: "Sunrise Senior Living Group",
  plan: "Professional",
  price: 299,
  interval: "month" as const,
  communities: 3,
  seats: 50,
  seatsUsed: 18,
  nextBillingDate: "2026-07-01",
  memberSince: "Sep 2024",
  adminName: "Dana Alvarez",
  adminEmail: "dana@sunriseseniorliving.com",
  timezone: "America/Denver (MST)",
};

export const PAYMENT_METHOD = {
  brand: "Visa",
  last4: "4242",
  expMonth: 8,
  expYear: 2028,
};

export interface SubscriptionInvoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "open";
}

export const SUBSCRIPTION_INVOICES: SubscriptionInvoice[] = [
  { id: "sinv_001", date: "2026-06-01", description: "Haven OS Professional · 3 communities", amount: 897, status: "paid" },
  { id: "sinv_002", date: "2026-05-01", description: "Haven OS Professional · 3 communities", amount: 897, status: "paid" },
  { id: "sinv_003", date: "2026-04-01", description: "Haven OS Professional · 3 communities", amount: 897, status: "paid" },
  { id: "sinv_004", date: "2026-03-01", description: "Haven OS Professional · 3 communities", amount: 897, status: "paid" },
  { id: "sinv_005", date: "2026-02-01", description: "Haven OS Professional · 3 communities", amount: 897, status: "paid" },
  { id: "sinv_006", date: "2026-01-01", description: "Haven OS Professional · 3 communities", amount: 897, status: "paid" },
];

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  access: string;
  avatar: string;
  status: "active" | "invited";
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "u1", name: "Dana Alvarez",  email: "dana@sunriseseniorliving.com",    role: "Admin",              access: "All Communities",          avatar: "DA", status: "active" },
  { id: "u2", name: "Alice Monroe",  email: "alice@sunriseseniorliving.com",   role: "Care Manager",       access: "Sunrise Gardens",          avatar: "AM", status: "active" },
  { id: "u3", name: "Brandon Lee",   email: "brandon@sunriseseniorliving.com", role: "Billing Coordinator",access: "All Communities",          avatar: "BL", status: "active" },
  { id: "u4", name: "Carmen Diaz",   email: "carmen@sunriseseniorliving.com",  role: "Activities Director",access: "Pinecrest Memory Care",     avatar: "CD", status: "active" },
  { id: "u5", name: "Devon Park",    email: "devon@sunriseseniorliving.com",   role: "Director of Nursing",access: "Sunrise Gardens",          avatar: "DP", status: "active" },
  { id: "u6", name: "Elena Ruiz",    email: "elena@sunriseseniorliving.com",   role: "Sales Director",     access: "All Communities",          avatar: "ER", status: "active" },
  { id: "u7", name: "Marcus Webb",   email: "marcus@sunriseseniorliving.com",  role: "Care Manager",       access: "River Pines Assisted Living",avatar: "MW", status: "invited" },
];
