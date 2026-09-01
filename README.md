# portfolio

Personal site and testing ground — https://github.com/pierrea5atwit

A single-page React site with no UI framework, no animation library, and two
runtime dependencies. It doubles as a sandbox: things get tried here first.

## The gecko

`src/Lizard.tsx` is a procedural gecko that walks to wherever you last tapped.
It is hand-rolled SVG, ~200 lines, no library:

- **Spine** — a 16-node chain. The head steers toward the target with a lerped
  angular step; every other node is distance-constrained to the node ahead of
  it, so the body and tail trail behind (follow-the-leader inverse kinematics).
- **Body** — each node is offset along its normal by a per-node half-width to
  build an outline, then drawn as one closed quadratic path through the
  midpoints, which is what keeps the silhouette smooth instead of faceted.
- **Legs** — foot IK. A foot stays planted until its hip drags past a trigger
  distance, then snaps to a new resting spot. The walk cycle is emergent; there
  are no keyframes.
- **Rendering** — one SVG, mutated imperatively through refs. React never
  re-renders during the animation loop.

It refuses to start under `prefers-reduced-motion: reduce`, stops entirely
while the tab is hidden, and recenters if it ever finds itself outside the
viewport (a tab that mounts hidden reports a 0x0 window).

## Content

Everything the page says lives in `src/data.ts` — projects, roles, and links.
Edit that file, not the components. A project with no `repo` or `live` renders
as private rather than dead-linking.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build -> dist/
npm run preview
```

## Stack

React 18 · Vite 5 · TypeScript 5 · plain CSS (custom properties, no preprocessor)
