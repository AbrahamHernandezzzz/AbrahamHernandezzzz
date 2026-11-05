// Builds the animated SVGs of the GitHub profile (assets/*.svg) in Starknot's visual language: the navy night,
// the logo's gold and cyan, Instrument Serif over a system sans, drawn stars. Everything is self-contained (the font
// and the mark are embedded as data URIs), because GitHub shows an SVG as an image and an image cannot load
// anything from outside. Motion is CSS only and stops under prefers-reduced-motion.
//
//   node tools/build-assets.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = (f) => path.join(root, "tools", "src", f);
const out = (f, svg) => {
  fs.writeFileSync(path.join(root, "assets", f), svg.replace(/\n\s*/g, "\n"));
  console.log(`${f}  ${(fs.statSync(path.join(root, "assets", f)).size / 1024).toFixed(1)} KB`);
};
const b64 = (f) => fs.readFileSync(src(f)).toString("base64");

const C = { abyss: "#00121d", midnight: "#011b2a", navy: "#002b42", gold: "#dcb872", goldSoft: "#ead3a3", cyan: "#9fbcc2", ivory: "#f4eee2" };
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const FONTS = `@font-face{font-family:IS;src:url(data:font/woff2;base64,${b64("instrument-serif-latin.woff2")}) format('woff2')}
@font-face{font-family:ISI;src:url(data:font/woff2;base64,${b64("instrument-serif-italic-latin.woff2")}) format('woff2')}`;
const MARK = `data:image/webp;base64,${b64("starknot-mark-256.webp")}`;

/** A deterministic sky: the same stars every build. */
function stars(seed, n, w, h, { minR = 0.5, maxR = 1.6 } = {}) {
  let x = seed;
  const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: n }, () => {
    const r = (minR + rnd() * (maxR - minR)).toFixed(2);
    return `<circle class="tw" cx="${Math.round(rnd() * w)}" cy="${Math.round(rnd() * h)}" r="${r}" style="animation-delay:${(rnd() * 4).toFixed(2)}s;animation-duration:${(3 + rnd() * 3).toFixed(2)}s"/>`;
  }).join("");
}

const BASE_CSS = `
.tw{fill:#f3e3bd;opacity:.25;animation:tw 4s ease-in-out infinite}
@keyframes tw{0%,100%{opacity:.12}50%{opacity:.9}}
.rise{opacity:0;animation:rise 1.1s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.sweep{animation:sweep 8s ease-in-out infinite}
@keyframes sweep{0%{transform:translateX(-500px)}55%,100%{transform:translateX(1800px)}}
.draw{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.6s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes draw{to{stroke-dashoffset:0}}`;
const REDUCED = (extra = "") => `@media (prefers-reduced-motion: reduce){.tw,.sweep,.spin,.spinr,.pulse,.meteor,.float,.glint${extra}{animation:none}.rise{animation:none;opacity:1}.draw{animation:none;stroke-dashoffset:0}}`;
const SHINE = `<linearGradient id="shine" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
const BG = (id = "bg") => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.abyss}"/><stop offset=".55" stop-color="${C.navy}"/><stop offset="1" stop-color="${C.midnight}"/></linearGradient>`;
const d = (s) => `style="animation-delay:${s}s"`;

