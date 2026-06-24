import { useState, type ComponentType } from "react";
import {
  Settings, CreditCard, Users, ExternalLink, Download, CheckCircle2,
  Building2, Mail, Clock, UserPlus, MoreHorizontal, Zap,
} from "lucide-react";
import { ModuleHeader } from "@/components/shell/ModuleHeader";
import { cn } from "@/lib/utils";
import {
  ACCOUNT, PAYMENT_METHOD, SUBSCRIPTION_INVOICES, TEAM_MEMBERS,
  type TeamMember,
} from "@/lib/mock/account";
import { PermissionsTab } from "./PermissionsTab";
import { STAFF_MEMBERS } from "@/lib/mock/permissions";

const MODULE_COLOR = "#818CF8";

type Tab = "subscription" | "account" | "team" | "permissions";

const TABS: { id: Tab; label: string }[] = [
  { id: "subscription", label: "Subscription" },
  { id: "account", label: "Account" },
  { id: "team", label: "Team" },
  { id: "permissions", label: "Permissions" },
];

export function SettingsModule() {
  const [tab, setTab] = useState<Tab>("subscription");

  return (
    <div className="space-y-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Settings"
        description="Manage your Haven OS account, subscription, and team."
        icon={Settings}
        color={MODULE_COLOR}
      />

      <div className="flex gap-0 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.id ? "" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            style={tab === t.id ? { borderColor: MODULE_COLOR, color: MODULE_COLOR } : {}}
          >
            {t.label}
            {t.id === "team" && (
              <span className="ml-1.5 text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                {TEAM_MEMBERS.length}
              </span>
            )}
            {t.id === "permissions" && (
              <span className="ml-1.5 text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                {STAFF_MEMBERS.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "subscription" && <SubscriptionTab />}
      {tab === "account" && <AccountTab />}
      {tab === "team" && <TeamTab />}
      {tab === "permissions" && <PermissionsTab />}
    </div>
  );
}

// ── Subscription Tab ──────────────────────────────────────────────────────────

function SubscriptionTab() {
  const monthlyTotal = ACCOUNT.price * ACCOUNT.communities;
  const annualSavings = Math.round(monthlyTotal * 12 * 0.2);

  return (
    <div className="max-w-3xl space-y-4">
      {/* Current plan */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-surface flex items-center justify-between">
          <h3 className="font-semibold text-sm">Current Plan</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium border border-success/20">
            Active
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xl font-bold mb-1">Haven OS {ACCOUNT.plan}</div>
              <div className="text-sm text-muted-foreground mb-3">
                ${ACCOUNT.price} / community / month · {ACCOUNT.communities} {ACCOUNT.communities === 1 ? "community" : "communities"}
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
                <span className="text-muted-foreground">
                  Monthly total{" "}
                  <span className="font-mono font-semibold text-foreground">${monthlyTotal.toLocaleString()}</span>
                </span>
                <span className="text-muted-foreground">
                  Next billing{" "}
                  <span className="font-semibold text-foreground">{ACCOUNT.nextBillingDate}</span>
                </span>
                <span className="text-muted-foreground">
                  Member since{" "}
                  <span className="font-semibold text-foreground">{ACCOUNT.memberSince}</span>
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: MODULE_COLOR }}
              >
                <ExternalLink size={13} />
                Manage Subscription
              </button>
              <button className="px-4 py-2 rounded-md text-sm font-medium border border-border bg-card text-muted-foreground hover:text-foreground transition-colors text-center">
                Add Community
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Communities</div>
              <div className="font-semibold">{ACCOUNT.communities}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Staff Seats</div>
              <div className="font-semibold">
                {ACCOUNT.seatsUsed}{" "}
                <span className="text-muted-foreground font-normal">of {ACCOUNT.seats}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Billing Cycle</div>
              <div className="font-semibold capitalize">{ACCOUNT.interval}ly</div>
            </div>
          </div>
        </div>
      </div>

      {/* Annual billing upsell */}
      <div
        className="rounded-lg border px-5 py-3.5 flex items-center justify-between gap-4"
        style={{ borderColor: `${MODULE_COLOR}40`, backgroundColor: `${MODULE_COLOR}08` }}
      >
        <div className="flex items-center gap-3">
          <Zap size={15} style={{ color: MODULE_COLOR }} className="shrink-0" />
          <span className="text-sm">
            Switch to annual billing and save{" "}
            <span className="font-mono font-semibold" style={{ color: MODULE_COLOR }}>
              ${annualSavings.toLocaleString()}/year
            </span>
          </span>
        </div>
        <button
          className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors hover:opacity-80"
          style={{ borderColor: `${MODULE_COLOR}50`, color: MODULE_COLOR }}
        >
          Switch to Annual
        </button>
      </div>

      {/* Payment method */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-surface flex items-center justify-between">
          <h3 className="font-semibold text-sm">Payment Method</h3>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">Update</button>
        </div>
        <div className="p-5 flex items-center gap-4">
          <div className="w-12 h-8 rounded-md border border-border bg-muted flex items-center justify-center shrink-0">
            <CreditCard size={15} className="text-muted-foreground" />
          </div>
          <div>
            <div className="text-sm font-medium">
              {PAYMENT_METHOD.brand} ending in {PAYMENT_METHOD.last4}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Expires {String(PAYMENT_METHOD.expMonth).padStart(2, "0")}/{PAYMENT_METHOD.expYear}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-success font-medium">
            <CheckCircle2 size={12} />
            Default
          </div>
        </div>
      </div>

      {/* Invoice history */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-surface">
          <h3 className="font-semibold text-sm">Invoice History</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              <th className="text-left px-5 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Date</th>
              <th className="text-left px-3 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Description</th>
              <th className="text-right px-3 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Amount</th>
              <th className="text-center px-3 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Status</th>
              <th className="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {SUBSCRIPTION_INVOICES.map((inv) => (
              <tr key={inv.id} className="border-b border-border/40 last:border-0 hover:bg-surface/30 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{inv.date}</td>
                <td className="px-3 py-3">{inv.description}</td>
                <td className="px-3 py-3 text-right font-mono font-semibold">${inv.amount.toLocaleString()}</td>
                <td className="px-3 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                    <CheckCircle2 size={10} />
                    Paid
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors ml-auto">
                    <Download size={11} />
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Account Tab ───────────────────────────────────────────────────────────────

function AccountTab() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-surface flex items-center justify-between">
          <h3 className="font-semibold text-sm">Organization</h3>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">Edit</button>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/15 grid place-items-center shrink-0">
              <span className="font-display font-bold text-primary text-xl">H</span>
            </div>
            <div>
              <div className="font-semibold text-base">{ACCOUNT.org}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Member since {ACCOUNT.memberSince}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoField icon={Mail} label="Admin Email" value={ACCOUNT.adminEmail} />
            <InfoField icon={Building2} label="Communities" value={`${ACCOUNT.communities} locations`} />
            <InfoField icon={Clock} label="Timezone" value={ACCOUNT.timezone} />
            <InfoField icon={Users} label="Staff Seats" value={`${ACCOUNT.seatsUsed} of ${ACCOUNT.seats} used`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({
  icon: Icon, label, value,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
        <Icon size={13} className="text-muted-foreground" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

// ── Team Tab ──────────────────────────────────────────────────────────────────

function TeamTab() {
  const activeCount = TEAM_MEMBERS.filter((m) => m.status === "active").length;
  const invitedCount = TEAM_MEMBERS.filter((m) => m.status === "invited").length;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{activeCount}</span> active
          {invitedCount > 0 && (
            <> · <span className="text-accent font-semibold">{invitedCount}</span> pending invite</>
          )}
          {" · "}
          <span className="text-foreground font-semibold">{ACCOUNT.seatsUsed}</span> of {ACCOUNT.seats} seats used
        </p>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90 shrink-0"
          style={{ backgroundColor: MODULE_COLOR }}
        >
          <UserPlus size={13} />
          Invite Member
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              <th className="text-left px-5 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Member</th>
              <th className="text-left px-3 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider hidden sm:table-cell">Role</th>
              <th className="text-left px-3 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider hidden md:table-cell">Community Access</th>
              <th className="text-center px-3 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Status</th>
              <th className="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {TEAM_MEMBERS.map((m) => (
              <TeamRow key={m.id} member={m} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamRow({ member: m }: { member: TeamMember }) {
  return (
    <tr className="border-b border-border/40 last:border-0 hover:bg-surface/30 transition-colors">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary/20 grid place-items-center text-[11px] font-semibold text-primary shrink-0">
            {m.avatar}
          </div>
          <div>
            <div className="font-medium leading-snug">{m.name}</div>
            <div className="text-[11px] text-muted-foreground">{m.email}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-muted-foreground text-sm hidden sm:table-cell">{m.role}</td>
      <td className="px-3 py-3 hidden md:table-cell">
        <span className={cn(
          "text-[11px] px-2 py-0.5 rounded font-medium",
          m.access === "All Communities"
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground",
        )}>
          {m.access}
        </span>
      </td>
      <td className="px-3 py-3 text-center">
        {m.status === "active" ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
            <CheckCircle2 size={10} />
            Active
          </span>
        ) : (
          <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
            Invited
          </span>
        )}
      </td>
      <td className="px-5 py-3">
        <button className="text-muted-foreground hover:text-foreground transition-colors ml-auto block">
          <MoreHorizontal size={15} />
        </button>
      </td>
    </tr>
  );
}
