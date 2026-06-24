import { useState, useMemo } from "react";
import {
  WORK_ORDERS, PM_TASKS, ASSETS,
  type WorkOrder, type WorkOrderStatus, type PMTask, type Asset,
} from "@/lib/mock/maintenance";
import { syncMaintenanceWOs, syncMaintenancePM, syncMaintenanceAssets } from "@/lib/appStore";
import { cn } from "@/lib/utils";
import { AlertTriangle, ClipboardList, Package, TrendingDown, Wrench } from "lucide-react";
import { ModuleHeader } from "@/components/shell/ModuleHeader";
import { WorkOrders } from "./WorkOrders";
import { PreventiveMaintenance } from "./PreventiveMaintenance";
import { AssetRegistry } from "./AssetRegistry";
import { VendorDirectory } from "./VendorDirectory";
import { MaintenanceReports } from "./MaintenanceReports";

const MODULE_COLOR = "#94A3B8";

const TABS = [
  { id: "work-orders", label: "Work Orders" },
  { id: "pm",          label: "Preventive PM" },
  { id: "assets",      label: "Assets" },
  { id: "vendors",     label: "Vendors" },
  { id: "reports",     label: "Reports" },
] as const;

type TabId = typeof TABS[number]["id"];

const ASSET_CATEGORY_TO_WO: Record<string, string> = {
  elevator: "safety", hvac: "hvac", kitchen: "appliances",
  laundry: "appliances", generator: "electrical", plumbing: "plumbing",
  roof: "grounds", safety: "safety",
};

