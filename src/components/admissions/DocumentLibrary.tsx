import { FileText, Scale, DollarSign, Stethoscope, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { DOCUMENT_TEMPLATES, PACKET_TEMPLATES, type DocCategory } from "@/lib/mock/admissions";

const MODULE_COLOR = "#10B981";

const CATEGORY_CONFIG: Record<DocCategory, { label: string; color: string; icon: React.ReactNode }> = {
  legal:          { label: "Legal",          color: "#8B5CF6", icon: <Scale      size={14} /> },
  financial:      { label: "Financial",      color: "#F59E0B", icon: <DollarSign size={14} /> },
  clinical:       { label: "Clinical",       color: "#60A5FA", icon: <Stethoscope size={14} /> },
  administrative: { label: "Administrative", color: "#94A3B8", icon: <ClipboardList size={14} /> },
};

export function DocumentLibrary() {
  return (
    <div className="space-y-6">
      {/* Document templates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Document Templates</h3>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
          >
            <FileText size={13} />
            Upload Document
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {DOCUMENT_TEMPLATES.map((doc) => {
            const usedIn = PACKET_TEMPLATES.filter((pt) => pt.documentIds.includes(doc.id));
            const cfg = CATEGORY_CONFIG[doc.category];
            return (
              <div
                key={doc.id}
                className="bg-card rounded-xl border border-border p-4 flex flex-col gap-3 hover:border-border/80 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="size-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cfg.color + "18", color: cfg.color }}
                  >
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium leading-snug">{doc.name}</div>
                    <div
                      className="text-[10px] font-medium mt-0.5"
                      style={{ color: cfg.color }}
                    >
                      {cfg.label}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{doc.description}</p>
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground">{doc.pageCount} {doc.pageCount === 1 ? "page" : "pages"}</span>
                  <div className="flex items-center gap-1">
                    {usedIn.map((pt) => (
                      <span
                        key={pt.id}
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: MODULE_COLOR + "18", color: MODULE_COLOR }}
                      >
                        {pt.name.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Packet templates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Packet Templates</h3>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
          >
            New Template
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PACKET_TEMPLATES.map((pt) => {
            const docs = DOCUMENT_TEMPLATES.filter((d) => pt.documentIds.includes(d.id));
            return (
              <div key={pt.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
                <div>
                  <div className="text-sm font-semibold">{pt.name}</div>
                  <p className="text-[11px] text-muted-foreground mt-1">{pt.description}</p>
                </div>
                <div className="space-y-1">
                  {docs.map((d) => {
                    const cfg = CATEGORY_CONFIG[d.category];
                    return (
                      <div key={d.id} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span style={{ color: cfg.color }}>{cfg.icon}</span>
                        {d.name}
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{docs.length} documents</span>
                  <span className="text-[10px]" style={{ color: MODULE_COLOR }}>
                    {pt.careTypes.map((ct) => ct.replace("_", " ")).join(", ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
