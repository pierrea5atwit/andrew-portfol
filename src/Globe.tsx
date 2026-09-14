import { useEffect, useRef } from "react";
import {
  advance,
  angleBetween,
  anyTangent,
  clamp,
  constrain,
  cross,
  dot,
  fibonacciSphere,
  fromLatLon,
  norm,
  rotate,
  scale,
  sub,
  tangentToward,
  unrotate,
  v3,
  type V3,
} from "./sphere";

/**
 * A hollow wireframe globe with a gecko walking on it.
 *
 * The globe is a lat/long cage plus a Fibonacci scatter of node points. It
 * spins slowly about its own axis under a fixed tilt, and rises up the
 * viewport as you scroll, so the page reads as descending past it — by the
 * time the experience section arrives the globe has set above you.
 *
 * The gecko is the same follow-the-leader IK chain as before, lifted onto the
 * sphere: spine nodes are unit vectors, the "distance" constraint is an
 * angular one along great circles, and the head walks geodesics toward
 * whatever point on the surface your cursor is over. Everything is stored in
 * body-fixed coordinates, so it sticks to the surface as the globe turns.
 *
 * One canvas, one rAF, no 3D library.
 */

/* ---------- globe geometry ---------- */

const TILT = -0.34; // radians; a fixed axial lean so the poles are visible
const SPIN_RATE = 0.058; // rad/s — a full turn takes just under two minutes
const LATITUDES = [-66, -44, -22, 0, 22, 44, 66].map((d) => (d * Math.PI) / 180);
const MERIDIANS = 12;
const RING_SEGMENTS = 72;
const MERIDIAN_SEGMENTS = 48;
const NODE_COUNT = 44;

/* ---------- gecko ---------- */

/** All gecko dimensions are angles, derived once from a reference radius, so
 *  the creature keeps its proportions at any globe size. */
const REF_R = 380;
/** Sizes the whole creature against the globe. At 1 the proportions match the
 *  old flat gecko exactly, which turned out to read as a smudge at globe
 *  scale — the legs were too small to see. */
const GECKO = 1.5;
const SEGMENTS = 16;
const LINK = 0.037 * GECKO; // radians between spine nodes
const WIDTHS = [7, 8, 10, 9, 8, 7.5, 7, 6.4, 5.8, 5, 4.2, 3.4, 2.7, 2, 1.4, 0.8].map(
  (w) => (w / REF_R) * GECKO
);
const LEGS = [
  { node: 3, side: 1 },
  { node: 3, side: -1 },
  { node: 8, side: 1 },
  { node: 8, side: -1 },
];
const LEG_REACH = (26 / REF_R) * GECKO;
const LEG_FORWARD = (6 / REF_R) * GECKO;
const KNEE_PUSH = (7 / REF_R) * GECKO;
const STEP_TRIGGER = (30 / REF_R) * GECKO;
const STEP_SPEED = 0.35;
const MAX_TURN = 3.2; // rad/s of heading change
const MAX_SPEED = 0.62; // rad/s along the surface

/** After this long without pointer movement the gecko wanders on its own. */
const IDLE_AFTER = 4000;
const WANDER_EVERY = 5200;

type Proj = { sx: number; sy: number; z: number };

function hexToRgb(hex: string, fallback: [number, number, number]) {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) return fallback;
  const n = Number.parseInt(h, 16);
  if (Number.isNaN(n)) return fallback;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as [number, number, number];
}

