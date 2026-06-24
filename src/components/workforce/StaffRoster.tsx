import { useState } from "react";
import {
  type StaffMember, type StaffRole, type EmployeeStatus, type CertStatus,
} from "@/lib/mock/workforce";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, Flame, Phone, Search } from "lucide-react";

type RoleFilter = StaffRole | "All" | "Other";

const ROLE_FILTERS: RoleFilter[] = ["All", "RN", "LPN", "CNA", "Med Tech", "Other"];

const STATUS_LABELS: Record<EmployeeStatus, string> = {
  full_time: "FT",
  part_time: "PT",
  prn: "PRN",
  agency: "Agency",
};

const ROLE_COLORS: Record<StaffRole, string> = {
  RN: "bg-primary/10 text-primary border-primary/20",
  LPN: "bg-primary/10 text-primary border-primary/20",
  CNA: "bg-secondary text-secondary-foreground border-border",
  "Med Tech": "bg-success/10 text-success border-success/20",
  Activities: "bg-accent/10 text-accent border-accent/20",
  Dietary: "bg-muted text-muted-foreground border-border",
  Maintenance: "bg-muted text-muted-foreground border-border",
};

const CLINICAL_ROLES: StaffRole[] = ["RN", "LPN", "CNA", "Med Tech"];

function getInitials(name: string) {
  const parts = name.replace(/,.*$/, "").split(" ");
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function burnoutRisk(staff: StaffMember): "high" | "medium" | "none" {
  if (staff.consecutiveDays >= 6) return "high";
  if (staff.consecutiveDays >= 5 || staff.hoursThisWeek >= staff.overtimeThreshold - 2) return "medium";
  return "none";
}

function certSeverity(staff: StaffMember): CertStatus | null {
  if (staff.certifications.some((c) => c.status === "expired")) return "expired";
  if (staff.certifications.some((c) => c.status === "expiring_soon")) return "expiring_soon";
  return null;
}

export function StaffRoster({ staff }: { staff: StaffMember[] }) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [search, setSearch] = useState("");

  const filtered = staff.filter((s) => {
    const matchRole = roleFilter === "All"
      ? true
      : roleFilter === "Other"
        ? !CLINICAL_ROLES.includes(s.role)
        : s.role === roleFilter;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts: Partial<Record<RoleFilter, number>> = { All: staff.length };
  for (const r of ROLE_FILTERS.slice(1)) {
    counts[r] = staff.filter((s) => {
      if (r === "Other") return !CLINICAL_ROLES.includes(s.role);
      return s.role === r;
    }).length;
  }

  const expiredCount = staff.filter((s) => certSeverity(s) === "expired").length;
  const burnoutCount = staff.filter((s) => burnoutRisk(s) !== "none").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary alerts */}
      {(expiredCount > 0 || burnoutCount > 0) && (
        <div className="flex gap-3">
          {expiredCount > 0 && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
              <AlertTriangle size={13} className="text-destructive" />
              <span className="text-destructive font-medium">{expiredCount} expired credential{expiredCount !== 1 ? "s" : ""}</span>
              <span className="text-muted-foreground">— requires immediate action</span>
            </div>
          )}
          {burnoutCount > 0 && (
            <div className="flex items-center gap-2 rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-sm">
              <Flame size={13} className="text-accent" />
              <span className="text-accent font-medium">{burnoutCount} burnout risk{burnoutCount !== 1 ? "s" : ""}</span>
              <span className="text-muted-foreground">— extended streaks or near OT</span>
            </div>
          )}
        </div>
      )}

      {/* Search + filter chips */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff…"
            className="h-7 pl-7 pr-3 rounded-full border border-border bg-background text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-44"
          />
        </div>
        {ROLE_FILTERS.map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={cn(
              "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
              roleFilter === r
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {r}
            {counts[r] !== undefined && counts[r]! > 0 && (
              <span className="ml-1.5 font-mono opacity-60">{counts[r]}</span>
            )}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-muted-foreground">{filtered.length} staff members</span>
      </div>


      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_80px_80px_1fr] gap-3 px-4 py-2.5 bg-secondary/40 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Staff Member</span>
          <span>Unit</span>
          <span>Phone</span>
          <span className="text-right">Hours/Wk</span>
          <span className="text-right">Streak</span>
          <span>Credentials</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/50">
          {filtered.map((member) => (
            <StaffRow key={member.id} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StaffRow({ member }: { member: StaffMember }) {
  const burn = burnoutRisk(member);
  const certIssue = certSeverity(member);
  const hoursWarning = member.hoursThisWeek >= member.overtimeThreshold;
  const hoursNearOt = member.hoursThisWeek >= member.overtimeThreshold - 4;

  const expiredCerts = member.certifications.filter((c) => c.status === "expired");
  const expiringSoonCerts = member.certifications.filter((c) => c.status === "expiring_soon");

  return (
    <div className={cn(
      "grid grid-cols-[2fr_1fr_1fr_80px_80px_1fr] gap-3 px-4 py-3 items-center hover:bg-secondary/20 transition-colors",
      certIssue === "expired" && "bg-destructive/3",
    )}>
      {/* Name + avatar */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          "size-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
          ROLE_COLORS[member.role],
          "border",
        )}>
          {getInitials(member.name)}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{member.name.replace(/,.*$/, "")}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", ROLE_COLORS[member.role])}>
              {member.role}
            </span>
            <span className="text-[10px] text-muted-foreground">{STATUS_LABELS[member.status]}</span>
            {member.todayShift && (
              <span className="text-[10px] text-muted-foreground">· {member.todayShift}</span>
            )}
            {member.calloutCount30d && member.calloutCount30d >= 2 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium border border-destructive/20">
                {member.calloutCount30d}× callouts/30d
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Unit */}
      <div className="text-xs text-muted-foreground truncate">{member.primaryUnit}</div>

      {/* Status */}
      <div>
        <a
          href={`tel:${member.phone}`}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Phone size={10} />
          {member.phone}
        </a>
      </div>

      {/* Hours */}
      <div className="text-right">
        <span className={cn(
          "font-mono text-sm",
          hoursWarning ? "text-destructive font-semibold" : hoursNearOt ? "text-accent" : "text-foreground",
        )}>
          {member.hoursThisWeek}h
        </span>
        <div className="text-[9px] text-muted-foreground">
          of {member.overtimeThreshold}h
        </div>
        {hoursNearOt && (
          <Clock size={9} className={cn("ml-auto", hoursWarning ? "text-destructive" : "text-accent")} />
        )}
      </div>

      {/* Consecutive days */}
      <div className="text-right">
        <span className={cn(
          "font-mono text-sm",
          burn === "high" ? "text-destructive font-semibold" : burn === "medium" ? "text-accent" : "text-foreground",
        )}>
          {member.consecutiveDays}d
        </span>
        {burn !== "none" && (
          <Flame size={9} className={cn("ml-auto", burn === "high" ? "text-destructive" : "text-accent")} />
        )}
      </div>

      {/* Credentials */}
      <div className="flex flex-col gap-0.5">
        {expiredCerts.map((c) => (
          <div key={c.name} className="flex items-center gap-1 text-[10px] text-destructive">
            <AlertTriangle size={9} />
            <span className="truncate">{c.name}</span>
            <span className="font-mono shrink-0">EXPIRED</span>
          </div>
        ))}
        {expiringSoonCerts.map((c) => (
          <div key={c.name} className="flex items-center gap-1 text-[10px] text-accent">
            <Clock size={9} />
            <span className="truncate">{c.name}</span>
            <span className="font-mono shrink-0">{c.expires}</span>
          </div>
        ))}
        {certIssue === null && (
          <div className="flex items-center gap-1 text-[10px] text-success">
            <span>All current</span>
          </div>
        )}
      </div>
    </div>
  );
}
