import Globe from "./Globe";
import { PROJECTS, ROLES, LINKS, type Project } from "./data";

function ProjectCard({ p, i }: { p: Project; i: number }) {
  return (
    <article
      className={p.featured ? "card card--featured" : "card"}
      // Staggers the idle float so the rail does not bob in unison.
      style={{ "--i": i } as React.CSSProperties}
    >
      <span className="pill">{p.tag}</span>
      <h3>{p.name}</h3>
      <p>{p.blurb}</p>
      <ul className="stack" aria-label={`${p.name} stack`}>
        {p.stack.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <div className="card__links">
        {p.repo && (
          <a href={p.repo} target="_blank" rel="noreferrer">
            Code
          </a>
        )}
        {p.live && (
          <a href={p.live} target="_blank" rel="noreferrer">
            Live
          </a>
        )}
        {!p.repo && !p.live && p.privateNote && (
          <span className="card__note">{p.privateNote}</span>
        )}
      </div>
    </article>
  );
}

export default function App() {
  // Featured first, then the rest, in one rail.
  const ordered = [
    ...PROJECTS.filter((p) => p.featured),
    ...PROJECTS.filter((p) => !p.featured),
  ];

  return (
    <>
      <Globe />
      <a className="skip" href="#main">
        Skip to content
      </a>

      <div className="content">
        <header className="hero wrap" id="main">
          <p className="eyebrow">
            andrew@wentworth <b>~/portfolio</b> &mdash; testing ground
          </p>
          <h1>
            Andrew Pierre
            <span className="caret" aria-hidden="true" />
          </h1>
          <p className="lede">
            CS + Data Science at Wentworth, class of{" "}
            <span className="nowrap">&rsquo;27</span>. I build local-first AI
            systems &mdash; agents that run on your own hardware, with your own
            data.
          </p>
          <p className="lede lede--sub">
            I care about owning systems: architecture, orchestration, and
            problem-framing more than any one implementation. Keeping everything
            on-device is the constraint that makes it interesting &mdash; memory,
            retrieval, and routing stop being API calls and start being
            engineering.
          </p>

          <nav className="links" aria-label="Elsewhere">
            <a href={LINKS.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={LINKS.email}>Email</a>
          </nav>

          <p className="hint">
            Move your cursor &mdash; the gecko chases it around the globe.{" "}
            <span aria-hidden="true">&#129422;</span>
          </p>
        </header>

        <section className="work" aria-labelledby="work">
          <div className="wrap work__head">
            <h2 id="work">selected work</h2>
            <p className="rail__hint" aria-hidden="true">
              drag<span className="rail__hint-desk">, or shift + scroll</span>
            </p>
          </div>

          {/* A plain overflow row: trackpad, touch, keyboard and screen
              readers all work without any scroll interception. */}
          <div
            className="rail"
            role="region"
            aria-label="Projects, scrollable horizontally"
            tabIndex={0}
          >
            {ordered.map((p, i) => (
              <ProjectCard key={p.name} p={p} i={i} />
            ))}
          </div>

          <p className="more wrap">
            <a href={LINKS.github} target="_blank" rel="noreferrer">
              Everything else on GitHub
            </a>
          </p>
        </section>

        {/* Solid ground below the globe. The canvas reads this element's
            offset to know when it should have finished setting. */}
        <div className="ground" data-globe-end>
          <div className="wrap">
            <section aria-labelledby="experience">
              <h2 id="experience">experience</h2>
              <ol className="timeline">
                {ROLES.map((r) => (
                  <li key={r.org + r.title}>
                    <div className="timeline__head">
                      <h3>
                        {r.title} <span className="at">&middot;</span> {r.org}
                      </h3>
                      <p className="timeline__meta">
                        {r.when} <span className="at">&middot;</span> {r.where}
                      </p>
                    </div>
                    <ul>
                      {r.points.map((pt) => (
                        <li key={pt}>{pt}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="toolbox">
              <h2 id="toolbox">toolbox</h2>
              <dl className="toolbox">
                <div>
                  <dt>Focus</dt>
                  <dd>
                    LLM integration &amp; agent design &middot; retrieval systems
                    &middot; data visualization &amp; analysis &middot; API design
                  </dd>
                </div>
                <div>
                  <dt>Languages</dt>
                  <dd>
                    Python &middot; TypeScript / JavaScript &middot; C / C++
                    &middot; Java &middot; Rust &middot; SQL
                  </dd>
                </div>
                <div>
                  <dt>Tools</dt>
                  <dd>
                    Git &middot; Docker &middot; Ollama &middot; SQLite &middot;
                    MongoDB &middot; Vercel &middot; Netlify &middot; Claude Code
                    &middot; VS Code
                  </dd>
                </div>
                <div>
                  <dt>Coursework</dt>
                  <dd>
                    Operating Systems &middot; Databases &middot; AI Applications
                    &middot; Linear Algebra &middot; Probability &middot;
                    Statistics &middot; Software Engineering
                  </dd>
                </div>
              </dl>
            </section>

            <footer>
              <p>
                B.S. Computer Science, minor in Data Science &amp; Applied Math
                &mdash; expected Dec. 2027.
              </p>
              <p>
                Built with React, Vite, and TypeScript. The globe is a
                hand-rolled wireframe on one canvas, and the gecko walks it in
                spherical coordinates &mdash; an inverse-kinematics spine whose
                links are angles along great circles. No 3D library.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
