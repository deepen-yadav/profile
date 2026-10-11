import { profile } from '../data';

/** Footer laid out like the title block in the corner of an engineering drawing. */
export default function TitleBlock() {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const cells: [string, string][] = [
    ['Name', profile.name],
    ['Designation', profile.title],
    ['Office', profile.org],
    ['Location', profile.location],
  ];
  if (profile.email) cells.push(['Email', profile.email]);

  return (
    <footer className="titleblock">
      <div className="tb-main">
        <span className="tb-label">Drawing title</span>
        <span className="tb-title">Professional Profile</span>
      </div>
      {cells.map(([k, v]) => (
        <div key={k} className="tb-cell">
          <span className="tb-label">{k}</span>
          <span>{v}</span>
        </div>
      ))}
      <div className="tb-cell">
        <span className="tb-label">Rev. date</span>
        <span>{today}</span>
      </div>
      <div className="tb-cell">
        <span className="tb-label">Sheet</span>
        <span>1 of 1</span>
      </div>
    </footer>
  );
}
