import { useEffect, useRef } from "react";

/**
 * A little procedural gecko that walks toward wherever you last tapped.
 *
 * How it works:
 *  - The spine is a chain of points. The head steers toward the click target;
 *    every other node is distance-constrained to the node ahead of it, so the
 *    body + tail trail naturally (a "follow-the-leader" / inverse-kinematics chain).
 *  - Four legs use simple foot-IK: a foot stays planted until its hip drags too
 *    far away, then it takes a quick step. That produces a walk cycle for free.
 *  - Everything is drawn to one SVG and updated imperatively via refs, so React
 *    never re-renders during the animation loop.
 *
 * Good-citizen behaviour: the loop never starts under prefers-reduced-motion,
 * and parks itself while the tab is hidden so a backgrounded page costs nothing.
 */

type Pt = { x: number; y: number };

const SEGMENTS = 16;
const LINK = 13; // distance between spine nodes
// Body half-width at each node: head bulge -> thin neck -> body -> tapering tail.
const WIDTHS = [7, 8, 10, 9, 8, 7.5, 7, 6.4, 5.8, 5, 4.2, 3.4, 2.7, 2, 1.4, 0.8];

const LEGS = [
  { node: 3, side: 1 },
  { node: 3, side: -1 },
  { node: 8, side: 1 },
  { node: 8, side: -1 },
];
const LEG_REACH = 22; // how far a foot rests out to the side
const STEP_TRIGGER = 26; // hip-to-foot distance that triggers a step
const STEP_SPEED = 0.35; // how fast a foot snaps to its new spot

const MAX_SPEED = 3.4;

