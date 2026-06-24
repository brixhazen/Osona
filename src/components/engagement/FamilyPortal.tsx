import { useState } from "react";
import {
  FAMILY_ACCOUNTS, VOLUNTEERS, COMMUNITY_METRICS,
  type FamilyAccount, type FamilyNotification,
} from "@/lib/mock/engagement";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, Bell, CheckCircle, Clock, Mail, MessageSquare,
  Phone, Send, Smartphone, UserPlus, Users, Camera,
} from "lucide-react";

const CHANNEL_ICONS: Record<FamilyAccount["preferredChannel"], React.ReactNode> = {
  push:  <Smartphone size={10} />,
  email: <Mail size={10} />,
  text:  <MessageSquare size={10} />,
  call:  <Phone size={10} />,
};

const CHANNEL_LABELS: Record<FamilyAccount["preferredChannel"], string> = {
  push: "Push", email: "Email", text: "Text", call: "Call",
};

export function FamilyPortal() {
  const [selected, setSelected] = useState<FamilyAccount | null>(null);
  const [inviteSent, setInviteSent] = useState<Set<string>>(new Set());

  const flagged = FAMILY_ACCOUNTS.filter((f) => f.flagged);
  const active   = FAMILY_ACCOUNTS.filter((f) => !f.flagged && f.hasPortalAccount);

  function handleInvite(residentId: string) {
    setInviteSent((prev) => new Set([...prev, residentId]));
  }

  return (
    <div className="flex gap-5 items-start">
      {/* Main panel */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">

        {/* Flagged accounts */}
        {flagged.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Needs Attention ({flagged.length})
            </div>
            {flagged.map((f) => (
              <FlaggedCard
                key={f.residentId}
                account={f}
                invited={inviteSent.has(f.residentId)}
                onView={() => setSelected(f)}
                onInvite={() => handleInvite(f.residentId)}
              />
            ))}
          </div>
        )}

        {/* Active accounts */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Active Family Accounts ({active.length})
          </div>
          {active.map((f) => (
            <FamilyRow key={f.residentId} account={f} onClick={() => setSelected(f)} />
          ))}
        </div>

        {/* Volunteer section */}
        <div className="flex flex-col gap-2 mt-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Volunteer Roster ({VOLUNTEERS.length}) · {COMMUNITY_METRICS.volunteerHoursThisMonth} hrs this month
          </div>
          <div className="grid grid-cols-2 gap-2">
            {VOLUNTEERS.map((v) => (
              <div key={v.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-sm font-medium">{v.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {v.hoursThisMonth} hrs / mo
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground">{v.primaryActivity}</div>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span>Last: {v.lastVisit.slice(5)}</span>
                  {v.nextScheduled && <span>Next: {v.nextScheduled.slice(5)}</span>}
                  <span className="flex flex-wrap gap-1 ml-auto">
                    {v.skills.slice(0, 2).map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-secondary/60 text-[9px]">{s}</span>
                    ))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right sidebar — summary stats */}
      <div className="w-[260px] shrink-0 flex flex-col gap-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Portal Summary
        </div>

        <div className="rounded-lg border border-border bg-card p-3 flex flex-col gap-2.5">
          <StatRow label="Portal Accounts Active" value={`${COMMUNITY_METRICS.familyPortalActive}/87`} />
          <StatRow label="Avg Last Login" value={`${COMMUNITY_METRICS.avgFamilyLastLogin} days ago`} />
          <StatRow
            label="Notifications Sent (Jun)"
            value={String(FAMILY_ACCOUNTS.reduce((s, f) => s + f.notificationsThisMonth, 0))}
          />
          <StatRow
            label="Photos Shared (Jun)"
            value={String(FAMILY_ACCOUNTS.reduce((s, f) => s + f.photosSharedThisMonth, 0))}
          />
          <StatRow
            label="Messages (Jun)"
            value={String(FAMILY_ACCOUNTS.reduce((s, f) => s + f.messagesThisMonth, 0))}
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Quick Actions
          </div>
          <div className="flex flex-col gap-1.5">
            {[
              { icon: <Bell size={11} />, label: "Send Community Update" },
              { icon: <Camera size={11} />, label: "Upload Photo Album" },
              { icon: <Send size={11} />, label: "Resend Pending Invites" },
              { icon: <UserPlus size={11} />, label: "Add New Family Contact" },
            ].map((a) => (
              <button
                key={a.label}
                className="flex items-center gap-2 text-[11px] px-2.5 py-1.5 rounded border border-border hover:bg-secondary transition-colors w-full text-left"
              >
                <span className="text-muted-foreground">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Notification Channels
          </div>
          <div className="flex flex-col gap-1.5">
            {(["push", "email", "text", "call"] as const).map((ch) => {
              const count = FAMILY_ACCOUNTS.filter((f) => f.preferredChannel === ch).length;
              return (
                <div key={ch} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  {CHANNEL_ICONS[ch]}
                  <span>{CHANNEL_LABELS[ch]}</span>
                  <span className="ml-auto font-mono">{count} families</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail sheet */}
      <Sheet open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-[460px] sm:max-w-lg bg-card border-l border-border overflow-y-auto">
          {selected && <FamilyDetail account={selected} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FlaggedCard({
  account: f, invited, onView, onInvite,
}: {
  account: FamilyAccount;
  invited: boolean;
  onView: () => void;
  onInvite: () => void;
}) {
  const noAccount = !f.hasPortalAccount;

  return (
    <div className={cn(
      "rounded-lg border p-3.5",
      noAccount ? "border-accent/30 bg-accent/5" : "border-destructive/30 bg-destructive/5",
    )}>
      <div className="flex items-start gap-2">
        <AlertTriangle size={13} className={noAccount ? "text-accent mt-0.5" : "text-destructive mt-0.5"} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium">{f.familyName}</span>
            <span className="text-[10px] text-muted-foreground">{f.relationship} · {f.residentName} ({f.room})</span>
          </div>
          <p className={cn(
            "text-[11px] leading-relaxed",
            noAccount ? "text-accent" : "text-destructive/90",
          )}>
            {f.flagReason}
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-2.5">
        {noAccount ? (
          <button
            onClick={invited ? undefined : onInvite}
            className={cn(
              "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border font-medium transition-colors",
              invited
                ? "border-success/40 bg-success/10 text-success"
                : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15",
            )}
          >
            {invited ? <><CheckCircle size={11} /> Invite Sent</> : <><Send size={11} /> Send Portal Invite</>}
          </button>
        ) : (
          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 font-medium transition-colors">
            <Phone size={11} /> Call {f.familyName.split(" ")[0]}
          </button>
        )}
        <button onClick={onView} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-border hover:bg-secondary transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}

function FamilyRow({ account: f, onClick }: { account: FamilyAccount; onClick: () => void }) {
  const unread = f.notifications.filter((n) => !n.opened).length;

  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-border bg-card p-3.5 text-left hover:border-primary/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-full bg-secondary grid place-items-center text-[11px] font-medium shrink-0">
          {f.familyName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{f.familyName}</span>
            <span className="text-[10px] text-muted-foreground">{f.relationship}</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {f.residentName} · {f.room}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end">
            <Clock size={9} />
            <span>{f.lastLogin ? `${f.lastLogin.slice(5)}` : "Never"}</span>
          </div>
          <div className="flex items-center gap-2.5 mt-0.5 justify-end">
            {unread > 0 && (
              <span className="text-[9px] bg-accent/15 text-accent px-1 py-0.5 rounded font-mono">{unread} unread</span>
            )}
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              {CHANNEL_ICONS[f.preferredChannel]}
              <span>{CHANNEL_LABELS[f.preferredChannel]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification preview */}
      {f.notifications[0] && (
        <div className="mt-2.5 pt-2.5 border-t border-border/50 text-[10px] text-muted-foreground flex items-start gap-1.5">
          <Bell size={9} className="shrink-0 mt-0.5" />
          <span className="truncate">{f.notifications[0].message}</span>
          <span className="shrink-0 ml-auto">{f.notifications[0].date.split(" ").slice(0, 2).join(" ")}</span>
        </div>
      )}
    </button>
  );
}

function FamilyDetail({ account: f }: { account: FamilyAccount }) {
  return (
    <>
      <SheetHeader className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="size-10 rounded-full bg-secondary grid place-items-center text-sm font-medium shrink-0">
            {f.familyName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </div>
          <div>
            <SheetTitle>{f.familyName}</SheetTitle>
            <SheetDescription>{f.relationship} of {f.residentName} · {f.room}</SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="space-y-5">
        {/* Contact info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-border bg-secondary/30 p-2.5">
            <div className="text-[10px] text-muted-foreground">Email</div>
            <div className="text-xs font-medium mt-0.5 truncate">{f.email}</div>
          </div>
          <div className="rounded-md border border-border bg-secondary/30 p-2.5">
            <div className="text-[10px] text-muted-foreground">Phone</div>
            <div className="text-xs font-medium mt-0.5">{f.phone}</div>
          </div>
          <div className="rounded-md border border-border bg-secondary/30 p-2.5">
            <div className="text-[10px] text-muted-foreground">Portal Status</div>
            <div className={cn("text-xs font-medium mt-0.5", f.hasPortalAccount ? "text-success" : "text-accent")}>
              {f.hasPortalAccount ? "Active" : "No Account"}
            </div>
          </div>
          <div className="rounded-md border border-border bg-secondary/30 p-2.5">
            <div className="text-[10px] text-muted-foreground">Last Login</div>
            <div className="text-xs font-medium mt-0.5">{f.lastLogin ?? "—"}</div>
          </div>
        </div>

        {/* This month stats */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">This Month</div>
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Notifications" value={String(f.notificationsThisMonth)} />
            <MiniStat label="Messages" value={String(f.messagesThisMonth)} />
            <MiniStat label="Photos Shared" value={String(f.photosSharedThisMonth)} />
          </div>
        </div>

        {/* Notification log */}
        {f.notifications.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Recent Notifications ({f.notifications.length})
            </div>
            <div className="flex flex-col gap-2">
              {f.notifications.map((n) => (
                <NotificationRow key={n.id} notif={n} />
              ))}
            </div>
          </div>
        )}

        {f.notifications.length === 0 && (
          <div className="rounded-md border border-border bg-secondary/20 px-3 py-4 text-[11px] text-muted-foreground text-center">
            No notifications sent yet — portal account needed first
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Actions</div>
          {[
            { icon: <Phone size={12} />, label: "Call " + f.familyName.split(" ")[0] },
            { icon: <Mail size={12} />, label: "Send Email Update" },
            { icon: <MessageSquare size={12} />, label: "Send Secure Message" },
            { icon: <Camera size={12} />, label: "Share Photos" },
          ].map((a) => (
            <button
              key={a.label}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded border border-border hover:bg-secondary transition-colors w-full text-left"
            >
              <span className="text-muted-foreground">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function NotificationRow({ notif: n }: { notif: FamilyNotification }) {
  const CHANNEL_ICONS_SM: Record<FamilyNotification["channel"], React.ReactNode> = {
    push:  <Smartphone size={9} />,
    email: <Mail size={9} />,
    text:  <MessageSquare size={9} />,
  };

  return (
    <div className={cn(
      "rounded-md border p-2.5",
      n.opened ? "border-border bg-secondary/20" : "border-primary/20 bg-primary/5",
    )}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          {CHANNEL_ICONS_SM[n.channel]}
          <span>{n.date}</span>
        </div>
        {!n.opened && (
          <span className="text-[9px] bg-primary/15 text-primary px-1 py-0.5 rounded font-medium">Unread</span>
        )}
      </div>
      <p className="text-[11px] text-foreground/80 leading-relaxed">{n.message}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="font-mono text-base font-semibold mt-0.5">{value}</div>
    </div>
  );
}
