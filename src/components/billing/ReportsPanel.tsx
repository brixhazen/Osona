import { useState } from "react";
import { cn } from "@/lib/utils";
import { Download, FileText, BarChart3, Users, Shield, Check, Loader2 } from "lucide-react";

interface Report {
  id: string;
  name: string;
  description: string;
  category: "financial" | "occupancy" | "compliance";
  format: string;
}

const REPORTS: Report[] = [
  { id: "r01", name: "Monthly Invoice Register", description: "All invoices generated in May 2026 with amounts by resident and payer", category: "financial", format: "Excel / PDF" },
  { id: "r02", name: "A/R Aging Report", description: "Outstanding balances bucketed into 0–30, 31–60, 61–90, 90+ days", category: "financial", format: "Excel / PDF" },
  { id: "r03", name: "Payer Mix Analysis", description: "Revenue breakdown by payer type with trend vs prior 3 months", category: "financial", format: "Excel" },
  { id: "r04", name: "Payment Ledger", description: "All payments received in May 2026 — date, method, amount, reference", category: "financial", format: "Excel" },
  { id: "r05", name: "Ancillary Revenue Summary", description: "All ancillary charges posted this month broken down by category", category: "financial", format: "Excel" },
  { id: "r06", name: "Rate Change History", description: "All rate changes by resident with effective dates and approval trail", category: "financial", format: "Excel" },
  { id: "r07", name: "GL Journal Entry Export", description: "Monthly journal entries by cost center — ready for QuickBooks / Sage import", category: "financial", format: "CSV / XML" },
  { id: "r08", name: "Revenue Forecast", description: "Projected revenue based on current census, rates, and LOC distribution", category: "financial", format: "Excel" },
  { id: "r09", name: "Monthly Census Report", description: "All residents active on each day of May 2026 — drives revenue calculations", category: "occupancy", format: "Excel / PDF" },
  { id: "r10", name: "Move-In / Move-Out Log", description: "All admissions and discharges with proration details and community fees", category: "occupancy", format: "Excel" },
  { id: "r11", name: "Vacancy Analysis", description: "Occupied vs. available units by wing; revenue foregone from vacancy", category: "occupancy", format: "Excel / PDF" },
  { id: "r12", name: "Loss-to-Lease Report", description: "Market rate vs. actual billed rate per unit — identifies discount concentration", category: "occupancy", format: "Excel" },
  { id: "r13", name: "Trust Fund Ledger", description: "All resident trust account transactions with running balances — by resident", category: "compliance", format: "PDF" },
  { id: "r14", name: "Resident Trust Quarterly Statement", description: "Resident-facing trust account statement required by state regulations", category: "compliance", format: "PDF" },
  { id: "r15", name: "Collections Activity Log", description: "Follow-up contacts, letters sent, and escalations for AR over 60 days", category: "compliance", format: "Excel / PDF" },
  { id: "r16", name: "Bed Hold / Leave Billing Report", description: "Residents on therapeutic or personal leave with billing adjustments applied", category: "compliance", format: "Excel" },
];

const CATEGORY_CONFIG = {
  financial: { label: "Financial", icon: <BarChart3 size={13} />, cls: "bg-primary/10 text-primary" },
  occupancy: { label: "Occupancy", icon: <Users size={13} />, cls: "bg-success/10 text-success" },
  compliance: { label: "Compliance", icon: <Shield size={13} />, cls: "bg-accent/10 text-accent" },
};

const CATEGORIES = ["financial", "occupancy", "compliance"] as const;

export function ReportsPanel() {
  const [generating, setGenerating] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<Set<string>>(new Set());

  function handleGenerate(id: string) {
    if (generating.has(id) || done.has(id)) return;
    setGenerating((prev) => new Set([...prev, id]));
    setTimeout(() => {
      setGenerating((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
      setDone((prev) => new Set([...prev, id]));
    }, 1400);
  }

  return (
    <div className="flex flex-col gap-6">
      {CATEGORIES.map((cat) => {
        const catReports = REPORTS.filter((r) => r.category === cat);
        const cfg = CATEGORY_CONFIG[cat];

        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full", cfg.cls)}>
                {cfg.icon}
                {cfg.label}
              </span>
              <span className="text-[11px] text-muted-foreground">{catReports.length} reports</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {catReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  isGenerating={generating.has(report.id)}
                  isDone={done.has(report.id)}
                  onGenerate={() => handleGenerate(report.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReportCard({
  report, isGenerating, isDone, onGenerate,
}: {
  report: Report;
  isGenerating: boolean;
  isDone: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-4 flex flex-col gap-3 transition-all duration-200",
      isDone ? "border-success/30 bg-success/5" : "border-border hover:border-primary/30",
    )}>
      <div className="flex items-start gap-3">
        <FileText
          size={15}
          className={cn("mt-0.5 shrink-0 transition-colors", isDone ? "text-success" : "text-muted-foreground")}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{report.name}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{report.description}</div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <span className="text-[10px] text-muted-foreground font-mono">{report.format}</span>
        <button
          onClick={onGenerate}
          disabled={isGenerating || isDone}
          className={cn(
            "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border transition-all duration-200 cursor-pointer",
            isDone
              ? "border-success/25 text-success bg-success/5 cursor-default"
              : isGenerating
              ? "border-border text-muted-foreground bg-secondary/50 cursor-not-allowed"
              : "border-border hover:bg-secondary hover:border-primary/30 text-muted-foreground hover:text-foreground",
          )}
        >
          {isGenerating ? (
            <><Loader2 size={11} className="animate-spin" /> Generating…</>
          ) : isDone ? (
            <><Check size={11} /> Ready to Download</>
          ) : (
            <><Download size={11} /> Generate</>
          )}
        </button>
      </div>
    </div>
  );
}
