import type { LucideIcon } from "lucide-react";

interface ModuleHeaderProps {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export function ModuleHeader({ name, description, icon: Icon, color }: ModuleHeaderProps) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-border">
      <div
        className="size-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}22`, color }}
      >
        <Icon size={20} />
      </div>
      <div>
        <h1
          className="font-display font-bold text-lg leading-tight"
          style={{ color }}
        >
          {name}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}