// ------------------------------------------------------------------ experience strip
// The certification and three numbers under the hero, drawn like the metrics of the case card.
const XP_Y = 400, XP_H = 100, XP_CY = XP_Y + XP_H / 2;
const xml = (s) => s.replace(/&/g, "&amp;");
const XP = [
  { seal: ["Claude Certified", "Architect"] },
  { big: "2+", es: ["años en el espacio", "de la IA"], en: ["years in the", "AI space"] },
  { big: "1.5", es: ["años construyendo sistemas", "de turismo y logística"], en: ["years building tourism", "systems & logistics"] },
  { big: "15+", es: ["años de industria en el", "equipo que me acompaña"], en: ["years of industry in the", "team beside me"] },
];
const xpCol = (c, i) => {
  const x0 = 40 + i * 300;
  const delay = 1.7 + i * 0.2;
  if (c.seal) {
    return `<g class="rise" ${d(delay)}>
<circle cx="${x0 + 58}" cy="${XP_CY}" r="30" fill="${C.abyss}" fill-opacity=".55" stroke="${C.gold}" stroke-opacity=".45"/>
<path transform="translate(${x0 + 58} ${XP_CY}) scale(1.05) translate(-640 -20)" d="M640 8c.6 7 5 11.4 12 12-7 .6-11.4 5-12 12-.6-7-5-11.4-12-12 7-.6 11.4-5 12-12Z" fill="${C.gold}"/>
<text x="${x0 + 104}" y="${XP_CY - 4}" style="font-family:IS,Georgia,serif;font-size:27px;fill:${C.ivory}">${c.seal[0]}</text>
<text x="${x0 + 104}" y="${XP_CY + 26}" style="font-family:IS,Georgia,serif;font-size:27px;fill:${C.goldSoft}">${c.seal[1]}</text>
</g>`;
  }
  const lines = [...c.es.map((t) => [t, 0]), ...c.en.map((t) => [t, 1])];
  let y = 0;
  const rows = lines.map(([t, k], j) => {
    if (j) y += k === 0 ? 18 : lines[j - 1][1] === 0 ? 21 : 16;
    return [t, k, y];
  });
  const top = XP_CY - y / 2 + 5;
  return `<g class="rise" ${d(delay)}>
<text x="${x0 + 30}" y="${XP_CY + 18}" style="font-family:IS,Georgia,serif;font-size:52px;fill:${C.goldSoft}">${c.big}</text>
${rows.map(([t, k, yy]) => `<text x="${x0 + 108}" y="${(top + yy).toFixed(1)}" style="${k === 0 ? `font:400 14px ${SANS};fill:#e2e6ec;fill-opacity:.85` : `font:400 12px ${SANS};fill:#e2e6ec;fill-opacity:.52`}">${xml(t)}</text>`).join("\n")}
</g>`;
};
const XP_BAND = `<rect class="rise" x="40" y="${XP_Y}" width="1200" height="${XP_H}" rx="22" fill="#fff" fill-opacity=".035" stroke="#fff" stroke-opacity=".1" ${d(1.6)}/>
${[1, 2, 3].map((i) => `<path class="rise" d="M${40 + i * 300} ${XP_Y + 24} V ${XP_Y + XP_H - 24}" stroke="${C.gold}" stroke-opacity=".25" ${d(1.7)}/>`).join("\n")}
${XP.map(xpCol).join("\n")}`;

