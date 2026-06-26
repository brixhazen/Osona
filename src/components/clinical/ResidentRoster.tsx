import { useState } from "react";
import { Search, AlertTriangle, Shield, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { RESIDENTS, type Resident, type CareLevel } from "@/lib/mock/clinical";
import { cn } from "@/lib/utils";

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const CARE_LABELS: Record<CareLevel, string> = {
  memory_care: "Memory Care",
  assisted: "Assisted",
  independent: "Independent",
};

const CARE_COLORS: Record<CareLevel, string> = {
  memory_care: "bg-destructive/15 text-destructive border-destructive/25",
  assisted: "bg-primary/15 text-primary border-primary/25",
  independent: "bg-success/15 text-success border-success/25",
};

type FilterType = "all" | CareLevel;

export function ResidentRoster({ selectedId, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = RESIDENTS.filter((r) => {
    const matchCare = filter === "all" || r.careLevel === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.firstName.toLowerCase().includes(q) ||
      r.lastName.toLowerCase().includes(q) ||
      r.room.toLowerCase().includes(q) ||
      (r.preferredName ?? "").toLowerCase().includes(q);
    return matchCare && matchSearch;
  });

  return (
    <div className="w-72 shrink-0 flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search residents..."
          className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {(["all", "memory_care", "assisted", "independent"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {f === "all" ? "All" : CARE_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((r) => (
          <ResidentCard key={r.id} resident={r} selected={r.id === selectedId} onSelect={onSelect} />
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">No residents match.</p>
        )}
      </div>

      <Link
        to="/residents/roster"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-1 pt-2"
      >
        View all residents
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function ResidentCard({
  resident: r,
  selected,
  onSelect,
}: {
  resident: Resident;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const displayName = r.preferredName
    ? `${r.preferredName} ${r.lastName}`
    : `${r.firstName} ${r.lastName}`;

  return (
    <button
      onClick={() => onSelect(r.id)}
      className={cn(
        "w-full text-left rounded-lg border p-3 transition-all",
        selected
          ? "bg-primary/10 border-primary/40"
          : "bg-card border-border hover:border-primary/30 hover:bg-surface",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate">{displayName}</div>
          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
            {r.room} · {r.age}{r.gender[0]}
          </div>
        </div>
        <span className={cn("shrink-0 text-[10px] px-1.5 py-0.5 rounded border font-medium", CARE_COLORS[r.careLevel])}>
          {CARE_LABELS[r.careLevel]}
        </span>
      </div>

      <div className="text-[11px] text-muted-foreground mt-1.5 truncate">{r.primaryDx[0]}</div>

      <div className="flex gap-1.5 mt-2 flex-wrap">
        {r.fallRisk === "high" && (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/25">
            <AlertTriangle className="w-2.5 h-2.5" /> Fall
          </span>
        )}
        {r.elopementRisk === "high" && (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-warning/15 text-warning border border-warning/25">
            <Shield className="w-2.5 h-2.5" /> Elope
          </span>
        )}
        {r.dnr && (
          <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border">
            DNR
          </span>
        )}
      </div>
    </button>
  );
}
