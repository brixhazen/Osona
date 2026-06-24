import { Bell, AlertTriangle, ClipboardList, UserMinus, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useCommunity } from "@/lib/communityContext";
import { ALERTS } from "@/lib/mock/dashboard";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

type PanelKind = "incidents" | "tasks" | "staffing" | "all" | null;

const TODAY = new Date().toLocaleDateString("en-US", {
  weekday: "long", month: "long", day: "numeric", year: "numeric",
});

export function TopBar() {
  const [panel, setPanel] = useState<PanelKind>(null);
  const { theme, toggle } = useTheme();
  const { community } = useCommunity();

  return (
    <>
      <header className="sticky top-0 z-30 h-14 bg-background/80 backdrop-blur border-b border-border flex items-center px-6 gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Community</div>
          <div className="font-display font-semibold text-sm leading-tight">{community.name}</div>
        </div>
        <div className="text-xs text-muted-foreground font-mono ml-2">{TODAY}</div>

        <div className="ml-auto flex items-center gap-2">
          <Chip onClick={() => setPanel("incidents")} tone="warn" icon={<AlertTriangle size={14} />}>
            2 Open Incidents
          </Chip>
          <Chip onClick={() => setPanel("tasks")} tone="warn" icon={<ClipboardList size={14} />}>
            4 Overdue Tasks
          </Chip>
          <Chip onClick={() => setPanel("staffing")} tone="danger" icon={<UserMinus size={14} />}>
            1 Staffing Gap Tonight
          </Chip>

          <button
            onClick={toggle}
            className="size-9 rounded-md hover:bg-secondary grid place-items-center text-foreground/70 hover:text-foreground transition-colors"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            onClick={() => setPanel("all")}
            className="relative size-9 rounded-md hover:bg-secondary grid place-items-center text-foreground/80"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-destructive text-[10px] font-mono grid place-items-center text-destructive-foreground">
              7
            </span>
          </button>
        </div>
      </header>

      <Sheet open={panel !== null} onOpenChange={(o) => !o && setPanel(null)}>
        <SheetContent className="w-[420px] sm:max-w-md bg-card border-l border-border">
          <SheetHeader>
            <SheetTitle>{panelTitle(panel)}</SheetTitle>
            <SheetDescription>Real-time operational alerts for this community.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6 overflow-y-auto pr-1">
            {(panel === "incidents" || panel === "all") && (
              <Section title="Open Incidents">
                {ALERTS.incidents.map((a) => (
                  <Item key={a.id} title={a.title} sub={a.at} tone="warn" />
                ))}
              </Section>
            )}
            {(panel === "tasks" || panel === "all") && (
              <Section title="Overdue Tasks">
                {ALERTS.tasks.map((t) => (
                  <Item key={t.id} title={t.title} sub={t.owner} tone="warn" />
                ))}
              </Section>
            )}
            {(panel === "staffing" || panel === "all") && (
              <Section title="Staffing Gaps">
                {ALERTS.staffing.map((s) => (
                  <Item key={s.id} title={s.title} sub={s.note} tone="danger" />
                ))}
              </Section>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function Chip({
  children, tone, icon, onClick,
}: { children: React.ReactNode; tone: "warn" | "danger"; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium border transition-colors",
        tone === "warn"
          ? "border-accent/40 text-accent bg-accent/10 hover:bg-accent/15"
          : "border-destructive/40 text-destructive bg-destructive/10 hover:bg-destructive/15",
      )}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Item({ title, sub, tone }: { title: string; sub: string; tone: "warn" | "danger" }) {
  return (
    <div
      className={cn(
        "rounded-md border bg-surface-2/40 px-3 py-2.5 border-l-2",
        tone === "warn" ? "border-l-accent border-border" : "border-l-destructive border-border",
      )}
    >
      <div className="text-sm">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

function panelTitle(p: PanelKind) {
  switch (p) {
    case "incidents": return "Open Incidents";
    case "tasks": return "Overdue Tasks";
    case "staffing": return "Staffing Gaps Tonight";
    default: return "All Alerts";
  }
}
