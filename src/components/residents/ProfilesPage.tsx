import { useMemo, useState } from "react";
import { Search, Pencil, Phone, User, Heart, FileText, Shield, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { RESIDENTS, type Resident, type CareLevel, type PayerType } from "@/lib/mock/clinical";
import { cn } from "@/lib/utils";
import { ModuleHeader } from "@/components/shell/ModuleHeader";

const MODULE_COLOR = "#6366F1";

const CARE_LABELS: Record<CareLevel, string> = {
  memory_care: "Memory Care",
  assisted: "Assisted Living",
  independent: "Independent Living",
};

const CARE_COLORS: Record<CareLevel, string> = {
  memory_care: "bg-destructive/15 text-destructive border-destructive/25",
  assisted: "bg-primary/15 text-primary border-primary/25",
  independent: "bg-success/15 text-success border-success/25",
};

const PAYER_LABELS: Record<PayerType, string> = {
  private_pay: "Private Pay",
  medicaid: "Medicaid",
  ltci: "LTC Insurance",
  va: "VA",
};

const ALLERGY_SEVERITY_COLORS: Record<"severe" | "moderate" | "mild", string> = {
  severe: "bg-destructive/10 border-destructive/25 text-destructive",
  moderate: "bg-warning/10 border-warning/25 text-warning",
  mild: "bg-muted/40 border-border text-muted-foreground",
};

function calcLengthOfStay(moveInDate: string): string {
  const start = new Date(moveInDate + "T00:00:00");
  const now = new Date();
  const totalMonths =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} months`;
  if (months === 0) return `${years} year${years !== 1 ? "s" : ""}`;
  return `${years}y ${months}m`;
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-sm">{title}</h4>
        </div>
        <button
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Edit ${title}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground w-44 shrink-0">{label}</span>
      <span className="text-xs text-right flex-1">{value}</span>
    </div>
  );
}

function ProfilePanel({ resident: r }: { resident: Resident }) {
  const dob = new Date(r.dob + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const moveIn = new Date(r.moveInDate + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const los = calcLengthOfStay(r.moveInDate);
  const displayName = r.preferredName
    ? `${r.firstName} "${r.preferredName}" ${r.lastName}`
    : `${r.firstName} ${r.lastName}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Header card */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display font-bold text-lg leading-tight">{displayName}</h2>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-mono">{r.room}</span>
              <span className="text-border">·</span>
              <span>Moved in {moveIn}</span>
              <span className="text-border">·</span>
              <span>{los}</span>
            </div>
          </div>
          <span className={cn("text-[11px] px-2 py-0.5 rounded border font-medium shrink-0", CARE_COLORS[r.careLevel])}>
            {CARE_LABELS[r.careLevel]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Personal Information" icon={User}>
          <Row label="Date of Birth" value={`${dob} (Age ${r.age})`} />
          <Row label="Gender" value={r.gender} />
          <Row label="Height" value={r.height} />
          <Row label="Weight" value={`${r.weightLbs} lbs`} />
        </SectionCard>

        <SectionCard title="Care Team" icon={Shield}>
          <Row label="Attending Physician" value={r.physician} />
          <Row label="Healthcare Proxy" value={r.healthcareProxy} />
        </SectionCard>

        <SectionCard title="Clinical Summary" icon={Heart}>
          <div className="mb-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Primary Diagnoses
            </p>
            <ol className="space-y-1.5">
              {r.primaryDx.map((dx, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span className="w-4 h-4 shrink-0 rounded-full bg-muted/60 border border-border text-[10px] flex items-center justify-center font-mono text-muted-foreground">
                    {i + 1}
                  </span>
                  {dx}
                </li>
              ))}
            </ol>
          </div>
          <div className="pt-3 border-t border-border mb-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Allergies
            </p>
            {r.allergies.length === 0 ? (
              <p className="text-xs text-success font-medium">NKDA — No known drug allergies</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {r.allergies.map((a, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-[11px] px-2 py-1 rounded border font-medium",
                      ALLERGY_SEVERITY_COLORS[a.severity],
                    )}
                  >
                    {a.substance} — {a.reaction}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="pt-3 border-t border-border">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Code Status
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded border font-semibold",
                  r.dnr
                    ? "bg-destructive/15 text-destructive border-destructive/25"
                    : "bg-success/15 text-success border-success/25",
                )}
              >
                {r.codeStatus}
              </span>
              {r.dnr && (
                <span className="text-xs text-destructive font-medium">DNR on file</span>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Payer & Insurance" icon={FileText}>
          <Row label="Payer Type" value={PAYER_LABELS[r.payerType]} />
          <Row label="Insurance" value={r.insurance} />
        </SectionCard>

        <SectionCard title="Emergency Contacts" icon={Phone}>
          <div className="space-y-2">
            {r.emergencyContacts.map((c, i) => (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-md border text-xs",
                  c.isPrimary
                    ? "bg-primary/5 border-primary/25"
                    : "bg-muted/20 border-border",
                )}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-sm">{c.name}</span>
                  {c.isPrimary && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 font-medium">
                      Primary
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground">{c.relation}</div>
                <div className="font-mono mt-1">{c.phone}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export function ProfilesPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(RESIDENTS[0].id);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return RESIDENTS;
    return RESIDENTS.filter(
      (r) =>
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q) ||
        r.room.toLowerCase().includes(q) ||
        (r.preferredName ?? "").toLowerCase().includes(q),
    );
  }, [search]);

  const selected = RESIDENTS.find((r) => r.id === selectedId) ?? RESIDENTS[0];

  return (
    <div className="flex flex-col gap-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Resident Profiles"
        description="Administrative records, emergency contacts, and payer information."
        icon={Users}
        color={MODULE_COLOR}
      />
      <div className="flex gap-5">
        {/* Left list */}
        <div className="w-60 shrink-0 flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="space-y-1">
            {filtered.map((r) => {
              const name = r.preferredName
                ? `${r.preferredName} ${r.lastName}`
                : `${r.firstName} ${r.lastName}`;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={cn(
                    "w-full text-left rounded-lg border px-3 py-2.5 transition-all",
                    r.id === selectedId
                      ? "border-primary/40 bg-primary/10"
                      : "border-border bg-card hover:border-primary/30 hover:bg-muted/30",
                  )}
                >
                  <div className="text-sm font-medium truncate">{name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{r.room}</div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No residents match.</p>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 min-w-0">
          <ProfilePanel resident={selected} />
        </div>
      </div>
    </div>
  );
}
