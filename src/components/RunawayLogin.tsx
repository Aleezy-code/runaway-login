import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Status = "idle" | "loading" | "done";

const MIN_PASSWORD = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function RunawayLogin() {
  const dockRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const lastMoveRef = useRef(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, rot: 0 });
  const [status, setStatus] = useState<Status>("idle");
  const [keyboardMode, setKeyboardMode] = useState(false);

  const emailOk = EMAIL_RE.test(email.trim());
  const passwordOk = password.length >= MIN_PASSWORD;
  const filled = (emailOk ? 1 : 0) + (passwordOk ? 1 : 0);
  const settled = filled === 2;

  // How badly the button wants to escape. 0 filled = feral, 1 = hesitant, 2 = tame.
  const evasion = useMemo(() => {
    if (settled) return { radius: 0, push: 0, duration: 260 };
    if (filled === 1) return { radius: 120, push: 0.55, duration: 520 };
    return { radius: 210, push: 1, duration: 380 };
  }, [filled, settled]);

  const reset = useCallback(() => {
    posRef.current = { x: 0, y: 0 };
    setPos({ x: 0, y: 0, rot: 0 });
  }, []);

  useEffect(() => {
    if (settled) reset();
  }, [settled, reset]);

  const flee = useCallback(
    (pointerX: number, pointerY: number) => {
      const dock = dockRef.current;
      const btn = btnRef.current;
      if (!dock || !btn || evasion.radius === 0 || status !== "idle") return;

      const dockRect = dock.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const cx = btnRect.left + btnRect.width / 2;
      const cy = btnRect.top + btnRect.height / 2;

      const dx = cx - pointerX;
      const dy = cy - pointerY;
      const dist = Math.hypot(dx, dy) || 0.001;
      if (dist > evasion.radius) return;

      const now = performance.now();
      if (now - lastMoveRef.current < 90) return;
      lastMoveRef.current = now;

      // Free room inside the dock, minus a little breathing padding.
      const padding = 10;
      const freeX = Math.max(0, (dockRect.width - btnRect.width) / 2 - padding);
      const freeY = Math.max(0, (dockRect.height - btnRect.height) / 2 - padding);

      // Closer pointer = stronger shove.
      const urgency = (1 - dist / evasion.radius) * evasion.push;
      const stepX = (dx / dist) * (freeX * 1.35 * urgency + 24);
      const stepY = (dy / dist) * (freeY * 1.35 * urgency + 12);

      let nextX = posRef.current.x + stepX;
      let nextY = posRef.current.y + stepY;

      // A finger is never chased into a corner: if the wall is close on the
      // clamped axis, the button teleports past the pointer instead of pinning.
      if (freeX > 0 && Math.abs(nextX) > freeX) {
        nextX = -Math.sign(nextX) * freeX * (0.55 + Math.random() * 0.35);
      }

      nextX = clamp(nextX, -freeX, freeX);
      nextY = clamp(nextY, -freeY, freeY);

      posRef.current = { x: nextX, y: nextY };
      setPos({ x: nextX, y: nextY, rot: clamp(nextX / 26, -7, 7) });
    },
    [evasion, status],
  );

  useEffect(() => {
    // Fine pointers only — touch users get a button that simply stands still.
    const fine = window.matchMedia("(pointer: fine)");
    if (!fine.matches) return;

    const onMove = (e: PointerEvent) => flee(e.clientX, e.clientY);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [flee]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") setKeyboardMode(true);
    };
    const onPointer = () => setKeyboardMode(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settled || status !== "idle") return;
    setStatus("loading");
    window.setTimeout(() => setStatus("done"), 1600);
  };

  const hint = settled
    ? status === "done"
      ? "Welcome back, you caught it."
      : status === "loading"
        ? "Signing you in…"
        : "It stopped running. Go ahead."
    : filled === 1
      ? "One to go — it is slowing down."
      : "Two fields to fill before it stands still.";

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={submit}
        className="surface-card rounded-3xl px-6 py-7 sm:px-8 sm:py-9"
        noValidate
      >
        <div className="flex items-center gap-2.5">
          <span className="relative grid size-6 place-items-center rounded-full border border-primary/50">
            <span className="pulse-dot size-2 rounded-full bg-primary" />
          </span>
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-muted-foreground">
            Tether
          </span>
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
            icon={<MailIcon />}
          >
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@studio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
          </Field>

          <Field
            id="password"
            label="Password"
            active={focused === "password"}
            valid={passwordOk}
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
            aside={
              <button
                type="button"
                className="text-xs font-medium text-primary transition-opacity hover:opacity-80"
              >
                Forgot?
              </button>
            }
          >
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={`At least ${MIN_PASSWORD} characters`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
          </Field>
        </div>

        {/* The dock is the cage: the button can only run inside these walls. */}
        <div
          ref={dockRef}
          className="dock-track relative mt-7 flex h-[74px] items-center justify-center rounded-2xl"
        >
          <button
            ref={btnRef}
            type="submit"
            aria-disabled={!settled}
            data-settled={settled}
            className="cta-runaway inline-flex h-11 min-w-[132px] items-center justify-center gap-2 rounded-xl px-7 text-sm font-semibold data-[settled=false]:cursor-default"
            style={{
              transform: `translate3d(${keyboardMode ? 0 : pos.x}px, ${
                keyboardMode ? 0 : pos.y
              }px, 0) rotate(${keyboardMode ? 0 : pos.rot}deg)`,
              ["--flee-dur" as string]: `${evasion.duration}ms`,
            }}
          >
            {status === "loading" ? (
              <span className="spin-ring size-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            ) : status === "done" ? (
              "Signed in"
            ) : (
              "Log in"
            )}
          </button>
        </div>

        <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <span
            data-settled={settled}
            className="size-1.5 rounded-full bg-muted-foreground data-[settled=true]:bg-primary"
          />
          {hint}
        </p>

        <p className="mt-3 text-center text-[0.7rem] text-muted-foreground/80">
          <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[0.65rem]">
            Tab
          </kbd>{" "}
          reaches it.{" "}
          <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[0.65rem]">
            Enter
          </kbd>{" "}
          submits.
        </p>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account yet?{" "}
          <button type="button" className="font-medium text-primary hover:opacity-80">
            Create one
          </button>
        </p>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  active,
  valid,
  icon,
  trailing,
  aside,
  children,
}: {
  id: string;
  label: string;
  active: boolean;
  valid: boolean;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
        {aside}
      </div>
      <div
        className={`field-shell flex items-center gap-3 rounded-xl px-3.5 py-3 ${
          active ? "field-shell-active" : ""
        }`}
      >
        <span className={active || valid ? "text-primary" : "text-muted-foreground"}>{icon}</span>
        {children}
        {trailing}
        {valid ? <CheckBadge /> : null}
      </div>
    </div>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="10" width="16" height="10.5" rx="3" />
      <path d="M8 10V7.5a4 4 0 1 1 8 0V10" />
    </svg>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
      {off ? <path d="m4 20 16-16" /> : null}
    </svg>
  );
}

function CheckBadge() {
  return (
    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}
