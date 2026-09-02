import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/LoginForm";
import { AuthShell } from "@/components/auth-ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tether — The Login Button That Runs Away" },
      {
        name: "description",
        content:
          "A prank sign-in page where the log in button dodges your cursor until every field is valid. Real accounts, real sessions.",
      },
      { property: "og:title", content: "Tether — The Login Button That Runs Away" },
      {
        property: "og:description",
        content: "Fill the form to catch the button. Real authentication behind the joke.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthShell eyebrow="Catch it if you can" title="The button" accent="runs away.">
      <LoginForm />
    </AuthShell>
  );
}
