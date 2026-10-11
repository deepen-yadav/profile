import { useScroll } from '../hooks/useScroll';

/** Floating back-to-top button that appears once you scroll down. */
export default function BackToTop() {
  const { y } = useScroll();
  if (y < 240) return null;

  return (
    <button
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="back to top"
    >
      ↑ Top
    </button>
  );
}
