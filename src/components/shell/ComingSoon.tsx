import type { LucideIcon } from "lucide-react";

export function ComingSoon({ title, icon: Icon, blurb }: { title: string; icon: LucideIcon; blurb: string }) {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-center max-w-md">
        <div className="mx-auto size-14 rounded-xl bg-primary/10 grid place-items-center mb-5">
          <Icon className="text-primary" size={26} />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm mt-2">{blurb}</p>
        <div className="inline-flex items-center gap-2 mt-6 px-3 py-1.5 rounded-full bg-secondary text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          Coming soon
        </div>
      </div>
    </div>
  );
}
