import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, BrandMark, Field, LockIcon } from "@/components/auth-ui";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password — Tether" },
      { name: "description", content: "Choose a new password for your Tether account." },
      { property: "og:title", content: "Set a new password — Tether" },
      { property: "og:description", content: "Complete your Tether password reset." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[a-zA-Z]/, "Add at least one letter")
  .regex(/[0-9]/, "Add at least one number");

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const parsed = passwordSchema.safeParse(password);
  const matches = password.length > 0 && password === confirm;
  const valid = parsed.success && matches;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated. You're signed in.");
    void navigate({ to: "/dashboard" });
  };

  return (
    <AuthShell eyebrow="Recovery" title="New password," accent="same chase.">
      <form onSubmit={submit} className="surface-card rounded-3xl px-5 py-7 sm:px-8 sm:py-9" noValidate>
        <BrandMark />
        <h2 className="mt-6 text-2xl font-semibold tracking-tight">Set a new password</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {ready
            ? "Pick something you'll remember this time."
            : "Open this page from the reset link in your email to continue."}
        </p>

        <div className="mt-6 space-y-5">
          <Field
            id="new-password"
            label="New password"
            active={focused === "p"}
            valid={parsed.success}
            error={password && !parsed.success ? parsed.error.issues[0]?.message : undefined}
            icon={<LockIcon />}
          >
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("p")}
              onBlur={() => setFocused(null)}
              placeholder="8+ chars, letter and number"
              className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
          </Field>

          <Field
            id="confirm-password"
            label="Confirm password"
            active={focused === "c"}
            valid={matches}
            error={confirm && !matches ? "Passwords don't match" : undefined}
            icon={<LockIcon />}
          >
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onFocus={() => setFocused("c")}
              onBlur={() => setFocused(null)}
              placeholder="Type it again"
              className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={!valid || busy || !ready}
          className="cta-runaway mt-7 h-11 w-full rounded-xl text-sm font-semibold disabled:opacity-45"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
