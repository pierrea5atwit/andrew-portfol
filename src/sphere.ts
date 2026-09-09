/**
 * Minimal 3D vector math for walking on the surface of a unit sphere.
 *
 * Everything the globe draws lives in *local* (body-fixed) coordinates on the
 * unit sphere, and is rotated into view coordinates only at draw time. That is
 * what makes the gecko stick to the surface as the globe spins underneath it,
 * with no per-frame correction.
 */

export type V3 = { x: number; y: number; z: number };

export const v3 = (x: number, y: number, z: number): V3 => ({ x, y, z });

export const dot = (a: V3, b: V3) => a.x * b.x + a.y * b.y + a.z * b.z;

export const cross = (a: V3, b: V3): V3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});

export const add = (a: V3, b: V3): V3 => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});

export const sub = (a: V3, b: V3): V3 => ({
  x: a.x - b.x,
  y: a.y - b.y,
  z: a.z - b.z,
});

export const scale = (a: V3, k: number): V3 => ({
  x: a.x * k,
  y: a.y * k,
  z: a.z * k,
});

export function norm(a: V3): V3 {
  const l = Math.hypot(a.x, a.y, a.z) || 1;
  return { x: a.x / l, y: a.y / l, z: a.z / l };
}

export const clamp = (n: number, lo: number, hi: number) =>
  n < lo ? lo : n > hi ? hi : n;

/** Angle in radians between two unit vectors. */
export const angleBetween = (a: V3, b: V3) => Math.acos(clamp(dot(a, b), -1, 1));

/** Convert latitude/longitude in radians to a point on the unit sphere. */
export const fromLatLon = (lat: number, lon: number): V3 => ({
  x: Math.cos(lat) * Math.sin(lon),
  y: Math.sin(lat),
  z: Math.cos(lat) * Math.cos(lon),
});

/**
 * Spin about the vertical axis, then tilt about the horizontal one.
 * Orthographic projection afterwards means the returned z is pure depth:
 * positive is toward the viewer, so `z > 0` is the near hemisphere.
 */
export function rotate(p: V3, spin: number, tilt: number): V3 {
  const cs = Math.cos(spin);
  const sn = Math.sin(spin);
  const x1 = p.x * cs + p.z * sn;
  const z1 = -p.x * sn + p.z * cs;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  return { x: x1, y: p.y * ct - z1 * st, z: p.y * st + z1 * ct };
}

/** Inverse of `rotate` — view coordinates back to body-fixed coordinates. */
export function unrotate(p: V3, spin: number, tilt: number): V3 {
  const ct = Math.cos(-tilt);
  const st = Math.sin(-tilt);
  const y1 = p.y * ct - p.z * st;
  const z1 = p.y * st + p.z * ct;
  const cs = Math.cos(-spin);
  const sn = Math.sin(-spin);
  return { x: p.x * cs + z1 * sn, y: y1, z: -p.x * sn + z1 * cs };
}

/**
 * Unit tangent at `p` pointing along the great circle toward `t`.
 * Null when the two are coincident or antipodal, where no direction exists.
 */
export function tangentToward(p: V3, t: V3): V3 | null {
  const proj = sub(t, scale(p, dot(p, t)));
  const l = Math.hypot(proj.x, proj.y, proj.z);
  if (l < 1e-6) return null;
  return scale(proj, 1 / l);
}

/** Any unit tangent at `p`, for when a real direction is unavailable. */
export function anyTangent(p: V3): V3 {
  const seed = Math.abs(p.y) < 0.9 ? v3(0, 1, 0) : v3(1, 0, 0);
  return norm(cross(p, seed));
}

/**
 * Walk `step` radians along the great circle from `p` heading `dir`.
 * Returns the new position and the parallel-transported heading, so a chain of
 * these traces a geodesic rather than drifting off one.
 */
export function advance(p: V3, dir: V3, step: number): { p: V3; dir: V3 } {
  const c = Math.cos(step);
  const s = Math.sin(step);
  const np = norm(add(scale(p, c), scale(dir, s)));
  const raw = add(scale(p, -s), scale(dir, c));
  // Re-orthogonalise against the new position; floating-point drift otherwise
  // tilts the heading off the tangent plane over thousands of frames.
  return { p: np, dir: norm(sub(raw, scale(np, dot(raw, np)))) };
}

/**
 * Pull `node` to sit exactly `ang` radians from `anchor`, keeping the
 * direction between them. The spherical analogue of a distance constraint,
 * which is what holds the gecko's spine together.
 */
export function constrain(anchor: V3, node: V3, ang: number): V3 {
  const t = tangentToward(anchor, node) ?? anyTangent(anchor);
  return norm(add(scale(anchor, Math.cos(ang)), scale(t, Math.sin(ang))));
}

/**
 * Evenly spaced points on a sphere via the Fibonacci lattice — no clumping,
 * unlike uniform random sampling, so the node scatter reads as designed.
 */
export function fibonacciSphere(count: number): V3[] {
  const out: V3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    out.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
  }
  return out;
}
