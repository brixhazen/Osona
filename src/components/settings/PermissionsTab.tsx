import { useState, useMemo } from "react";
import { Search, UserPlus, Shield, ChevronRight, Check, Eye, EyeOff, Edit2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ROLES, STAFF_MEMBERS, MODULE_META,
  type Role, type StaffMember, type PermissionLevel, type ModulePermissions,
} from "@/lib/mock/permissions";

const MODULE_COLOR = "#818CF8";

// ── Permission level badge ────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<PermissionLevel, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  full:  { label: "Full", bg: "bg-teal-500/15", text: "text-teal-400", icon: <Check size={10} /> },
  view:  { label: "View", bg: "bg-blue-500/15",  text: "text-blue-400",  icon: <Eye  size={10} /> },
  none:  { label: "None", bg: "bg-muted/40",      text: "text-muted-foreground", icon: <EyeOff size={10} /> },
};

function LevelBadge({ level }: { level: PermissionLevel }) {
  const cfg = LEVEL_CONFIG[level];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full", cfg.bg, cfg.text)}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

// ── Permission toggle button ──────────────────────────────────────────────────

function PermToggle({
  level,
  onChange,
  disabled,
}: {
  level: PermissionLevel;
  onChange: (l: PermissionLevel) => void;
  disabled?: boolean;
}) {
  const options: PermissionLevel[] = ["full", "view", "none"];

  return (
    <div className={cn("inline-flex rounded-lg border border-border overflow-hidden", disabled && "opacity-50 pointer-events-none")}>
      {options.map((opt) => {
        const cfg = LEVEL_CONFIG[opt];
        const active = opt === level;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "px-2 py-1 text-[10px] font-medium transition-colors",
              active ? cn(cfg.bg, cfg.text) : "bg-transparent text-muted-foreground hover:bg-muted/20",
            )}
          >
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div
      className="size-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
      style={{ backgroundColor: color + "30", color }}
    >
      {initials}
    </div>
  );
}

// ── Role color helper ─────────────────────────────────────────────────────────

function getRoleColor(roleId: string) {
  return ROLES.find((r) => r.id === roleId)?.color ?? "#818CF8";
}

// ── Staff list item ───────────────────────────────────────────────────────────

function StaffRow({
  member,
  selected,
  onSelect,
}: {
  member: StaffMember;
  selected: boolean;
  onSelect: () => void;
}) {
  const role = ROLES.find((r) => r.id === member.roleId);
  const color = role?.color ?? "#818CF8";

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
        selected ? "bg-[#818CF8]/10 border border-[#818CF8]/30" : "hover:bg-muted/20 border border-transparent",
      )}
    >
      <Avatar initials={member.avatar} color={color} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{member.name}</span>
          {member.status === "invited" && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium shrink-0">
              Invited
            </span>
          )}
          {member.customPermissions && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#818CF8]/15 text-[#818CF8] font-medium shrink-0">
              Custom
            </span>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">{role?.name ?? member.roleId}</div>
      </div>
      {selected && <ChevronRight size={14} className="text-[#818CF8] shrink-0" />}
    </button>
  );
}

// ── Permissions grid ──────────────────────────────────────────────────────────

function PermissionsGrid({
  permissions,
  rolePermissions,
  isCustom,
  onToggle,
}: {
  permissions: ModulePermissions;
  rolePermissions: ModulePermissions;
  isCustom: boolean;
  onToggle: (key: keyof ModulePermissions, level: PermissionLevel) => void;
}) {
  return (
    <div className="space-y-1">
      {MODULE_META.map((mod) => {
        const level = permissions[mod.key];
        const roleLevel = rolePermissions[mod.key];
        const isOverridden = isCustom && level !== roleLevel;

        return (
          <div
            key={mod.key}
            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/10 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-foreground/90">{mod.label}</span>
              {isOverridden && (
                <span className="text-[9px] text-[#818CF8]/70 italic">overridden</span>
              )}
            </div>
            <PermToggle level={level} onChange={(l) => onToggle(mod.key, l)} />
          </div>
        );
      })}
    </div>
  );
}

// ── Role Card ─────────────────────────────────────────────────────────────────

