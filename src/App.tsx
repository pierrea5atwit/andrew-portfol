import Lizard from "./Lizard";
import { PROJECTS, ROLES, LINKS, type Project } from "./data";

function ProjectCard({ p }: { p: Project }) {
  return (
    <article className={p.featured ? "card card--featured" : "card"}>
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
  const featured = PROJECTS.filter((p) => p.featured);
  const rest = PROJECTS.filter((p) => !p.featured);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>

      <div className="content">
        {/* .stage is the gecko's enclosure — it is positioned inside this box,
            so it can never walk over the body copy below the fold. */}
        <div className="stage">
          <Lizard />
          <header className="hero" id="main">
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
            Click anywhere up here &mdash; the gecko walks over.{" "}
            <span aria-hidden="true">&#129422;</span>
          </p>
          </header>
        </div>

        <section aria-labelledby="work">
          <h2 id="work">selected work</h2>
          <div className="grid grid--featured">
            {featured.map((p) => (
              <ProjectCard key={p.name} p={p} />
            ))}
          </div>
          <div className="grid">
            {rest.map((p) => (
              <ProjectCard key={p.name} p={p} />
            ))}
          </div>
          <p className="more">
            <a href={LINKS.github} target="_blank" rel="noreferrer">
              Everything else on GitHub
            </a>
          </p>
        </section>

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
                Python &middot; TypeScript / JavaScript &middot; C / C++ &middot;
                Java &middot; Rust &middot; SQL
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
                &middot; Linear Algebra &middot; Probability &middot; Statistics
                &middot; Software Engineering
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
            Built with React, Vite, and TypeScript. The gecko is hand-rolled SVG
            &mdash; an inverse-kinematics spine with foot planting, no animation
            library. This site doubles as a sandbox, so expect it to keep
            changing.
          </p>
        </footer>
      </div>
    </>
  );
}