function dist(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Shortest signed angular difference, lerped for smooth steering.
function steer(from: number, to: number, t: number) {
  let d = ((to - from + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return from + d * t;
}

// A closed, smooth path through the given outline points (quadratic midpoints).
function smoothClosed(points: Pt[]) {
  if (points.length < 3) return "";
  let d = `M ${mid(points[points.length - 1], points[0])}`;
  for (let i = 0; i < points.length; i++) {
    const cur = points[i];
    const next = points[(i + 1) % points.length];
    d += ` Q ${cur.x.toFixed(1)} ${cur.y.toFixed(1)} ${mid(cur, next)}`;
  }
  return d + " Z";
}
function mid(a: Pt, b: Pt) {
  return `${((a.x + b.x) / 2).toFixed(1)} ${((a.y + b.y) / 2).toFixed(1)}`;
}

export default function Lizard() {
  const svgRef = useRef<SVGSVGElement>(null);
  const bodyRef = useRef<SVGPathElement>(null);
  const eyeL = useRef<SVGCircleElement>(null);
  const eyeR = useRef<SVGCircleElement>(null);
  const legRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    // Decorative motion is opt-out at the OS level; honour it and render nothing.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Seed the spine trailing off to the left of center.
    const spine: Pt[] = Array.from({ length: SEGMENTS }, () => ({ x: 0, y: 0 }));
    const target: Pt = { x: 0, y: 0 };
    const feet: Pt[] = LEGS.map(() => ({ x: 0, y: 0 }));
    let heading = 0;

    // Park the whole body at the center of the current viewport. Called at
    // mount and again if we ever find ourselves outside it — a tab that mounts
    // while hidden or prerendered reports a 0x0 window, which would otherwise
    // strand the gecko in the top-left corner forever.
    const recenter = () => {
      const w = window.innerWidth || 1024;
      const h = window.innerHeight || 768;
      for (let i = 0; i < SEGMENTS; i++) {
        spine[i].x = w / 2 - i * LINK;
        spine[i].y = h / 2;
      }
      target.x = w / 2;
      target.y = h / 2;
      LEGS.forEach((l, i) => {
        feet[i].x = spine[l.node].x;
        feet[i].y = spine[l.node].y + l.side * LEG_REACH;
      });
    };
    recenter();

    // pointerdown covers mouse, touch, and pen in one listener — a plain
    // "click" handler never fires for the tail end of a touch scroll, which
    // made the gecko feel dead on mobile.
    const onPoint = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    window.addEventListener("pointerdown", onPoint);

    // If the viewport changes, keep the gecko reachable: pull the target back
    // inside it, and start over entirely if the head is already stranded
    // outside (the 0x0-at-mount case resolves here).
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const head = spine[0];
      if (head.x < 0 || head.y < 0 || head.x > w || head.y > h) {
        recenter();
        return;
      }
      target.x = Math.min(target.x, w - 20);
      target.y = Math.min(target.y, h - 20);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const tick = () => {
      const head = spine[0];
      const d = dist(head, target);
      const want = Math.atan2(target.y - head.y, target.x - head.x);
      heading = steer(heading, want, 0.12);
      if (d > 3) {
        const speed = Math.min(MAX_SPEED, d * 0.12 + 0.6);
        head.x += Math.cos(heading) * speed;
        head.y += Math.sin(heading) * speed;
      }

      // Distance-constrain the rest of the chain to the node ahead.
      for (let i = 1; i < SEGMENTS; i++) {
        const a = spine[i - 1];
        const b = spine[i];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dl = Math.hypot(dx, dy) || 1;
        b.x = a.x + (dx / dl) * LINK;
        b.y = a.y + (dy / dl) * LINK;
      }

      // Build the body outline: offset each node along its normal.
      const left: Pt[] = [];
      const right: Pt[] = [];
      for (let i = 0; i < SEGMENTS; i++) {
        const prev = spine[Math.max(0, i - 1)];
        const next = spine[Math.min(SEGMENTS - 1, i + 1)];
        const ang = Math.atan2(next.y - prev.y, next.x - prev.x);
        const nx = Math.cos(ang + Math.PI / 2);
        const ny = Math.sin(ang + Math.PI / 2);
        const wd = WIDTHS[i];
        left.push({ x: spine[i].x + nx * wd, y: spine[i].y + ny * wd });
        right.push({ x: spine[i].x - nx * wd, y: spine[i].y - ny * wd });
      }
      const outline = [...left, ...right.reverse()];
      bodyRef.current?.setAttribute("d", smoothClosed(outline));

      // Legs: foot-IK walk cycle.
      LEGS.forEach((leg, i) => {
        const n = spine[leg.node];
        const prev = spine[Math.max(0, leg.node - 1)];
        const ang = Math.atan2(n.y - prev.y, n.x - prev.x);
        const nx = Math.cos(ang + (leg.side * Math.PI) / 2);
        const ny = Math.sin(ang + (leg.side * Math.PI) / 2);
        // Desired resting foot spot: out to the side, biased slightly forward.
        const rest: Pt = {
          x: n.x + nx * LEG_REACH + Math.cos(ang) * 6,
          y: n.y + ny * LEG_REACH + Math.sin(ang) * 6,
        };
        const foot = feet[i];
        if (dist(foot, rest) > STEP_TRIGGER) {
          foot.x += (rest.x - foot.x) * STEP_SPEED;
          foot.y += (rest.y - foot.y) * STEP_SPEED;
        }
        // Knee: midpoint pushed outward for a bent-leg look.
        const knee = {
          x: (n.x + foot.x) / 2 + nx * 5,
          y: (n.y + foot.y) / 2 + ny * 5,
        };
        legRefs.current[i]?.setAttribute(
          "d",
          `M ${n.x.toFixed(1)} ${n.y.toFixed(1)} Q ${knee.x.toFixed(1)} ${knee.y.toFixed(1)} ${foot.x.toFixed(1)} ${foot.y.toFixed(1)}`
        );
      });

      // Eyes on top of the head.
      const head0 = spine[0];
      const eAng = heading;
      const enx = Math.cos(eAng + Math.PI / 2);
      const eny = Math.sin(eAng + Math.PI / 2);
      const fx = Math.cos(eAng) * 3;
      const fy = Math.sin(eAng) * 3;
      eyeL.current?.setAttribute("cx", (head0.x + enx * 4 + fx).toFixed(1));
      eyeL.current?.setAttribute("cy", (head0.y + eny * 4 + fy).toFixed(1));
      eyeR.current?.setAttribute("cx", (head0.x - enx * 4 + fx).toFixed(1));
      eyeR.current?.setAttribute("cy", (head0.y - eny * 4 + fy).toFixed(1));

      raf = requestAnimationFrame(tick);
    };

    // Browsers throttle rAF in hidden tabs; stopping outright means a
    // backgrounded tab does no work at all.
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", onVisibility);

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", onPoint);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <svg ref={svgRef} className="lizard" aria-hidden="true">
      <defs>
        <linearGradient id="gecko" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7fd66a" />
          <stop offset="100%" stopColor="#3f9e57" />
        </linearGradient>
      </defs>
      {LEGS.map((_, i) => (
        <path
          key={i}
          ref={(el) => {
            legRefs.current[i] = el;
          }}
          stroke="#3f9e57"
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      <path ref={bodyRef} fill="url(#gecko)" stroke="#2f7d43" strokeWidth={1.5} />
      <circle ref={eyeL} r={2.4} fill="#10231a" />
      <circle ref={eyeR} r={2.4} fill="#10231a" />
    </svg>
  );
}
