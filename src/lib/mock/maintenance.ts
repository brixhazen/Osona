// ─── Types ───────────────────────────────────────────────────────────────────

export type WorkOrderPriority = "emergency" | "urgent" | "standard" | "scheduled";
export type WorkOrderStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "parts_ordered"
  | "vendor_called"
  | "completed"
  | "scheduled";
export type WorkOrderCategory =
  | "plumbing"
  | "electrical"
  | "hvac"
  | "appliances"
  | "carpentry"
  | "painting"
  | "grounds"
  | "safety"
  | "technology"
  | "elevator"
  | "roof";

export type PMFrequency = "monthly" | "quarterly" | "annual";
export type PMStatus = "current" | "due_soon" | "overdue";
export type AssetCategory =
  | "elevator"
  | "hvac"
  | "kitchen"
  | "laundry"
  | "generator"
  | "plumbing"
  | "roof"
  | "safety";

export interface WorkOrder {
  id: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  category: WorkOrderCategory;
  title: string;
  location: string;
  description: string;
  reportedBy: string;
  reportedDate: string;
  assignedTo: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  completedDate: string | null;
  residentRoom: string | null;
  residentName: string | null;
  safetyFlag: boolean;
  vendorId: string | null;
  notes: string | null;
}

export interface PMTask {
  id: string;
  title: string;
  category: WorkOrderCategory;
  frequency: PMFrequency;
  lastCompleted: string;
  nextDue: string;
  daysUntilDue: number;
  status: PMStatus;
  assignedTo: string;
  estimatedHours: number;
  regulatoryRequired: boolean;
  notes: string | null;
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  location: string;
  age: number;
  warrantyExpiry: string | null;
  warrantyActive: boolean;
  lastServiceDate: string;
  nextServiceDate: string;
  serviceStatus: PMStatus;
  linkedWorkOrderId: string | null;
  vendor: string | null;
  serialNumber: string | null;
  notes: string | null;
}

export interface Vendor {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  contractType: string;
  categories: WorkOrderCategory[];
  lastUsed: string;
  actionNeeded: boolean;
  actionNote: string | null;
  notes: string | null;
}

export interface BudgetLine {
  category: string;
  amount: number;
}

// ─── Configs ──────────────────────────────────────────────────────────────────

export const PRIORITY_CONFIG: Record<WorkOrderPriority, { label: string; color: string; dot: string; border: string }> = {
  emergency: { label: "Emergency", color: "bg-destructive/15 text-destructive border-destructive/30",      dot: "bg-destructive",         border: "border-l-destructive" },
  urgent:    { label: "Urgent",    color: "bg-accent/15 text-accent border-accent/30",                     dot: "bg-accent",              border: "border-l-accent" },
  standard:  { label: "Standard",  color: "bg-secondary text-muted-foreground border-border",              dot: "bg-muted-foreground",    border: "border-l-transparent" },
  scheduled: { label: "Scheduled", color: "bg-primary/10 text-primary border-primary/20",                 dot: "bg-primary",             border: "border-l-primary" },
};

export const STATUS_CONFIG: Record<WorkOrderStatus, { label: string; color: string }> = {
  open:          { label: "Open",           color: "bg-destructive/10 text-destructive border-destructive/20" },
  assigned:      { label: "Assigned",       color: "bg-accent/10 text-accent border-accent/20" },
  in_progress:   { label: "In Progress",    color: "bg-primary/10 text-primary border-primary/20" },
  parts_ordered: { label: "Parts Ordered",  color: "bg-purple-400/15 text-purple-300 border-purple-400/30" },
  vendor_called: { label: "Vendor Called",  color: "bg-indigo-400/15 text-indigo-300 border-indigo-400/30" },
  completed:     { label: "Completed",      color: "bg-success/10 text-success border-success/20" },
  scheduled:     { label: "Scheduled",      color: "bg-primary/10 text-primary border-primary/20" },
};