function RoleCard({
  role,
  memberCount,
  selected,
  onSelect,
}: {
  role: Role;
  memberCount: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left border transition-colors",
        selected
          ? "border-[#818CF8]/40 bg-[#818CF8]/8"
          : "border-transparent hover:border-border hover:bg-muted/10",
      )}
    >
      <div
        className="size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: role.color + "25" }}
      >
        <Shield size={14} style={{ color: role.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{role.name}</span>
          <span className="text-[10px] text-muted-foreground">{memberCount} staff</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{role.description}</p>
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PermissionsTab() {
  const [view, setView] = useState<"staff" | "roles">("staff");
  const [search, setSearch] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(STAFF_MEMBERS[0].id);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(ROLES[0].id);
  const [staffOverrides, setStaffOverrides] = useState<Record<string, ModulePermissions | null>>({});
  const [roleEdits, setRoleEdits] = useState<Record<string, ModulePermissions>>({});
  const [saved, setSaved] = useState<string | null>(null);

  const filteredStaff = useMemo(
    () =>
      STAFF_MEMBERS.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          (ROLES.find((r) => r.id === m.roleId)?.name ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  // Effective permissions for a staff member
  function effectivePerms(member: StaffMember): ModulePermissions {
    const override = staffOverrides[member.id];
    if (override) return override;
    const role = ROLES.find((r) => r.id === member.roleId);
    return roleEdits[member.roleId] ?? role?.permissions ?? ({} as ModulePermissions);
  }

  function rolePerms(roleId: string): ModulePermissions {
    return roleEdits[roleId] ?? (ROLES.find((r) => r.id === roleId)?.permissions ?? ({} as ModulePermissions));
  }

  // Staff permission change
  function handleStaffToggle(memberId: string, key: keyof ModulePermissions, level: PermissionLevel) {
    setStaffOverrides((prev) => {
      const current = prev[memberId] ?? effectivePermsForId(memberId);
      return { ...prev, [memberId]: { ...current, [key]: level } };
    });
  }

  function effectivePermsForId(memberId: string): ModulePermissions {
    const member = STAFF_MEMBERS.find((m) => m.id === memberId)!;
    return effectivePerms(member);
  }

  // Role permission change
  function handleRoleToggle(roleId: string, key: keyof ModulePermissions, level: PermissionLevel) {
    setRoleEdits((prev) => {
      const current = prev[roleId] ?? (ROLES.find((r) => r.id === roleId)?.permissions ?? {} as ModulePermissions);
      return { ...prev, [roleId]: { ...current, [key]: level } };
    });
  }

  function resetStaffToRole(memberId: string) {
    setStaffOverrides((prev) => ({ ...prev, [memberId]: null }));
  }

  function triggerSave(label: string) {
    setSaved(label);
    setTimeout(() => setSaved(null), 2000);
  }

  const selectedMember = STAFF_MEMBERS.find((m) => m.id === selectedStaffId) ?? null;
  const selectedMemberRole = selectedMember ? ROLES.find((r) => r.id === selectedMember.roleId) : null;
  const hasStaffOverride = selectedMember ? !!staffOverrides[selectedMember.id] : false;
  const selectedRole = ROLES.find((r) => r.id === selectedRoleId) ?? null;
  const roleMemberCount = (roleId: string) => STAFF_MEMBERS.filter((m) => m.roleId === roleId).length;

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-muted/20 rounded-lg p-1">
          {(["staff", "roles"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize",
                view === v
                  ? "bg-card text-foreground shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v === "staff" ? "Staff" : "Roles"}
            </button>
          ))}
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border hover:bg-muted/20 transition-colors text-muted-foreground hover:text-foreground"
          onClick={() => triggerSave("invite")}
        >
          <UserPlus size={14} />
          Invite Staff
        </button>
      </div>

      {/* Staff view */}
      {view === "staff" && (
        <div className="grid grid-cols-[280px_1fr] gap-4 min-h-[520px]">
          {/* Staff list */}
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff or role…"
                className="w-full bg-muted/20 border border-border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#818CF8]/40"
              />
            </div>
            <div className="space-y-0.5 overflow-y-auto max-h-[460px]">
              {filteredStaff.map((m) => (
                <StaffRow
                  key={m.id}
                  member={m}
                  selected={selectedStaffId === m.id}
                  onSelect={() => setSelectedStaffId(m.id)}
                />
              ))}
              {filteredStaff.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No staff found.</p>
              )}
            </div>
          </div>

          {/* Detail panel */}
          {selectedMember ? (
            <div className="bg-muted/10 rounded-xl border border-border p-5 flex flex-col gap-4 overflow-y-auto max-h-[580px]">
              {/* Header */}
              <div className="flex items-start gap-3">
                <Avatar initials={selectedMember.avatar} color={selectedMemberRole?.color ?? MODULE_COLOR} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold">{selectedMember.name}</span>
                    {selectedMember.status === "invited" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                        Pending invite
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{selectedMember.email}</div>
                </div>
              </div>

              {/* Role + override controls */}
              <div className="flex items-center justify-between py-2 px-3 bg-muted/20 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <Shield size={13} style={{ color: selectedMemberRole?.color ?? MODULE_COLOR }} />
                  <span className="text-sm font-medium">{selectedMemberRole?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasStaffOverride ? (
                    <>
                      <span className="text-[10px] text-[#818CF8]">Custom permissions active</span>
                      <button
                        onClick={() => resetStaffToRole(selectedMember.id)}
                        className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors"
                        title="Reset to role defaults"
                      >
                        <X size={10} />Reset
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Using role defaults</span>
                  )}
                  <button
                    onClick={() => {
                      if (!hasStaffOverride) {
                        setStaffOverrides((prev) => ({
                          ...prev,
                          [selectedMember.id]: effectivePerms(selectedMember),
                        }));
                      }
                    }}
                    className={cn(
                      "text-[10px] flex items-center gap-1 px-2 py-1 rounded border transition-colors",
                      hasStaffOverride
                        ? "border-[#818CF8]/30 text-[#818CF8] bg-[#818CF8]/5"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/20",
                    )}
                  >
                    <Edit2 size={9} />
                    {hasStaffOverride ? "Editing" : "Customize"}
                  </button>
                </div>
              </div>

              {/* Module permission grid */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  Module Access
                </div>
                <PermissionsGrid
                  permissions={effectivePerms(selectedMember)}
                  rolePermissions={selectedMemberRole?.permissions ?? ({} as ModulePermissions)}
                  isCustom={hasStaffOverride}
                  onToggle={(key, level) => {
                    if (!hasStaffOverride) {
                      setStaffOverrides((prev) => ({
                        ...prev,
                        [selectedMember.id]: effectivePerms(selectedMember),
                      }));
                    }
                    handleStaffToggle(selectedMember.id, key, level);
                  }}
                />
              </div>

              {/* Save */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => triggerSave(selectedMember.name)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                  style={{ backgroundColor: MODULE_COLOR }}
                >
                  {saved === selectedMember.name ? (
                    <span className="flex items-center gap-1.5"><Check size={13} />Saved</span>
                  ) : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-muted/10 rounded-xl border border-border flex items-center justify-center text-sm text-muted-foreground">
              Select a staff member
            </div>
          )}
        </div>
      )}

      {/* Roles view */}
      {view === "roles" && (
        <div className="grid grid-cols-[280px_1fr] gap-4 min-h-[520px]">
          {/* Role list */}
          <div className="space-y-0.5">
            {ROLES.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                memberCount={roleMemberCount(role.id)}
                selected={selectedRoleId === role.id}
                onSelect={() => setSelectedRoleId(role.id)}
              />
            ))}
          </div>

          {/* Role detail */}
          {selectedRole ? (
            <div className="bg-muted/10 rounded-xl border border-border p-5 flex flex-col gap-4 overflow-y-auto max-h-[580px]">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className="size-9 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: selectedRole.color + "25" }}
                >
                  <Shield size={16} style={{ color: selectedRole.color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold">{selectedRole.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {roleMemberCount(selectedRole.id)} staff
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedRole.description}</p>
                </div>
              </div>

              {/* Staff with this role */}
              {roleMemberCount(selectedRole.id) > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {STAFF_MEMBERS.filter((m) => m.roleId === selectedRole.id).map((m) => (
                    <span
                      key={m.id}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted/20 text-muted-foreground"
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Permission grid */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  Default Module Access
                </div>
                <div className="space-y-1">
                  {MODULE_META.map((mod) => {
                    const level = rolePerms(selectedRole.id)[mod.key];
                    return (
                      <div
                        key={mod.key}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/10 transition-colors"
                      >
                        <span className="text-sm text-foreground/90">{mod.label}</span>
                        <PermToggle
                          level={level}
                          onChange={(l) => handleRoleToggle(selectedRole.id, mod.key, l)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 px-1 pt-1">
                {(["full", "view", "none"] as PermissionLevel[]).map((l) => {
                  const cfg = LEVEL_CONFIG[l];
                  return (
                    <div key={l} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className={cn("inline-flex items-center gap-0.5 font-medium", cfg.text)}>
                        {cfg.icon}
                      </span>
                      <span><b className={cfg.text}>{cfg.label}</b> — {
                        l === "full" ? "can view & edit" :
                        l === "view" ? "read-only access" :
                        "hidden from user"
                      }</span>
                    </div>
                  );
                })}
              </div>

              {/* Save */}
              <div className="flex justify-end">
                <button
                  onClick={() => triggerSave(selectedRole.id)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                  style={{ backgroundColor: MODULE_COLOR }}
                >
                  {saved === selectedRole.id ? (
                    <span className="flex items-center gap-1.5"><Check size={13} />Saved</span>
                  ) : "Save Role"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-muted/10 rounded-xl border border-border flex items-center justify-center text-sm text-muted-foreground">
              Select a role
            </div>
          )}
        </div>
      )}
    </div>
  );
}
