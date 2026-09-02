import { createFileRoute } from "@tanstack/react-router";
import { SignupForm } from "@/components/SignupForm";
import { AuthShell } from "@/components/auth-ui";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — Tether" },
      {
        name: "description",
        content:
          "Register for Tether: display name, email and password. Four valid fields tame the runaway button.",
      },
      { property: "og:title", content: "Create your account — Tether" },
      {
        property: "og:description",
        content: "Sign up in four fields and tame the button that refuses to be clicked.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <AuthShell eyebrow="New here" title="Four fields," accent="one wild button.">
      <SignupForm />
    </AuthShell>
  );
}
