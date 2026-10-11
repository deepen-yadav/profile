# Profile Page

Personal profile page for Deepen Yadav, Executive Engineer at the Ajmer Development Authority, — a coder-style interactive profile built with Vite + React + TypeScript, deployed via GitHub Pages.

Styled like an engineering drawing: drafting paper in light mode and a blueprint in dark mode. Projects are shown as drawing sheets with status stamps, career history as a survey-style timeline, and the footer as a drawing title block. A **Download CV** button builds a PDF CV in the browser.

## Local development

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

Repo: `https://github.com/deepen-yadav/profile` → live at `https://deepen-yadav.github.io/profile/`.

1. Push:
   ```bash
   git push -u origin main
   ```
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and deploys on every push to `main`.

> `base` in `vite.config.js` is set to `'/profile/'` to match the repo name. If you rename the repo, update it.

## Editing content

All page content lives in `src/data.ts` (profile, projects, experience, education, and expertise). Types are in `src/types.ts`. The portrait is `public/profile.jpg`.

## Structure

```
src/
├── main.tsx              # entry point
├── App.tsx               # page layout
├── data.ts               # all page content (edit here)
├── types.ts              # shared interfaces
├── cv.ts                 # PDF CV generator (jsPDF)
├── index.css             # drafting-paper / blueprint theme
├── hooks/
│   ├── useReveal.ts      # IntersectionObserver scroll reveal
│   └── useScroll.ts
└── components/
    ├── SiteHeader.tsx    # sticky top bar, nav, CV download
    ├── Hero.tsx          # name, role, photo, key figures
    ├── Sections.tsx      # projects, career, education, expertise
    ├── TitleBlock.tsx    # drawing title-block footer
    ├── Reveal.tsx
    ├── ScrollProgress.tsx
    └── BackToTop.tsx
```
