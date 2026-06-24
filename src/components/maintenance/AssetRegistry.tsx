import { useState } from "react";
import {
  PM_STATUS_CONFIG, type Asset, type AssetCategory,
} from "@/lib/mock/maintenance";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, CheckCircle, Clock, Package, X, Zap,
  Wrench, Shield,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

type CategoryFilter = "all" | AssetCategory;

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  elevator:  "Elevator",
  hvac:      "HVAC",
  kitchen:   "Kitchen",
  laundry:   "Laundry",
  generator: "Generator",
  plumbing:  "Plumbing",
  roof:      "Roof",
  safety:    "Safety",
};

const CATEGORY_ICONS: Record<AssetCategory, React.ReactNode> = {
  elevator:  <Zap size={16} />,
  hvac:      <Wrench size={16} />,
  kitchen:   <Package size={16} />,
  laundry:   <Package size={16} />,
  generator: <Zap size={16} />,
  plumbing:  <Wrench size={16} />,
  roof:      <Shield size={16} />,
  safety:    <Shield size={16} />,
};

interface Props {
  assets: Asset[];
  onLogService: (assetId: string) => void;
  onCreateWorkOrder: (asset: Asset) => void;
}

export function AssetRegistry({ assets, onLogService, onCreateWorkOrder }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = assets.find((a) => a.id === selectedId) ?? null;

  const statusOrder = { overdue: 0, due_soon: 1, current: 2 };
  const sorted = assets
    .filter((a) => categoryFilter === "all" || a.category === categoryFilter)
    .sort((a, b) => (statusOrder[a.serviceStatus] ?? 3) - (statusOrder[b.serviceStatus] ?? 3));

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "elevator", "hvac", "kitchen", "laundry", "generator", "plumbing", "roof"] as CategoryFilter[]).map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={cn(
                "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
                categoryFilter === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {c === "all" ? "All Assets" : CATEGORY_LABELS[c]}
              <span className="ml-1.5 font-mono opacity-60">
                {c === "all" ? assets.length : assets.filter((a) => a.category === c).length}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {sorted.map((asset) => (
            <AssetCard key={asset.id} asset={asset} onSelect={() => setSelectedId(asset.id)} />
          ))}
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="w-[480px] bg-card border-l border-border overflow-y-auto p-0">
          {selected && (
            <AssetDetail
              asset={selected}
              onClose={() => setSelectedId(null)}
              onLogService={() => { onLogService(selected.id); setSelectedId(null); }}
              onCreateWorkOrder={() => onCreateWorkOrder(selected)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function AssetCard({ asset, onSelect }: { asset: Asset; onSelect: () => void }) {
  const cfg = PM_STATUS_CONFIG[asset.serviceStatus];
  const isOverdue = asset.serviceStatus === "overdue";
  const isDueSoon = asset.serviceStatus === "due_soon";

  return (
    <button
      onClick={onSelect}
      className={cn(
        "text-left rounded-lg border bg-card p-4 flex flex-col gap-3 transition-colors hover:bg-secondary/20",
        isOverdue ? "border-destructive/30 bg-destructive/4"
        : isDueSoon ? "border-accent/25 bg-accent/4"
        : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn(
          "size-9 rounded-md flex items-center justify-center shrink-0",
          isOverdue ? "bg-destructive/15 text-destructive"
          : isDueSoon ? "bg-accent/15 text-accent"
          : "bg-secondary text-muted-foreground",
        )}>
          {CATEGORY_ICONS[asset.category]}
        </div>
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", cfg.color)}>
          {cfg.label}
        </span>
      </div>

      <div>
        <div className="text-sm font-semibold leading-tight">{asset.name}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{asset.location}</div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
        <div>
          <span className="text-muted-foreground">Age: </span>
          <span className="font-medium">{asset.age} yr</span>
        </div>
        <div>
          <span className="text-muted-foreground">Warranty: </span>
          <span className={cn("font-medium", asset.warrantyActive ? "text-success" : "text-muted-foreground")}>
            {asset.warrantyActive ? "Active" : "Expired"}
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground">Next Service: </span>
          <span className={cn("font-medium", isOverdue ? "text-destructive" : isDueSoon ? "text-accent" : "")}>
            {asset.nextServiceDate}
          </span>
        </div>
      </div>

      {asset.linkedWorkOrderId && (
        <div className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border border-accent/20 bg-accent/8 text-accent w-fit font-medium">
          <Wrench size={8} />
          {asset.linkedWorkOrderId} active
        </div>
      )}
    </button>
  );
}

function AssetDetail({ asset, onClose, onLogService, onCreateWorkOrder }: {
  asset: Asset;
  onClose: () => void;
  onLogService: () => void;
  onCreateWorkOrder: () => void;
}) {
  const cfg = PM_STATUS_CONFIG[asset.serviceStatus];
  const isOverdue = asset.serviceStatus === "overdue";

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", cfg.color)}>
                {cfg.label}
              </span>
              {asset.warrantyActive && (
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-success/25 bg-success/10 text-success font-medium">
                  Warranty Active
                </span>
              )}
            </div>
            <SheetTitle className="text-base font-semibold leading-tight">{asset.name}</SheetTitle>
            <SheetDescription className="text-[11px] text-muted-foreground mt-0.5">{asset.location}</SheetDescription>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary text-muted-foreground shrink-0">
            <X size={14} />
          </button>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {isOverdue && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-destructive/8 border border-destructive/25 text-[11px]">
            <AlertTriangle size={12} className="text-destructive shrink-0 mt-0.5" />
            <span className="text-foreground/80">
              <span className="font-semibold text-destructive">Service overdue — </span>
              This asset has missed its scheduled maintenance window.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <InfoBlock label="Age">{asset.age} years</InfoBlock>
          <InfoBlock label="Category">{CATEGORY_LABELS[asset.category]}</InfoBlock>
          <InfoBlock label="Serial Number">
            <span className="font-mono text-xs">{asset.serialNumber ?? "N/A"}</span>
          </InfoBlock>
          <InfoBlock label="Vendor">{asset.vendor ?? "In-house"}</InfoBlock>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Service History</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle size={12} className="text-success shrink-0" />
              <span className="text-muted-foreground">Last service:</span>
              <span className="font-medium">{asset.lastServiceDate}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {isOverdue
                ? <AlertTriangle size={12} className="text-destructive shrink-0" />
                : <Clock size={12} className="text-muted-foreground shrink-0" />
              }
              <span className="text-muted-foreground">Next service:</span>
              <span className={cn("font-medium", isOverdue ? "text-destructive" : "")}>
                {asset.nextServiceDate}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Warranty</div>
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md border text-xs",
            asset.warrantyActive
              ? "bg-success/8 border-success/20 text-success"
              : "bg-secondary border-border text-muted-foreground",
          )}>
            {asset.warrantyActive ? <CheckCircle size={12} /> : <X size={12} />}
            {asset.warrantyActive
              ? `Warranty active through ${asset.warrantyExpiry}`
              : asset.warrantyExpiry
              ? `Expired ${asset.warrantyExpiry}`
              : "No warranty on record"}
          </div>
        </div>

        {asset.linkedWorkOrderId && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Active Work Order</div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-accent/20 bg-accent/8 text-xs">
              <Wrench size={12} className="text-accent" />
              <span className="font-mono text-accent font-semibold">{asset.linkedWorkOrderId}</span>
              <span className="text-muted-foreground">— open</span>
            </div>
          </div>
        )}

        {asset.notes && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Notes</div>
            <p className="text-[11px] text-foreground/80 leading-relaxed">{asset.notes}</p>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <button
            onClick={onLogService}
            className="w-full py-2 rounded-md bg-success/10 border border-success/20 text-success text-xs font-medium hover:bg-success/15 transition-colors"
          >
            Log Service Completed
          </button>
          <button
            onClick={onCreateWorkOrder}
            className="w-full py-2 rounded-md border border-border text-muted-foreground text-xs font-medium hover:text-foreground hover:bg-secondary transition-colors"
          >
            Create Work Order
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</div>
      <div className="text-xs font-medium">{children}</div>
    </div>
  );
}