const rgba = (c: [number, number, number], a: number) =>
  `rgba(${c[0]},${c[1]},${c[2]},${a})`;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Read the palette off the stylesheet so the canvas can never drift out of
    // sync with the CSS tokens.
    const css = getComputedStyle(document.documentElement);
    const ACCENT = hexToRgb(css.getPropertyValue("--accent"), [110, 231, 135]);
    const DIM = hexToRgb(css.getPropertyValue("--dim"), [78, 106, 91]);
    const BODY = hexToRgb(css.getPropertyValue("--accent"), [110, 231, 135]);

    /* ---------- static geometry, built once ---------- */

    const rings: V3[][] = LATITUDES.map((lat) => {
      const pts: V3[] = [];
      for (let i = 0; i < RING_SEGMENTS; i++) {
        pts.push(fromLatLon(lat, (i / RING_SEGMENTS) * Math.PI * 2));
      }
      return pts;
    });

    const meridians: V3[][] = [];
    for (let m = 0; m < MERIDIANS; m++) {
      const lon = (m / MERIDIANS) * Math.PI * 2;
      const pts: V3[] = [];
      for (let i = 0; i <= MERIDIAN_SEGMENTS; i++) {
        const lat = -Math.PI / 2 + (i / MERIDIAN_SEGMENTS) * Math.PI;
        pts.push(fromLatLon(lat, lon));
      }
      meridians.push(pts);
    }

    const nodes = fibonacciSphere(NODE_COUNT);

    /* ---------- gecko state ---------- */

    const spine: V3[] = [];
    let heading: V3 = v3(0, 0, 0);
    const feet: V3[] = [];

    const seedGecko = () => {
      const start = norm(v3(0.15, 0.25, 1));
      let p = start;
      let dir = anyTangent(start);
      spine.length = 0;
      spine.push(p);
      for (let i = 1; i < SEGMENTS; i++) {
        const back = advance(p, scale(dir, -1), LINK);
        p = back.p;
        spine.push(p);
      }
      heading = tangentToward(spine[0], spine[1])
        ? scale(tangentToward(spine[0], spine[1])!, -1)
        : anyTangent(spine[0]);
      feet.length = 0;
      LEGS.forEach((leg) => {
        const n = spine[leg.node];
        feet.push(norm(advance(n, anyTangent(n), LEG_REACH).p));
      });
    };
    seedGecko();

    /* ---------- viewport / scroll ---------- */

    let W = 0;
    let H = 0;
    let R = 300;
    let cx = 0;
    let cy = 0;
    let spin = 0;
    let globeEndY = 0;

    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = clamp(Math.min(W, H) * 0.48, 140, 430);
      cx = W / 2;
      measureLayout();
    };

    /** Where the ground section starts. Cached rather than read per frame:
     *  getBoundingClientRect forces layout. */
    const measureLayout = () => {
      const end = document.querySelector("[data-globe-end]");
      globeEndY = end
        ? end.getBoundingClientRect().top + window.scrollY
        : H * 2;
    };
    measure();

    /**
     * Vertical centre of the globe for the current scroll position.
     *
     * Two rules, and the tighter one wins. The globe rises on its own slow
     * schedule over roughly one viewport of scroll (the reveal), but it must
     * always sit clear of the ground section — which is opaque, and would
     * otherwise bury the lower half of the globe and the gecko with it. Once
     * the ground catches up it pushes the globe out of frame.
     */
    const globeY = () => {
      const reveal = lerp(
        H * 1.22,
        H * 0.46,
        easeOut(clamp(window.scrollY / (H * 0.9), 0, 1))
      );
      const groundTop = globeEndY - window.scrollY;
      return Math.min(reveal, groundTop - R * 1.05);
    };

    /** Fade out only once the globe has essentially left the viewport. */
    const globeAlpha = () => clamp((cy + R) / (H * 0.3), 0, 1);

    /* ---------- pointer ---------- */

    let pointer: { x: number; y: number } | null = null;
    let lastMove = 0;
    let nextWander = 0;
    let wanderTarget: V3 | null = null;

    const onPointerMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      lastMove = performance.now();
      wanderTarget = null;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    /** Screen point to the surface point under it, in body-fixed coordinates.
     *  Outside the disc, the nearest point on the limb. */
    const screenToLocal = (mx: number, my: number): V3 => {
      const u = (mx - cx) / R;
      const v = -(my - cy) / R;
      const d2 = u * u + v * v;
      const view =
        d2 <= 1
          ? v3(u, v, Math.sqrt(1 - d2))
          : (() => {
              const l = Math.sqrt(d2);
              return v3(u / l, v / l, 0);
            })();
      return unrotate(view, spin, TILT);
    };

    /* ---------- drawing ---------- */

    const project = (p: V3): Proj => {
      const r = rotate(p, spin, TILT);
      return { sx: cx + r.x * R, sy: cy - r.y * R, z: r.z };
    };

    /** Stroke only the runs of a polyline on the requested hemisphere. */
    const strokeHemisphere = (
      pts: Proj[],
      closed: boolean,
      front: boolean
    ) => {
      const n = pts.length;
      const limit = closed ? n + 1 : n;
      ctx.beginPath();
      let pen = false;
      for (let i = 0; i < limit; i++) {
        const p = pts[i % n];
        if (front ? p.z > 0 : p.z <= 0) {
          if (pen) ctx.lineTo(p.sx, p.sy);
          else {
            ctx.moveTo(p.sx, p.sy);
            pen = true;
          }
        } else {
          pen = false;
        }
      }
      ctx.stroke();
    };

    const drawGecko = (alpha: number) => {
      const projected = spine.map(project);
      // The gecko is opaque: it goes over the horizon rather than showing
      // through the cage. Truncate the body at the first node past the limb.
      let visible = 0;
      while (visible < SEGMENTS && projected[visible].z > 0) visible++;
      if (visible < 3) return;

      // Soften the cut while the head is close to the limb.
      const edge = clamp(projected[0].z / 0.16, 0, 1);
      const a = alpha * edge;
      if (a <= 0.02) return;

      const left: Proj[] = [];
      const right: Proj[] = [];
      for (let i = 0; i < visible; i++) {
        const node = spine[i];
        const ahead = spine[Math.max(0, i - 1)];
        const behind = spine[Math.min(SEGMENTS - 1, i + 1)];
        const fwd =
          tangentToward(node, ahead) ??
          (tangentToward(node, behind)
            ? scale(tangentToward(node, behind)!, -1)
            : anyTangent(node));
        const lat = norm(cross(node, fwd));
        const w = WIDTHS[i];
        left.push(project(norm(advance(node, lat, w).p)));
        right.push(project(norm(advance(node, scale(lat, -1), w).p)));
      }

      const outline = [...left, ...right.reverse()];
      ctx.beginPath();
      const first = outline[0];
      const last = outline[outline.length - 1];
      ctx.moveTo((last.sx + first.sx) / 2, (last.sy + first.sy) / 2);
      for (let i = 0; i < outline.length; i++) {
        const cur = outline[i];
        const next = outline[(i + 1) % outline.length];
        ctx.quadraticCurveTo(
          cur.sx,
          cur.sy,
          (cur.sx + next.sx) / 2,
          (cur.sy + next.sy) / 2
        );
      }
      ctx.closePath();
      ctx.fillStyle = rgba(BODY, 0.92 * a);
      ctx.fill();
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = rgba(BODY, 0.5 * a);
      ctx.stroke();

      // Legs, drawn under nothing in particular — only when hip and foot are
      // both on the near side.
      ctx.lineWidth = Math.max(2, R / 95);
      ctx.lineCap = "round";
      ctx.strokeStyle = rgba(BODY, 0.75 * a);
      LEGS.forEach((leg, i) => {
        if (leg.node >= visible) return;
        const hip = projected[leg.node];
        const foot = project(feet[i]);
        if (hip.z <= 0 || foot.z <= 0) return;
        const node = spine[leg.node];
        const ahead = spine[Math.max(0, leg.node - 1)];
        const fwd = tangentToward(node, ahead) ?? anyTangent(node);
        const lat = norm(cross(node, fwd));
        const kneeV = norm(
          advance(
            norm(scale(sub(node, scale(feet[i], -1)), 0.5)),
            scale(lat, leg.side),
            KNEE_PUSH
          ).p
        );
        const knee = project(kneeV);
        ctx.beginPath();
        ctx.moveTo(hip.sx, hip.sy);
        ctx.quadraticCurveTo(knee.sx, knee.sy, foot.sx, foot.sy);
        ctx.stroke();
      });

      // Eyes.
      const head = spine[0];
      const fwd = tangentToward(head, spine[1])
        ? scale(tangentToward(head, spine[1])!, -1)
        : anyTangent(head);
      const lat = norm(cross(head, fwd));
      const eyeOut = 4 / REF_R;
      const eyeFwd = 3 / REF_R;
      [1, -1].forEach((side) => {
        const base = advance(head, fwd, eyeFwd).p;
        const e = project(norm(advance(base, scale(lat, side), eyeOut).p));
        if (e.z <= 0) return;
        ctx.beginPath();
        ctx.arc(e.sx, e.sy, Math.max(1.6, R / 120), 0, Math.PI * 2);
        ctx.fillStyle = rgba([8, 12, 10], 0.9 * a);
        ctx.fill();
      });
    };

    const draw = (alpha: number) => {
      ctx.clearRect(0, 0, W, H);
      if (alpha <= 0.02) return;

      const ringsP = rings.map((r) => r.map(project));
      const meridiansP = meridians.map((m) => m.map(project));
      const nodesP = nodes.map(project);

      // Far hemisphere first, faint — this is what sells "hollow".
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(DIM, 0.28 * alpha);
      ringsP.forEach((r) => strokeHemisphere(r, true, false));
      meridiansP.forEach((m) => strokeHemisphere(m, false, false));

      nodesP.forEach((p) => {
        if (p.z > 0) return;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 1.1, 0, Math.PI * 2);
        ctx.fillStyle = rgba(DIM, 0.35 * alpha);
        ctx.fill();
      });

      // Near hemisphere.
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(ACCENT, 0.3 * alpha);
      ringsP.forEach((r) => strokeHemisphere(r, true, true));
      meridiansP.forEach((m) => strokeHemisphere(m, false, true));

      nodesP.forEach((p) => {
        if (p.z <= 0) return;
        // Brighter as it faces us, so the scatter breathes as the globe turns.
        const f = 0.35 + p.z * 0.65;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 1.1 + p.z * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(ACCENT, 0.75 * f * alpha);
        ctx.fill();
      });

      drawGecko(alpha);
    };

    /* ---------- loop ---------- */

    // The layout read above goes stale without any window resize: on a first
    // visit the web font lands after this effect runs, and on small screens it
    // reflows the hero past its min-height, moving the ground (68px at
    // 320x568). Re-read whenever the document's height actually changes.
    const layoutObserver = new ResizeObserver(() => {
      measureLayout();
      if (reduced) {
        cy = globeY();
        draw(globeAlpha());
      }
    });
    layoutObserver.observe(document.body);

    if (reduced) {
      // Decorative motion is opt-out at the OS level. Render one still frame
      // so the page keeps its backdrop, then stop for good.
      cy = globeY();
      draw(globeAlpha());
      const onResizeStatic = () => {
        measure();
        cy = globeY();
        draw(globeAlpha());
      };
      window.addEventListener("resize", onResizeStatic);
      window.addEventListener("scroll", onResizeStatic, { passive: true });
      window.removeEventListener("pointermove", onPointerMove);
      return () => {
        layoutObserver.disconnect();
        window.removeEventListener("resize", onResizeStatic);
        window.removeEventListener("scroll", onResizeStatic);
      };
    }

    let raf = 0;
    let prev = performance.now();

    const tick = (now: number) => {
      // Clamp dt so a backgrounded tab does not resume with one enormous step.
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      spin = (spin + SPIN_RATE * dt) % (Math.PI * 2);
      cy = globeY();

      // Where the gecko wants to be.
      let target: V3;
      if (pointer && now - lastMove < IDLE_AFTER) {
        target = screenToLocal(pointer.x, pointer.y);
      } else {
        if (!wanderTarget || now > nextWander) {
          const lat = (Math.random() - 0.5) * 1.7;
          const lon = Math.random() * Math.PI * 2;
          wanderTarget = unrotate(fromLatLon(lat, lon), spin, TILT);
          nextWander = now + WANDER_EVERY;
        }
        target = wanderTarget;
      }

      // Steer the heading toward the great circle to the target, then walk it.
      const want = tangentToward(spine[0], target);
      if (want) {
        const turn = Math.min(1, MAX_TURN * dt);
        const blended = norm({
          x: heading.x + (want.x - heading.x) * turn,
          y: heading.y + (want.y - heading.y) * turn,
          z: heading.z + (want.z - heading.z) * turn,
        });
        heading = norm(sub(blended, scale(spine[0], dot(blended, spine[0]))));
      }
      const gap = angleBetween(spine[0], target);
      if (gap > 0.012) {
        const step = Math.min(MAX_SPEED * dt, gap);
        const moved = advance(spine[0], heading, step);
        spine[0] = moved.p;
        heading = moved.dir;
      }

      // Follow-the-leader: every node sits exactly LINK from the one ahead.
      for (let i = 1; i < SEGMENTS; i++) {
        spine[i] = constrain(spine[i - 1], spine[i], LINK);
      }

      // Foot IK: a foot stays planted until its hip drags too far away.
      LEGS.forEach((leg, i) => {
        const node = spine[leg.node];
        const ahead = spine[Math.max(0, leg.node - 1)];
        const fwd = tangentToward(node, ahead) ?? anyTangent(node);
        const lat = norm(cross(node, fwd));
        const rest = norm(
          advance(
            advance(node, scale(lat, leg.side), LEG_REACH).p,
            fwd,
            LEG_FORWARD
          ).p
        );
        if (angleBetween(feet[i], rest) > STEP_TRIGGER) {
          const t = tangentToward(feet[i], rest);
          if (t) {
            feet[i] = advance(
              feet[i],
              t,
              angleBetween(feet[i], rest) * STEP_SPEED
            ).p;
          }
        }
      });

      draw(globeAlpha());
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        prev = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      layoutObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="sky" aria-hidden="true" />;
}