export const CATEGORY_CONFIG: Record<WorkOrderCategory, { label: string; abbr: string }> = {
  plumbing:   { label: "Plumbing",    abbr: "PLM" },
  electrical: { label: "Electrical",  abbr: "ELC" },
  hvac:       { label: "HVAC",        abbr: "HVAC" },
  appliances: { label: "Appliances",  abbr: "APP" },
  carpentry:  { label: "Carpentry",   abbr: "CARP" },
  painting:   { label: "Painting",    abbr: "PAINT" },
  grounds:    { label: "Grounds",     abbr: "GRD" },
  safety:     { label: "Safety",      abbr: "SFTY" },
  technology: { label: "Technology",  abbr: "TECH" },
  elevator:   { label: "Elevator",    abbr: "ELEV" },
  roof:       { label: "Roof",        abbr: "ROOF" },
};

export const PM_STATUS_CONFIG: Record<PMStatus, { label: string; color: string; border: string }> = {
  current:   { label: "Current",   color: "bg-success/10 text-success border-success/20",           border: "border-border" },
  due_soon:  { label: "Due Soon",  color: "bg-accent/10 text-accent border-accent/20",              border: "border-accent/30" },
  overdue:   { label: "Overdue",   color: "bg-destructive/10 text-destructive border-destructive/20", border: "border-destructive/40" },
};

export const WO_WORKFLOW_ORDER: Record<WorkOrderStatus, number> = {
  open: 0, assigned: 1, in_progress: 2, parts_ordered: 2, vendor_called: 2, completed: 3, scheduled: 0,
};

// ─── Work Orders ─────────────────────────────────────────────────────────────

