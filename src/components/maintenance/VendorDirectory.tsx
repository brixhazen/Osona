import { useState } from "react";
import {
  VENDORS, WORK_ORDERS, CATEGORY_CONFIG, type Vendor, type WorkOrderCategory,
} from "@/lib/mock/maintenance";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, Mail, Phone, Plus, X,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export function VendorDirectory() {
  const [selected, setSelected] = useState<Vendor | null>(null);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {VENDORS.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} onSelect={() => setSelected(vendor)} />
          ))}
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-[440px] bg-card border-l border-border overflow-y-auto p-0">
          {selected && <VendorDetail vendor={selected} onClose={() => setSelected(null)} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

function VendorCard({ vendor, onSelect }: { vendor: Vendor; onSelect: () => void }) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-4 flex flex-col gap-3",
      vendor.actionNeeded ? "border-accent/30 bg-accent/4" : "border-border",
    )}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold">{vendor.company}</span>
            {vendor.actionNeeded && (
              <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded border border-accent/30 bg-accent/10 text-accent font-medium">
                <AlertTriangle size={8} />
                Action Needed
              </span>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground">{vendor.contractType}</div>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-[11px]">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Phone size={10} />
          <span>{vendor.contact} · {vendor.phone}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Mail size={10} />
          <span>{vendor.email}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {vendor.categories.map((c) => (
          <span key={c} className="text-[9px] px-1.5 py-0.5 rounded border border-border text-muted-foreground font-medium">
            {CATEGORY_CONFIG[c as WorkOrderCategory]?.label ?? c}
          </span>
        ))}
        <span className="text-[9px] px-1.5 py-0.5 rounded border border-border text-muted-foreground font-medium ml-auto">
          Last: {vendor.lastUsed.slice(5).replace("-", "/")}
        </span>
      </div>

      {vendor.actionNote && (
        <div className="text-[10px] text-accent bg-accent/8 border border-accent/20 rounded px-2 py-1.5">
          {vendor.actionNote}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-border/50">
        <a
          href={`tel:${vendor.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded border border-border text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <Phone size={9} />
          Call
        </a>
        <a
          href={`mailto:${vendor.email}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded border border-border text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <Mail size={9} />
          Email
        </a>
        <button
          onClick={onSelect}
          className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded border border-primary/20 bg-primary/8 text-primary hover:bg-primary/12 transition-colors font-medium ml-auto"
        >
          <Plus size={9} />
          New WO
        </button>
      </div>
    </div>
  );
}

function VendorDetail({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const vendorWOs = WORK_ORDERS.filter((wo) => wo.vendorId === vendor.id);

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground font-medium">
                {vendor.contractType}
              </span>
              {vendor.actionNeeded && (
                <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded border border-accent/30 bg-accent/10 text-accent font-medium">
                  <AlertTriangle size={8} />
                  Action Needed
                </span>
              )}
            </div>
            <SheetTitle className="text-base font-semibold">{vendor.company}</SheetTitle>
            <SheetDescription className="text-[11px] text-muted-foreground mt-0.5">
              Contact: {vendor.contact}
            </SheetDescription>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary text-muted-foreground shrink-0">
            <X size={14} />
          </button>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {vendor.actionNote && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-accent/8 border border-accent/25 text-[11px]">
            <AlertTriangle size={12} className="text-accent shrink-0 mt-0.5" />
            <span className="text-foreground/80">{vendor.actionNote}</span>
          </div>
        )}

        {/* Contact info */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Contact</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Phone size={12} className="text-muted-foreground shrink-0" />
              <span className="font-medium">{vendor.contact}</span>
              <span className="text-muted-foreground">{vendor.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Mail size={12} className="text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">{vendor.email}</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Services</div>
          <div className="flex flex-wrap gap-1.5">
            {vendor.categories.map((c) => (
              <span key={c} className="text-[11px] px-2 py-1 rounded border border-border text-muted-foreground font-medium">
                {CATEGORY_CONFIG[c as WorkOrderCategory]?.label ?? c}
              </span>
            ))}
          </div>
        </div>

        {/* Work orders */}
        {vendorWOs.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Recent Work Orders ({vendorWOs.length})
            </div>
            <div className="flex flex-col gap-2">
              {vendorWOs.map((wo) => (
                <div key={wo.id} className="flex items-center gap-2 text-[11px] rounded border border-border bg-secondary/30 px-3 py-2">
                  <span className="font-mono text-muted-foreground">{wo.id}</span>
                  <span className="flex-1 min-w-0 truncate">{wo.title}</span>
                  <span className="text-muted-foreground">{wo.reportedDate.slice(5).replace("-", "/")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {vendor.notes && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Notes</div>
            <p className="text-[11px] text-foreground/80 leading-relaxed">{vendor.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <a
            href={`tel:${vendor.phone}`}
            className="flex items-center justify-center gap-1.5 py-2 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/15 transition-colors"
          >
            <Phone size={12} />
            Call {vendor.contact}
          </a>
          <button className="flex items-center justify-center gap-1.5 py-2 rounded-md border border-border text-muted-foreground text-xs font-medium hover:text-foreground hover:bg-secondary transition-colors">
            <Plus size={12} />
            Create Work Order
          </button>
        </div>
      </div>
    </div>
  );
}
