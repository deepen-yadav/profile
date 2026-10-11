import { profile, keyFigures } from '../data';

export const photoUrl = `${import.meta.env.BASE_URL}profile.jpg`;

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-text">
        <p className="eyebrow">
          <span className="eyebrow-mark" /> Government of Rajasthan · Local Self Government Department
        </p>
        <h1>{profile.name}</h1>
        <p className="hero-role">
          {profile.title}
          <span className="sep">/</span>
          {profile.org}
        </p>
        <p className="hero-tagline">{profile.tagline}</p>
        <p className="hero-loc">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
          </svg>
          {profile.location}
        </p>
      </div>

      <figure className="hero-photo">
        <div className="photo-frame">
          <img src={photoUrl} alt={profile.name} width={420} height={504} />
          <span className="crop tl" />
          <span className="crop tr" />
          <span className="crop bl" />
          <span className="crop br" />
        </div>
        <figcaption>
          <span>FIG. 1</span> {profile.name}, {profile.title}
        </figcaption>
      </figure>

      <dl className="figures">
        {keyFigures.map((f) => (
          <div key={f.label} className="figure">
            <dt>
              {f.value}
              {f.unit && <small>{f.unit}</small>}
            </dt>
            <dd>{f.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