export const WORK_ORDERS: WorkOrder[] = [
  {
    id: "WO-0214",
    priority: "emergency",
    status: "open",
    category: "safety",
    title: "Fire Door Latch Failure — MC Hallway",
    location: "Memory Care Hallway, Main Building",
    description: "Fire door between MC wing and main corridor is not latching properly. Door swings open freely. Immediate safety and code compliance concern.",
    reportedBy: "Carol Nguyen (Night Charge)",
    reportedDate: "2026-05-16",
    assignedTo: null,
    estimatedHours: 2,
    actualHours: null,
    completedDate: null,
    residentRoom: null,
    residentName: null,
    safetyFlag: true,
    vendorId: null,
    notes: "Door propped with a doorstop as temporary measure. Must be repaired or replaced today.",
  },
  {
    id: "WO-0213",
    priority: "emergency",
    status: "completed",
    category: "plumbing",
    title: "Water Leak — Kitchen Under-Sink",
    location: "Main Kitchen",
    description: "Active water leak under the main prep sink. Shut-off valve closed. Blue Ridge Plumbing dispatched for repair.",
    reportedBy: "Terry Walsh (Kitchen Staff)",
    reportedDate: "2026-05-15",
    assignedTo: "Blue Ridge Plumbing",
    estimatedHours: 3,
    actualHours: 2.5,
    completedDate: "2026-05-15",
    residentRoom: null,
    residentName: null,
    safetyFlag: false,
    vendorId: "V-003",
    notes: "P-trap and supply line replaced. All clear.",
  },
  {
    id: "WO-0212",
    priority: "urgent",
    status: "vendor_called",
    category: "elevator",
    title: "Elevator Intermittent Slow Response — Building A",
    location: "Main Elevator, Building A",
    description: "Elevator taking 45–60 seconds to respond to calls. Some residents have reported it stopping between floors momentarily. Mountain West Elevator contacted — technician scheduled for May 19.",
    reportedBy: "Lisa Ortega (CNA)",
    reportedDate: "2026-05-14",
    assignedTo: "Mountain West Elevator Co.",
    estimatedHours: 4,
    actualHours: null,
    completedDate: null,
    residentRoom: null,
    residentName: null,
    safetyFlag: true,
    vendorId: "V-001",
    notes: "Mountain West scheduled May 19. Elevator operational but monitoring daily.",
  },
  {
    id: "WO-0211",
    priority: "urgent",
    status: "completed",
    category: "hvac",
    title: "Thermostat Malfunction — Room E-118",
    location: "Room E-118 (Raymond Kowalski)",
    description: "Thermostat unresponsive. Room temperature reached 80°F. Replaced with new Honeywell T6 Pro thermostat.",
    reportedBy: "Raymond Kowalski (Resident)",
    reportedDate: "2026-05-14",
    assignedTo: "Dave Hensley (Maintenance)",
    estimatedHours: 1,
    actualHours: 0.75,
    completedDate: "2026-05-14",
    residentRoom: "E-118",
    residentName: "Raymond Kowalski",
    safetyFlag: false,
    vendorId: null,
    notes: "Replaced thermostat in-house. Resident satisfied.",
  },
  {
    id: "WO-0210",
    priority: "urgent",
    status: "in_progress",
    category: "safety",
    title: "Loose Handrail — East Wing Corridor Near E-114",
    location: "East Wing Hallway, near Room E-114",
    description: "Wall-mounted handrail has 1.5\" of lateral play. Margaret Olson (E-114) fell on May 14 near this section of hallway. Rail must be reanchored into studs with lag bolts.",
    reportedBy: "Director of Care (Incident Follow-Up)",
    reportedDate: "2026-05-13",
    assignedTo: "Dave Hensley (Maintenance)",
    estimatedHours: 2,
    actualHours: null,
    completedDate: null,
    residentRoom: "E-114",
    residentName: "Margaret Olson",
    safetyFlag: true,
    vendorId: null,
    notes: "Linked to Margaret Olson fall incident May 14. Repair in progress — hardware ordered.",
  },
  {
    id: "WO-0209",
    priority: "urgent",
    status: "in_progress",
    category: "plumbing",
    title: "Dripping Shower Head — Room MC-205",
    location: "Room MC-205 (Doris Lambert)",
    description: "Shower head dripping continuously. Cartridge replacement required. Resident has been notified.",
    reportedBy: "Doris Lambert (Resident Family)",
    reportedDate: "2026-05-12",
    assignedTo: "Dave Hensley (Maintenance)",
    estimatedHours: 1,
    actualHours: null,
    completedDate: null,
    residentRoom: "MC-205",
    residentName: "Doris Lambert",
    safetyFlag: false,
    vendorId: null,
    notes: "Moen cartridge on order — ETA May 17.",
  },
  {
    id: "WO-0208",
    priority: "standard",
    status: "open",
    category: "electrical",
    title: "Overhead Light Out — Room W-310",
    location: "Room W-310 (Charles Wells)",
    description: "Overhead ceiling light fixture not working. Likely bulb or ballast failure.",
    reportedBy: "Charles Wells (Resident)",
    reportedDate: "2026-05-12",
    assignedTo: null,
    estimatedHours: 0.5,
    actualHours: null,
    completedDate: null,
    residentRoom: "W-310",
    residentName: "Charles Wells",
    safetyFlag: false,
    vendorId: null,
    notes: null,
  },
  {
    id: "WO-0207",
    priority: "standard",
    status: "completed",
    category: "carpentry",
    title: "Closet Door Off Track — Room E-102",
    location: "Room E-102 (Dorothy Hayes)",
    description: "Bi-fold closet door jumped the bottom track. Rehung and track reinforced.",
    reportedBy: "Dorothy Hayes (Resident)",
    reportedDate: "2026-05-11",
    assignedTo: "Dave Hensley (Maintenance)",
    estimatedHours: 0.5,
    actualHours: 0.5,
    completedDate: "2026-05-11",
    residentRoom: "E-102",
    residentName: "Dorothy Hayes",
    safetyFlag: false,
    vendorId: null,
    notes: "Track clip replaced. Resident satisfied.",
  },
  {
    id: "WO-0206",
    priority: "standard",
    status: "completed",
    category: "technology",
    title: "TV Remote Unresponsive — Room W-108",
    location: "Room W-108 (Eleanor Bradford)",
    description: "TV remote batteries replaced and remote programmed. Resident demonstrated operation.",
    reportedBy: "Eleanor Bradford (Resident)",
    reportedDate: "2026-05-10",
    assignedTo: "Dave Hensley (Maintenance)",
    estimatedHours: 0.25,
    actualHours: 0.25,
    completedDate: "2026-05-10",
    residentRoom: "W-108",
    residentName: "Eleanor Bradford",
    safetyFlag: false,
    vendorId: null,
    notes: null,
  },
  {
    id: "WO-0205",
    priority: "standard",
    status: "open",
    category: "painting",
    title: "Wall Scuffs & Touch-Up — Dining Room",
    location: "Main Dining Room",
    description: "Multiple scuff marks and minor dents along the south wall. Schedule touch-up paint during off-hours.",
    reportedBy: "Activity Director",
    reportedDate: "2026-05-09",
    assignedTo: null,
    estimatedHours: 2,
    actualHours: null,
    completedDate: null,
    residentRoom: null,
    residentName: null,
    safetyFlag: false,
    vendorId: null,
    notes: "Eggshell match on file — paint code SW7013.",
  },
  {
    id: "WO-0204",
    priority: "standard",
    status: "open",
    category: "grounds",
    title: "West Patio Bench — Paint & Touch-Up",
    location: "West Patio",
    description: "Two outdoor benches showing rust spots and faded paint. Wire brush, prime, and repaint with weather-resistant enamel.",
    reportedBy: "Dave Hensley (Maintenance)",
    reportedDate: "2026-05-08",
    assignedTo: null,
    estimatedHours: 3,
    actualHours: null,
    completedDate: null,
    residentRoom: null,
    residentName: null,
    safetyFlag: false,
    vendorId: null,
    notes: "Schedule for dry weather window.",
  },
  {
    id: "WO-0203",
    priority: "standard",
    status: "in_progress",
    category: "plumbing",
    title: "Stained Ceiling Tile — East Hallway",
    location: "East Wing Hallway, between E-108 and E-110",
    description: "Water stain on ceiling tile, possibly from 2nd floor bathroom above. Leak source investigated — supply line above had slow seep. Repaired; tile replacement pending.",
    reportedBy: "Lisa Ortega (CNA)",
    reportedDate: "2026-05-07",
    assignedTo: "Dave Hensley (Maintenance)",
    estimatedHours: 3,
    actualHours: 1.5,
    completedDate: null,
    residentRoom: null,
    residentName: null,
    safetyFlag: false,
    vendorId: null,
    notes: "Leak source fixed. Replacement tiles ordered — ETA May 19.",
  },
  {
    id: "WO-0202",
    priority: "scheduled",
    status: "scheduled",
    category: "electrical",
    title: "Generator Monthly Load Test",
    location: "Generator Room, Building A",
    description: "Monthly 30-minute load test per PM schedule. Confirm transfer switch operation and log output.",
    reportedBy: "PM Schedule",
    reportedDate: "2026-05-01",
    assignedTo: "Dave Hensley (Maintenance)",
    estimatedHours: 1,
    actualHours: null,
    completedDate: null,
    residentRoom: null,
    residentName: null,
    safetyFlag: false,
    vendorId: null,
    notes: "Scheduled May 20, 7:00 AM before resident wake-up.",
  },
  {
    id: "WO-0201",
    priority: "scheduled",
    status: "scheduled",
    category: "hvac",
    title: "HVAC Filter Replacement — East Wing AHU",
    location: "East Wing Air Handling Unit, Mechanical Room",
    description: "Monthly MERV-13 filter replacement for East Wing AHU. Check belt tension and log static pressure readings.",
    reportedBy: "PM Schedule",
    reportedDate: "2026-05-01",
    assignedTo: "Dave Hensley (Maintenance)",
    estimatedHours: 1.5,
    actualHours: null,
    completedDate: null,
    residentRoom: null,
    residentName: null,
    safetyFlag: false,
    vendorId: null,
    notes: "Scheduled May 22. Filter stock confirmed in supply room.",
  },
];

