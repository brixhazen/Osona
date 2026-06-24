import { Link, useRouterState, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ChevronDown, Building2, Settings, User, LogOut, ArrowLeft,
} from "lucide-react";
import { COMMUNITIES } from "@/lib/mock/dashboard";
import { useCommunity } from "@/lib/communityContext";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SECTIONS, findSection, type SectionDef } from "@/lib/sectionNav";
import { LogoLockup } from "./Logo";

const SIDEBAR_WIDTH_MAIN = 244;
const SIDEBAR_WIDTH_SECTION = 220;

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const section = findSection(path);
  const inSection = section !== null && section.path !== "/";

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-[width] duration-200",
      )}
      style={{ width: inSection ? SIDEBAR_WIDTH_SECTION : SIDEBAR_WIDTH_MAIN }}
    >
      {inSection && section ? <SectionHeader section={section} /> : <BrandHeader />}
      <div className="flex-1 overflow-y-auto scrollbar-hidden py-3 px-2 space-y-0.5">
        {inSection && section ? <SectionTabs section={section} /> : <MainNav currentPath={path} />}
      </div>
      <SidebarFooter />
    </aside>
  );
}

function BrandHeader() {
  return (
    <div className="flex items-center px-4 h-14 border-b border-sidebar-border">
      <Link to="/" className="block">
        <LogoLockup />
      </Link>
    </div>
  );
}

function SectionHeader({ section }: { section: ReturnType<typeof findSection> }) {
  if (!section) return null;
  return (
    <div className="px-3 h-14 flex items-center border-b border-sidebar-border">
      <Link
        to="/"
        className="flex items-center gap-2 px-2 py-1.5 -ml-1 rounded-md text-sm font-medium hover:bg-sidebar-accent text-sidebar-foreground transition-colors w-full"
        aria-label={`Back to dashboard from ${section.label}`}
      >
        <ArrowLeft size={16} className="shrink-0" />
        <span className="truncate">{section.label}</span>
      </Link>
    </div>
  );
}

function MainNav({ currentPath }: { currentPath: string }) {
  const dashboard = SECTIONS.find((s) => s.path === "/");
  const grouped = SECTIONS.filter((s) => s.path !== "/").reduce<Record<string, typeof SECTIONS>>((acc, s) => {
    const cat = s.category ?? "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const categoryOrder = ["Resident Care", "Business", "Operations", "Quality / Learning"];

  return (
    <div className="space-y-1">
      {dashboard && (
        <div className="pb-2">
          <NavLink section={dashboard} currentPath={currentPath} />
        </div>
      )}
      {categoryOrder.map((category) => {
        const items = grouped[category];
        if (!items || items.length === 0) return null;
        return (
          <div
            key={category}
            className="space-y-0.5 pt-3 mt-2 border-t border-sidebar-border/60"
          >
            <div className="px-3 pt-1 pb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {category}
            </div>
            {items.map((s) => (
              <NavLink key={s.path} section={s} currentPath={currentPath} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function NavLink({ section, currentPath }: { section: SectionDef; currentPath: string }) {
  const Icon = section.icon;
  const active = section.path === "/" ? currentPath === "/" : currentPath.startsWith(section.path);
  return (
    <Link
      to={section.path}
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon size={17} className="shrink-0" />
      <span className="truncate">{section.label}</span>
    </Link>
  );
}

function SectionTabs({ section }: { section: NonNullable<ReturnType<typeof findSection>> }) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { tab?: string };
  const active = search.tab || section.defaultTab;

  return (
    <div className="space-y-0.5 pt-1">
      <div className="px-3 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
        {section.label}
      </div>
      {section.tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() =>
              navigate({
                to: section.path,
                search: { tab: t.id },
                replace: true,
              } as never)
            }
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <span className="truncate">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SidebarFooter() {
  const { community, setCommunity } = useCommunity();
  return (
    <div className="border-t border-sidebar-border p-2 space-y-1">
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-sidebar-accent text-left">
          <Building2 size={16} className="text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Community</div>
            <div className="text-xs truncate">{community.name.split(" — ")[0]}</div>
          </div>
          <ChevronDown size={13} className="text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" className="w-72">
          <DropdownMenuLabel>Switch community</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {COMMUNITIES.map((c) => (
            <DropdownMenuItem key={c.id} onClick={() => setCommunity(c)} className="flex justify-between gap-4">
              <div>
                <div className="text-sm">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.beds}</div>
              </div>
              <div className="font-mono text-xs text-primary">{(c.occupancy * 100).toFixed(1)}%</div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="w-full flex items-center gap-2 rounded-md hover:bg-sidebar-accent text-left p-1.5"
          aria-label="Account menu"
        >
          <div className="size-8 rounded-full bg-primary/20 grid place-items-center text-xs font-semibold text-primary shrink-0">
            DA
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">Dana Alvarez</div>
            <div className="text-[11px] text-muted-foreground truncate">Regional Director</div>
          </div>
          <ChevronDown size={13} className="text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" className="w-56">
          <DropdownMenuLabel>Dana Alvarez</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
              <Settings size={14} /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
            <User size={14} /> Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
            <LogOut size={14} /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function useCurrentCommunity() {
  return useCommunity().community;
}
