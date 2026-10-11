import { jsPDF } from 'jspdf';
import { profile, projects, skills, skillTags, experience, education, keyFigures } from './data';
import type { SkillTag, Project } from './types';

// A4 laid out like an engineering drawing sheet: double border frame with zone
// markers, faint grid, and a title block along the bottom of every page.
const PAGE_W = 210;
const PAGE_H = 297;
const OUTER = 7; // outer frame offset from paper edge
const INNER = 10; // inner (heavy) frame offset
const TB_H = 15; // title block height
const X = 18; // content left edge
const W = PAGE_W - X * 2; // content width
const TOP = 20; // content top on continuation pages
const BOTTOM = PAGE_H - INNER - TB_H - 6; // content must end above this

type RGB = [number, number, number];

// same palette as the site's light (drafting paper) theme in index.css
const INK: RGB = [27, 39, 51];
const INK_SOFT: RGB = [59, 72, 86];
const MUTED: RGB = [102, 112, 123];
const LINE: RGB = [203, 196, 181];
const LINE_STRONG: RGB = [142, 135, 122];
const GRID: RGB = [238, 235, 228];
const SHEET: RGB = [251, 250, 246];
const ACCENT: RGB = [196, 81, 31];
const DONE: RGB = [46, 122, 76];

interface Photo {
  dataUrl: string;
  format: 'JPEG' | 'PNG';
  width: number;
  height: number;
}

async function loadPhoto(url: string): Promise<Photo | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = dataUrl;
    });
    const format = blob.type.includes('png') ? 'PNG' : 'JPEG';
    return { dataUrl, format, width, height };
  } catch {
    return null;
  }
}

/**
 * jsPDF's standard Helvetica font silently drops characters outside its
 * built-in encoding (em/en dashes, curly quotes) instead of rendering them —
 * the glyph just vanishes while width calculations still account for it,
 * throwing off wrapping. Swap them for plain ASCII before anything is measured
 * or drawn.
 */
function pdfSafe(text: string): string {
  return text
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"');
}