// ─── Preventive Maintenance ────────────────────────────────────────────────────

export const PM_TASKS: PMTask[] = [
  {
    id: "PM-001",
    title: "Emergency Exit Lighting Test",
    category: "safety",
    frequency: "monthly",
    lastCompleted: "2026-05-02",
    nextDue: "2026-06-02",
    daysUntilDue: 17,
    status: "current",
    assignedTo: "Dave Hensley",
    estimatedHours: 0.5,
    regulatoryRequired: true,
    notes: "Test all 14 exit signs and emergency lights. Log lumen output.",
  },
  {
    id: "PM-002",
    title: "Call Light System Test",
    category: "technology",
    frequency: "monthly",
    lastCompleted: "2026-05-02",
    nextDue: "2026-06-02",
    daysUntilDue: 17,
    status: "current",
    assignedTo: "Dave Hensley",
    estimatedHours: 1,
    regulatoryRequired: true,
    notes: "Test all resident call lights and confirm response at nursing station.",
  },
  {
    id: "PM-003",
    title: "Fire Extinguisher Visual Inspection",
    category: "safety",
    frequency: "monthly",
    lastCompleted: "2026-05-01",
    nextDue: "2026-06-01",
    daysUntilDue: 16,
    status: "current",
    assignedTo: "Dave Hensley",
    estimatedHours: 0.75,
    regulatoryRequired: true,
    notes: "Check pressure gauge, pin, and tag on all 22 extinguishers.",
  },
  {
    id: "PM-004",
    title: "Generator Monthly Load Test",
    category: "electrical",
    frequency: "monthly",
    lastCompleted: "2026-04-20",
    nextDue: "2026-05-20",
    daysUntilDue: 4,
    status: "due_soon",
    assignedTo: "Dave Hensley",
    estimatedHours: 1,
    regulatoryRequired: true,
    notes: "30-minute load test. Log voltage, amperage, and transfer switch time.",
  },
  {
    id: "PM-005",
    title: "HVAC Filter — East Wing AHU",
    category: "hvac",
    frequency: "monthly",
    lastCompleted: "2026-04-22",
    nextDue: "2026-05-22",
    daysUntilDue: 6,
    status: "due_soon",
    assignedTo: "Dave Hensley",
    estimatedHours: 1.5,
    regulatoryRequired: false,
    notes: "MERV-13 filter. Check belt tension and static pressure.",
  },
  {
    id: "PM-006",
    title: "HVAC Filter — West Wing AHU",
    category: "hvac",
    frequency: "monthly",
    lastCompleted: "2026-04-22",
    nextDue: "2026-05-22",
    daysUntilDue: 6,
    status: "due_soon",
    assignedTo: "Dave Hensley",
    estimatedHours: 1.5,
    regulatoryRequired: false,
    notes: "MERV-13 filter. Same spec as East Wing AHU.",
  },
  {
    id: "PM-007",
    title: "Elevator State Inspection Certificate",
    category: "safety",
    frequency: "annual",
    lastCompleted: "2025-05-02",
    nextDue: "2026-05-02",
    daysUntilDue: -14,
    status: "overdue",
    assignedTo: "Mountain West Elevator Co.",
    estimatedHours: 3,
    regulatoryRequired: true,
    notes: "State-required annual inspection. Certificate expired May 2, 2026. Must be scheduled immediately.",
  },
  {
    id: "PM-008",
    title: "Kitchen Grease Trap Cleaning",
    category: "plumbing",
    frequency: "quarterly",
    lastCompleted: "2026-02-15",
    nextDue: "2026-05-15",
    daysUntilDue: -1,
    status: "overdue",
    assignedTo: "Blue Ridge Plumbing",
    estimatedHours: 2,
    regulatoryRequired: true,
    notes: "Health department requires quarterly cleaning. Past due May 15.",
  },
  {
    id: "PM-009",
    title: "Roof Inspection",
    category: "roof",
    frequency: "annual",
    lastCompleted: "2025-10-01",
    nextDue: "2026-10-01",
    daysUntilDue: 138,
    status: "current",
    assignedTo: "Dave Hensley",
    estimatedHours: 2,
    regulatoryRequired: false,
    notes: "Walk roof, check flashing, downspouts, and membrane condition.",
  },
  {
    id: "PM-010",
    title: "Water Heater Maintenance",
    category: "plumbing",
    frequency: "annual",
    lastCompleted: "2026-01-15",
    nextDue: "2027-01-15",
    daysUntilDue: 244,
    status: "current",
    assignedTo: "Blue Ridge Plumbing",
    estimatedHours: 2,
    regulatoryRequired: false,
    notes: "Flush sediment, check anode rod, test T&P relief valve.",
  },
];

