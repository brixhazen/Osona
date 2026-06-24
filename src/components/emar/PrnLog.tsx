import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Check, Clock } from "lucide-react";
import { STAFF, type EmarResident, type Medication, type PrnAdministration } from "@/lib/mock/emar";

interface Props {
  residents: EmarResident[];
  medications: Medication[];
  prnAdministrations: PrnAdministration[];
  onAddPrn: (prn: PrnAdministration) => void;
  onUpdatePrn: (id: string, updates: Partial<PrnAdministration>) => void;
}

export function PrnLog({ residents, medications, prnAdministrations, onAddPrn, onUpdatePrn }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [residentId, setResidentId] = useState(residents[0]?.id ?? "");
  const [medId, setMedId] = useState("");
  const [reason, setReason] = useState("");
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [givenBy, setGivenBy] = useState(STAFF[0]);
  const [followUpId, setFollowUpId] = useState<string | null>(null);
  const [followUpText, setFollowUpText] = useState("");
  const [followUpTime, setFollowUpTime] = useState(new Date().toTimeString().slice(0, 5));

  const today = new Date().toISOString().slice(0, 10);
  const todayPrns = prnAdministrations.filter((p) => p.date === today);

  const prnMedsForResident = medications.filter((m) => m.residentId === residentId && m.isPrn && m.active);

  function submitPrn() {
    if (!residentId || !medId || !reason.trim()) return;
    onAddPrn({
      id: `prn-${Date.now()}`,
      medicationId: medId,
      residentId,
      date: today,
      time,
      givenBy,
      reason: reason.trim(),
    });
    setShowForm(false);
    setReason("");
    setMedId("");
  }

  function submitFollowUp(id: string) {
    if (!followUpText.trim()) return;
    onUpdatePrn(id, {
      effectiveness: followUpText.trim(),
      followUpTime,
      followUpBy: givenBy,
    });
    setFollowUpId(null);
    setFollowUpText("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          PRN Administrations — Today ({todayPrns.length})
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
        >
          <Plus size={12} />
          Log PRN
        </button>
      </div>

      {/* Log PRN form */}
      {showForm && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
          <p className="text-xs font-semibold text-primary">New PRN Administration</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Resident <span className="text-destructive">*</span></label>
              <select
                value={residentId}
                onChange={(e) => { setResidentId(e.target.value); setMedId(""); }}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {residents.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.room})</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Medication <span className="text-destructive">*</span></label>
              <select
                value={medId}
                onChange={(e) => setMedId(e.target.value)}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select PRN med...</option>
                {prnMedsForResident.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} {m.dose}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Time Given</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Given By</label>
              <select
                value={givenBy}
                onChange={(e) => setGivenBy(e.target.value)}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {STAFF.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-muted-foreground block mb-1">Reason Given <span className="text-destructive">*</span></label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe the indication (e.g. resident c/o pain 6/10 in right hip)..."
                rows={2}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          {medId && (
            <div className="text-[10px] text-muted-foreground bg-muted/20 rounded px-2.5 py-1.5">
              {medications.find((m) => m.id === medId)?.instructions ?? "No special instructions."}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            <button
              onClick={submitPrn}
              disabled={!residentId || !medId || !reason.trim()}
              className="px-3 py-1.5 rounded text-xs bg-primary text-primary-foreground font-medium disabled:opacity-40"
            >
              Save PRN
            </button>
          </div>
        </div>
      )}

      {/* PRN list */}
      {todayPrns.length === 0 && !showForm && (
        <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          No PRN administrations recorded today.
        </div>
      )}

      <div className="space-y-3">
        {todayPrns.map((prn) => {
          const med = medications.find((m) => m.id === prn.medicationId);
          const res = residents.find((r) => r.id === prn.residentId);
          const isFollowingUp = followUpId === prn.id;
          const needsFollowUp = !prn.effectiveness;

          return (
            <div key={prn.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{res?.name}</span>
                    <span className="text-[11px] text-muted-foreground">{res?.room}</span>
                  </div>
                  <div className="text-xs font-medium mt-0.5">{med?.name} {med?.dose}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-xs text-muted-foreground">{prn.time}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{prn.givenBy}</div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mb-2 pl-2.5 border-l-2 border-primary/30">
                <span className="font-medium text-foreground">Reason: </span>{prn.reason}
              </div>

              {prn.effectiveness ? (
                <div className="text-xs text-muted-foreground pl-2.5 border-l-2 border-success/40">
                  <span className="flex items-center gap-1 font-medium text-success mb-0.5">
                    <Check size={11} /> Follow-up documented
                  </span>
                  {prn.effectiveness}
                  {prn.followUpTime && <span className="ml-1 font-mono text-[10px]">— {prn.followUpTime} by {prn.followUpBy}</span>}
                </div>
              ) : (
                <>
                  {!isFollowingUp ? (
                    <button
                      onClick={() => setFollowUpId(prn.id)}
                      className={cn(
                        "flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded border transition-colors",
                        needsFollowUp
                          ? "border-accent/30 text-accent hover:bg-accent/10"
                          : "border-border text-muted-foreground hover:text-primary",
                      )}
                    >
                      <Clock size={10} />
                      {needsFollowUp ? "Follow-up needed" : "Add follow-up"}
                    </button>
                  ) : (
                    <div className="space-y-2 mt-2 pt-2 border-t border-border/50">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-0.5">Follow-up time</label>
                          <input
                            type="time"
                            value={followUpTime}
                            onChange={(e) => setFollowUpTime(e.target.value)}
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-0.5">By</label>
                          <select
                            value={givenBy}
                            onChange={(e) => setGivenBy(e.target.value)}
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            {STAFF.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                      <textarea
                        value={followUpText}
                        onChange={(e) => setFollowUpText(e.target.value)}
                        placeholder="Effectiveness / resident response..."
                        rows={2}
                        autoFocus
                        className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setFollowUpId(null)} className="px-2.5 py-1 rounded border border-border text-xs text-muted-foreground">Cancel</button>
                        <button
                          onClick={() => submitFollowUp(prn.id)}
                          disabled={!followUpText.trim()}
                          className="px-2.5 py-1 rounded text-xs bg-primary text-primary-foreground font-medium disabled:opacity-40"
                        >
                          Save Follow-Up
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
