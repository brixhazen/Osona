import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Check, Lock, Plus } from "lucide-react";
import { STAFF, type EmarResident, type Medication, type MedAdministration, type ControlledCount } from "@/lib/mock/emar";

interface Props {
  residents: EmarResident[];
  medications: Medication[];
  administrations: MedAdministration[];
  counts: ControlledCount[];
  onAddCount: (count: ControlledCount) => void;
}

export function ControlledSubstances({ residents, medications, administrations, counts, onAddCount }: Props) {
  const [countingId, setCountingId] = useState<string | null>(null);
  const [actual, setActual] = useState("");
  const [oncoming, setOncoming] = useState(STAFF[0]);
  const [offgoing, setOffgoing] = useState(STAFF[1]);
  const [countNotes, setCountNotes] = useState("");
  const [shift, setShift] = useState<"day" | "evening" | "night">("day");

  const today = new Date().toISOString().slice(0, 10);
  const controlledMeds = medications.filter((m) => m.isControlled && m.active);

  function getLatestCount(medId: string) {
    return counts
      .filter((c) => c.medicationId === medId)
      .sort((a, b) => `${b.date}${b.shift}`.localeCompare(`${a.date}${a.shift}`))[0];
  }

  function submitCount(med: Medication) {
    const actualNum = parseInt(actual);
    if (isNaN(actualNum)) return;
    const latest = getLatestCount(med.id);
    const expected = latest?.actualCount ?? latest?.expectedCount ?? 0;
    onAddCount({
      id: `cc-${Date.now()}`,
      medicationId: med.id,
      residentId: med.residentId,
      date: today,
      shift,
      expectedCount: expected,
      actualCount: actualNum,
      oncomingStaff: oncoming,
      offgoingStaff: offgoing,
      notes: countNotes.trim() || undefined,
    });
    setCountingId(null);
    setActual("");
    setCountNotes("");
  }

  const discrepancies = controlledMeds.filter((m) => {
    const latest = getLatestCount(m.id);
    return latest && latest.actualCount !== latest.expectedCount;
  });

  return (
    <div className="flex flex-col gap-5">
      {discrepancies.length > 0 && (
        <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3">
          <AlertTriangle size={14} className="text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Count Discrepancy — Immediate Action Required</p>
            {discrepancies.map((m) => {
              const latest = getLatestCount(m.id);
              const res = residents.find((r) => r.id === m.residentId);
              return (
                <p key={m.id} className="text-xs text-muted-foreground mt-0.5">
                  {m.name} {m.dose} — {res?.name} ({res?.room}): expected {latest?.expectedCount}, counted {latest?.actualCount}.
                  {latest?.notes && <span className="italic ml-1">{latest.notes}</span>}
                </p>
              );
            })}
          </div>
        </div>
      )}

      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        Controlled Substances ({controlledMeds.length})
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_120px] border-b border-border bg-secondary/40">
          {["Medication / Resident", "Schedule", "Room", "Expected", "Last Count", "Status", ""].map((h) => (
            <div key={h} className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">{h}</div>
          ))}
        </div>

        <div className="divide-y divide-border/50">
          {controlledMeds.map((med) => {
            const res = residents.find((r) => r.id === med.residentId);
            const latest = getLatestCount(med.id);
            const isDiscrepancy = latest && latest.actualCount !== latest.expectedCount;
            const isCounting = countingId === med.id;

            return (
              <div key={med.id}>
                <div className={cn(
                  "grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_120px] items-center",
                  isDiscrepancy ? "bg-destructive/5" : "",
                )}>
                  <div className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Lock size={11} className="text-muted-foreground shrink-0" />
                      <div>
                        <div className="text-xs font-medium">{med.name} {med.dose}</div>
                        <div className="text-[10px] text-muted-foreground">{res?.name}</div>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                      Sch {med.controlledSchedule}
                    </span>
                  </div>
                  <div className="px-3 py-3 text-xs text-muted-foreground">{res?.room}</div>
                  <div className="px-3 py-3 text-xs font-mono">{latest?.expectedCount ?? "—"}</div>
                  <div className={cn("px-3 py-3 text-xs font-mono font-semibold", isDiscrepancy ? "text-destructive" : "text-success")}>
                    {latest?.actualCount ?? "—"}
                  </div>
                  <div className="px-3 py-3">
                    {!latest ? (
                      <span className="text-[10px] text-muted-foreground italic">No count</span>
                    ) : isDiscrepancy ? (
                      <span className="flex items-center gap-1 text-[10px] text-destructive font-medium">
                        <AlertTriangle size={10} /> Discrepancy
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-success font-medium">
                        <Check size={10} /> Verified
                      </span>
                    )}
                  </div>
                  <div className="px-3 py-3">
                    <button
                      onClick={() => { setCountingId(isCounting ? null : med.id); setActual(""); setCountNotes(""); }}
                      className="text-[11px] px-2 py-1 rounded border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                    >
                      {isCounting ? "Cancel" : "Count Now"}
                    </button>
                  </div>
                </div>

                {isCounting && (
                  <div className="px-4 py-4 bg-primary/5 border-t border-primary/10 space-y-3">
                    <p className="text-xs font-semibold text-primary">Count Verification — {med.name} {med.dose} · {res?.name}</p>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">Shift</label>
                        <select value={shift} onChange={(e) => setShift(e.target.value as "day" | "evening" | "night")}
                          className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
                          <option value="day">Day</option>
                          <option value="evening">Evening</option>
                          <option value="night">Night</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">Actual Count <span className="text-destructive">*</span></label>
                        <input type="number" value={actual} onChange={(e) => setActual(e.target.value)} autoFocus
                          placeholder={String(latest?.actualCount ?? latest?.expectedCount ?? 0)}
                          className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">Oncoming Staff</label>
                        <select value={oncoming} onChange={(e) => setOncoming(e.target.value)}
                          className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
                          {STAFF.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">Offgoing Staff</label>
                        <select value={offgoing} onChange={(e) => setOffgoing(e.target.value)}
                          className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
                          {STAFF.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-1">Notes (required if discrepancy)</label>
                      <input value={countNotes} onChange={(e) => setCountNotes(e.target.value)}
                        placeholder="Optional — explain any variance..."
                        className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setCountingId(null)} className="px-3 py-1.5 rounded border border-border text-xs text-muted-foreground">Cancel</button>
                      <button onClick={() => submitCount(med)} disabled={!actual.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-primary text-primary-foreground font-medium disabled:opacity-40">
                        <Check size={11} /> Submit Count
                      </button>
                    </div>
                  </div>
                )}

                {latest && (
                  <div className="px-4 py-2 bg-muted/10 border-t border-border/30 text-[10px] text-muted-foreground flex items-center gap-4">
                    <span>Last counted: {latest.date} · {latest.shift} shift</span>
                    <span>Oncoming: {latest.oncomingStaff}</span>
                    <span>Offgoing: {latest.offgoingStaff}</span>
                    {latest.notes && <span className="text-destructive">{latest.notes}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