// ─── Assets ───────────────────────────────────────────────────────────────────

export const ASSETS: Asset[] = [
  {
    id: "A-001",
    name: "Passenger Elevator — Building A",
    category: "elevator",
    location: "Main Building, Elevator Shaft",
    age: 12,
    warrantyExpiry: "2018-06-01",
    warrantyActive: false,
    lastServiceDate: "2025-06-10",
    nextServiceDate: "2026-05-02",
    serviceStatus: "overdue",
    linkedWorkOrderId: "WO-0212",
    vendor: "Mountain West Elevator Co.",
    serialNumber: "OTV-42198-A",
    notes: "Annual state inspection overdue. Intermittent slow response — WO-0212 open. Consider capital planning for replacement in 3–5 years.",
  },
  {
    id: "A-002",
    name: "Commercial Dishwasher",
    category: "kitchen",
    location: "Main Kitchen",
    age: 4,
    warrantyExpiry: "2027-03-01",
    warrantyActive: true,
    lastServiceDate: "2026-03-10",
    nextServiceDate: "2026-09-10",
    serviceStatus: "current",
    linkedWorkOrderId: null,
    vendor: null,
    serialNumber: "HB-3900-DW-7741",
    notes: "Hobart HB3900. Under manufacturer warranty through Mar 2027.",
  },
  {
    id: "A-003",
    name: "HVAC Air Handler — East Wing",
    category: "hvac",
    location: "East Wing Mechanical Room",
    age: 7,
    warrantyExpiry: "2022-08-01",
    warrantyActive: false,
    lastServiceDate: "2026-04-22",
    nextServiceDate: "2026-08-22",
    serviceStatus: "current",
    linkedWorkOrderId: null,
    vendor: "Comfort Air Systems",
    serialNumber: "CAR-AHU-4412E",
    notes: "Carrier unit. Comfort Air quarterly PM contract.",
  },
  {
    id: "A-004",
    name: "HVAC Air Handler — West Wing",
    category: "hvac",
    location: "West Wing Mechanical Room",
    age: 7,
    warrantyExpiry: "2022-08-01",
    warrantyActive: false,
    lastServiceDate: "2026-04-22",
    nextServiceDate: "2026-08-22",
    serviceStatus: "current",
    linkedWorkOrderId: null,
    vendor: "Comfort Air Systems",
    serialNumber: "CAR-AHU-4412W",
    notes: "Same spec as East Wing unit. Both due Aug 2026 service.",
  },
  {
    id: "A-005",
    name: "Emergency Generator",
    category: "generator",
    location: "Generator Room, Building A",
    age: 9,
    warrantyExpiry: "2021-04-01",
    warrantyActive: false,
    lastServiceDate: "2026-04-20",
    nextServiceDate: "2026-09-20",
    serviceStatus: "current",
    linkedWorkOrderId: null,
    vendor: null,
    serialNumber: "KD-45RZ-GEN-0089",
    notes: "Kohler 45RZ. Monthly load tests in-house. Annual service Sep 2026.",
  },
  {
    id: "A-006",
    name: "Commercial Washer — Laundry",
    category: "laundry",
    location: "Laundry Room",
    age: 6,
    warrantyExpiry: "2023-07-01",
    warrantyActive: false,
    lastServiceDate: "2026-01-10",
    nextServiceDate: "2026-07-10",
    serviceStatus: "current",
    linkedWorkOrderId: null,
    vendor: null,
    serialNumber: "SQ-AXRT-6611",
    notes: "Speed Queen AXRT. Next service July 2026 (52 days).",
  },
  {
    id: "A-007",
    name: "Grease Trap — Kitchen",
    category: "plumbing",
    location: "Main Kitchen, Under-Floor",
    age: 12,
    warrantyExpiry: null,
    warrantyActive: false,
    lastServiceDate: "2026-02-15",
    nextServiceDate: "2026-05-15",
    serviceStatus: "overdue",
    linkedWorkOrderId: null,
    vendor: "Blue Ridge Plumbing",
    serialNumber: null,
    notes: "Quarterly cleaning overdue since May 15. Health department requirement.",
  },
  {
    id: "A-008",
    name: "Roof — Main Building",
    category: "roof",
    location: "Building A Rooftop",
    age: 8,
    warrantyExpiry: "2028-06-01",
    warrantyActive: true,
    lastServiceDate: "2025-10-01",
    nextServiceDate: "2026-10-01",
    serviceStatus: "current",
    linkedWorkOrderId: null,
    vendor: null,
    serialNumber: null,
    notes: "TPO membrane, 20-year warranty through 2028. Annual inspection Oct 2026.",
  },
];

