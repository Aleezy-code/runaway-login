import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buzz, playDodge, prefersReducedMotion } from "@/lib/prank-fx";

type Props = {
  /** 0 = feral, 1 = hesitant, 2 = tame. */
  filled: number;
  total: number;
  settled: boolean;
  busy: boolean;
  soundOn: boolean;
  label: string;
  busyLabel?: string;
};

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/**
 * A submit button that physically flees the pointer inside its dock until the
 * form is valid. Keyboard users always reach it (Tab focus pins it home).
 */
export function RunawayButton({ filled, total, settled, busy, soundOn, label, busyLabel }: Props) {
  const dockRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const lastMoveRef = useRef(0);
  const dodgeCountRef = useRef(0);

  const [pos, setPos] = useState({ x: 0, y: 0, rot: 0, squash: 1 });
  const [pinned, setPinned] = useState(false); // keyboard focus = truce
  const [caught, setCaught] = useState(false);

  const remaining = Math.max(0, total - filled);

  // Panic profile: emptier form, wider fear radius and harder shove.
  const evasion = useMemo(() => {
    if (settled) return { radius: 0, push: 0, duration: 260 };
    const ratio = remaining / Math.max(1, total);
    return {
      radius: 90 + ratio * 150,
      push: 0.35 + ratio * 0.75,
      duration: 620 - ratio * 240,
    };
  }, [settled, remaining, total]);

  const home = useCallback(() => {
    posRef.current = { x: 0, y: 0 };
    setPos({ x: 0, y: 0, rot: 0, squash: 1 });
  }, []);

  useEffect(() => {
    if (settled) home();
  }, [settled, home]);

  // Any dock/viewport resize could strand the button outside its walls.
  useEffect(() => {
    const dock = dockRef.current;
    if (!dock || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => home());
    ro.observe(dock);
    return () => ro.disconnect();
  }, [home]);

  const dodge = useCallback(
    (px: number, py: number, force = false) => {
      const dock = dockRef.current;
      const btn = btnRef.current;
      if (!dock || !btn || settled || busy || pinned) return;

      const dockRect = dock.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const cx = btnRect.left + btnRect.width / 2;
      const cy = btnRect.top + btnRect.height / 2;

      const dx = cx - px;
      const dy = cy - py;
      const dist = Math.hypot(dx, dy) || 0.001;
      if (!force && dist > evasion.radius) return;

      const now = performance.now();
      if (!force && now - lastMoveRef.current < 80) return;
      lastMoveRef.current = now;

      const padding = 8;
      const freeX = Math.max(0, (dockRect.width - btnRect.width) / 2 - padding);
      const freeY = Math.max(0, (dockRect.height - btnRect.height) / 2 - padding);

      const urgency = force ? 1 : clamp(1 - dist / evasion.radius, 0, 1) * evasion.push;
      const nx = dx / dist;
      const ny = dy / dist;

      let nextX = posRef.current.x + nx * (freeX * 1.4 * urgency + 26);
      let nextY = posRef.current.y + ny * (freeY * 1.4 * urgency + 14);

      // Never corner a finger: bounce to the far side instead of pinning to a wall.
      if (freeX > 6 && Math.abs(nextX) > freeX) {
        nextX = -Math.sign(nextX) * freeX * (0.5 + Math.random() * 0.4);
      }
      if (freeY > 6 && Math.abs(nextY) > freeY) {
        nextY = -Math.sign(nextY) * freeY * (0.4 + Math.random() * 0.5);
      }

      nextX = clamp(nextX, -freeX, freeX);
      nextY = clamp(nextY, -freeY, freeY);

      posRef.current = { x: nextX, y: nextY };
      setPos({
        x: nextX,
        y: nextY,
        rot: freeX > 0 ? clamp((nextX / freeX) * 8, -8, 8) : 0,
        squash: 1 + urgency * 0.06,
      });

      dodgeCountRef.current += 1;
      if (soundOn) playDodge(urgency);
      buzz(force ? [18, 40, 18] : 12);
    },
    [evasion, settled, busy, pinned, soundOn],
  );

  // Mouse/pen: continuous chase. Touch is handled on pointerdown instead.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      dodge(e.clientX, e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [dodge]);

  // Coarse pointers (phones/tablets): it jumps the moment a finger lands on it.
  const onTouchAttempt = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" || settled || busy) return;
    e.preventDefault();
    dodge(e.clientX, e.clientY, true);
  };

  const reduced = typeof window !== "undefined" && prefersReducedMotion();
  const parked = pinned || reduced;

  const content = busy ? (
    <>
      <span className="spin-ring size-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
      <span className="sr-only">{busyLabel ?? "Working"}</span>
    </>
  ) : (
    label
  );

  return (
    <div
      ref={dockRef}
      data-settled={settled}
      className="dock-track relative flex h-[76px] items-center justify-center overflow-hidden rounded-2xl sm:h-[80px]"
    >
      <button
        ref={btnRef}
        type="submit"
        aria-disabled={!settled}
        data-settled={settled}
        data-caught={caught}
        onPointerDown={onTouchAttempt}
        onFocus={(e) => {
          // Tab focus is a truce: the button returns home and stays put.
          if (e.currentTarget.matches(":focus-visible")) {
            setPinned(true);
            home();
          }
        }}
        onBlur={() => setPinned(false)}
        onMouseEnter={() => settled && setCaught(true)}
        onMouseLeave={() => setCaught(false)}
        className="cta-runaway inline-flex h-11 min-w-[136px] items-center justify-center gap-2 rounded-xl px-7 text-sm font-semibold data-[settled=false]:cursor-default"
        style={{
          transform: parked
            ? "translate3d(0,0,0)"
            : `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${pos.rot}deg) scaleX(${pos.squash}) scaleY(${2 - pos.squash})`,
          ["--flee-dur" as string]: `${parked ? 220 : evasion.duration}ms`,
        }}
      >
        {content}
      </button>
    </div>
  );
}
