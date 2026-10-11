import type { ReactNode } from 'react';
import { profile, projects, experience, education, skills, skillTags } from '../data';
import type { SkillTag } from '../types';

interface SectionProps {
  id: string;
  no: string;
  title: string;
  note?: string;
  children: ReactNode;
}

/** Section with a drawing-style callout heading: numbered bubble, title, sheet note. */
function Section({ id, no, title, note, children }: SectionProps) {
  return (
    <section className="section" id={id}>
      <header className="section-head">
        <span className="bubble">{no}</span>
        <h2>{title}</h2>
        <span className="rule" />
        {note && <span className="section-note">{note}</span>}
      </header>
      {children}
    </section>
  );
}

export function Projects() {
  return (
    <Section id="projects" no="01" title="Key Projects" note="Ajmer Development Authority · 2019 – present">
      <p className="section-lead">
        On joining ADA in 2019, Deepen was given charge of all its time-barred projects. These are four of them.
      </p>
      <div className="sheets">
        {projects.map((p) => (
          <article key={p.code} className="sheet">
            <header className="sheet-head">
              <span className="sheet-code">{p.code}</span>
              <span className="sheet-cat">{p.category}</span>
            </header>
            <h3>{p.name}</h3>
            <p className="sheet-summary">{p.summary}</p>
            <ol className="sheet-actions">
              {p.actions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
            <span className={`stamp stamp-${p.status}`}>{p.statusLabel}</span>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function Career() {
  return (
    <Section id="career" no="02" title="Career" note={`Govt. of Rajasthan · since ${profile.serviceSince}`}>
      <ol className="timeline">
        {experience.map((e) => (
          <li key={e.period} className="station">
            <span className="station-period">{e.period}</span>
            <span className="station-node" aria-hidden="true" />
            <div className="station-body">
              <h3>{e.role}</h3>
              <p className="station-org">
                {e.org} · {e.place}
              </p>
              <p>{e.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Education() {
  return (
    <Section id="education" no="03" title="Education">
      <div className="edu">
        {education.map((e) => (
          <article key={e.degree} className="edu-card">
            <p className="edu-degree">{e.degree}</p>
            <h3>{e.field}</h3>
            <p className="edu-school">
              {e.school}
              {e.period && ` · ${e.period}`}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function Expertise() {
  return (
    <Section id="expertise" no="04" title="Expertise">
      <div className="expertise">
        {(Object.keys(skillTags) as SkillTag[]).map((tag) => (
          <div key={tag} className="expertise-group">
            <h3>{skillTags[tag]}</h3>
            <ul className="tags">
              {skills
                .filter((s) => s.tag === tag)
                .map((s) => (
                  <li key={s.name}>{s.name}</li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