// ─── Vendors ──────────────────────────────────────────────────────────────────

export const VENDORS: Vendor[] = [
  {
    id: "V-001",
    company: "Mountain West Elevator Co.",
    contact: "Jack Merrill",
    phone: "(801) 555-0201",
    email: "jack@mountainwestelevator.com",
    contractType: "Annual Service Agreement",
    categories: ["safety"],
    lastUsed: "2025-06-10",
    actionNeeded: true,
    actionNote: "Elevator inspection overdue — schedule immediately",
    notes: "Annual state inspection and maintenance. Emergency response available. Last PM was Jun 2025.",
  },
  {
    id: "V-002",
    company: "Comfort Air Systems",
    contact: "Rachel Torres",
    phone: "(801) 555-0302",
    email: "r.torres@comfortair.com",
    contractType: "Quarterly PM Contract",
    categories: ["hvac"],
    lastUsed: "2026-02-20",
    actionNeeded: false,
    actionNote: null,
    notes: "HVAC quarterly PM contract. Summer check scheduled Jun 2026.",
  },
  {
    id: "V-003",
    company: "Blue Ridge Plumbing",
    contact: "Mike Castro",
    phone: "(801) 555-0403",
    email: "mike@blueridgeplumbing.com",
    contractType: "On-Call",
    categories: ["plumbing"],
    lastUsed: "2026-05-15",
    actionNeeded: false,
    actionNote: null,
    notes: "Completed kitchen leak repair May 15. Grease trap cleaning also needed — schedule soon.",
  },
  {
    id: "V-004",
    company: "Precision Electric",
    contact: "Sam Yuen",
    phone: "(801) 555-0504",
    email: "sam@precisionelectric.com",
    contractType: "On-Call",
    categories: ["electrical"],
    lastUsed: "2026-03-08",
    actionNeeded: false,
    actionNote: null,
    notes: "Used for panel upgrade in Mar 2026. Available for emergency calls 24/7.",
  },
  {
    id: "V-005",
    company: "Alpine Grounds & Exterior",
    contact: "Pete Sanchez",
    phone: "(801) 555-0605",
    email: "pete@alpinegrounds.com",
    contractType: "Monthly Contract",
    categories: ["grounds"],
    lastUsed: "2026-04-30",
    actionNeeded: false,
    actionNote: null,
    notes: "Monthly lawn, landscaping, and snow removal contract. Next visit May 28.",
  },
];

