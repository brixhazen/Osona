import { cn } from "@/lib/utils";
import { Download, AlertTriangle, X, TrendingDown } from "lucide-react";
import { STATUS_CONFIG, ROUTE_LABELS, type EmarResident, type Medication, type MedAdministration, type PrnAdministration } from "@/lib/mock/emar";

interface Props {
  residents: EmarResident[];
  medications: Medication[];
  administrations: MedAdministration[];
  prnAdministrations: PrnAdministration[];
}

function downloadCSV(filename: string, rows: string[][], headers: string[]) {
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function EmarReports({ residents, medications, administrations, prnAdministrations }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  // Missed doses = meds with a scheduled pass today that have no administration record
  const missedToday = medications
    .filter((m) => m.active && !m.isPrn)
    .flatMap((med) =>
      med.scheduledPasses.map((pass) => {
        const adm = administrations.find(
          (a) => a.medicationId === med.id && a.date === today && a.passTime === pass,
        );
        if (adm) return null;
        const res = residents.find((r) => r.id === med.residentId);
        return { med, pass, res };
      }),
    )
    .filter(Boolean) as { med: Medication; pass: string; res: EmarResident | undefined }[];

  // Refusals this month
  const refusals = administrations.filter((a) => a.status === "refused" && a.date.startsWith("2026-06"));

  // PRN frequency — count per medication
  const prnFreq = prnAdministrations.reduce<Record<string, number>>((acc, p) => {
    acc[p.medicationId] = (acc[p.medicationId] ?? 0) + 1;
    return acc;
  }, {});
  const prnByFreq = Object.entries(prnFreq)
    .map(([id, count]) => ({ med: medications.find((m) => m.id === id), count }))
    .filter((x) => x.med)
    .sort((a, b) => b.count - a.count);

  function exportMAR() {
    const rows = administrations.map((a) => {
      const med = medications.find((m) => m.id === a.medicationId);
      const res = residents.find((r) => r.id === a.residentId);
      return [
        res?.name ?? "",
        res?.room ?? "",
        med?.name ?? "",
        med?.dose ?? "",
        ROUTE_LABELS[med?.route ?? "oral"],
        a.passTime,
        a.date,
        STATUS_CONFIG[a.status].label,
        a.givenAt ?? "",
        a.givenBy ?? "",
        a.notes ?? a.refusalReason ?? a.heldReason ?? "",
      ];
    });
    downloadCSV(
      `MAR-${today}.csv`,
      rows,
      ["Resident", "Room", "Medication", "Dose", "Route", "Pass", "Date", "Status", "Given At", "Given By", "Notes"],
    );
  }

  function exportRefusals() {
    const rows = refusals.map((a) => {
      const med = medications.find((m) => m.id === a.medicationId);
      const res = residents.find((r) => r.id === a.residentId);
      return [res?.name ?? "", res?.room ?? "", med?.name ?? "", med?.dose ?? "", a.passTime, a.date, a.refusalReason ?? "", a.givenBy ?? ""];
    });
    downloadCSV(`Refusals-June-2026.csv`, rows, ["Resident", "Room", "Medication", "Dose", "Pass", "Date", "Reason", "Documented By"]);
  }

  function exportPRN() {
    const rows = prnAdministrations.map((p) => {
      const med = medications.find((m) => m.id === p.medicationId);
      const res = residents.find((r) => r.id === p.residentId);
      return [res?.name ?? "", res?.room ?? "", med?.name ?? "", med?.dose ?? "", p.date, p.time, p.givenBy, p.reason, p.effectiveness ?? "", p.followUpTime ?? ""];
    });
    downloadCSV(`PRN-Log-${today}.csv`, rows, ["Resident", "Room", "Medication", "Dose", "Date", "Time", "Given By", "Reason", "Effectiveness", "Follow-Up Time"]);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Export row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-2">Export</span>
        {[
          { label: "Monthly MAR", fn: exportMAR },
          { label: "Refusal Report", fn: exportRefusals },
          { label: "PRN Log", fn: exportPRN },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.fn}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <Download size={11} />
            {btn.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Missed doses today */}
        <div className="col-span-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Not Yet Documented Today ({missedToday.length})
          </div>
          {missedToday.length === 0 ? (
            <div className="rounded-lg border border-success/20 bg-success/5 px-4 py-6 text-center text-sm text-success font-medium">
              All passes fully documented for today
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_1fr] border-b border-border bg-secondary/40">
                {["Resident / Medication", "Pass", "Room"].map((h) => (
                  <div key={h} className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">{h}</div>
                ))}
              </div>
              <div className="divide-y divide-border/50 max-h-64 overflow-y-auto">
                {missedToday.map(({ med, pass, res }, i) => (
                  <div key={i} className="grid grid-cols-[2fr_1fr_1fr] items-center">
                    <div className="px-3 py-2.5">
                      <div className="text-xs font-medium">{res?.name}</div>
                      <div className="text-[10px] text-muted-foreground">{med.name} {med.dose}</div>
                    </div>
                    <div className="px-3 py-2.5">
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-medium",
                        pass === "AM" ? "bg-warning/10 text-warning" :
                        pass === "Noon" ? "bg-primary/10 text-primary" :
                        pass === "PM" ? "bg-accent/10 text-accent" :
                        "bg-muted/30 text-muted-foreground",
                      )}>
                        {pass}
                      </span>
                    </div>
                    <div className="px-3 py-2.5 text-xs text-muted-foreground">{res?.room}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PRN frequency */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            PRN Frequency — This Month
          </div>
          {prnByFreq.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
              No PRNs recorded
            </div>
          ) : (
            <div className="space-y-2">
              {prnByFreq.map(({ med, count }) => {
                const res = residents.find((r) => r.id === med!.residentId);
                const pct = Math.round((count / prnAdministrations.length) * 100);
                return (
                  <div key={med!.id} className="rounded-lg border border-border bg-card p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <div className="text-xs font-medium">{med!.name} {med!.dose}</div>
                        <div className="text-[10px] text-muted-foreground">{res?.name}</div>
                      </div>
                      <span className="font-mono text-sm font-bold">{count}×</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Refusal log */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Refusals This Month ({refusals.length})
        </div>
        {refusals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">No refusals recorded this month</div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] border-b border-border bg-secondary/40">
              {["Resident", "Medication", "Pass", "Date", "Reason"].map((h) => (
                <div key={h} className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">{h}</div>
              ))}
            </div>
            <div className="divide-y divide-border/50">
              {refusals.map((a) => {
                const med = medications.find((m) => m.id === a.medicationId);
                const res = residents.find((r) => r.id === a.residentId);
                return (
                  <div key={a.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] items-center bg-destructive/3">
                    <div className="px-3 py-2.5 flex items-center gap-2">
                      <X size={11} className="text-destructive shrink-0" />
                      <div>
                        <div className="text-xs font-medium">{res?.name}</div>
                        <div className="text-[10px] text-muted-foreground">{res?.room}</div>
                      </div>
                    </div>
                    <div className="px-3 py-2.5 text-xs">{med?.name} {med?.dose}</div>
                    <div className="px-3 py-2.5 text-xs text-muted-foreground">{a.passTime}</div>
                    <div className="px-3 py-2.5 text-xs font-mono text-muted-foreground">{a.date}</div>
                    <div className="px-3 py-2.5 text-xs text-muted-foreground italic">{a.refusalReason || "—"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
