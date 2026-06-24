export interface PLLineItem {
  id: string;
  label: string;
  indent?: boolean;
  isSectionHeader?: boolean;
  isSubtotal?: boolean;
  isTotal?: boolean;
  currentMonth: number;
  priorMonth: number;
  ytd: number;
  budget?: number;
}

export interface MonthlySnapshot {
  month: string;
  revenue: number;
  expenses: number;
  net: number;
}

export interface DeptExpense {
  dept: string;
  actual: number;
  budget: number;
}

export interface ARBucket {
  range: string;
  days: string;
  count: number;
  amount: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  payee: string;
  account: string;
  type: "income" | "expense";
  amount: number;
}

export const FINANCES_MONTH = "June 2026";
export const CASH_ON_HAND = 284600;
export const QB_LAST_SYNCED = "2026-06-06T08:14:00";

export const PL_ITEMS: PLLineItem[] = [
  { id: "rev_header", label: "REVENUE", isSectionHeader: true, currentMonth: 0, priorMonth: 0, ytd: 0 },
  { id: "rev_al", label: "Room & Board — Assisted Living", indent: true, currentMonth: 180000, priorMonth: 176400, ytd: 1047600, budget: 178000 },
  { id: "rev_mc", label: "Room & Board — Memory Care", indent: true, currentMonth: 126000, priorMonth: 118800, ytd: 723600, budget: 122400 },
  { id: "rev_il", label: "Room & Board — Independent Living", indent: true, currentMonth: 38400, priorMonth: 38400, ytd: 230400, budget: 38400 },
  { id: "rev_fees", label: "Community & Move-In Fees", indent: true, currentMonth: 10500, priorMonth: 7000, ytd: 49000, budget: 8000 },
  { id: "rev_ancillary", label: "Ancillary Services", indent: true, currentMonth: 8750, priorMonth: 7920, ytd: 49200, budget: 8500 },
  { id: "rev_total", label: "Total Revenue", isSubtotal: true, currentMonth: 363650, priorMonth: 348520, ytd: 2099800, budget: 355300 },

  { id: "labor_header", label: "LABOR EXPENSES", isSectionHeader: true, currentMonth: 0, priorMonth: 0, ytd: 0 },
  { id: "exp_nursing", label: "Nursing & Care Staff", indent: true, currentMonth: 145200, priorMonth: 141800, ytd: 856200, budget: 143000 },
  { id: "exp_dietary_staff", label: "Dietary Staff", indent: true, currentMonth: 28400, priorMonth: 27600, ytd: 166800, budget: 28000 },
  { id: "exp_housekeeping", label: "Housekeeping", indent: true, currentMonth: 18600, priorMonth: 18200, ytd: 109200, budget: 18500 },
  { id: "exp_maint_staff", label: "Maintenance Staff", indent: true, currentMonth: 12800, priorMonth: 12800, ytd: 76800, budget: 13000 },
  { id: "exp_admin", label: "Administration", indent: true, currentMonth: 22500, priorMonth: 22500, ytd: 135000, budget: 22500 },
  { id: "exp_sales", label: "Sales & Marketing", indent: true, currentMonth: 14200, priorMonth: 13800, ytd: 83400, budget: 14000 },
  { id: "labor_total", label: "Total Labor", isSubtotal: true, currentMonth: 241700, priorMonth: 236700, ytd: 1427400, budget: 239000 },

  { id: "ops_header", label: "OPERATING EXPENSES", isSectionHeader: true, currentMonth: 0, priorMonth: 0, ytd: 0 },
  { id: "exp_food", label: "Food & Dietary Supplies", indent: true, currentMonth: 31200, priorMonth: 30400, ytd: 183600, budget: 30000 },
  { id: "exp_medical", label: "Medical Supplies", indent: true, currentMonth: 8400, priorMonth: 7800, ytd: 47400, budget: 8000 },
  { id: "exp_utilities", label: "Utilities", indent: true, currentMonth: 12800, priorMonth: 13200, ytd: 77400, budget: 13000 },
  { id: "exp_insurance", label: "Insurance", indent: true, currentMonth: 9200, priorMonth: 9200, ytd: 55200, budget: 9200 },
  { id: "exp_maint_ops", label: "Maintenance & Repairs", indent: true, currentMonth: 6800, priorMonth: 5400, ytd: 38600, budget: 6500 },
  { id: "exp_admin_supplies", label: "Administrative Supplies", indent: true, currentMonth: 4100, priorMonth: 3900, ytd: 23400, budget: 4000 },
  { id: "ops_total", label: "Total Operating Expenses", isSubtotal: true, currentMonth: 72500, priorMonth: 69900, ytd: 425600, budget: 70700 },

  { id: "exp_total", label: "Total Expenses", isTotal: true, currentMonth: 314200, priorMonth: 306600, ytd: 1853000, budget: 309700 },
  { id: "net_income", label: "Net Income", isTotal: true, currentMonth: 49450, priorMonth: 41920, ytd: 246800, budget: 45600 },
];