// ─── Budget ────────────────────────────────────────────────────────────────────

export const BUDGET_MONTHLY = 12000;
export const BUDGET_SPENT = 8420;

export const BUDGET_LINES: BudgetLine[] = [
  { category: "Labor",     amount: 4200 },
  { category: "Materials", amount: 2180 },
  { category: "Vendor",    amount: 2040 },
];

export const BUDGET_HISTORY = [
  { month: "Dec", spent: 7200 },
  { month: "Jan", spent: 9100 },
  { month: "Feb", spent: 6800 },
  { month: "Mar", spent: 11400 },
  { month: "Apr", spent: 7600 },
  { month: "May", spent: 8420 },
];

// ─── Maintenance Metrics ──────────────────────────────────────────────────────

export const MAINTENANCE_METRICS = {
  openWorkOrders: 12,
  emergencyOpen: 2,
  pmCompletionPct: 73,
  avgResponseEmergencyHrs: 1.8,
  avgResponseUrgentHrs: 22,
  assetsNeedingAttention: 3,
  budgetSpent: BUDGET_SPENT,
  budgetTotal: BUDGET_MONTHLY,
  overdueCount: 2,
};

// ─── Report Definitions ───────────────────────────────────────────────────────

export interface MaintenanceReportDef {
  id: string;
  category: "operations" | "compliance" | "financial" | "lifecycle";
  title: string;
  description: string;
  lastGenerated: string;
  format: string;
}

