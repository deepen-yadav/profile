import { profile } from '../data';
import { exportCv } from '../cv';
import { photoUrl } from './Hero';

const NAV = [
  ['projects', 'Projects'],
  ['career', 'Career'],
  ['education', 'Education'],
  ['expertise', 'Expertise'],
] as const;

export default function SiteHeader() {
  function handleExport() {
    // open the tab synchronously, in the click handler, so the browser doesn't
    // treat it as a pop-up once the PDF finishes building after an `await`
    const tab = window.open('', '_blank');
    exportCv(tab, photoUrl);
  }

  return (
    <header className="topbar">
      <a href="#top" className="brand">
        <span className="brand-mark">DY</span>
        <span className="brand-text">
          {profile.name}
          <small>{profile.title}</small>
        </span>
      </a>
      <nav>
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`}>
            {label}
          </a>
        ))}
      </nav>
      <button className="btn" onClick={handleExport}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v11m0 0-4-4m4 4 4-4M5 17v3h14v-3" />
        </svg>
        Download CV
      </button>
    </header>
  );
}
