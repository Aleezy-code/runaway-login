import { createFileRoute } from "@tanstack/react-router";
import { RunawayLogin } from "@/components/RunawayLogin";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Runaway Login — Tether Component 95" },
      {
        name: "description",
        content:
          "A login button that runs away until you've earned it. Fill both fields and it finally stands still. Keyboard access always works.",
      },
      { property: "og:title", content: "Runaway Login — Tether Component 95" },
      {
        property: "og:description",
        content:
          "An interactive sign-in form where the Log in button bolts from your cursor until the form is valid.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-14">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.42em] text-muted-foreground">
        Component · 95
      </p>
      <h1 className="mt-4 text-center text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl">
        <span className="text-gradient-title">Runaway</span>
        <br />
        <span className="text-gradient-title">Login</span>
      </h1>

      <div className="mt-9 w-full max-w-md">
        <RunawayLogin />
      </div>

      <p className="mt-10 text-center text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground/70">
        Fine pointer only · Tab + Enter always work · Zero dependencies
      </p>
    </main>
  );
}
