import { FileText, FlaskConical, Heart, ClipboardList, FileCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type Resident, type ResidentClinicalData, type ClinicalDocument } from "@/lib/mock/clinical";
import { cn } from "@/lib/utils";

interface Props {
  resident: Resident;
  data: ResidentClinicalData;
}

const DOC_CONFIG: Record<
  ClinicalDocument["type"],
  { label: string; icon: LucideIcon; cls: string }
> = {
  physician_order: {
    label: "Physician Order",
    icon: ClipboardList,
    cls: "text-primary bg-primary/10 border-primary/20",
  },
  lab: {
    label: "Lab Result",
    icon: FlaskConical,
    cls: "text-success bg-success/10 border-success/20",
  },
  advance_directive: {
    label: "Advance Directive",
    icon: Heart,
    cls: "text-destructive bg-destructive/10 border-destructive/20",
  },
  assessment_pdf: {
    label: "Assessment",
    icon: FileText,
    cls: "text-warning bg-warning/10 border-warning/20",
  },
  consent: {
    label: "Consent / Agreement",
    icon: FileCheck,
    cls: "text-muted-foreground bg-muted/30 border-border",
  },
};

export function DocumentsTab({ data }: Props) {
  const sorted = [...data.documents].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-2">
      {sorted.map((doc) => (
        <DocumentRow key={doc.id} doc={doc} />
      ))}
      {sorted.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">No documents on file.</p>
      )}
    </div>
  );
}

function DocumentRow({ doc }: { doc: ClinicalDocument }) {
  const config = DOC_CONFIG[doc.type];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 hover:border-primary/30 transition-colors cursor-pointer">
      <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center shrink-0", config.cls)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{doc.title}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          {config.label} · {doc.date} · Uploaded by {doc.uploadedBy}
        </div>
      </div>
      <div className="text-xs text-muted-foreground font-mono shrink-0">{doc.fileSize}</div>
    </div>
  );
}
