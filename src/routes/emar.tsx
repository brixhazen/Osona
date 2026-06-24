import { createFileRoute } from "@tanstack/react-router";
import { EmarModule } from "@/components/emar/EmarModule";

export const Route = createFileRoute("/emar")({
  head: () => ({ meta: [
    { title: "eMAR — Haven OS" },
    { name: "description", content: "Electronic medication administration record for Haven OS." },
  ]}),
  component: EmarModule,
});
