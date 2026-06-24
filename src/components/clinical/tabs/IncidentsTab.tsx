import { useState } from "react";
import { AlertTriangle, Shield, Pill, Users, Activity, Brain, Plus, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type Resident, type ResidentClinicalData, type Incident } from "@/lib/mock/clinical";
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
  onAddIncident: (i: Incident) => void;
}

const SEVERITY_STYLES: Record<Incident["severity"], string> = {
  minor: "bg-warning/10 text-warning border-warning/25",
  moderate: "bg-accent/15 text-accent border-accent/25",
  major: "bg-destructive/15 text-destructive border-destructive/25",
};

const STATUS_STYLES: Record<Incident["status"], string> = {
  open: "bg-destructive/15 text-destructive border-destructive/25",
  in_review: "bg-warning/15 text-warning border-warning/25",
  closed: "bg-success/15 text-success border-success/25",
};

const TYPE_ICONS: Record<Incident["type"], LucideIcon> = {
  fall: AlertTriangle,
  medication_error: Pill,
  elopement: Shield,
  altercation: Users,
  injury: Activity,
  behavioral: Brain,
};

const TYPE_LABELS: Record<Incident["type"], string> = {
  fall: "Fall",
  medication_error: "Medication Error",
  elopement: "Elopement Attempt",
  altercation: "Altercation",
  injury: "Injury",
  behavioral: "Behavioral Incident",
};

const INCIDENT_TYPES = Object.keys(TYPE_LABELS) as Incident["type"][];

export function IncidentsTab({ resident, data, onAddIncident }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState({
    type: "fall" as Incident["type"],
    severity: "minor" as Incident["severity"],
    location: "",
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    description: "",
    immediateActions: "",
    physicianNotified: false,
    familyNotified: false,
    stateReportable: false,
  });

  function handleSave() {
    if (!form.description.trim() || !form.location.trim()) return;
    const newIncident: Incident = {
      id: `inc-new-${Date.now()}`,
      type: form.type,
      severity: form.severity,
      status: "open",
      location: form.location,
      date: form.date,
      time: form.time,
      description: form.description,
      immediateActions: form.immediateActions,
      physicianNotified: form.physicianNotified,
      familyNotified: form.familyNotified,
      stateReportable: form.stateReportable,
      reportedBy: "Current User, RN",
    };
    onAddIncident(newIncident);
    setSheetOpen(false);
    setForm({
      type: "fall",
      severity: "minor",
      location: "",
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      description: "",
      immediateActions: "",
      physicianNotified: false,
      familyNotified: false,
      stateReportable: false,
    });
  }

  const sorted = [...data.incidents].sort(
    (a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`),
  );

  return (
    <div className="space-y-3">
      {/* Header with Log button */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {sorted.length} incident{sorted.length !== 1 ? "s" : ""} on record
        </p>
        <button
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium"
        >
          <Plus size={13} />
          Log Incident
        </button>
      </div>

      {sorted.map((inc) => (
        <IncidentCard key={inc.id} incident={inc} />
      ))}
      {sorted.length === 0 && (
        <div className="text-center py-16">
          <Shield className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No incidents documented.</p>
        </div>
      )}

      {/* Log Incident Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[500px] bg-card border-l border-border overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-destructive" />
              Log Incident — {resident.firstName} {resident.lastName}
            </SheetTitle>
            <SheetDescription>
              Complete all required fields. This record will appear in the compliance module.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            {/* Type */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Incident Type</label>
              <div className="flex flex-wrap gap-1.5">
                {INCIDENT_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs font-medium border transition-colors",
                      form.type === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Severity</label>
              <div className="flex gap-1.5">
                {(["minor", "moderate", "major"] as Incident["severity"][]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm((f) => ({ ...f, severity: s }))}
                    className={cn(
                      "px-3 py-1.5 rounded text-xs font-medium border capitalize transition-colors",
                      form.severity === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Date + time + location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Resident's room 114B"
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Description <span className="text-destructive">*</span></label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the incident in detail..."
                rows={4}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Immediate actions */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Immediate Actions Taken</label>
              <textarea
                value={form.immediateActions}
                onChange={(e) => setForm((f) => ({ ...f, immediateActions: e.target.value }))}
                placeholder="What was done immediately following the incident..."
                rows={3}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Notifications */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">Notifications</label>
              {[
                { key: "physicianNotified" as const, label: "Physician notified" },
                { key: "familyNotified" as const, label: "Family / responsible party notified" },
                { key: "stateReportable" as const, label: "State reportable incident" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
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
                disabled={!form.description.trim() || !form.location.trim()}
                className="flex-1 px-3 py-2 rounded text-sm bg-primary text-primary-foreground font-medium disabled:opacity-40"
              >
                Save Incident
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function IncidentCard({ incident: inc }: { incident: Incident }) {
  const Icon = TYPE_ICONS[inc.type] ?? AlertTriangle;

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        inc.status === "open"
          ? "border-destructive/30 bg-destructive/5"
          : inc.status === "in_review"
          ? "border-warning/30 bg-warning/5"
          : "border-border bg-surface",
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              "w-4 h-4 shrink-0",
              inc.status === "open" ? "text-destructive" : inc.status === "in_review" ? "text-warning" : "text-muted-foreground",
            )}
          />
          <div>
            <span className="font-semibold text-sm">{TYPE_LABELS[inc.type] ?? inc.type}</span>
            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
              {inc.date} at {inc.time}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", SEVERITY_STYLES[inc.severity])}>
            {inc.severity}
          </span>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase", STATUS_STYLES[inc.status])}>
            {inc.status.replace("_", " ")}
          </span>
          {inc.stateReportable && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-destructive/25 bg-destructive/10 text-destructive font-medium">
              State Reportable
            </span>
          )}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mb-3">Location: {inc.location}</p>

      <div className="space-y-2.5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Description</p>
          <p className="text-xs leading-relaxed">{inc.description}</p>
        </div>
        {inc.immediateActions && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Immediate Actions</p>
            <p className="text-xs leading-relaxed">{inc.immediateActions}</p>
          </div>
        )}
        {inc.investigationNote && (
          <div className="rounded-md border border-warning/20 bg-warning/10 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-warning mb-1">Investigation Note</p>
            <p className="text-xs leading-relaxed">{inc.investigationNote}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-[11px] text-muted-foreground flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <span className={cn("font-medium", inc.physicianNotified ? "text-success" : "text-destructive")}>
            {inc.physicianNotified ? "✓ Physician notified" : "✗ Physician not notified"}
          </span>
          <span className={cn("font-medium", inc.familyNotified ? "text-success" : "text-destructive")}>
            {inc.familyNotified ? "✓ Family notified" : "✗ Family not notified"}
          </span>
        </div>
        <span>Reported by {inc.reportedBy}</span>
      </div>
    </div>
  );
}
