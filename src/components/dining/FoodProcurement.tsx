import { useState } from "react";
import {
  DINING_VENDORS, PAR_ITEMS,
  type PurchaseOrder, type POStatus, type POLineItem,
  type ProductCategory, type ParItem,
} from "@/lib/mock/dining";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, CheckCircle, ChevronDown, ChevronRight,
  Package, Truck, Clock, RefreshCw, Phone,
} from "lucide-react";

interface Props {
  pos: PurchaseOrder[];
  onReceiveLineItem: (poId: string, itemId: string) => void;
  onReceiveAllItems: (poId: string) => void;
}

const PO_STATUS_CONFIG: Record<POStatus, { label: string; cls: string; dot: string }> = {
  draft:      { label: "Draft",       cls: "bg-secondary text-muted-foreground border-border",         dot: "bg-muted-foreground" },
  submitted:  { label: "Submitted",   cls: "bg-primary/10 text-primary border-primary/20",             dot: "bg-primary" },
  in_transit: { label: "In Transit",  cls: "bg-accent/10 text-accent border-accent/20",               dot: "bg-accent" },
  delivered:  { label: "Delivered",   cls: "bg-success/10 text-success border-success/20",             dot: "bg-success" },
  partial:    { label: "Partial",     cls: "bg-orange-400/15 text-orange-300 border-orange-400/30",    dot: "bg-orange-400" },
};

const CATEGORY_DOT: Record<ProductCategory, string> = {
  protein:     "bg-red-400",
  produce:     "bg-green-400",
  dairy:       "bg-blue-400",
  dry_goods:   "bg-muted-foreground",
  frozen:      "bg-indigo-400",
  beverages:   "bg-cyan-400",
  supplements: "bg-purple-400",
  bakery:      "bg-amber-400",
};

