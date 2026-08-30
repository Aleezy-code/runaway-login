import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function AuthShell({
  eyebrow,
  title,
  accent,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
      <p className="text-[0.6rem] font-medium uppercase tracking-[0.4em] text-muted-foreground sm:text-[0.65rem]">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-center text-4xl font-bold leading-[0.95] tracking-tight sm:text-6xl">
        <span className="text-gradient-title">{title}</span>
        <br />
        <span className="text-gradient-title">{accent}</span>
      </h1>

      <div className="mt-8 w-full max-w-md">{children}</div>

      <div className="mt-8 text-center text-[0.55rem] uppercase tracking-[0.28em] text-muted-foreground/70 sm:text-[0.6rem]">
        {footer ?? "Tab + Enter always work · Zero dependencies"}
      </div>
    </main>
  );
}

export function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative grid size-6 place-items-center rounded-full border border-primary/50">
        <span className="pulse-dot size-2 rounded-full bg-primary" />
      </span>
      <span className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-muted-foreground">
        Tether
      </span>
    </div>
  );
}

export function Field({
  id,
  label,
  active,
  valid,
  error,
  icon,
  trailing,
  aside,
  children,
}: {
  id: string;
  label: string;
  active: boolean;
  valid: boolean;
  error?: string;
  icon: ReactNode;
  trailing?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
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
        data-error={Boolean(error)}
        className={`field-shell flex items-center gap-3 rounded-xl px-3.5 py-3 data-[error=true]:border-destructive ${
          active ? "field-shell-active" : ""
        }`}
      >
        <span className={active || valid ? "text-primary" : "text-muted-foreground"}>{icon}</span>
        {children}
        {trailing}
        {valid ? <CheckBadge /> : null}
      </div>
      {error ? <p className="mt-1.5 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function SoundToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? "Mute prank sounds" : "Unmute prank sounds"}
      className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:text-primary"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
        {on ? <path d="M16 9a4.5 4.5 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" /> : <path d="m16.5 9.5 5 5m0-5-5 5" />}
      </svg>
    </button>
  );
}

export function AuthSwitch({ text, to, cta }: { text: string; to: string; cta: string }) {
  return (
    <p className="mt-6 text-center text-sm text-muted-foreground">
      {text}{" "}
      <Link to={to} className="font-medium text-primary hover:opacity-80">
        {cta}
      </Link>
    </p>
  );
}

export function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="10" width="16" height="10.5" rx="3" />
      <path d="M8 10V7.5a4 4 0 1 1 8 0V10" />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.75" />
      <path d="M4.5 20c1.3-3.8 4.1-5.5 7.5-5.5s6.2 1.7 7.5 5.5" />
    </svg>
  );
}

export function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
      {off ? <path d="m4 20 16-16" /> : null}
    </svg>
  );
}

export function CheckBadge() {
  return (
    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}
