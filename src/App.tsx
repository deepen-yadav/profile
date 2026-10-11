import SiteHeader from './components/SiteHeader';
import Hero from './components/Hero';
import { Projects, Career, Education, Expertise } from './components/Sections';
import TitleBlock from './components/TitleBlock';
import Reveal from './components/Reveal';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';

export default function App() {
  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      <main className="page">
        <Hero />
        <Reveal>
          <Projects />
        </Reveal>
        <Reveal>
          <Career />
        </Reveal>
        <Reveal>
          <Education />
        </Reveal>
        <Reveal>
          <Expertise />
        </Reveal>
        <TitleBlock />
      </main>
      <BackToTop />
    </>
  );
}
