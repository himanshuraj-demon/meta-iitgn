// Mechanical pass: swap hardcoded palette colors for daisyUI semantic tokens
// so the UI re-themes. Safe, repeated patterns only. Exclusions handled
// elsewhere: Mess menu, globals.css (color defs), constants.ts (per-category
// brand colors), HomeTab hero (whites sit over a photo).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const targets = [
  "src/app/wiki-client.tsx",
  "src/app/components/wiki/PendingChangesView.tsx",
  "src/app/components/wiki/RevisionsView.tsx",
  "src/app/wiki/page/[slug]/page.tsx",
  "src/app/wiki/[category]/[slug]/page.tsx",
  "src/app/components/home/overlays/HistoryOverlay.tsx",
  "src/app/components/home/overlays/PendingPagesOverlay.tsx",
  "src/app/components/home/overlays/PortalOverlay.tsx",
  "src/app/components/home/overlays/TriviaOverlay.tsx",
  "src/app/wiki/categories/page.tsx",
  "src/app/blog/page.tsx",
  "src/app/blog/[slug]/page.tsx",
  "src/app/not-found.tsx",
  "src/components/CategoryPage.tsx",
  "src/components/Sidebar.tsx",
  "src/components/BottomNavbar.tsx",
  "src/components/CategoryEditModal.tsx",
  "src/components/Navbar.tsx",
  "src/components/SettingsModal.tsx",
  "src/app/login/page.tsx",
  "src/app/logout/page.tsx",
];

// Ordered: exact strings first, then regexes.
const exact = [
  ["bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white", "bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-content"],
  ["bg-blue-600 hover:bg-blue-700 text-white", "bg-primary hover:bg-primary/90 text-primary-content"],
  ["bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-105", "bg-primary border-primary text-primary-content shadow-md shadow-primary/20 scale-105"],
  ["bg-blue-600 hover:bg-blue-700", "bg-primary hover:bg-primary/90"],
  ["disabled:bg-blue-400", "disabled:bg-primary/50"],
  ["disabled:bg-blue-300", "disabled:bg-primary/50"],
  ["border-blue-600", "border-primary"],
  ["shadow-blue-500/20", "shadow-primary/20"],
  ["shadow-blue-500/25", "shadow-primary/25"],
  ["bg-rose-600 hover:bg-rose-700 text-white", "bg-error hover:bg-error/90 text-error-content"],
  ["bg-rose-600 hover:bg-rose-700", "bg-error hover:bg-error/90"],
  ["disabled:bg-rose-800", "disabled:bg-error/80"],
  ["bg-rose-500 text-white", "bg-error text-error-content"],
  ["bg-rose-600/10", "bg-error/10"],
  ["bg-black/40", "bg-base-content/40"],
  ["bg-black/30", "bg-base-content/30"],
  ["bg-black/60", "bg-base-content/60"],
  ["bg-white", "bg-base-100"],
  ["border-gray-200", "border-base-300"],
  ["border-gray-300", "border-base-300"],
  ["text-black", "text-base-content"],
  ["text-blue-600", "text-primary"],
  ["group-hover:text-blue-700", "group-hover:text-primary/80"],
  ["hover:text-blue-600", "hover:text-primary"],
  ["hover:bg-blue-700", "hover:bg-primary/90"],
  ["bg-blue-600", "bg-primary"],
  ["hover:bg-slate-800", "hover:bg-primary/90"],
  ["disabled:bg-slate-350", "disabled:bg-primary/50"],
  ["text-zinc-400", "text-base-content/60"],
  ["hover:bg-zinc-800", "hover:bg-base-300"],
];

// btn content colors: replace text-white with the matching content token.
const btnRegex = [
  [/(btn-error\b[^"]*?)text-white/g, "$1text-error-content"],
  [/(btn-success\b[^"]*?)text-white/g, "$1text-success-content"],
  [/(btn-primary\b[^"]*?)text-white/g, "$1text-primary-content"],
];

// Brand-colored buttons without the hover variant (e.g. not-found, badges).
const brandRegex = [
  [/bg-blue-600([^"]*?)text-white/g, "bg-primary hover:bg-primary/90$1text-primary-content"],
  [/bg-rose-500([^"]*?)text-white/g, "bg-error hover:bg-error/90$1text-error-content"],
  [/bg-rose-600([^"]*?)text-white/g, "bg-error hover:bg-error/90$1text-error-content"],
];

let changed = 0;
for (const rel of targets) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    console.log("SKIP (missing):", rel);
    continue;
  }
  let src = fs.readFileSync(file, "utf8");
  const before = src;
  for (const [from, to] of exact) src = src.split(from).join(to);
  for (const [re, rep] of btnRegex) src = src.replace(re, rep);
  for (const [re, rep] of brandRegex) src = src.replace(re, rep);
  if (src !== before) {
    fs.writeFileSync(file, src, "utf8");
    changed++;
    console.log("UPDATED:", rel);
  } else {
    console.log("no change:", rel);
  }
}
console.log(`\nDone. Updated ${changed} file(s).`);
