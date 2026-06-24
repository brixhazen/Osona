import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { type StaffMember, type StaffRole, type CertStatus } from "@/lib/mock/workforce";
import { cn } from "@/lib/utils";

interface CertEntry {
  staffId: string;
  staffName: string;
  role: StaffRole;
  certName: string;
  expires: string;
  status: CertStatus;
  daysRemaining: number; // negative = overdue
}

const ROLE_COLORS: Record<StaffRole, string> = {
  RN:          "bg-primary/10 text-primary border-primary/20",
  LPN:         "bg-primary/10 text-primary border-primary/20",
  CNA:         "bg-secondary text-secondary-foreground border-border",
  "Med Tech":  "bg-success/10 text-success border-success/20",
  Activities:  "bg-accent/10 text-accent border-accent/20",
  Dietary:     "bg-muted text-muted-foreground border-border",
  Maintenance: "bg-muted text-muted-foreground border-border",
};

function buildCertEntries(staff: StaffMember[]): CertEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ORDER: Record<CertStatus, number> = { expired: 0, expiring_soon: 1, current: 2 };

  return staff
    .flatMap((s) =>
      s.certifications.map((c) => {
        const daysRemaining = Math.ceil(
          (new Date(c.expires).getTime() - today.getTime()) / 86400000,
        );
        return {
          staffId: s.id,
          staffName: s.name.replace(/,.*$/, ""),
          role: s.role,
          certName: c.name,
          expires: c.expires,
          status: c.status,
          daysRemaining,
        };
      }),
    )
    .sort((a, b) => {
      if (ORDER[a.status] !== ORDER[b.status]) return ORDER[a.status] - ORDER[b.status];
      return a.daysRemaining - b.daysRemaining; // most urgent first within each group
    });
}

export function CredentialsView({ staff }: { staff: StaffMember[] }) {
  const [filter, setFilter] = useState<CertStatus | "all">("all");
  const allEntries = buildCertEntries(staff);

  const expiredCount     = allEntries.filter((e) => e.status === "expired").length;
  const expiringSoonCount = allEntries.filter((e) => e.status === "expiring_soon").length;
  const currentCount     = allEntries.filter((e) => e.status === "current").length;

  const filtered = filter === "all" ? allEntries : allEntries.filter((e) => e.status === filter);

  return (
    <div className="space-y-4">
      {/* Summary cards — click to filter */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          icon={<AlertTriangle size={14} className="text-destructive" />}
          label="Expired"
          count={expiredCount}
          tone="danger"
          active={filter === "expired"}
          onClick={() => setFilter(filter === "expired" ? "all" : "expired")}
        />
        <SummaryCard
          icon={<Clock size={14} className="text-accent" />}
          label="Expiring within 90 days"
          count={expiringSoonCount}
          tone="warn"
          active={filter === "expiring_soon"}
          onClick={() => setFilter(filter === "expiring_soon" ? "all" : "expiring_soon")}
        />
        <SummaryCard
          icon={<CheckCircle2 size={14} className="text-success" />}
          label="Current"
          count={currentCount}
          tone="ok"
          active={filter === "current"}
          onClick={() => setFilter(filter === "current" ? "all" : "current")}
        />
      </div>

      {/* Credential table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <ShieldCheck size={14} />
            Credential Registry
          </h3>
          <span className="text-[11px] text-muted-foreground">
            {filtered.length} credential{filtered.length !== 1 ? "s" : ""}
            {filter !== "all" && " (filtered)"}
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              <th className="text-left px-4 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Staff Member</th>
              <th className="text-left px-3 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider hidden md:table-cell">Credential</th>
              <th className="text-center px-3 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Expires</th>
              <th className="text-right px-3 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Days</th>
              <th className="text-center px-4 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, i) => (
              <CredRow key={`${entry.staffId}-${i}`} entry={entry} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No credentials match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SummaryCard({
  icon, label, count, tone, active, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  tone: "danger" | "warn" | "ok";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border p-4 text-left transition-all hover:opacity-80 cursor-pointer",
        tone === "danger" ? "border-destructive/30 bg-destructive/5"
          : tone === "warn" ? "border-accent/30 bg-accent/5"
          : "border-success/30 bg-success/5",
        active && "ring-2",
        active && (tone === "danger" ? "ring-destructive/50" : tone === "warn" ? "ring-accent/50" : "ring-success/50"),
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className={cn(
        "font-mono text-2xl font-bold",
        tone === "danger" ? "text-destructive" : tone === "warn" ? "text-accent" : "text-success",
      )}>
        {count}
      </div>
    </button>
  );
}

function CredRow({ entry }: { entry: CertEntry }) {
  const isExpired  = entry.status === "expired";
  const isExpiring = entry.status === "expiring_soon";

  return (
    <tr className={cn(
      "border-b border-border/40 last:border-0 hover:bg-surface/30 transition-colors",
      isExpired && "bg-destructive/[0.03]",
    )}>
      <td className="px-4 py-3">
        <div className="font-medium leading-snug">{entry.staffName}</div>
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", ROLE_COLORS[entry.role])}>
          {entry.role}
        </span>
      </td>
      <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">{entry.certName}</td>
      <td className="px-3 py-3 text-center font-mono text-xs text-muted-foreground whitespace-nowrap">
        {entry.expires}
      </td>
      <td className={cn(
        "px-3 py-3 text-right font-mono text-sm font-semibold tabular-nums whitespace-nowrap",
        isExpired ? "text-destructive" : isExpiring ? "text-accent" : "text-muted-foreground",
      )}>
        {isExpired
          ? `${Math.abs(entry.daysRemaining)}d overdue`
          : `${entry.daysRemaining}d`}
      </td>
      <td className="px-4 py-3 text-center">
        {isExpired ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
            <AlertTriangle size={9} />
            Expired
          </span>
        ) : isExpiring ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
            <Clock size={9} />
            Expiring Soon
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
            <CheckCircle2 size={9} />
            Current
          </span>
        )}
      </td>
    </tr>
  );
}