export function MaintenanceModule() {
  const [tab, setTab] = useState<TabId>("work-orders");
  const [localWOs, setLocalWOs] = useState<WorkOrder[]>(
    WORK_ORDERS.map((wo) => ({ ...wo })),
  );
  const [localPMTasks, setLocalPMTasks] = useState<PMTask[]>(
    PM_TASKS.map((t) => ({ ...t })),
  );
  const [localAssets, setLocalAssets] = useState<Asset[]>(
    ASSETS.map((a) => ({ ...a })),
  );

  // ── Mutations ─────────────────────────────────────────────────────────────────

  function assignWO(id: string, assignee: string, estimatedHours: number | null) {
    setLocalWOs((prev) => {
      const next = prev.map((wo) =>
        wo.id !== id ? wo : {
          ...wo,
          assignedTo: assignee,
          status: "assigned" as WorkOrderStatus,
          estimatedHours: estimatedHours ?? wo.estimatedHours,
        },
      );
      syncMaintenanceWOs(next);
      return next;
    });
  }

  function advanceWOStatus(id: string) {
    setLocalWOs((prev) => {
      const next = prev.map((wo) => {
        if (wo.id !== id) return wo;
        const status: WorkOrderStatus | null =
          wo.status === "assigned" ? "in_progress"
          : wo.status === "scheduled" ? "in_progress"
          : null;
        return status ? { ...wo, status } : wo;
      });
      syncMaintenanceWOs(next);
      return next;
    });
  }

  function callVendor(id: string) {
    setLocalWOs((prev) => {
      const next = prev.map((wo) =>
        wo.id !== id ? wo : { ...wo, status: "vendor_called" as WorkOrderStatus },
      );
      syncMaintenanceWOs(next);
      return next;
    });
  }

  function completeWO(id: string, actualHours: number, notes: string) {
    setLocalWOs((prev) => {
      const next = prev.map((wo) =>
        wo.id !== id ? wo : {
          ...wo,
          status: "completed" as WorkOrderStatus,
          actualHours,
          completedDate: "2026-06-05",
          notes: notes || wo.notes,
        },
      );
      syncMaintenanceWOs(next);
      return next;
    });
  }

  function addWorkOrder(data: Omit<WorkOrder, "id">) {
    const maxId = Math.max(...localWOs.map((wo) => parseInt(wo.id.split("-")[1] ?? "0")));
    const newId = `WO-${String(maxId + 1).padStart(4, "0")}`;
    setLocalWOs((prev) => {
      const next = [{ ...data, id: newId }, ...prev];
      syncMaintenanceWOs(next);
      return next;
    });
  }

  function completePMTask(id: string) {
    setLocalPMTasks((prev) => {
      const next = prev.map((t) =>
        t.id !== id ? t : {
          ...t,
          status: "current" as const,
          lastCompleted: "2026-06-05",
          nextDue: "2026-07-05",
          daysUntilDue: 30,
        },
      );
      syncMaintenancePM(next.filter((t) => t.status === "current").length, next.length);
      return next;
    });
  }

  function logAssetService(assetId: string) {
    setLocalAssets((prev) => {
      const next = prev.map((a) =>
        a.id !== assetId ? a : {
          ...a,
          lastServiceDate: "2026-06-05",
          nextServiceDate: "2026-12-05",
          serviceStatus: "current" as const,
        },
      );
      syncMaintenanceAssets(next.filter((a) => a.serviceStatus === "overdue" || a.serviceStatus === "due_soon").length);
      return next;
    });
  }

  function createWOFromAsset(asset: Asset) {
    const category = (ASSET_CATEGORY_TO_WO[asset.category] ?? "safety") as WorkOrder["category"];
    addWorkOrder({
      priority: asset.serviceStatus === "overdue" ? "urgent" : "standard",
      status: "open",
      category,
      title: `Scheduled Service — ${asset.name}`,
      location: asset.location,
      description: `Maintenance service required for ${asset.name}. ${asset.notes ?? ""}`.trim(),
      reportedBy: "Asset Registry",
      reportedDate: "2026-06-05",
      assignedTo: asset.vendor ?? null,
      estimatedHours: 2,
      actualHours: null,
      completedDate: null,
      residentRoom: null,
      residentName: null,
      safetyFlag: asset.serviceStatus === "overdue",
      vendorId: null,
      notes: null,
    });
    setTab("work-orders");
  }

  // ── Live KPIs ─────────────────────────────────────────────────────────────────

  const openWOs = localWOs.filter((wo) => wo.status !== "completed");
  const emergencyOpen = openWOs.filter((wo) => wo.priority === "emergency");
  const pmCurrentCount = localPMTasks.filter((t) => t.status === "current").length;
  const pmCompletionPct = Math.round((pmCurrentCount / localPMTasks.length) * 100);
  const assetsNeedingAttention = localAssets.filter(
    (a) => a.serviceStatus === "overdue" || a.serviceStatus === "due_soon",
  ).length;
  const pmOverdueCount = localPMTasks.filter((t) => t.status === "overdue").length;

  const firstEmergency = emergencyOpen[0] ?? null;

  const VARIANT_STYLES = {
    danger: "border-destructive/30 bg-destructive/5 text-destructive",
    warn:   "border-accent/30 bg-accent/5 text-accent",
    ok:     "border-border bg-card text-foreground",
  } as const;

  const kpiCards = [
    { label: "Open Work Orders", value: String(openWOs.length), sub: `${emergencyOpen.length} emergency`, variant: "danger" as const, icon: <ClipboardList size={14} /> },
    { label: "PM Completion",    value: `${pmCompletionPct}%`,  sub: "this month",                        variant: pmCompletionPct >= 80 ? "ok" as const : "warn" as const, icon: <Wrench size={14} /> },
    { label: "Avg Response",     value: "1.8h",                  sub: "emergency · 22h urgent",           variant: "ok" as const,   icon: <TrendingDown size={14} /> },
    { label: "Assets Needing Service", value: String(assetsNeedingAttention), sub: "overdue service", variant: assetsNeedingAttention > 0 ? "warn" as const : "ok" as const, icon: <Package size={14} /> },
    { label: "Monthly Budget",   value: "$8.4k",                 sub: "of $12k used",                     variant: "ok" as const,   icon: null },
  ];

  return (
    <div className="flex flex-col gap-4 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Maintenance & Facilities"
        description="Work orders, preventive maintenance, assets, and vendor management."
        icon={Wrench}
        color={MODULE_COLOR}
      />

      {/* KPI bar */}
      <div className="grid grid-cols-5 gap-3">
        {kpiCards.map((k) => (
          <div key={k.label} className={cn("rounded-lg border p-3", VARIANT_STYLES[k.variant])}>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-70 mb-1.5">
              {k.icon}
              {k.label}
            </div>
            <div className="font-display font-bold text-xl leading-none">{k.value}</div>
            <div className="text-[10px] opacity-60 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Alert bar */}
      {firstEmergency && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/8 border border-destructive/25 text-[11px]">
          <AlertTriangle size={12} className="text-destructive shrink-0" />
          <span className="font-semibold text-destructive">Emergency —</span>
          <span className="text-foreground/80">
            {firstEmergency.title} · {firstEmergency.assignedTo ?? "Unassigned"} · Reported {firstEmergency.reportedDate.slice(5)}
          </span>
          <button
            onClick={() => setTab("work-orders")}
            className="ml-auto text-destructive font-medium hover:underline underline-offset-2 shrink-0"
          >
            View {firstEmergency.id} →
          </button>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-border gap-1">
        {TABS.map((t) => {
          const badge =
            t.id === "work-orders" ? openWOs.length
            : t.id === "pm" ? pmOverdueCount
            : t.id === "assets" ? assetsNeedingAttention
            : null;

          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                tab === t.id
                  ? "border-b-2"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
              style={tab === t.id ? { borderColor: MODULE_COLOR, color: MODULE_COLOR } : {}}
            >
              {t.label}
              {badge !== null && badge > 0 && (
                <span className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded-full border",
                  t.id === "work-orders" || t.id === "pm"
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-accent/10 text-accent border-accent/20",
                )}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {tab === "work-orders" && (
          <WorkOrders
            workOrders={localWOs}
            onAssign={assignWO}
            onAdvanceStatus={advanceWOStatus}
            onCallVendor={callVendor}
            onComplete={completeWO}
            onAddWorkOrder={addWorkOrder}
          />
        )}
        {tab === "pm" && (
          <PreventiveMaintenance
            pmTasks={localPMTasks}
            onMarkComplete={completePMTask}
          />
        )}
        {tab === "assets" && (
          <AssetRegistry
            assets={localAssets}
            onLogService={logAssetService}
            onCreateWorkOrder={createWOFromAsset}
          />
        )}
        {tab === "vendors"  && <VendorDirectory />}
        {tab === "reports"  && <MaintenanceReports />}
      </div>
    </div>
  );
}