function makeDoc(photo: Photo | null) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const rawText = doc.text.bind(doc);
  doc.text = ((text: string | string[], x: number, y: number, options?: unknown, transform?: unknown) =>
    rawText(
      Array.isArray(text) ? text.map(pdfSafe) : pdfSafe(text),
      x,
      y,
      options as never,
      transform as never
    )) as typeof doc.text;

  const rawSplit = doc.splitTextToSize.bind(doc);
  doc.splitTextToSize = ((text: string, maxWidth: number, options?: unknown) =>
    rawSplit(pdfSafe(text), maxWidth, options as never)) as typeof doc.splitTextToSize;

  const rawLink = doc.textWithLink.bind(doc);
  doc.textWithLink = ((text: string, x: number, y: number, options: unknown) =>
    rawLink(pdfSafe(text), x, y, options as never)) as typeof doc.textWithLink;

  const rawWidth = doc.getTextWidth.bind(doc);
  doc.getTextWidth = ((text: string) => rawWidth(pdfSafe(text))) as typeof doc.getTextWidth;

  let y = TOP;

  // ---------- text helpers ----------

  function font(style: 'normal' | 'bold' | 'italic', size: number, color: RGB, family = 'helvetica') {
    doc.setFont(family, style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  }

  /** small letter-spaced uppercase label, the annotation type on the sheet */
  function label(text: string, x: number, ty: number, size: number, color: RGB, align: 'left' | 'right' | 'center' = 'left') {
    const t = text.toUpperCase();
    const cs = size * 0.025;
    font('normal', size, color);
    const w = doc.getTextWidth(t) + cs * (t.length - 1);
    const lx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
    doc.text(t, lx, ty, { charSpace: cs });
    return w;
  }

  function wrap(text: string, width: number, size: number, style: 'normal' | 'bold' | 'italic' = 'normal') {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    return doc.splitTextToSize(text, width) as string[];
  }

  /** shrinks font size until text fits maxWidth */
  function fitSize(text: string, maxWidth: number, start: number, min = 5) {
    let size = start;
    doc.setFontSize(size);
    while (doc.getTextWidth(text) > maxWidth && size > min) {
      size -= 0.25;
      doc.setFontSize(size);
    }
    return size;
  }

  // ---------- sheet furniture ----------

  function paintSheet() {
    // faint 5 mm grid inside the frame
    doc.setDrawColor(...GRID);
    doc.setLineWidth(0.1);
    for (let gx = INNER + 5; gx < PAGE_W - INNER; gx += 5) doc.line(gx, INNER, gx, PAGE_H - INNER);
    for (let gy = INNER + 5; gy < PAGE_H - INNER; gy += 5) doc.line(INNER, gy, PAGE_W - INNER, gy);

    doc.setDrawColor(...INK);
    doc.setLineWidth(0.2);
    doc.rect(OUTER, OUTER, PAGE_W - OUTER * 2, PAGE_H - OUTER * 2);
    doc.setLineWidth(0.6);
    doc.rect(INNER, INNER, PAGE_W - INNER * 2, PAGE_H - INNER * 2);

    // zone markers between the frames: numbers across, letters down
    const cols = 4;
    const rows = 6;
    const zw = (PAGE_W - INNER * 2) / cols;
    const zh = (PAGE_H - INNER * 2) / rows;
    doc.setLineWidth(0.2);
    for (let i = 0; i < cols; i++) {
      const cx = INNER + zw * (i + 0.5);
      label(String(i + 1), cx, OUTER + 2.3, 5.5, MUTED, 'center');
      label(String(i + 1), cx, PAGE_H - OUTER - 0.9, 5.5, MUTED, 'center');
      if (i) {
        doc.line(INNER + zw * i, OUTER, INNER + zw * i, INNER);
        doc.line(INNER + zw * i, PAGE_H - INNER, INNER + zw * i, PAGE_H - OUTER);
      }
    }
    for (let i = 0; i < rows; i++) {
      const cy = INNER + zh * (i + 0.5) + 0.8;
      const letter = String.fromCharCode(65 + i);
      label(letter, OUTER + 1.5, cy, 5.5, MUTED, 'center');
      label(letter, PAGE_W - OUTER - 1.5, cy, 5.5, MUTED, 'center');
      if (i) {
        doc.line(OUTER, INNER + zh * i, INNER, INNER + zh * i);
        doc.line(PAGE_W - INNER, INNER + zh * i, PAGE_W - OUTER, INNER + zh * i);
      }
    }
  }

  function titleBlock(page: number, total: number) {
    const top = PAGE_H - INNER - TB_H;
    const left = INNER;
    const width = PAGE_W - INNER * 2;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const cells: [string, string, number][] = [
      ['Drawing title', 'CURRICULUM VITAE', 48],
      ['Name', profile.name, 28],
      ['Designation', profile.title, 30],
      ['Office', profile.org, 42],
      ['Rev. date', today, 22],
      ['Sheet', `${page} of ${total}`, width - 48 - 28 - 30 - 42 - 22],
    ];

    doc.setFillColor(255, 255, 255);
    doc.rect(left, top, width, TB_H, 'F');
    doc.setDrawColor(...INK);
    doc.setLineWidth(0.6);
    doc.line(left, top, left + width, top);

    let cx = left;
    cells.forEach(([k, v, cw], i) => {
      if (i) {
        doc.setLineWidth(0.2);
        doc.line(cx, top, cx, top + TB_H);
      }
      label(k, cx + 2.5, top + 4.2, 5, MUTED);
      if (i === 0) {
        font('bold', 12, INK);
        doc.text(v, cx + 2.5, top + 11.5);
      } else {
        doc.setFont('helvetica', 'normal');
        fitSize(v, cw - 5, 8);
        doc.setTextColor(...INK);
        doc.text(v, cx + 2.5, top + 10.5);
      }
      cx += cw;
    });
  }

  function newPage() {
    doc.addPage();
    paintSheet();
    y = TOP;
  }

  /** section currently being laid out, so a continuation sheet can say where it picks up */
  let currentSection = '';

  /** start a new sheet unless `h` mm of content still fits on this one */
  function ensureSpace(h: number) {
    if (y + h <= BOTTOM) return;
    newPage();
    if (currentSection) {
      label(`${String(sectionNo).padStart(2, '0')}  ${currentSection} (contd.)`, X, y, 6.5, MUTED);
      y += 6;
    }
  }

  // ---------- section heading: numbered callout bubble + rule ----------

  const HEADING_H = 13;
  let sectionNo = 0;

  /** `keepWith` is the height of the first block that follows — the heading never ends a page alone */
  function heading(title: string, note: string | undefined, keepWith: number) {
    currentSection = '';
    ensureSpace(HEADING_H + keepWith);
    sectionNo += 1;
    currentSection = title;
    const cy = y + 4.5;
    doc.setDrawColor(...INK);
    doc.setLineWidth(0.45);
    doc.setFillColor(255, 255, 255);
    doc.circle(X + 4.5, cy, 4.5, 'FD');
    label(String(sectionNo).padStart(2, '0'), X + 4.5, cy + 1.1, 7, INK, 'center');

    font('bold', 13, INK);
    const t = title.toUpperCase();
    doc.text(t, X + 12, cy + 1.7);
    const tEnd = X + 12 + doc.getTextWidth(t) + 3;

    let lineEnd = X + W;
    if (note) {
      const nw = label(note, X + W, cy + 0.9, 5.8, MUTED, 'right');
      lineEnd = X + W - nw - 3;
    }
    doc.setDrawColor(...INK);
    doc.setLineWidth(0.35);
    doc.line(tEnd, cy, lineEnd, cy);
    doc.line(lineEnd, cy - 1.2, lineEnd, cy + 1.2);
    y += HEADING_H;
  }

  // ================= page 1 header =================
  paintSheet();
  y = 18;

  const PHOTO_W = 36;
  const PHOTO_H = PHOTO_W * 1.2;
  const textW = W - PHOTO_W - 10;

  doc.setFillColor(...ACCENT);
  doc.rect(X, y + 1.2, 7, 0.8, 'F');
  label('Government of Rajasthan  /  Local Self Government Dept.', X + 9.5, y + 2.2, 6.3, MUTED);
  y += 13;

  font('bold', 30, INK);
  doc.text(profile.name.toUpperCase(), X, y);
  y += 8;

  font('normal', 12.5, INK_SOFT);
  doc.text(profile.title, X, y);
  let rx = X + doc.getTextWidth(profile.title) + 2.5;
  font('bold', 12.5, ACCENT);
  doc.text('/', rx, y);
  rx += doc.getTextWidth('/') + 2.5;
  font('normal', 12.5, INK_SOFT);
  doc.text(profile.org, rx, y);
  y += 7;

  const tagLines = wrap(profile.tagline, textW - 5, 9.3);
  doc.setDrawColor(...LINE_STRONG);
  doc.setLineWidth(0.8);
  doc.line(X + 0.4, y - 3, X + 0.4, y - 3 + tagLines.length * 4.4 + 0.6);
  font('normal', 9.3, INK_SOFT);
  doc.text(tagLines, X + 4, y);
  y += tagLines.length * 4.4 + 3.5;

  // location + portfolio link
  doc.setFillColor(...ACCENT);
  doc.circle(X + 1, y - 1.4, 0.9, 'F');
  doc.triangle(X + 0.2, y - 1, X + 1.8, y - 1, X + 1, y + 0.4, 'F');
  const locW = label(profile.location, X + 3.5, y, 6.8, MUTED);
  const linkX = X + 3.5 + locW + 6;
  label('Web', linkX, y, 6.8, MUTED);
  font('normal', 7, ACCENT);
  doc.textWithLink(profile.url.replace('https://', ''), linkX + 7, y, { url: profile.url });

  // photo as "FIG. 1", with crop marks
  const px = X + W - PHOTO_W;
  const py = 20;
  doc.setFillColor(...SHEET);
  doc.setDrawColor(...LINE_STRONG);
  doc.setLineWidth(0.25);
  doc.rect(px - 2, py - 2, PHOTO_W + 4, PHOTO_H + 4, 'FD');
  if (photo) {
    const scale = Math.max(PHOTO_W / photo.width, PHOTO_H / photo.height);
    const iw = photo.width * scale;
    const ih = photo.height * scale;
    doc.saveGraphicsState();
    doc.rect(px, py, PHOTO_W, PHOTO_H, null);
    doc.clip();
    doc.discardPath();
    doc.addImage(photo.dataUrl, photo.format, px + (PHOTO_W - iw) / 2, py + (PHOTO_H - ih) / 2, iw, ih, undefined, 'FAST');
    doc.restoreGraphicsState();
  }
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.5);
  const m = 4;
  const [l, r, t, b] = [px - 3.5, px + PHOTO_W + 3.5, py - 3.5, py + PHOTO_H + 3.5];
  doc.line(l, t, l + m, t); doc.line(l, t, l, t + m);
  doc.line(r, t, r - m, t); doc.line(r, t, r, t + m);
  doc.line(l, b, l + m, b); doc.line(l, b, l, b - m);
  doc.line(r, b, r - m, b); doc.line(r, b, r, b - m);
  const capY = py + PHOTO_H + 8;
  const figW = label('Fig. 1', px - 2, capY, 5.8, ACCENT);
  label(profile.name, px - 2 + figW + 2, capY, 5.8, MUTED);

  y = Math.max(y + 9, capY + 6);

  // key figures strip
  const FIG_H = 21;
  const figCellW = W / keyFigures.length;
  doc.setFillColor(...SHEET);
  doc.setDrawColor(...LINE_STRONG);
  doc.setLineWidth(0.3);
  doc.rect(X, y, W, FIG_H, 'FD');
  keyFigures.forEach((f, i) => {
    const fx = X + figCellW * i;
    if (i) {
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.2);
      doc.line(fx, y + 2, fx, y + FIG_H - 2);
    }
    font('bold', 17, INK);
    doc.text(f.value, fx + 4, y + 8.5);
    if (f.unit) label(f.unit, fx + 4 + doc.getTextWidth(f.value) + 1.2, y + 8.5, 7, ACCENT);
    const lines = wrap(f.label, figCellW - 8, 7);
    font('normal', 7, MUTED);
    doc.text(lines, fx + 4, y + 13.2);
  });
  y += FIG_H + 8;

  // ================= experience: survey-station timeline =================
  const PERIOD_W = 26;
  const NODE_X = X + PERIOD_W + 5;
  const BODY_X = NODE_X + 6;
  const BODY_W = X + W - BODY_X;

  function measureStation(e: (typeof experience)[number]) {
    const org = wrap(`${e.org} / ${e.place}`.toUpperCase(), BODY_W, 6.6);
    const detail = wrap(e.detail, BODY_W, 9);
    return { org, detail, h: 5.2 + org.length * 3.3 + 1.2 + detail.length * 4.2 + 4.5 };
  }

  function diamond(cx: number, cy: number, d: number, filled: boolean) {
    doc.setLineWidth(0.4);
    doc.setDrawColor(...(filled ? ACCENT : INK));
    doc.setFillColor(...(filled ? ACCENT : ([255, 255, 255] as RGB)));
    doc.lines([[d, d], [-d, d], [-d, -d], [d, -d]], cx, cy - d, [1, 1], 'FD', true);
  }

  heading('Career', `Govt. of Rajasthan / since ${profile.serviceSince}`, measureStation(experience[0]).h);
  experience.forEach((e, i) => {
    const { org, detail, h } = measureStation(e);
    ensureSpace(h);
    const top = y;
    label(e.period, NODE_X - 5, top + 0.2, 6.6, MUTED, 'right');
    if (i < experience.length - 1) {
      doc.setDrawColor(...LINE_STRONG);
      doc.setLineWidth(0.3);
      doc.setLineDashPattern([0.9, 0.9], 0);
      doc.line(NODE_X, top + 1.5, NODE_X, top + h - 1);
      doc.setLineDashPattern([], 0);
    }
    diamond(NODE_X, top - 1.2, 1.8, i === 0);

    font('bold', 11, INK);
    doc.text(e.role, BODY_X, top);
    let by = top + 4.6;
    org.forEach((line) => {
      label(line, BODY_X, by, 6.6, ACCENT);
      by += 3.3;
    });
    by += 1.2;
    font('normal', 9, INK_SOFT);
    doc.text(detail, BODY_X, by);
    y = top + h;
  });

  // ================= projects: drawing-sheet cards, two per row =================
  const GAP = 5;
  const CARD_W = (W - GAP) / 2;
  const PAD = 4.5;

  function measureCard(p: Project) {
    const name = wrap(p.name, CARD_W - PAD * 2, 11.5, 'bold');
    const summary = wrap(p.summary, CARD_W - PAD * 2, 7.8);
    const actions = p.actions.map((a) => wrap(a, CARD_W - PAD * 2 - 7, 8.6));
    const actionsH = actions.reduce((sum, a) => sum + a.length * 3.9 + 2.4, 0);
    return { name, summary, actions, h: PAD + 7 + name.length * 5 + summary.length * 3.5 + 3 + actionsH + PAD - 1 };
  }

  /** small rubber stamp, tilted a few degrees */
  function stamp(text: string, rx: number, cy: number, color: RGB) {
    const t = text.toUpperCase();
    const size = 5.8;
    font('bold', size, color);
    const cs = size * 0.025;
    const tw = doc.getTextWidth(t) + cs * (t.length - 1);
    const bw = tw + 4;
    const bh = 4.6;
    const ang = (-4 * Math.PI) / 180;
    const cx = rx - bw / 2;
    const corner = (dx: number, dy: number): [number, number] => [
      cx + dx * Math.cos(ang) - dy * Math.sin(ang),
      cy + dx * Math.sin(ang) + dy * Math.cos(ang),
    ];
    const pts = [corner(-bw / 2, -bh / 2), corner(bw / 2, -bh / 2), corner(bw / 2, bh / 2), corner(-bw / 2, bh / 2)];
    doc.setDrawColor(...color);
    doc.setLineWidth(0.45);
    const deltas = pts.slice(1).map((pt, i) => [pt[0] - pts[i][0], pt[1] - pts[i][1]]);
    doc.lines(deltas, pts[0][0], pts[0][1], [1, 1], 'S', true);
    const [sx, sy] = corner(-tw / 2, 0.75);
    doc.text(t, sx, sy, { angle: 4, charSpace: cs });
  }

  function card(p: Project, cx: number, top: number, h: number) {
    const { name, summary, actions } = measureCard(p);
    doc.setFillColor(...SHEET);
    doc.setDrawColor(...LINE_STRONG);
    doc.setLineWidth(0.3);
    doc.rect(cx, top, CARD_W, h, 'FD');
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.15);
    doc.rect(cx + 1.2, top + 1.2, CARD_W - 2.4, h - 2.4);

    let cy = top + PAD + 1.6;
    label(p.code, cx + PAD, cy, 6.5, ACCENT);
    label(p.category, cx + PAD + 11, cy, 6.2, MUTED);
    stamp(p.statusLabel, cx + CARD_W - PAD, cy - 1, p.status === 'done' ? DONE : ACCENT);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([0.8, 0.8], 0);
    doc.line(cx + PAD, cy + 2.2, cx + CARD_W - PAD, cy + 2.2);
    doc.setLineDashPattern([], 0);
    cy += 7.6;

    font('bold', 11.5, INK);
    doc.text(name, cx + PAD, cy);
    cy += name.length * 5 - 0.6;
    font('normal', 7.8, MUTED);
    doc.text(summary, cx + PAD, cy);
    cy += summary.length * 3.5 + 3;

    actions.forEach((lines, i) => {
      if (i) {
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.15);
        doc.line(cx + PAD, cy - 3.6, cx + CARD_W - PAD, cy - 3.6);
      }
      label(String(i + 1).padStart(2, '0'), cx + PAD, cy, 6, ACCENT);
      font('normal', 8.6, INK);
      doc.text(lines, cx + PAD + 7, cy);
      cy += lines.length * 3.9 + 2.4;
    });
  }

  const rows: Project[][] = [];
  for (let i = 0; i < projects.length; i += 2) rows.push(projects.slice(i, i + 2));
  const rowH = (row: Project[]) => Math.max(...row.map((p) => measureCard(p).h));

  heading('Key Projects', 'Ajmer Development Authority / 2019 - present', rowH(rows[0]));
  rows.forEach((row) => {
    const h = rowH(row);
    ensureSpace(h);
    row.forEach((p, i) => card(p, X + i * (CARD_W + GAP), y, h));
    y += h + GAP;
  });
  y += 3;

  // ================= education: two cards =================
  function measureEdu(e: (typeof education)[number]) {
    const field = wrap(e.field, CARD_W - PAD * 2, 11, 'bold');
    const school = wrap(e.school + (e.period ? ` / ${e.period}` : ''), CARD_W - PAD * 2, 8.4);
    return { field, school, h: 6.5 + 4.5 + field.length * 4.8 + school.length * 3.8 + 3 };
  }
  const eduH = Math.max(...education.map((e) => measureEdu(e).h));

  heading('Education', undefined, eduH);
  for (let i = 0; i < education.length; i += 2) {
    ensureSpace(eduH);
    education.slice(i, i + 2).forEach((e, col) => {
      const { field, school } = measureEdu(e);
      const cx = X + col * (CARD_W + GAP);
      doc.setFillColor(...SHEET);
      doc.setDrawColor(...LINE_STRONG);
      doc.setLineWidth(0.3);
      doc.rect(cx, y, CARD_W, eduH, 'FD');
      doc.setFillColor(...INK);
      doc.rect(cx, y, CARD_W, 1.1, 'F');
      let cy = y + 6.5;
      label(e.degree, cx + PAD, cy, 6.6, ACCENT);
      cy += 5;
      font('bold', 11, INK);
      doc.text(field, cx + PAD, cy);
      cy += field.length * 4.8;
      font('normal', 8.4, MUTED);
      doc.text(school, cx + PAD, cy);
    });
    y += eduH + GAP;
  }
  y += 3;

  // ================= expertise: tag boxes in two columns =================
  const TAG_H = 6;
  const tagGroups = (Object.keys(skillTags) as SkillTag[]).map((tag) => ({
    title: skillTags[tag],
    names: skills.filter((s) => s.tag === tag).map((s) => s.name),
  }));

  /** lays out tags left-to-right, wrapping within `width`; returns positions and total height */
  function flowTags(names: string[], width: number) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    let tx = 0;
    let row = 0;
    const placed = names.map((n) => {
      const tw = doc.getTextWidth(n) + 5;
      if (tx && tx + tw > width) {
        tx = 0;
        row += 1;
      }
      const pos = { n, x: tx, row, w: tw };
      tx += tw + 2;
      return pos;
    });
    return { placed, h: 6 + (row + 1) * (TAG_H + 2) };
  }

  const flows = tagGroups.map((g) => flowTags(g.names, CARD_W));
  const expH = Math.max(...flows.map((f) => f.h));

  heading('Expertise', undefined, expH);
  ensureSpace(expH);
  tagGroups.forEach((g, col) => {
    const cx = X + col * (CARD_W + GAP);
    font('bold', 8.5, INK_SOFT);
    doc.text(g.title.toUpperCase(), cx, y + 2);
    flows[col].placed.forEach((tg) => {
      const ty = y + 5 + tg.row * (TAG_H + 2);
      doc.setFillColor(...SHEET);
      doc.setDrawColor(...LINE_STRONG);
      doc.setLineWidth(0.25);
      doc.rect(cx + tg.x, ty, tg.w, TAG_H, 'FD');
      font('normal', 8, INK);
      doc.text(tg.n, cx + tg.x + 2.5, ty + 4.1);
    });
  });
  y += expH;

  // title blocks last, once the sheet count is known
  const total = doc.getNumberOfPages();
  for (let pg = 1; pg <= total; pg++) {
    doc.setPage(pg);
    titleBlock(pg, total);
  }

  return doc;
}

/**
 * Builds the CV as a real PDF and opens it in a new tab (browser's native PDF viewer).
 *
 * `preOpenedWindow` should be a tab opened synchronously in the click handler
 * (e.g. `window.open('', '_blank')`) — building the PDF requires an `await`,
 * and opening the tab only after that would lose the user-gesture context and
 * get blocked as a pop-up. Passing an already-open tab sidesteps that.
 */
export async function exportCv(preOpenedWindow?: Window | null, photoUrl?: string): Promise<void> {
  const photo = photoUrl ? await loadPhoto(photoUrl) : null;
  const doc = makeDoc(photo);
  const filename = 'deepen-yadav-cv.pdf';
  doc.setProperties({ title: filename });
  // wrap the blob in a named File — browsers use this as the suggested
  // filename when the PDF viewer's own blob: URL would otherwise be nameless
  const file = new File([doc.output('blob')], filename, { type: 'application/pdf' });
  const url = URL.createObjectURL(file);
  if (preOpenedWindow) {
    preOpenedWindow.location.href = url;
  } else {
    window.open(url, '_blank');
  }
}
