import { CLINICAL_FLAGS } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

const TONES = {
  good: "text-success",
  ok: "text-foreground",
  warn: "text-accent",
} as const;

export function ClinicalFlags() {
  return (
    <div className="rounded-lg bg-card border border-border p-5">
      <h3 className="font-display font-semibold tracking-tight mb-4">Clinical Quality Flags</h3>
      <div className="grid grid-cols-2 gap-3">
        {CLINICAL_FLAGS.map((f) => (
          <div key={f.label} className="rounded-md bg-surface-2/40 border border-border p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</div>
            <div className={cn("font-mono text-xl font-semibold mt-1", TONES[f.tone])}>{f.value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{f.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
