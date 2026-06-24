import { useSearch, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCallback } from "react";

/**
 * Two-way bind a module's active tab to the `?tab=...` URL search param so
 * the contextual sidebar sub-nav can drive it. Falls back to `defaultTab`.
 */
export function useSectionTab<T extends string>(defaultTab: T): [T, (next: T) => void] {
  const search = useSearch({ strict: false }) as { tab?: string };
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const current = (search.tab as T) || defaultTab;

  const setTab = useCallback(
    (next: T) => {
      navigate({
        to: pathname,
        search: (prev: Record<string, unknown>) => ({ ...prev, tab: next }),
        replace: true,
      } as never);
    },
    [navigate, pathname],
  );

  return [current, setTab];
}