// ------------------------------------------------------------------ header
out(
  "header.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 530" width="1280" height="530" role="img" aria-label="Abraham Hernández, fundador y CEO de Starknot. Digital Architecture for Ambitious Businesses. Claude Certified Architect, más de 2 años en IA, 1.5 años construyendo sistemas de turismo y logística, con un equipo de más de 15 años en la industria.">
<title>Abraham Hernández — Founder &amp; CEO, Starknot</title>
<defs>
${BG()}
<radialGradient id="glow" cx="0.2" cy="0.396" r="0.36"><stop offset="0" stop-color="${C.gold}" stop-opacity=".22"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></radialGradient>
<radialGradient id="glow2" cx="0.86" cy="0.14" r="0.4"><stop offset="0" stop-color="#1f6c80" stop-opacity=".35"/><stop offset="1" stop-color="#1f6c80" stop-opacity="0"/></radialGradient>
<radialGradient id="disc" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="#0b3f4e"/><stop offset="1" stop-color="${C.abyss}"/></radialGradient>
<linearGradient id="meteor" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff4dc" stop-opacity=".9"/></linearGradient>
${SHINE}
<clipPath id="frame"><rect width="1280" height="530" rx="24"/></clipPath>
</defs>
<style>${FONTS}${BASE_CSS}
.spin{transform-origin:250px 210px;animation:spin 30s linear infinite}
.spinr{transform-origin:250px 210px;animation:spin 46s linear infinite reverse}
@keyframes spin{to{transform:rotate(360deg)}}
.pulse{transform-origin:250px 210px;animation:pulse 5s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.7;transform:scale(1.04)}}
.float{animation:float 7s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.meteor{opacity:0;animation:meteor 9s ease-in infinite 2s}
@keyframes meteor{0%{opacity:0;transform:translate(0,0)}4%{opacity:1}14%{opacity:0;transform:translate(-260px,130px)}100%{opacity:0;transform:translate(-260px,130px)}}
.eyebrow{font:600 14px ${SANS};letter-spacing:4px;fill:${C.gold}}
.name{font-family:IS,Georgia,serif;font-size:80px;fill:${C.ivory}}
.tag{font-family:ISI,Georgia,serif;font-style:italic;font-size:31px;fill:${C.goldSoft}}
.line{font:400 19px ${SANS};fill:#e2e6ec;fill-opacity:.7}
.small{font:500 14px ${SANS};letter-spacing:1.5px;fill:${C.cyan};fill-opacity:.85}
${REDUCED()}
</style>
<g clip-path="url(#frame)">
<rect width="1280" height="530" fill="url(#bg)"/>
<rect width="1280" height="530" fill="url(#glow)"/>
<rect width="1280" height="530" fill="url(#glow2)"/>
${stars(7, 90, 1280, 420)}<g transform="translate(0 420)">${stars(8, 22, 1280, 110)}</g>
<g class="meteor"><line x1="1160" y1="40" x2="1240" y2="0" stroke="url(#meteor)" stroke-width="1.6" stroke-linecap="round" transform="rotate(180 1200 20)"/></g>
<circle class="pulse" cx="250" cy="210" r="104" fill="none" stroke="${C.gold}" stroke-opacity=".28"/>
<g class="spin"><circle cx="250" cy="210" r="132" fill="none" stroke="${C.gold}" stroke-opacity=".4" stroke-width="1.2" stroke-dasharray="2 9"/><circle cx="382" cy="210" r="3.6" fill="${C.goldSoft}"/></g>
<g class="spinr"><circle cx="250" cy="210" r="168" fill="none" stroke="${C.cyan}" stroke-opacity=".18"/><circle cx="250" cy="42" r="2.6" fill="#cfe3f1" fill-opacity=".85"/></g>
<circle cx="250" cy="210" r="84" fill="url(#disc)" stroke="${C.gold}" stroke-opacity=".35"/>
<g class="float"><image href="${MARK}" x="182" y="142" width="136" height="136"/></g>
<text class="eyebrow rise" x="460" y="128" ${d(0.2)}>STARKNOT  ·  FUNDADOR Y CEO  ·  FOUNDER &amp; CEO</text>
<text class="name rise" x="456" y="206" ${d(0.45)}>Abraham Hernández</text>
<text class="tag rise" x="460" y="256" ${d(0.75)}>Arquitectura digital para negocios ambiciosos.</text>
<text class="line rise" x="460" y="296" ${d(1.05)}>Digital Architecture for Ambitious Businesses.</text>
<text class="small rise" x="460" y="338" ${d(1.3)}>COSTA RICA  ·  STARKNOT.CO</text>
<path class="draw" d="M460 358 H 760" stroke="${C.gold}" stroke-opacity=".6" stroke-width="1.2" pathLength="1" ${d(1.5)}/>
${XP_BAND}
<rect class="sweep" x="0" y="0" width="420" height="530" fill="url(#shine)"/>
</g>
<rect x=".5" y=".5" width="1279" height="529" rx="24" fill="none" stroke="#fff" stroke-opacity=".08"/>
</svg>`,
);

// ------------------------------------------------------------------ the four services
const GLYPH = {
  code: `<path d="M-8 -9 -17 0 -8 9M8 -9 17 0 8 9M4 -14 -4 14"/>`,
  route: `<path d="M-13 12c8 0 4-10 12-10s5-8 9-8" stroke-dasharray="2.5 3.5"/><circle cx="-13" cy="12" r="2.6" fill="currentColor" stroke="none"/><path d="M9 -16a5 5 0 0 1 5 5c0 3.6-5 8-5 8s-5-4.4-5-8a5 5 0 0 1 5-5z"/><circle cx="9" cy="-11" r="1.4" fill="currentColor" stroke="none"/>`,
  orbit: `<circle r="7"/><ellipse rx="17" ry="5.5" transform="rotate(-22)"/><circle cx="12" cy="-10" r="1.8" fill="currentColor" stroke="none"/>`,
  chip: `<rect x="-9" y="-9" width="18" height="18" rx="3.5"/><rect x="-3.5" y="-3.5" width="7" height="7" rx="1.2"/><path d="M-4 -15v6M4 -15v6M-4 9v6M4 9v6M-15 -4h6M-15 4h6M9 -4h6M9 4h6"/>`,
};
const SERVICES = [
  { n: "01", icon: "code", title: "Web Development", es: "Sitios a medida, sin plantillas, con rendimiento medido.", en: "Custom websites, no templates, measured performance.", url: "starknot.co/web" },
  { n: "02", icon: "route", title: "Tourism Systems & Logistics", es: "Reservas, flota, rutas y despacho en un solo sistema.", en: "Bookings, fleet, routes and dispatch in one system.", url: "starknot.co/turismo" },
  { n: "03", icon: "orbit", title: "Kepler by Starknot", es: "15 agentes de IA de marketing, en su propia computadora.", en: "15 AI marketing agents, on your own computer.", url: "starknot.co/kepler" },
  { n: "04", icon: "chip", title: "Consultoría en IA · AI Consulting", es: "Sesiones 1:1 para aprender a trabajar con IA.", en: "1:1 sessions to learn to work with AI.", url: "starknot.co/consultoria-ia" },
];
const card = (s, i) => {
  const x = i % 2 === 0 ? 40 : 660;
  const y = i < 2 ? 40 : 350;
  const delay = 0.2 + i * 0.25;
  return `<g class="rise" ${d(delay)}>
<rect x="${x}" y="${y}" width="580" height="280" rx="22" fill="#fff" fill-opacity=".035" stroke="#fff" stroke-opacity=".1"/>
<circle cx="${x + 64}" cy="${y + 68}" r="32" fill="${C.abyss}" fill-opacity=".55" stroke="${C.gold}" stroke-opacity=".45"/>
<g transform="translate(${x + 64} ${y + 68})" fill="none" stroke="${C.goldSoft}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" color="${C.goldSoft}"><g class="float">${GLYPH[s.icon]}</g></g>
<text x="${x + 540}" y="${y + 78}" text-anchor="end" style="font-family:ISI,Georgia,serif;font-style:italic;font-size:34px;fill:${C.gold}">${s.n}</text>
<text x="${x + 36}" y="${y + 148}" style="font-family:IS,Georgia,serif;font-size:${s.title.length > 26 ? 30 : 36}px;fill:${C.ivory}">${s.title.replace(/&/g, "&amp;")}</text>
<path class="draw" d="M${x + 36} ${y + 164} H ${x + 196}" stroke="${C.gold}" stroke-opacity=".6" stroke-width="1.2" pathLength="1" ${d(delay + 0.5)}/>
<text x="${x + 36}" y="${y + 200}" style="font:400 19px ${SANS};fill:#e2e6ec;fill-opacity:.85">${s.es}</text>
<text x="${x + 36}" y="${y + 228}" style="font:400 16px ${SANS};fill:#e2e6ec;fill-opacity:.52">${s.en}</text>
<text x="${x + 36}" y="${y + 256}" style="font:600 12px ${SANS};letter-spacing:1.8px;fill:${C.cyan};fill-opacity:.8">${s.url.toUpperCase()}  →</text>
</g>`;
};
out(
  "services.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 670" width="1280" height="670" role="img" aria-label="Cuatro servicios de Starknot: Web Development, Tourism Systems and Logistics, Kepler by Starknot y Consultoría en IA.">
<title>Starknot — four services</title>
<defs>${BG()}<radialGradient id="glow" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#1f6c80" stop-opacity=".22"/><stop offset="1" stop-color="#1f6c80" stop-opacity="0"/></radialGradient>${SHINE}<clipPath id="frame"><rect width="1280" height="670" rx="24"/></clipPath></defs>
<style>${FONTS}${BASE_CSS}
.float{animation:float 6s ease-in-out infinite}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}}
${REDUCED()}
</style>
<g clip-path="url(#frame)">
<rect width="1280" height="670" fill="url(#bg)"/><rect width="1280" height="670" fill="url(#glow)"/>
${stars(21, 70, 1280, 670, { maxR: 1.3 })}
${SERVICES.map(card).join("\n")}
<rect class="sweep" x="0" y="0" width="420" height="670" fill="url(#shine)"/>
</g>
<rect x=".5" y=".5" width="1279" height="669" rx="24" fill="none" stroke="#fff" stroke-opacity=".08"/>
</svg>`,
);

// ------------------------------------------------------------------ latest case
const metric = (x, big, es, en, delay, ring = false) => `<g class="rise" ${d(delay)}>
${ring ? `<circle cx="${x + 46}" cy="168" r="46" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="3"/><circle class="draw" cx="${x + 46}" cy="168" r="46" fill="none" stroke="${C.gold}" stroke-width="3" stroke-linecap="round" pathLength="1" transform="rotate(-90 ${x + 46} 168)" ${d(delay + 0.3)}/>` : ""}
<text x="${x + 46}" y="${ring ? 190 : 188}" text-anchor="middle" style="font-family:IS,Georgia,serif;font-size:${ring ? 56 : big.length > 2 ? 52 : 64}px;fill:${C.goldSoft}">${big}</text>
<text x="${x + 46}" y="246" text-anchor="middle" style="font:500 15px ${SANS};fill:#e2e6ec;fill-opacity:.82">${es}</text>
<text x="${x + 46}" y="268" text-anchor="middle" style="font:400 13px ${SANS};fill:#e2e6ec;fill-opacity:.5">${en}</text>
</g>`;
out(
  "case.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 330" width="1280" height="330" role="img" aria-label="Último caso: Green Road Travel Group, una plataforma de viajes de lujo construida en 19 semanas, con cinco motores de reserva, en línea desde octubre de 2026.">
<title>Latest case — Green Road Travel Group</title>
<defs>${BG()}<radialGradient id="glow" cx="0.82" cy="0.5" r="0.45"><stop offset="0" stop-color="${C.gold}" stop-opacity=".14"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></radialGradient>${SHINE}<clipPath id="frame"><rect width="1280" height="330" rx="24"/></clipPath></defs>
<style>${FONTS}${BASE_CSS}${REDUCED()}</style>
<g clip-path="url(#frame)">
<rect width="1280" height="330" fill="url(#bg)"/><rect width="1280" height="330" fill="url(#glow)"/>
${stars(33, 45, 1280, 330, { maxR: 1.2 })}
<text class="rise" x="60" y="92" style="animation-delay:.1s;font:600 13px ${SANS};letter-spacing:4px;fill:${C.gold}">ÚLTIMO CASO  ·  LATEST CASE</text>
<text class="rise" x="58" y="158" style="animation-delay:.3s;font-family:IS,Georgia,serif;font-size:54px;fill:${C.ivory}">Green Road Travel Group</text>
<text class="rise" x="60" y="200" style="animation-delay:.55s;font-family:ISI,Georgia,serif;font-style:italic;font-size:24px;fill:${C.goldSoft}">Plataforma de viajes de lujo · Luxury travel platform</text>
<text class="rise" x="60" y="252" style="animation-delay:.8s;font:600 12px ${SANS};letter-spacing:1.5px;fill:${C.cyan};fill-opacity:.8">STARKNOT.CO/CASOS/GREEN-ROAD  →</text>
${metric(760, "19", "semanas", "weeks to launch", 0.6, true)}
${metric(920, "5", "motores de reserva", "booking engines", 0.85)}
${metric(1090, "2026", "en línea desde octubre", "live since October", 1.1)}
<rect class="sweep" x="0" y="0" width="420" height="330" fill="url(#shine)"/>
</g>
<rect x=".5" y=".5" width="1279" height="329" rx="24" fill="none" stroke="#fff" stroke-opacity=".08"/>
</svg>`,
);

// ------------------------------------------------------------------ divider
out(
  "divider.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 40" width="1280" height="40" role="img" aria-label="">
<defs><linearGradient id="l" gradientUnits="userSpaceOnUse" x1="40" y1="0" x2="1240" y2="0"><stop offset="0" stop-color="${C.gold}" stop-opacity="0"/><stop offset=".5" stop-color="${C.gold}" stop-opacity=".75"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></linearGradient>
<radialGradient id="g"><stop offset="0" stop-color="#fff4dc"/><stop offset="1" stop-color="#fff4dc" stop-opacity="0"/></radialGradient></defs>
<style>.draw{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.8s cubic-bezier(.2,.7,.2,1) forwards}@keyframes draw{to{stroke-dashoffset:0}}
.glint{animation:glint 6s ease-in-out infinite}@keyframes glint{0%{transform:translateX(0);opacity:0}10%{opacity:1}60%{transform:translateX(1180px);opacity:0}100%{transform:translateX(1180px);opacity:0}}
.pulse{transform-origin:640px 20px;animation:pulse 4s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}
${REDUCED()}</style>
<path class="draw" d="M40 20 H 1240" stroke="url(#l)" stroke-width="1.2" pathLength="1"/>
<circle class="glint" cx="50" cy="20" r="6" fill="url(#g)"/>
<path class="pulse" d="M640 8c.6 7 5 11.4 12 12-7 .6-11.4 5-12 12-.6-7-5-11.4-12-12 7-.6 11.4-5 12-12Z" fill="${C.gold}"/>
</svg>`,
);

// ------------------------------------------------------------------ contact buttons
const ICON = {
  web: `<circle r="8.5"/><path d="M-8.5 0h17M0 -8.5c3 3 3 14 0 17M0 -8.5c-3 3-3 14 0 17"/>`,
  mail: `<rect x="-9" y="-6.5" width="18" height="13" rx="2.5"/><path d="m-8 -4.5 8 5.5 8-5.5"/>`,
  whatsapp: `<path d="M-6.8 7.6 -8.6 9l.6-3.3A8.5 8.5 0 1 1 -3 7.9z"/><path d="M-3.4 -3.4c.3-1 1.3-1.4 1.8-.6l.9 1.6c.2.5 0 1-.4 1.3-.5.4-.3 1 .1 1.6.8 1.1 1.7 1.9 2.8 2.5.5.3 1 .3 1.3-.2.3-.4.9-.6 1.3-.3l1.5 1c.7.6.3 1.6-.7 2-1.9.6-4.4-.5-6.5-2.6S-4 -1.6-3.4 -3.4Z"/>`,
  instagram: `<rect x="-8.5" y="-8.5" width="17" height="17" rx="5"/><circle r="4"/><circle cx="4.9" cy="-4.9" r=".7" fill="currentColor" stroke="none"/>`,
};
const button = (file, icon, label, w) =>
  out(
    file,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 52" width="${w}" height="52" role="img" aria-label="${label}">
<defs>${SHINE}<clipPath id="c"><rect width="${w}" height="52" rx="26"/></clipPath></defs>
<style>.sweep{animation:sweep 6s ease-in-out infinite}@keyframes sweep{0%{transform:translateX(-${w}px)}50%,100%{transform:translateX(${w * 2}px)}}${REDUCED()}</style>
<g clip-path="url(#c)"><rect width="${w}" height="52" fill="${C.navy}"/><rect class="sweep" width="${Math.round(w / 2)}" height="52" fill="url(#shine)"/></g>
<rect x=".75" y=".75" width="${w - 1.5}" height="50.5" rx="25.25" fill="none" stroke="${C.gold}" stroke-opacity=".55" stroke-width="1.2"/>
<g transform="translate(30 26)" fill="none" stroke="${C.goldSoft}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" color="${C.goldSoft}">${ICON[icon]}</g>
<text x="52" y="31.5" style="font:500 15px ${SANS};fill:${C.ivory}">${label}</text>
</svg>`,
  );
button("btn-web.svg", "web", "starknot.co", 168);
button("btn-email.svg", "mail", "contact@starknot.co", 236);
button("btn-whatsapp.svg", "whatsapp", "+506 7260 8885", 200);
button("btn-instagram.svg", "instagram", "@starknot.tech", 196);