export const MAINTENANCE_REPORTS: MaintenanceReportDef[] = [
  { id: "mr01", category: "operations",  title: "Open Work Order Summary",            description: "All open and in-progress work orders grouped by priority. Includes age, assignee, and estimated completion.",                 lastGenerated: "May 16, 2026", format: "PDF / Excel" },
  { id: "mr02", category: "operations",  title: "Work Order Completion Report",        description: "All work orders completed in the selected date range. Includes actual hours, cost, and resident feedback.",                    lastGenerated: "May 16, 2026", format: "PDF / Excel" },
  { id: "mr03", category: "operations",  title: "Response Time Report",                description: "Average response time by priority level. Benchmarked against industry targets (emergency <2 hrs, urgent <24 hrs).",            lastGenerated: "May 15, 2026", format: "PDF" },
  { id: "mr04", category: "operations",  title: "Resident Room Work Order History",    description: "All maintenance activity logged per resident room over the last 12 months. Useful for move-out inspections.",                  lastGenerated: "May 10, 2026", format: "PDF / Excel" },
  { id: "mr05", category: "compliance",  title: "Preventive Maintenance Log",          description: "All PM tasks completed, overdue, or upcoming. Required for state surveys and accreditation visits.",                           lastGenerated: "May 16, 2026", format: "PDF" },
  { id: "mr06", category: "compliance",  title: "Fire & Life Safety Inspection Log",   description: "All fire door tests, extinguisher checks, exit lighting, sprinkler, and smoke detector records.",                             lastGenerated: "May 16, 2026", format: "PDF" },
  { id: "mr07", category: "compliance",  title: "Elevator Compliance Certificate Log", description: "State elevator inspection records, certificate dates, and outstanding compliance items.",                                       lastGenerated: "Apr 30, 2026", format: "PDF" },
  { id: "mr08", category: "compliance",  title: "Health Department Compliance Log",    description: "Kitchen grease trap, pest control, and health department required maintenance records.",                                        lastGenerated: "Apr 30, 2026", format: "PDF" },
  { id: "mr09", category: "financial",   title: "Monthly Maintenance Budget Report",   description: "Actual vs. budget by category (labor, materials, vendor). YTD spend and trend analysis.",                                      lastGenerated: "May 16, 2026", format: "PDF / Excel" },
  { id: "mr10", category: "financial",   title: "Vendor Cost Summary",                 description: "All vendor invoices by vendor and category. Compare cost vs. contract rates.",                                                  lastGenerated: "May 1, 2026",  format: "PDF / Excel" },
  { id: "mr11", category: "lifecycle",   title: "Asset Service History Report",        description: "Complete service and repair history per asset. Supports capital planning and replacement decisions.",                           lastGenerated: "May 1, 2026",  format: "PDF" },
  { id: "mr12", category: "lifecycle",   title: "Capital Replacement Forecast",        description: "Assets with remaining useful life <5 years and estimated replacement costs. Used for annual budget planning.",                  lastGenerated: "Apr 1, 2026",  format: "PDF" },
];
