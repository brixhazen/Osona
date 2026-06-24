import { useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { getCommunityLocDefaults, setCommunityLocDefaults } from "@/lib/rateCardStore";
import { LOC_TIER_LABEL } from "@/lib/billingTypes";

export function CommunityLocDefaultsSheet({
  open, onOpenChange, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: () => void;
}) {
  const current = getCommunityLocDefaults();
  const [l1, setL1] = useState(String(current.level_1));
  const [l2, setL2] = useState(String(current.level_2));
  const [l3, setL3] = useState(String(current.level_3));

  function save() {
    setCommunityLocDefaults({
      level_1: Number(l1) || 0,
      level_2: Number(l2) || 0,
      level_3: Number(l3) || 0,
    });
    onSaved?.();
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-5">
        <SheetHeader>
          <SheetTitle>Community level-of-care rates</SheetTitle>
          <SheetDescription>
            These are the default monthly amounts pre-filled when you set a resident's level of care.
            Changing them here does <strong>not</strong> change existing rate cards — only what's pre-filled next time.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3">
          <RateRow label={LOC_TIER_LABEL.level_1} value={l1} onChange={setL1} />
          <RateRow label={LOC_TIER_LABEL.level_2} value={l2} onChange={setL2} />
          <RateRow label={LOC_TIER_LABEL.level_3} value={l3} onChange={setL3} />
          <div className="text-xs text-muted-foreground pt-2">
            {LOC_TIER_LABEL.none} is always $0.
          </div>
        </div>

        <div className="mt-auto flex gap-2 pt-4 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="flex-1" onClick={save}>Save defaults</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function RateRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-sm">{label}</div>
      <div className="flex-1 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
        <span className="text-muted-foreground text-sm">$</span>
        <input
          inputMode="decimal"
          className="flex-1 bg-transparent outline-none font-mono text-sm tabular-nums"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
        />
        <span className="text-xs text-muted-foreground">/ month</span>
      </div>
    </div>
  );
}