import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Check, X, Pause, UserX, Minus } from "lucide-react";
import {
  PASS_TIMES, ROUTE_LABELS, STATUS_CONFIG,
  type EmarResident, type Medication, type MedAdministration, type PassTime,
} from "@/lib/mock/emar";

interface Props {
  residents: EmarResident[];
  medications: Medication[];
  administrations: MedAdministration[];
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  given:         <Check size={9} className="text-success" />,
  refused:       <X size={9} className="text-destructive" />,
  held:          <Pause size={9} className="text-warning" />,
  not_available: <UserX size={9} className="text-muted-foreground" />,
  late:          <Minus size={9} className="text-accent" />,
};

const MONTH_DAYS = Array.from({ length: 17 }, (_, i) => i + 1); // June 1–17

export function ResidentMAR({ residents, medications, administrations }: Props) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(residents[0]?.id ?? null);

  const filtered = residents.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.room.toLowerCase().includes(search.toLowerCase()),
  );
  const selected = residents.find((r) => r.id === selectedId);
  const resMeds = medications.filter((m) => m.residentId === selectedId && m.active && !m.isPrn);

  function getAdm(medId: string, day: number, pass: PassTime) {
    const dateStr = `2026-06-${String(day).padStart(2, "0")}`;
    return administrations.find(
      (a) => a.medicationId === medId && a.date === dateStr && a.passTime === pass,
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-320px)] min-h-[500px]">
      {/* Resident list */}
      <div className="w-52 shrink-0 flex flex-col gap-2">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resident..."
            className="w-full rounded border border-border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {filtered.map((r) => {
            const meds = medications.filter((m) => m.residentId === r.id && m.active);
            return (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-all",
                  selectedId === r.id
                    ? "bg-primary/10 border-primary/30 text-foreground"
                    : "border-border hover:border-primary/20 hover:bg-surface text-muted-foreground",
                )}
              >
                <div className="font-medium text-foreground">{r.name}</div>
                <div className="text-[10px] text-muted-foreground">{r.room} · {meds.length} meds</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAR grid */}
      {selected ? (
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Resident header */}
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold">{selected.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{selected.room} · {selected.wing} · DOB: {selected.dob}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Physician: {selected.primaryPhysician}</div>
                {selected.allergies.length > 0 && (
                  <div className="text-[11px] text-destructive font-medium mt-0.5">
                    ⚠ Allergies: {selected.allergies.join(", ")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-auto rounded-lg border border-border">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-border">
                  <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground sticky left-0 bg-secondary/40 min-w-[200px]">Medication</th>
                  <th className="px-2 py-2 text-[10px] uppercase tracking-wider text-muted-foreground min-w-[40px]">Pass</th>
                  {MONTH_DAYS.map((d) => (
                    <th key={d} className="px-1 py-2 text-center text-muted-foreground font-mono min-w-[28px]">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {resMeds.map((med) =>
                  med.scheduledPasses.map((pass, pi) => (
                    <tr
                      key={`${med.id}-${pass}`}
                      className={cn(
                        "hover:bg-surface transition-colors",
                        pi === 0 ? "" : "border-t-0",
                      )}
                    >
                      {pi === 0 ? (
                        <td
                          rowSpan={med.scheduledPasses.length}
                          className="px-3 py-2 sticky left-0 bg-card border-r border-border/50 align-top"
                        >
                          <div className="font-medium text-xs">{med.name} {med.dose}</div>
                          <div className="text-muted-foreground text-[10px]">{ROUTE_LABELS[med.route]} · {med.indication}</div>
                          {med.isControlled && (
                            <span className="inline-block mt-0.5 text-[9px] px-1 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">
                              Sch {med.controlledSchedule}
                            </span>
                          )}
                        </td>
                      ) : null}
                      <td className="px-2 py-2 text-center border-r border-border/30">
                        <span className={cn(
                          "text-[9px] px-1 py-0.5 rounded font-medium",
                          pass === "AM" ? "bg-warning/10 text-warning" :
                          pass === "Noon" ? "bg-primary/10 text-primary" :
                          pass === "PM" ? "bg-accent/10 text-accent" :
                          "bg-muted/30 text-muted-foreground",
                        )}>
                          {pass}
                        </span>
                      </td>
                      {MONTH_DAYS.map((d) => {
                        const adm = getAdm(med.id, d, pass);
                        return (
                          <td key={d} className="px-1 py-2 text-center">
                            {adm ? (
                              <div className="flex items-center justify-center" title={`${STATUS_CONFIG[adm.status].label}${adm.givenBy ? ` — ${adm.givenBy}` : ""}`}>
                                {STATUS_ICON[adm.status]}
                              </div>
                            ) : d <= 17 ? (
                              <div className="w-3 h-3 mx-auto rounded-sm bg-muted/30" />
                            ) : (
                              <div className="w-3 h-3 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  )),
                )}
              </tbody>
            </table>

            {resMeds.length === 0 && (
              <div className="py-16 text-center text-sm text-muted-foreground italic">
                No scheduled medications on file.
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground px-1">
            <span className="font-semibold">Legend:</span>
            {Object.entries(STATUS_ICON).map(([s, icon]) => (
              <span key={s} className="flex items-center gap-1">
                {icon}
                <span className="capitalize">{STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s}</span>
              </span>
            ))}
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted/30 inline-block" />
              Not documented
            </span>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid place-items-center text-sm text-muted-foreground">
          Select a resident to view their MAR.
        </div>
      )}
    </div>
  );
}
