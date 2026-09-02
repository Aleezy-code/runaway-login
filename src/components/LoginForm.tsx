import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RunawayButton } from "@/components/RunawayButton";
import {
  AuthSwitch,
  BrandMark,
  EyeIcon,
  Field,
  LockIcon,
  MailIcon,
  SoundToggle,
} from "@/components/auth-ui";
import { buzz, playError, playSettle, playUnlock } from "@/lib/prank-fx";

const emailSchema = z.string().trim().email();
const passwordSchema = z.string().min(8);

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [errors, setErrors] = useState<{ email?: string | undefined; password?: string | undefined }>({});

  const emailOk = emailSchema.safeParse(email).success;
  const passwordOk = passwordSchema.safeParse(password).success;
  const filled = (emailOk ? 1 : 0) + (passwordOk ? 1 : 0);
  const settled = filled === 2;

  const prevFilled = useRef(0);
  useEffect(() => {
    if (filled > prevFilled.current) {
      if (soundOn) (filled === 2 ? playSettle : playUnlock)();
      buzz(filled === 2 ? [24, 50, 24] : 16);
    }
    prevFilled.current = filled;
  }, [filled, soundOn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settled || busy) return;

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);

    if (error) {
      if (soundOn) playError();
      buzz([40, 60, 40]);
      toast.error(
        error.message.toLowerCase().includes("email not confirmed")
          ? "Confirm your email first — check your inbox for the link."
          : "Those credentials didn't work. Try again.",
      );
      return;
    }

    toast.success("Caught it. Welcome back.");
    void navigate({ to: "/dashboard" });
  };

  const handleForgot = async () => {
    if (!emailOk) {
      setErrors((p) => ({ ...p, email: "Enter your email first, then tap Forgot." }));
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error("Couldn't send the reset link. Try again shortly.");
    else toast.success("Reset link sent — check your inbox.");
  };

  const hint = busy
    ? "Signing you in…"
    : settled
      ? "It stopped running. Go ahead."
      : filled === 1
        ? "One to go — it is slowing down."
        : "Two fields to fill before it stands still.";

  return (
    <form onSubmit={handleSubmit} className="surface-card rounded-3xl px-5 py-7 sm:px-8 sm:py-9" noValidate>
      <div className="flex items-center justify-between">
        <BrandMark />
        <SoundToggle on={soundOn} onToggle={() => setSoundOn((v) => !v)} />
      </div>

      <h2 className="mt-6 text-2xl font-semibold tracking-tight">Sign in</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Welcome back. Two fields stand between you and that button.
      </p>

      <div className="mt-6 space-y-5">
        <Field
          id="email"
          label="Email"
          active={focused === "email"}
          valid={emailOk}
          error={errors.email}
          icon={<MailIcon />}
        >
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@studio.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((p) => ({ ...p, email: undefined }));
            }}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </Field>

        <Field
          id="password"
          label="Password"
          active={focused === "password"}
          valid={passwordOk}
          icon={<LockIcon />}
          aside={
            <button
              type="button"
              onClick={handleForgot}
              className="text-xs font-medium text-primary transition-opacity hover:opacity-80"
            >
              Forgot?
            </button>
          }
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <EyeIcon off={showPassword} />
            </button>
          }
        >
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </Field>
      </div>

      <div className="mt-7">
        <RunawayButton
          filled={filled}
          total={2}
          settled={settled}
          busy={busy}
          soundOn={soundOn}
          label="Log in"
          busyLabel="Signing you in"
        />
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <span
          data-settled={settled}
          className="size-1.5 shrink-0 rounded-full bg-muted-foreground data-[settled=true]:bg-primary"
        />
        {hint}
      </p>

      <p className="mt-3 text-center text-[0.7rem] text-muted-foreground/80">
        <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[0.65rem]">Tab</kbd>{" "}
        reaches it.{" "}
        <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[0.65rem]">Enter</kbd>{" "}
        submits.
      </p>

      <AuthSwitch text="No account yet?" to="/signup" cta="Create one" />
    </form>
  );
}
