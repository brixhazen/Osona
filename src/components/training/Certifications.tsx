import { useState } from "react";
import {
  CERT_CONFIG, CERT_STATUS_CONFIG, DEPT_CONFIG,
  type StaffMember, type CertStatus, type CertType,
} from "@/lib/mock/training";
import { cn } from "@/lib/utils";
import { AlertTriangle, Award, CheckCircle, Clock, RotateCcw } from "lucide-react";

type StatusFilter = "all" | CertStatus;

interface FlatCert {
  staffId: string;
  staffName: string;
  staffRole: string;
  deptLabel: string;
  deptColor: string;
  type: CertType;
  number: string | null;
  issuedDate: string;
  expiryDate: string;
  status: CertStatus;
  daysUntilExpiry: number;
}

interface Props {
  staff: StaffMember[];
  onRenewCert: (staffId: string, certType: CertType) => void;
}

export function Certifications({ staff, onRenewCert }: Props) {
  const [filter, setFilter] = useState<StatusFilter>("all");

  const allCerts: FlatCert[] = staff.flatMap((s) =>
    s.certifications.map((cert) => ({
      staffId: s.id,
      staffName: s.name,
      staffRole: s.role,
      deptLabel: DEPT_CONFIG[s.department].label,
      deptColor: DEPT_CONFIG[s.department].color,
      type: cert.type,
      number: cert.number,
      issuedDate: cert.issuedDate,
      expiryDate: cert.expiryDate,
      status: cert.status,
      daysUntilExpiry: cert.daysUntilExpiry,
    })),
  );

  const statusOrder: Record<CertStatus, number> = { expired: 0, expiring_soon: 1, current: 2 };
  const sorted = [...allCerts]
    .filter((c) => filter === "all" || c.status === filter)
    .sort((a, b) => {
      const s = statusOrder[a.status] - statusOrder[b.status];
      return s !== 0 ? s : a.daysUntilExpiry - b.daysUntilExpiry;
    });

  const expiredCt = allCerts.filter((c) => c.status === "expired").length;
  const expiringSoonCt = allCerts.filter((c) => c.status === "expiring_soon").length;
  const currentCt = allCerts.filter((c) => c.status === "current").length;

  return (
    <div className="flex gap-5 items-start">
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {([
            { id: "all",           label: "All",           count: allCerts.length },
            { id: "expired",       label: "Expired",       count: expiredCt },
            { id: "expiring_soon", label: "Expiring Soon", count: expiringSoonCt },
            { id: "current",       label: "Current",       count: currentCt },
          ] as { id: StatusFilter; label: string; count: number }[]).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
                filter === f.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              <span className="ml-1.5 font-mono opacity-60">{f.count}</span>
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_1fr_80px] border-b border-border bg-secondary/40">
            {["Staff", "Certification", "Number", "Issued", "Expires", "Status", ""].map((h) => (
              <div key={h} className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">{h}</div>
            ))}
          </div>

          <div className="divide-y divide-border/50">
            {sorted.map((cert, i) => {
              const certCfg = CERT_CONFIG[cert.type];
              const statusCfg = CERT_STATUS_CONFIG[cert.status];
              const isExpired = cert.status === "expired";
              const isExpiringSoon = cert.status === "expiring_soon";
              const needsAction = isExpired || isExpiringSoon;

              return (
                <div
                  key={i}
                  className={cn(
                    "grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_1fr_80px]",
                    isExpired ? "bg-destructive/3" : isExpiringSoon ? "bg-accent/3" : "",
                  )}
                >
                  <div className="px-3 py-2.5">
                    <div className="text-xs font-medium">{cert.staffName}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-medium", cert.deptColor)}>
                        {cert.deptLabel}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-2.5">
                    <div className="text-xs">{certCfg.label}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{certCfg.abbr}</div>
                  </div>
                  <div className="px-3 py-2.5 text-xs font-mono text-muted-foreground">
                    {cert.number ?? "—"}
                  </div>
                  <div className="px-3 py-2.5 text-xs font-mono text-muted-foreground">
                    {cert.issuedDate.slice(0, 7)}
                  </div>
                  <div className={cn("px-3 py-2.5 text-xs font-mono font-semibold", isExpired ? "text-destructive" : isExpiringSoon ? "text-accent" : "text-muted-foreground")}>
                    {cert.expiryDate.slice(0, 7)}
                  </div>
                  <div className="px-3 py-2.5">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", statusCfg.color)}>
                      {statusCfg.label}
                    </span>
                  </div>
                  <div className="px-2 py-2 flex items-center">
                    {needsAction && (
                      <button
                        onClick={() => onRenewCert(cert.staffId, cert.type)}
                        className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border border-success/30 text-success hover:bg-success/10 transition-colors font-medium"
                      >
                        <RotateCcw size={8} />
                        Renew
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-[240px] shrink-0 flex flex-col gap-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5">Cert Summary</div>
          <div className="flex flex-col gap-1.5">
            {[
              { label: "Expired",       value: expiredCt,      cls: "text-destructive", icon: <AlertTriangle size={10} /> },
              { label: "Expiring Soon", value: expiringSoonCt, cls: "text-accent",      icon: <Clock size={10} /> },
              { label: "Current",       value: currentCt,      cls: "text-success",     icon: <CheckCircle size={10} /> },
              { label: "Total",         value: allCerts.length, cls: "text-foreground", icon: <Award size={10} /> },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className={row.cls}>{row.icon}</span>
                  {row.label}
                </span>
                <span className={cn("font-mono font-semibold", row.cls)}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {(expiredCt + expiringSoonCt) > 0 && (
          <div className="rounded-lg border border-destructive/25 bg-destructive/4 p-3">
            <div className="text-[10px] uppercase tracking-wider text-destructive mb-2 flex items-center gap-1">
              <AlertTriangle size={9} />
              Needs Renewal
            </div>
            <div className="flex flex-col gap-2">
              {sorted
                .filter((c) => c.status === "expired" || c.status === "expiring_soon")
                .slice(0, 6)
                .map((c, i) => (
                  <div key={i} className="text-[10px]">
                    <span className={cn("font-medium", c.status === "expired" ? "text-destructive" : "text-accent")}>
                      {c.staffName}
                    </span>
                    <span className="text-muted-foreground"> · {CERT_CONFIG[c.type].abbr}</span>
                    <div className="text-muted-foreground">
                      {c.status === "expired"
                        ? `Expired ${Math.abs(c.daysUntilExpiry)} days ago`
                        : `Expires in ${c.daysUntilExpiry} days`}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Certification Types</div>
          <div className="flex flex-col gap-1">
            {(Object.entries(CERT_CONFIG) as [CertType, typeof CERT_CONFIG[CertType]][]).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-2 text-[10px]">
                <span className="font-mono text-muted-foreground w-8 shrink-0">{cfg.abbr}</span>
                <span className="text-muted-foreground">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
