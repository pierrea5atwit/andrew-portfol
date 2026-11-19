import { useMemo, useState } from "react";
import {
  RESUME,
  RESUME_KINDS,
  type ResumeEntry,
  type ResumeKind,
} from "./data";

type Filter = ResumeKind | "all";

function Entry({ e, showKind }: { e: ResumeEntry; showKind: boolean }) {
  return (
    <li className="entry">
      <div className="entry__head">
        <h3>
          {e.title}
          {e.org && (
            <>
              {" "}
              <span className="at">&middot;</span>{" "}
              <span className="entry__org">{e.org}</span>
            </>
          )}
        </h3>
        {(e.when || e.where) && (
          <p className="entry__meta">
            {e.when}
            {e.when && e.where && <span className="at"> &middot; </span>}
            {e.where}
          </p>
        )}
      </div>

      {/* Only worth showing while the list is mixed. */}
      {showKind && <span className="pill entry__kind">{e.kind}</span>}

      {e.points && (
        <ul className="entry__points">
          {e.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}

      {e.tags && (
        <ul className="entry__tags">
          {e.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}

      {(e.repo || e.live || e.note) && (
        <div className="entry__links">
          {e.repo && (
            <a href={e.repo} target="_blank" rel="noreferrer">
              Code
            </a>
          )}
          {e.live && (
            <a href={e.live} target="_blank" rel="noreferrer">
              Live
            </a>
          )}
          {!e.repo && !e.live && e.note && (
            <span className="card__note">{e.note}</span>
          )}
        </div>
      )}
    </li>
  );
}

export default function Resume() {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: RESUME.length };
    for (const e of RESUME) c[e.kind] = (c[e.kind] ?? 0) + 1;
    return c;
  }, []);

  const shown = useMemo(
    () => (filter === "all" ? RESUME : RESUME.filter((e) => e.kind === filter)),
    [filter]
  );

  return (
    <section aria-labelledby="resume">
      <div className="resume__head">
        <h2 id="resume">resume</h2>
      </div>

      {/* Buttons, not links: this filters in place and changes no address. */}
      <div className="filters" role="group" aria-label="Filter resume by section">
        {[{ id: "all" as const, label: "all" }, ...RESUME_KINDS].map((k) => (
          <button
            key={k.id}
            type="button"
            className="filter"
            aria-pressed={filter === k.id}
            onClick={() => setFilter(k.id)}
          >
            {k.label}
            <span className="filter__count">{counts[k.id] ?? 0}</span>
          </button>
        ))}
      </div>

      <ol className="entries" aria-label="Resume entries">
        {shown.map((e) => (
          <Entry key={e.kind + e.title} e={e} showKind={filter === "all"} />
        ))}
      </ol>
    </section>
  );
}
