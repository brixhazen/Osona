import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter, useRouterState, HeadContent, Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { TopBar } from "@/components/shell/TopBar";
import { AiChat } from "@/components/shell/AiChat";
import { ThemeProvider, themeScript } from "@/lib/theme";
import { CommunityProvider } from "@/lib/communityContext";

function NotFoundComponent() {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold">404</h1>
        <p className="text-muted-foreground mt-2 text-sm">This page doesn't exist.</p>
        <Link to="/" className="inline-block mt-5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">Back to dashboard</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground text-sm mt-2">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
        >Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Haven OS — Operations Command Center" },
      { name: "description", content: "All-in-one operating system for assisted living communities." },
      { name: "theme-color", content: "#0D1B2A" },
      { property: "og:title", content: "Haven OS — Operations Command Center" },
      { name: "twitter:title", content: "Haven OS — Operations Command Center" },
      { property: "og:description", content: "All-in-one operating system for assisted living communities." },
      { name: "twitter:description", content: "All-in-one operating system for assisted living communities." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/27bb747c-bad9-458f-9ba7-4c5e44145f84/id-preview-3a2168d4--b6826842-5049-4e80-8f1c-4310c564c4a0.lovable.app-1778813534211.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/27bb747c-bad9-458f-9ba7-4c5e44145f84/id-preview-3a2168d4--b6826842-5049-4e80-8f1c-4310c564c4a0.lovable.app-1778813534211.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Prevent flash of wrong theme on load */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { location } = useRouterState();
  const isCheckout = location.pathname.startsWith("/pay/");

  if (isCheckout) {
    return (
      <ThemeProvider>
        <Outlet />
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CommunityProvider>
          <div className="flex min-h-screen w-full bg-background text-foreground">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <TopBar />
              <main className="flex-1 p-6"><Outlet /></main>
            </div>
            <AiChat />
          </div>
        </CommunityProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
