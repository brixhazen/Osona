import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/residents/")({
  beforeLoad: () => {
    throw redirect({ to: "/residents/roster" });
  },
});
