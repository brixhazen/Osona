import { useState } from "react";
import { Plus } from "lucide-react";
import { type Resident, type ResidentClinicalData, type AssistLevel, type AdlRecord } from "@/lib/mock/clinical";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface Props {
  resident: Resident;
  data: ResidentClinicalData;
  onAddRecord: (r: AdlRecord) => void;
}

type AdlKey = "bathing" | "dressing" | "grooming" | "mobility" | "eating" | "toileting";

const ADL_COLS: { key: AdlKey; label: string }[] = [
  { key: "bathing", label: "Bathing" },
  { key: "dressing", label: "Dressing" },
  { key: "grooming", label: "Grooming" },
  { key: "mobility", label: "Mobility" },
  { key: "eating", label: "Eating" },
  { key: "toileting", label: "Toileting" },
];

const ASSIST_LEVELS: AssistLevel[] = ["independent", "supervision", "limited", "extensive", "total", "na"];

const ASSIST_STYLES: Record<AssistLevel, { label: string; cls: string; full: string }> = {
  independent: { label: "Ind", cls: "bg-success/15 text-success border-success/25", full: "Independent" },
  supervision: { label: "Sup", cls: "bg-primary/15 text-primary border-primary/25", full: "Supervision" },
  limited: { label: "Ltd", cls: "bg-warning/15 text-warning border-warning/25", full: "Limited Assist" },
  extensive: { label: "Ext", cls: "bg-accent/20 text-accent border-accent/30", full: "Extensive Assist" },
  total: { label: "Tot", cls: "bg-destructive/15 text-destructive border-destructive/25", full: "Total Dependence" },
  na: { label: "—", cls: "bg-muted/30 text-muted-foreground border-border", full: "Not Applicable" },
};

const SHIFT_ORDER: Record<AdlRecord["shift"], number> = { Day: 0, Evening: 1, Night: 2 };

type AdlFormState = Record<AdlKey, AssistLevel>;

export function AdlTab({ resident, data, onAddRecord }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [shift, setShift] = useState<AdlRecord["shift"]>("Day");
  const [adlForm, setAdlForm] = useState<AdlFormState>({
    bathing: "supervision",
    dressing: "supervision",
    grooming: "supervision",
    mobility: "supervision",
    eating: "supervision",
    toileting: "supervision",
  });
  const [documentedBy, setDocumentedBy] = useState("Current User, CNA");

  function handleSave() {
    const today = new Date().toISOString().slice(0, 10);
    const newRecord: AdlRecord = {
      date: today,
      shift,
      adls: { ...adlForm },
      documentedBy: documentedBy.trim() || "Current User, CNA",
    };
    onAddRecord(newRecord);
    setSheetOpen(false);
  }

  const byDate = new Map<string, AdlRecord[]>();
  for (const r of data.adlRecords) {
    if (!byDate.has(r.date)) byDate.set(r.date, []);
    byDate.get(r.date)!.push(r);
  }
  const dates = [...byDate.keys()].sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(Object.entries(ASSIST_STYLES) as [AssistLevel, typeof ASSIST_STYLES[AssistLevel]][])
            .filter(([k]) => k !== "na")
            .map(([level, { label, cls, full }]) => (
              <span key={level} className={cn("text-[10px] px-2 py-1 rounded border font-medium", cls)}>
                {label} = {full}
              </span>
            ))}
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium shrink-0 ml-3"
        >
          <Plus size={13} />
          Document Shift
        </button>
      </div>

      {data.adlRecords.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">No ADL records found.</p>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-xs min-w-max">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-4 py-2.5 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider whitespace-nowrap">
                  Date / Shift
                </th>
                {ADL_COLS.map((col) => (
                  <th
                    key={col.key}
                    className="text-center px-3 py-2.5 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="text-left px-4 py-2.5 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider whitespace-nowrap">
                  Documented By
                </th>
              </tr>
            </thead>
            <tbody>
              {dates.flatMap((date) => {
                const records = [...(byDate.get(date) ?? [])].sort(
                  (a, b) => (SHIFT_ORDER[a.shift] ?? 9) - (SHIFT_ORDER[b.shift] ?? 9),
                );
                return records.map((r, i) => (
                  <tr
                    key={`${date}-${r.shift}`}
                    className={cn("border-b border-border last:border-0", i === 0 ? "" : "bg-surface/20")}
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {i === 0 && <div className="font-medium">{date}</div>}
                      <div className="text-[11px] text-muted-foreground">{r.shift} shift</div>
                    </td>
                    {ADL_COLS.map((col) => {
                      const level = r.adls[col.key];
                      const { label, cls } = ASSIST_STYLES[level];
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-center">
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium font-mono", cls)}>
                            {label}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{r.documentedBy}</td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Document Shift Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[480px] bg-card border-l border-border overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Document ADL Shift</SheetTitle>
            <SheetDescription>
              {resident.firstName} {resident.lastName} · Room {resident.room}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5">
            {/* Shift selector */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Shift</label>
              <div className="flex gap-2">
                {(["Day", "Evening", "Night"] as AdlRecord["shift"][]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setShift(s)}
                    className={cn(
                      "flex-1 py-2 rounded text-sm font-medium border transition-colors",
                      shift === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* ADL fields */}
            <div className="space-y-4">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">ADL Performance</label>
              {ADL_COLS.map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs font-medium block mb-1.5">{label}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ASSIST_LEVELS.map((level) => {
                      const { label: abbr, cls, full } = ASSIST_STYLES[level];
                      return (
                        <button
                          key={level}
                          onClick={() => setAdlForm((f) => ({ ...f, [key]: level }))}
                          className={cn(
                            "px-2.5 py-1 rounded text-xs font-medium border transition-colors",
                            adlForm[key] === level
                              ? cn(cls, "ring-1 ring-offset-1 ring-current")
                              : "bg-card border-border text-muted-foreground hover:text-foreground",
                          )}
                          title={full}
                        >
                          {abbr}
                        </button>
                      );
                    })}
                    <span className="text-[11px] text-muted-foreground self-center ml-1">
                      {ASSIST_STYLES[adlForm[key]].full}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Documented by */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Documented By</label>
              <input
                value={documentedBy}
                onChange={(e) => setDocumentedBy(e.target.value)}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setSheetOpen(false)}
                className="flex-1 px-3 py-2 rounded text-sm border border-border text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-3 py-2 rounded text-sm bg-primary text-primary-foreground font-medium"
              >
                Save Shift Documentation
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