function formatCurrency(n: number) {
  return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getParStatus(item: ParItem): "critical" | "low" | "ok" {
  const ratio = item.onHand / item.parLevel;
  if (ratio < 0.3) return "critical";
  if (ratio < 0.6) return "low";
  return "ok";
}

type FilterOption = "all" | POStatus;

const FILTER_OPTIONS: { id: FilterOption; label: string }[] = [
  { id: "all",        label: "All" },
  { id: "in_transit", label: "In Transit" },
  { id: "partial",    label: "Partial" },
  { id: "submitted",  label: "Submitted" },
  { id: "delivered",  label: "Delivered" },
];

export function FoodProcurement({ pos, onReceiveLineItem, onReceiveAllItems }: Props) {
  const [filter, setFilter] = useState<FilterOption>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["PO-2026-041"]));
  const [localParItems, setLocalParItems] = useState<ParItem[]>([...PAR_ITEMS]);
  const [reorderedItems, setReorderedItems] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function reorderItem(itemId: string) {
    setReorderedItems((prev) => new Set(prev).add(itemId));
  }

  const filtered = filter === "all" ? pos : pos.filter((p) => p.status === filter);

  const inTransitCount = pos.filter((p) => p.status === "in_transit").length;
  const partialCount   = pos.filter((p) => p.status === "partial").length;
  const inTransitValue = pos
    .filter((p) => p.status === "in_transit")
    .reduce((sum, p) => sum + p.lineItems.reduce((s, li) => s + li.unitCost * li.qtyOrdered, 0), 0);

  const criticalParCount = localParItems.filter((i) => getParStatus(i) === "critical").length;
  const lowParCount      = localParItems.filter((i) => getParStatus(i) === "low").length;

  const nextInTransit = [...pos]
    .filter((p) => p.status === "in_transit")
    .sort((a, b) => a.expectedDelivery.localeCompare(b.expectedDelivery))[0];
  const todayStr = new Date().toISOString().slice(0, 10);
  const nextDeliveryLabel = nextInTransit
    ? `${nextInTransit.expectedDelivery.slice(5)}${nextInTransit.expectedDelivery === todayStr ? " — Today" : ""}`
    : "None";
  const nextDeliveryVendor = nextInTransit?.vendorName ?? "—";

  return (
    <div className="flex gap-5 items-start">
      {/* Main: purchase orders */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Summary strip */}
        <div className="grid grid-cols-4 gap-3">
          <SummaryChip
            label="In Transit"
            value={String(inTransitCount)}
            sub={formatCurrency(inTransitValue)}
            tone={inTransitCount > 0 ? "warn" : undefined}
            icon={<Truck size={12} />}
          />
          <SummaryChip
            label="Partial Orders"
            value={String(partialCount)}
            sub="Need follow-up"
            tone={partialCount > 0 ? "orange" : undefined}
            icon={<AlertTriangle size={12} />}
          />
          <SummaryChip
            label="Par Alerts"
            value={`${criticalParCount} critical`}
            sub={`${lowParCount} low`}
            tone={criticalParCount > 0 ? "danger" : lowParCount > 0 ? "warn" : undefined}
            icon={<Package size={12} />}
          />
          <SummaryChip
            label="Next Delivery"
            value={nextDeliveryLabel}
            sub={nextDeliveryVendor}
            tone={nextInTransit ? "warn" : undefined}
            icon={<Clock size={12} />}
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_OPTIONS.map((opt) => {
            const count = opt.id === "all" ? pos.length : pos.filter((p) => p.status === opt.id).length;
            return (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id)}
                className={cn(
                  "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
                  filter === opt.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
                <span className="ml-1.5 font-mono opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        {/* PO cards */}
        <div className="flex flex-col gap-3">
          {filtered
            .sort((a, b) => {
              const order: Record<POStatus, number> = {
                in_transit: 0, partial: 1, submitted: 2, draft: 3, delivered: 4,
              };
              return order[a.status] - order[b.status];
            })
            .map((po) => (
              <POCard
                key={po.id}
                po={po}
                isExpanded={expanded.has(po.id)}
                onToggle={() => toggleExpanded(po.id)}
                onReceiveItem={(itemId) => onReceiveLineItem(po.id, itemId)}
                onReceiveAll={() => onReceiveAllItems(po.id)}
              />
            ))}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-[260px] shrink-0 flex flex-col gap-3">
        {/* Par level monitor */}
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Par Level Monitor</div>

        {criticalParCount + lowParCount > 0 && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-2.5 text-[10px] flex items-center gap-2 text-destructive">
            <AlertTriangle size={11} />
            <span>{criticalParCount} critical · {lowParCount} low — reorder needed</span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {[...localParItems]
            .sort((a, b) => {
              const order = { critical: 0, low: 1, ok: 2 };
              return order[getParStatus(a)] - order[getParStatus(b)];
            })
            .map((item) => {
              const status = getParStatus(item);
              const isReordered = reorderedItems.has(item.id);
              const ratio = item.onHand / item.parLevel;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-lg border p-2.5",
                    status === "critical" ? "border-destructive/30 bg-destructive/3"
                    : status === "low"    ? "border-accent/20 bg-accent/3"
                    : "border-border bg-card",
                  )}
                >
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className={cn("size-1.5 rounded-full shrink-0", CATEGORY_DOT[item.category])} />
                      <span className="text-[11px] font-medium leading-tight">{item.description}</span>
                    </div>
                    <span className={cn(
                      "text-[9px] px-1 py-0.5 rounded border font-medium shrink-0",
                      status === "critical" ? "bg-destructive/10 text-destructive border-destructive/20"
                      : status === "low"    ? "bg-accent/10 text-accent border-accent/20"
                      : "bg-success/10 text-success border-success/20",
                    )}>
                      {status === "critical" ? "Critical" : status === "low" ? "Low" : "OK"}
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        status === "critical" ? "bg-destructive" : status === "low" ? "bg-accent" : "bg-success",
                      )}
                      style={{ width: `${Math.min(100, Math.round(ratio * 100))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      <span className={cn("font-mono font-semibold", status !== "ok" ? "text-foreground" : "")}>
                        {item.onHand}
                      </span>
                      /{item.parLevel} {item.unit}
                    </span>
                    {status !== "ok" && (
                      isReordered ? (
                        <span className="text-[9px] text-success flex items-center gap-0.5 font-medium">
                          <CheckCircle size={9} /> Draft Created
                        </span>
                      ) : (
                        <button
                          onClick={() => reorderItem(item.id)}
                          className="text-[9px] px-1.5 py-0.5 rounded border border-primary/30 text-primary hover:bg-primary/10 transition-colors font-medium flex items-center gap-0.5"
                        >
                          <RefreshCw size={8} /> Reorder
                        </button>
                      )
                    )}
                  </div>
                  {status !== "ok" && (
                    <div className="text-[9px] text-muted-foreground mt-1">{item.vendorName}</div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Vendor contacts */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Vendor Contacts</div>
          <div className="flex flex-col gap-2">
            {DINING_VENDORS.map((v) => (
              <div key={v.id} className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-medium">{v.name}</div>
                  <div className="text-[10px] text-muted-foreground">{v.rep}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground font-mono">{v.phone}</div>
                  <div className="text-[9px] text-muted-foreground">{v.accountNumber}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function POCard({
  po, isExpanded, onToggle, onReceiveItem, onReceiveAll,
}: {
  po: PurchaseOrder;
  isExpanded: boolean;
  onToggle: () => void;
  onReceiveItem: (itemId: string) => void;
  onReceiveAll: () => void;
}) {
  const statusCfg = PO_STATUS_CONFIG[po.status];
  const isReceivable = po.status === "in_transit";
  const totalOrdered = po.lineItems.reduce((s, li) => s + li.unitCost * li.qtyOrdered, 0);
  const receivedCount = po.lineItems.filter((li) => li.qtyReceived >= li.qtyOrdered && li.qtyOrdered > 0).length;
  const orderableItems = po.lineItems.filter((li) => li.qtyOrdered > 0);

  return (
    <div className={cn(
      "rounded-lg border overflow-hidden",
      po.status === "in_transit" ? "border-accent/30"
      : po.status === "partial"  ? "border-orange-400/30"
      : po.status === "delivered" ? "border-success/20"
      : "border-border",
    )}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 bg-card hover:bg-secondary/30 transition-colors text-left"
      >
        {/* Status dot */}
        <div className={cn("size-2 rounded-full shrink-0", statusCfg.dot)} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium">{po.vendorName}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{po.id}</span>
            {po.status === "in_transit" && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 font-medium">
                Arriving Today
              </span>
            )}
            {po.status === "partial" && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-400/15 text-orange-300 border border-orange-400/30 font-medium">
                Shortage
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>Ordered {po.orderDate.slice(5)}</span>
            <span>·</span>
            <span>{po.status === "delivered" ? `Delivered ${po.actualDelivery?.slice(5)}` : `Expected ${po.expectedDelivery.slice(5)}`}</span>
            <span>·</span>
            <span>{orderableItems.length} items</span>
            {po.invoiceNumber && <><span>·</span><span className="font-mono">{po.invoiceNumber}</span></>}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-sm font-mono font-semibold">{formatCurrency(totalOrdered)}</div>
            {isReceivable && (
              <div className="text-[10px] text-muted-foreground">{receivedCount}/{orderableItems.length} received</div>
            )}
          </div>
          <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-medium", statusCfg.cls)}>
            {statusCfg.label}
          </span>
          {isExpanded ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded: line items */}
      {isExpanded && (
        <div className="border-t border-border/60">
          {/* Notes banner */}
          {po.notes && (
            <div className="px-4 py-2 bg-accent/5 border-b border-accent/10 text-[10px] text-accent flex items-start gap-1.5">
              <AlertTriangle size={9} className="shrink-0 mt-0.5" />
              {po.notes}
            </div>
          )}

          {/* Line items */}
          <div className="divide-y divide-border/40">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_60px_80px_80px_80px_100px] px-4 py-1.5 bg-secondary/30">
              {["Item", "Unit", "Ordered", "Received", "Unit Cost", ""].map((h) => (
                <div key={h} className="text-[9px] uppercase tracking-wider text-muted-foreground">{h}</div>
              ))}
            </div>

            {po.lineItems.map((li) => (
              <LineItemRow
                key={li.id}
                item={li}
                isReceivable={isReceivable}
                onReceive={() => onReceiveItem(li.id)}
              />
            ))}
          </div>

          {/* Footer actions */}
          {isReceivable && (
            <div className="px-4 py-3 border-t border-border/60 bg-secondary/10 flex items-center justify-between">
              <div className="text-[10px] text-muted-foreground">
                {receivedCount}/{orderableItems.length} items marked received
              </div>
              <button
                onClick={onReceiveAll}
                className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded bg-success/10 text-success border border-success/20 hover:bg-success/20 font-medium transition-colors"
              >
                <CheckCircle size={11} />
                Receive All Items
              </button>
            </div>
          )}

          {po.status === "partial" && (
            <div className="px-4 py-2.5 border-t border-orange-400/20 bg-orange-400/5 text-[10px] text-orange-300 flex items-center gap-1.5">
              <AlertTriangle size={10} />
              Shortage items are credited — contact vendor rep to confirm adjustments.
            </div>
          )}

          {po.status === "delivered" && (
            <div className="px-4 py-2.5 border-t border-success/20 bg-success/5 text-[10px] text-success flex items-center gap-1.5">
              <CheckCircle size={10} />
              All items received — order complete.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LineItemRow({
  item, isReceivable, onReceive,
}: {
  item: POLineItem;
  isReceivable: boolean;
  onReceive: () => void;
}) {
  const isReceived = item.qtyReceived >= item.qtyOrdered && item.qtyOrdered > 0;
  const isShorted  = !!item.shortageNote;
  const isSubstitute = item.qtyOrdered === 0 && item.qtyReceived > 0;

  return (
    <div className={cn(
      "grid grid-cols-[1fr_60px_80px_80px_80px_100px] px-4 py-2.5 items-start",
      isShorted ? "bg-destructive/3"
      : isReceived ? "bg-success/3"
      : isSubstitute ? "bg-primary/3"
      : "",
    )}>
      <div className="flex items-start gap-2">
        <div className={cn("size-1.5 rounded-full shrink-0 mt-1", CATEGORY_DOT[item.category])} />
        <div>
          <div className="text-[11px] font-medium leading-snug">{item.description}</div>
          {isShorted && (
            <div className="text-[10px] text-destructive/80 leading-relaxed mt-0.5">{item.shortageNote}</div>
          )}
          {isSubstitute && (
            <div className="text-[10px] text-primary/80 mt-0.5">Substituted item received</div>
          )}
        </div>
      </div>
      <div className="text-[11px] text-muted-foreground">{item.unit}</div>
      <div className="text-[11px] font-mono">{item.qtyOrdered || "—"}</div>
      <div className={cn(
        "text-[11px] font-mono font-semibold",
        isShorted && item.qtyReceived < item.qtyOrdered ? "text-destructive"
        : isReceived ? "text-success"
        : "text-muted-foreground",
      )}>
        {item.qtyReceived || (isReceivable ? "—" : item.qtyOrdered > 0 ? item.qtyReceived : "—")}
      </div>
      <div className="text-[11px] font-mono text-muted-foreground">{formatCurrency(item.unitCost)}</div>
      <div>
        {isReceivable && item.qtyOrdered > 0 && (
          isReceived ? (
            <span className="text-[9px] text-success flex items-center gap-0.5 font-medium">
              <CheckCircle size={9} /> Received
            </span>
          ) : (
            <button
              onClick={onReceive}
              className="text-[9px] px-2 py-0.5 rounded border border-border text-muted-foreground hover:border-success/40 hover:text-success transition-colors font-medium"
            >
              Mark Received
            </button>
          )
        )}
        {isShorted && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium">
            Shorted
          </span>
        )}
        {isSubstitute && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-medium">
            Substituted
          </span>
        )}
      </div>
    </div>
  );
}

function SummaryChip({
  icon, label, value, sub, tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone?: "warn" | "danger" | "orange";
}) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-3",
      tone === "danger" ? "border-destructive/30"
      : tone === "orange" ? "border-orange-400/30"
      : tone === "warn" ? "border-accent/30"
      : "border-border",
    )}>
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className={cn(
        "text-base font-semibold leading-tight",
        tone === "danger" ? "text-destructive"
        : tone === "orange" ? "text-orange-300"
        : tone === "warn" ? "text-accent"
        : "text-foreground",
      )}>
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}
