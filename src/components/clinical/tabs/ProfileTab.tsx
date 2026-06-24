import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { User, Phone, Heart, FileText } from "lucide-react";
import { type Resident, type ResidentClinicalData } from "@/lib/mock/clinical";
import { cn } from "@/lib/utils";

interface Props {
  resident: Resident;
  data: ResidentClinicalData;
}

function Section({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground w-40 shrink-0">{label}</span>
      <span className="text-xs text-right flex-1">{value}</span>
    </div>
  );
}

export function ProfileTab({ resident: r }: Props) {
  const dob = new Date(r.dob + "T00:00:00");
  const dobStr = dob.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const moveIn = new Date(r.moveInDate + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Section title="Demographics" icon={User}>
        <Row label="Full Name" value={`${r.firstName} ${r.lastName}${r.preferredName ? ` (${r.preferredName})` : ""}`} />
        <Row label="Date of Birth" value={`${dobStr} (Age ${r.age})`} />
        <Row label="Gender" value={r.gender} />
        <Row label="Height / Weight" value={`${r.height} · ${r.weightLbs} lbs`} />
        <Row label="Room" value={<span className="font-mono">{r.room}</span>} />
        <Row label="Wing" value={r.wing} />
        <Row label="Care Level" value={<span className="capitalize">{r.careLevel.replace("_", " ")}</span>} />
        <Row label="Move-In Date" value={moveIn} />
        <Row label="Attending Physician" value={r.physician} />
      </Section>

      <Section title="Emergency Contacts" icon={Phone}>
        <div className="space-y-3">
          {r.emergencyContacts.map((c, i) => (
            <div key={i} className="p-3 rounded-md bg-surface-2/40 border border-border">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-medium">{c.name}</span>
                {c.isPrimary && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 font-medium">
                    Primary
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{c.relation}</div>
              <div className="text-xs font-mono mt-1">{c.phone}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Diagnoses & Allergies" icon={Heart}>
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Primary Diagnoses</p>
          <ol className="space-y-1.5">
            {r.primaryDx.map((dx, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className="w-4 h-4 shrink-0 rounded-full bg-surface-2/60 border border-border text-[10px] flex items-center justify-center font-mono text-muted-foreground">
                  {i + 1}
                </span>
                {dx}
              </li>
            ))}
          </ol>
        </div>
        <div className="pt-3 border-t border-border">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Allergies</p>
          {r.allergies.length === 0 ? (
            <p className="text-xs text-success font-medium">NKDA — No known drug allergies</p>
          ) : (
            <div className="space-y-2">
              {r.allergies.map((a, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-md p-2.5 border text-xs",
                    a.severity === "severe"
                      ? "bg-destructive/10 border-destructive/25"
                      : a.severity === "moderate"
                      ? "bg-warning/10 border-warning/25"
                      : "bg-surface-2/40 border-border",
                  )}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold">{a.substance}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize",
                      a.severity === "severe"
                        ? "bg-destructive/20 text-destructive border-destructive/30"
                        : a.severity === "moderate"
                        ? "bg-warning/20 text-warning border-warning/30"
                        : "bg-muted/40 text-muted-foreground border-border",
                    )}>
                      {a.severity}
                    </span>
                  </div>
                  <div className="text-muted-foreground">{a.reaction}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section title="Advance Directives & Payer" icon={FileText}>
        <Row
          label="Code Status"
          value={
            <span className={cn("font-semibold", r.dnr ? "text-destructive" : "text-success")}>
              {r.codeStatus}
            </span>
          }
        />
        <Row label="Healthcare Proxy" value={r.healthcareProxy} />
        <Row label="Payer Type" value={<span className="capitalize">{r.payerType.replace("_", " ")}</span>} />
        <Row label="Insurance" value={r.insurance} />
        <Row label="Physician" value={r.physician} />
      </Section>
    </div>
  );
}
