import { useEffect, useRef, useState } from "react";
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
  UserIcon,
} from "@/components/auth-ui";
import { buzz, playError, playSettle, playUnlock } from "@/lib/prank-fx";

const schema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, "At least 2 characters")
      .max(50, "Keep it under 50 characters"),
    email: z.string().trim().email("That doesn't look like an email").max(255),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .max(72, "Too long")
      .regex(/[a-zA-Z]/, "Add at least one letter")
      .regex(/[0-9]/, "Add at least one number"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords don't match",
  });

type FieldName = "displayName" | "email" | "password" | "confirm";
type Errors = Partial<Record<FieldName, string | undefined>>;

export function SignupForm() {
  const [values, setValues] = useState({ displayName: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [focused, setFocused] = useState<FieldName | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [sent, setSent] = useState(false);

  const set = (name: FieldName, value: string) => {
    setValues((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const result = schema.safeParse(values);
  const fieldValid = (name: FieldName) => {
    if (!values[name]) return false;
    if (result.success) return true;
    return !result.error.issues.some((i) => i.path[0] === name);
  };

  const filled = (["displayName", "email", "password", "confirm"] as FieldName[]).filter(fieldValid).length;
  const settled = result.success;

  const prevFilled = useRef(0);
  useEffect(() => {
    if (filled > prevFilled.current) {
      if (soundOn) (filled === 4 ? playSettle : playUnlock)();
      buzz(filled === 4 ? [24, 50, 24] : 16);
    }
    prevFilled.current = filled;
  }, [filled, soundOn]);

  const showError = (name: FieldName) => (touched[name] ? errors[name] : undefined);

  const blur = (name: FieldName) => {
    setFocused(null);
    setTouched((p) => ({ ...p, [name]: true }));
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === name);
      setErrors((p) => ({ ...p, [name]: issue?.message }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as FieldName] = issue.message;
      setErrors(next);
      setTouched({ displayName: true, email: true, password: true, confirm: true });
      if (soundOn) playError();
      return;
    }
    if (busy) return;

    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: parsed.data.displayName },
      },
    });
    setBusy(false);

    if (error) {
      if (soundOn) playError();
      buzz([40, 60, 40]);
      toast.error(
        error.message.toLowerCase().includes("already registered")
          ? "That email already has an account. Try signing in."
          : error.message,
      );
      return;
    }

    setSent(true);
    toast.success("Account created — confirm your email to finish.");
  };

  if (sent) {
    return (
      <div className="surface-card rounded-3xl px-5 py-9 text-center sm:px-8">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
          <MailIcon />
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">Check your inbox</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We sent a confirmation link to <span className="text-foreground">{values.email.trim()}</span>. Click it,
          then come back and catch that button.
        </p>
        <AuthSwitch text="Already confirmed?" to="/" cta="Go to sign in" />
      </div>
    );
  }

  const remaining = 4 - filled;
  const hint = busy
    ? "Creating your account…"
    : settled
      ? "All four fields are good. The button surrendered."
      : `${remaining} field${remaining === 1 ? "" : "s"} left before it stands still.`;

  return (
    <form onSubmit={handleSubmit} className="surface-card rounded-3xl px-5 py-7 sm:px-8 sm:py-9" noValidate>
      <div className="flex items-center justify-between">
        <BrandMark />
        <SoundToggle on={soundOn} onToggle={() => setSoundOn((v) => !v)} />
      </div>

      <h2 className="mt-6 text-2xl font-semibold tracking-tight">Create account</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Four fields. The button runs harder here — earn it.
      </p>

      <div className="mt-6 space-y-5">
        <Field
          id="displayName"
          label="Display name"
          active={focused === "displayName"}
          valid={fieldValid("displayName")}
          error={showError("displayName")}
          icon={<UserIcon />}
        >
          <input
            id="displayName"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={values.displayName}
            onChange={(e) => set("displayName", e.target.value)}
            onFocus={() => setFocused("displayName")}
            onBlur={() => blur("displayName")}
            className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </Field>

        <Field
          id="signup-email"
          label="Email"
          active={focused === "email"}
          valid={fieldValid("email")}
          error={showError("email")}
          icon={<MailIcon />}
        >
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@studio.com"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            onFocus={() => setFocused("email")}
            onBlur={() => blur("email")}
            className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </Field>

        <Field
          id="signup-password"
          label="Password"
          active={focused === "password"}
          valid={fieldValid("password")}
          error={showError("password")}
          icon={<LockIcon />}
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
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="8+ chars, letter and number"
            value={values.password}
            onChange={(e) => set("password", e.target.value)}
            onFocus={() => setFocused("password")}
            onBlur={() => blur("password")}
            className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </Field>

        <Field
          id="signup-confirm"
          label="Confirm password"
          active={focused === "confirm"}
          valid={fieldValid("confirm")}
          error={showError("confirm")}
          icon={<LockIcon />}
        >
          <input
            id="signup-confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Type it again"
            value={values.confirm}
            onChange={(e) => set("confirm", e.target.value)}
            onFocus={() => setFocused("confirm")}
            onBlur={() => blur("confirm")}
            className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </Field>
      </div>

      <div className="mt-7">
        <RunawayButton
          filled={filled}
          total={4}
          settled={settled}
          busy={busy}
          soundOn={soundOn}
          label="Create account"
          busyLabel="Creating your account"
        />
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <span
          data-settled={settled}
          className="size-1.5 shrink-0 rounded-full bg-muted-foreground data-[settled=true]:bg-primary"
        />
        {hint}
      </p>

      <AuthSwitch text="Already have an account?" to="/" cta="Sign in" />
    </form>
  );
}