export const MONTHLY_TREND: MonthlySnapshot[] = [
  { month: "Jan", revenue: 341200, expenses: 299800, net: 41400 },
  { month: "Feb", revenue: 338600, expenses: 297400, net: 41200 },
  { month: "Mar", revenue: 344800, expenses: 301200, net: 43600 },
  { month: "Apr", revenue: 351400, expenses: 305800, net: 45600 },
  { month: "May", revenue: 348520, expenses: 306600, net: 41920 },
  { month: "Jun", revenue: 363650, expenses: 314200, net: 49450 },
];

export const DEPT_EXPENSES: DeptExpense[] = [
  { dept: "Nursing & Care", actual: 145200, budget: 143000 },
  { dept: "Dietary (Staff + Supplies)", actual: 59600, budget: 58000 },
  { dept: "Housekeeping", actual: 18600, budget: 18500 },
  { dept: "Maintenance", actual: 19600, budget: 19500 },
  { dept: "Administration", actual: 26600, budget: 26500 },
  { dept: "Sales & Marketing", actual: 14200, budget: 14000 },
  { dept: "Utilities & Insurance", actual: 22000, budget: 22200 },
  { dept: "Medical Supplies", actual: 8400, budget: 8000 },
];

export const AR_AGING: ARBucket[] = [
  { range: "Current", days: "0–30 days", count: 48, amount: 298400 },
  { range: "31–60 days", days: "31–60 days", count: 7, amount: 43750 },
  { range: "61–90 days", days: "61–90 days", count: 3, amount: 18900 },
  { range: "90+ days", days: "Over 90 days", count: 2, amount: 12600 },
];

export const RECENT_TRANSACTIONS: Transaction[] = [
  { id: "t001", date: "2026-06-06", description: "Monthly statement — Johnson, Robert", payee: "Robert Johnson", account: "Accounts Receivable", type: "income", amount: 5800 },
  { id: "t002", date: "2026-06-05", description: "Payroll — Nursing & Care (biweekly)", payee: "ADP Payroll", account: "Nursing Labor", type: "expense", amount: 72600 },
  { id: "t003", date: "2026-06-05", description: "Monthly statement — Martinez, Elena", payee: "Elena Martinez", account: "Accounts Receivable", type: "income", amount: 7200 },
  { id: "t004", date: "2026-06-04", description: "Food & Beverage Supply — Sysco", payee: "Sysco Supply Co.", account: "Dietary Supplies", type: "expense", amount: 8400 },
  { id: "t005", date: "2026-06-04", description: "Monthly statement — Chen, James", payee: "James Chen", account: "Accounts Receivable", type: "income", amount: 5800 },
  { id: "t006", date: "2026-06-03", description: "Electric & Gas — Mountain Power Co.", payee: "Mountain Power Co.", account: "Utilities", type: "expense", amount: 4280 },
  { id: "t007", date: "2026-06-03", description: "Monthly statement — Thompson, Barbara", payee: "Barbara Thompson", account: "Accounts Receivable", type: "income", amount: 7200 },
  { id: "t008", date: "2026-06-02", description: "Medical Supplies — Cardinal Health", payee: "Cardinal Health", account: "Medical Supplies", type: "expense", amount: 2840 },
  { id: "t009", date: "2026-06-02", description: "Community fee — Collins, Margaret", payee: "Margaret Collins", account: "Move-In Fees", type: "income", amount: 3500 },
  { id: "t010", date: "2026-06-01", description: "General Liability Insurance — Hartford", payee: "Hartford Group", account: "Insurance", type: "expense", amount: 9200 },
  { id: "t011", date: "2026-06-01", description: "Monthly statement — Garcia, Maria", payee: "Maria Garcia", account: "Accounts Receivable", type: "income", amount: 5400 },
  { id: "t012", date: "2026-05-31", description: "HVAC Repair — Elite Mechanical", payee: "Elite Mechanical", account: "Maintenance & Repairs", type: "expense", amount: 1840 },
  { id: "t013", date: "2026-05-31", description: "Laundry & Cleaning Supplies — Ecolab", payee: "Ecolab", account: "Housekeeping Supplies", type: "expense", amount: 1240 },
  { id: "t014", date: "2026-05-30", description: "Monthly statement — Wilson, Dorothy", payee: "Dorothy Wilson", account: "Accounts Receivable", type: "income", amount: 6800 },
  { id: "t015", date: "2026-05-30", description: "Payroll — All Departments (biweekly)", payee: "ADP Payroll", account: "Labor", type: "expense", amount: 68400 },
];
