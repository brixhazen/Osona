import { useMemo, useState } from "react";
import { Search, Plus, AlertTriangle, Shield, ChevronDown, Users } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { RESIDENTS, CLINICAL_DATA, type CareLevel, type PayerType, type Wing } from "@/lib/mock/clinical";
import { cn } from "@/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
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

const AVATAR_BG: Record<CareLevel, string> = {
  memory_care: "bg-destructive/20 text-destructive",
  assisted: "bg-primary/20 text-primary",
  independent: "bg-success/20 text-success",
};

const PAYER_LABELS: Record<PayerType, string> = {
  private_pay: "Private Pay",
  medicaid: "Medicaid",
  ltci: "LTC Insurance",
  va: "VA",
};

const WING_ABBR: Record<Wing, string> = {
  "East Wing": "EW",
  "West Wing": "WW",
  "Memory Care": "MC",
  "Independent Living": "IL",
};

type SortKey = "name" | "room" | "care_level" | "alerts";
type CareFilter = "all" | CareLevel;

const FLAG_OPTIONS = [
  { id: "fall",  label: "High Fall Risk" },
  { id: "elope", label: "High Elopement" },
  { id: "dnr",   label: "DNR" },
  { id: "alert", label: "Open Alerts" },
] as const;

type FlagId = (typeof FLAG_OPTIONS)[number]["id"];

function calcLengthOfStay(moveInDate: string): string {
  const start = new Date(moveInDate + "T00:00:00");
  const now = new Date();
  const totalMonths =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months}m`;
  if (months === 0) return `${years}y`;
  return `${years}y ${months}m`;
}

export function RosterPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [careFilter, setCareFilter] = useState<CareFilter>("all");
  const [activeFlags, setActiveFlags] = useState<Set<FlagId>>(new Set());
  const [sort, setSort] = useState<SortKey>("name");

  const openAlertsByResident = useMemo(() => {
    const map = new Map<string, number>();
    for (const [id, data] of Object.entries(CLINICAL_DATA)) {
      const count = data.incidents.filter((i) => i.status !== "closed").length;
      if (count > 0) map.set(id, count);
    }
    return map;
  }, []);

  const census = useMemo(() => ({
    total: RESIDENTS.length,
    memory_care: RESIDENTS.filter((r) => r.careLevel === "memory_care").length,
    assisted: RESIDENTS.filter((r) => r.careLevel === "assisted").length,
    independent: RESIDENTS.filter((r) => r.careLevel === "independent").length,
  }), []);

  const filtered = useMemo(() => {
    let list = [...RESIDENTS];
    const q = search.toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.firstName.toLowerCase().includes(q) ||
          r.lastName.toLowerCase().includes(q) ||
          (r.preferredName ?? "").toLowerCase().includes(q) ||
          r.room.toLowerCase().includes(q),
      );
    }
    if (careFilter !== "all") list = list.filter((r) => r.careLevel === careFilter);
    if (activeFlags.has("fall"))  list = list.filter((r) => r.fallRisk === "high");
    if (activeFlags.has("elope")) list = list.filter((r) => r.elopementRisk === "high");
    if (activeFlags.has("dnr"))   list = list.filter((r) => r.dnr);
    if (activeFlags.has("alert")) list = list.filter((r) => openAlertsByResident.has(r.id));

    list.sort((a, b) => {
      if (sort === "name")       return `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
      if (sort === "room")       return a.room.localeCompare(b.room);
      if (sort === "care_level") return a.careLevel.localeCompare(b.careLevel);
      if (sort === "alerts")     return (openAlertsByResident.get(b.id) ?? 0) - (openAlertsByResident.get(a.id) ?? 0);
      return 0;
    });
    return list;
  }, [search, careFilter, activeFlags, sort, openAlertsByResident]);

  function toggleFlag(id: FlagId) {
    setActiveFlags((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Resident Roster"
        description="Census overview and quick access to resident records."
        icon={Users}
        color={MODULE_COLOR}
      />

      {/* Census summary + search + add */}
      <div className="flex items-center gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{census.total} residents</span>
          {" · "}
          {census.memory_care} Memory Care
          {" · "}
          {census.assisted} Assisted
          {" · "}
          {census.independent} Independent
        </p>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search residents..."
            className="w-64 bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: MODULE_COLOR }}
        >
          <Plus className="w-4 h-4" />
          Add Resident
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5">
          {(["all", "memory_care", "assisted", "independent"] as const).map((f) => {
            const active = careFilter === f;
            return (
              <button
                key={f}
                onClick={() => setCareFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                  active
                    ? "text-white border-transparent"
                    : "bg-card border-border text-muted-foreground hover:text-foreground",
                )}
                style={active ? { backgroundColor: MODULE_COLOR, borderColor: MODULE_COLOR } : {}}
              >
                {f === "all" ? "All" : CARE_LABELS[f]}
              </button>
            );
          })}
        </div>

        <div className="w-px h-5 bg-border" />

        <div className="flex gap-1.5 flex-wrap">
          {FLAG_OPTIONS.map((flag) => (
            <button
              key={flag.id}
              onClick={() => toggleFlag(flag.id)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors",
                activeFlags.has(flag.id)
                  ? "bg-destructive/15 text-destructive border-destructive/30"
                  : "bg-card border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {flag.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="appearance-none bg-card border border-border rounded-lg pl-3 pr-8 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          >
            <option value="name">Name A–Z</option>
            <option value="room">Room</option>
            <option value="care_level">Care Level</option>
            <option value="alerts">Alerts First</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="pl-4 text-xs">Resident</TableHead>
              <TableHead className="text-xs">Room / Wing</TableHead>
              <TableHead className="text-xs">Care Level</TableHead>
              <TableHead className="text-xs">Physician</TableHead>
              <TableHead className="text-xs">Payer</TableHead>
              <TableHead className="text-xs">Flags</TableHead>
              <TableHead className="text-xs">Stay</TableHead>
              <TableHead className="pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => {
              const displayName = r.preferredName
                ? `${r.preferredName} ${r.lastName}`
                : `${r.firstName} ${r.lastName}`;
              const initials = `${r.firstName[0]}${r.lastName[0]}`;
              const alertCount = openAlertsByResident.get(r.id) ?? 0;

              return (
                <TableRow
                  key={r.id}
                  className="cursor-pointer"
                  onClick={() => navigate({ to: "/clinical" })}
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                          AVATAR_BG[r.careLevel],
                        )}
                      >
                        {initials}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{displayName}</div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                          {r.primaryDx[0]}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-mono text-sm">{r.room}</div>
                    <div className="text-[11px] text-muted-foreground">{WING_ABBR[r.wing]}</div>
                  </TableCell>

                  <TableCell>
                    <span className={cn("text-[11px] px-2 py-0.5 rounded border font-medium", CARE_COLORS[r.careLevel])}>
                      {CARE_LABELS[r.careLevel]}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-xs">{r.physician}</span>
                  </TableCell>

                  <TableCell>
                    <span className="text-xs">{PAYER_LABELS[r.payerType]}</span>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
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
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border">
                          DNR
                        </span>
                      )}
                      {alertCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/25 font-bold">
                          {alertCount} alert{alertCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="text-xs font-mono text-muted-foreground">
                      {calcLengthOfStay(r.moveInDate)}
                    </span>
                  </TableCell>

                  <TableCell className="pr-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({ to: "/clinical" });
                      }}
                      className="text-xs text-primary hover:underline whitespace-nowrap"
                    >
                      Open Chart
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-sm text-muted-foreground">
                  No residents match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
