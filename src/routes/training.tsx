import { createFileRoute } from "@tanstack/react-router";
import { TrainingModule } from "@/components/training/TrainingModule";

export const Route = createFileRoute("/training")({
  head: () => ({ meta: [
    { title: "Training (LMS) — Haven OS" },
    { name: "description", content: "Onboarding, in-service training, and continuing education compliance." },
  ]}),
  component: TrainingModule,
});
