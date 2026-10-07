"use strict";
/*
 * ADHD Hyperfocus Graph
 * A calmer graph view for ADHD and dyslexic brains: short labels, topic hubs, a focus layout,
 * vivid or calm palettes, still motion and bigger text. It never edits your notes: topic hubs
 * are separate notes inside one folder, and everything else only changes how the graph is drawn.
 *
 * Plain JavaScript, no build step. The pure functions at the top are exported for the tests in test/.
 */

let obsidian = null;
try { obsidian = require("obsidian"); } catch (e) { /* running under node for tests */ }

/* ------------------------------------------------------------------ */
/* Strings                                                             */
/* ------------------------------------------------------------------ */

const STRINGS = {
  en: {
    pluginName: "ADHD Hyperfocus Graph",
    cmdCalm: "Apply the calm layout to the graph",
    cmdTopics: "Update topic hubs",
    cmdFocus: "Focus on one topic",
    cmdLabels: "Turn short labels on or off",
    cmdLoose: "Show notes without a topic",
    cmdWelcome: "Open the 3-step setup",
    statusLoose: "{n} without topic",
    statusNoneLoose: "All notes have a topic",
    noticeCalm: "Calm layout applied to the graph.",
    noticeTopics: "Topic hubs updated: {n} hubs.",
    noticeNoTopics: "No topics yet. Add one in the plugin settings.",
    noticeLabelsOn: "Short labels on.",
    noticeLabelsOff: "Short labels off. Back to file names.",
    focusPlaceholder: "Pick a topic to look at alone",
    looseTitle: "Notes without a topic",
    looseEmpty: "Every visible note has a topic.",
    looseHelp: "Pick a topic for each one. You can change it later in the settings.",
    looseNone: "No topic",
    hubIntro: "Notes about this topic. This note is made by ADHD Hyperfocus Graph and rewritten when topics change: edits here are lost.",
    hubEmpty: "No notes yet.",
    hLabels: "Labels",
    hColors: "Colors",
    hMotion: "Motion",
    hTopics: "Topics",
    hHidden: "Hidden notes",
    hLanguage: "Language",
    sShort: "Short labels",
    sShortDesc: "Shows a short name on each dot instead of the full file name.",
    sMax: "Longest label",
    sMaxDesc: "Letters per label. Longer names are cut at a whole word and end with …",
    sSize: "Label size",
    sSizeDesc: "Bigger text is easier to read. 1 is the Obsidian size.",
    sPalette: "Palette",
    sPaletteDesc: "Vivid is bright and easy to tell apart. Calm is soft and quiet. Light or dark follows your Obsidian theme.",
    pVivid: "Vivid",
    pCalm: "Calm",
    sCb: "Colors for color blindness",
    sCbDesc: "Uses a palette that people with color blindness can tell apart.",
    sStill: "Still graph",
    sStillDesc: "The graph stops moving once the dots settle. Moving things pull attention.",
    sFolder: "Topic hubs folder",
    sFolderDesc: "One note per topic is made here. Nothing outside this folder is ever changed.",
    sTopic: "Topic",
    sTopicDesc: "Name, emoji, and where its notes come from: folders, words in the title, or tags. One per line.",
    sTopicName: "Name",
    sTopicEmoji: "Emoji",
    sTopicFolders: "Folders",
    sTopicWords: "Words in the title",
    sTopicTags: "Tags",
    sAddTopic: "Add a topic",
    sRemove: "Remove",
    sHiddenPatterns: "Hide notes named like",
    sHiddenPatternsDesc: "One per line. * means anything. These notes leave the graph but stay in your files.",
    sHiddenPaths: "Hidden one by one",
    sHiddenPathsDesc: "{n} notes hidden by path.",
    sLanguage: "Language",
    sLanguageDesc: "Auto follows Obsidian.",
    lAuto: "Auto",
    wTitle1: "Step 1 of 3: how should it look?",
    wText1: "Pick one. Light or dark follows your Obsidian theme by itself.",
    wTitle2: "Step 2 of 3: your topics",
    wText2: "These are your top folders. Tick the ones that are a topic for you. You can rename them later.",
    wTitle3: "Step 3 of 3: done",
    wText3: "Your graph now has short labels, one hub per topic and a calm layout. Open the graph to see it.",
    wNext: "Next",
    wDone: "Open the graph",
    wSkip: "Skip",
  },
  es: {
    pluginName: "ADHD Hyperfocus Graph",
    cmdCalm: "Aplicar el layout tranquilo al grafo",
    cmdTopics: "Actualizar las notas de tema",
    cmdFocus: "Enfocar un tema",
    cmdLabels: "Prender o apagar las etiquetas cortas",
    cmdLoose: "Ver notas sin tema",
    cmdWelcome: "Abrir el arranque en 3 pasos",
    statusLoose: "{n} sin tema",
    statusNoneLoose: "Todas las notas tienen tema",
    noticeCalm: "Layout tranquilo aplicado al grafo.",
    noticeTopics: "Notas de tema actualizadas: {n}.",
    noticeNoTopics: "Todavía no hay temas. Agregá uno en los ajustes del plugin.",
    noticeLabelsOn: "Etiquetas cortas prendidas.",
    noticeLabelsOff: "Etiquetas cortas apagadas. Vuelven los nombres de archivo.",
    focusPlaceholder: "Elegí un tema para verlo solo",
    looseTitle: "Notas sin tema",
    looseEmpty: "Todas las notas visibles tienen tema.",
    looseHelp: "Elegí un tema para cada una. Se puede cambiar después en los ajustes.",
    looseNone: "Sin tema",
    hubIntro: "Notas de este tema. Esta nota la arma ADHD Hyperfocus Graph y se reescribe cuando cambian los temas: lo que edites acá se pierde.",
    hubEmpty: "Todavía no hay notas.",
    hLabels: "Etiquetas",
    hColors: "Colores",
    hMotion: "Movimiento",
    hTopics: "Temas",
    hHidden: "Notas ocultas",
    hLanguage: "Idioma",
    sShort: "Etiquetas cortas",
    sShortDesc: "Muestra un nombre corto en cada punto en vez del nombre de archivo completo.",
    sMax: "Largo máximo",
    sMaxDesc: "Letras por etiqueta. Los nombres más largos se cortan en palabra entera y terminan en …",
    sSize: "Tamaño de letra",
    sSizeDesc: "La letra más grande se lee mejor. 1 es el tamaño de Obsidian.",
    sPalette: "Paleta",
    sPaletteDesc: "Vivo es brillante y fácil de distinguir. Calmo es suave y tranquilo. Claro u oscuro sigue el tema de Obsidian.",
    pVivid: "Vivo",
    pCalm: "Calmo",
    sCb: "Colores para daltonismo",
    sCbDesc: "Usa una paleta que se distingue bien con daltonismo.",
    sStill: "Grafo quieto",
    sStillDesc: "El grafo deja de moverse cuando los puntos se acomodan. Lo que se mueve roba atención.",
    sFolder: "Carpeta de las notas de tema",
    sFolderDesc: "Acá se crea una nota por tema. Nada fuera de esta carpeta se toca nunca.",
    sTopic: "Tema",
    sTopicDesc: "Nombre, emoji y de dónde salen sus notas: carpetas, palabras del título o tags. Uno por línea.",
    sTopicName: "Nombre",
    sTopicEmoji: "Emoji",
    sTopicFolders: "Carpetas",
    sTopicWords: "Palabras del título",
    sTopicTags: "Tags",
    sAddTopic: "Agregar un tema",
    sRemove: "Sacar",
    sHiddenPatterns: "Ocultar notas que se llamen",
    sHiddenPatternsDesc: "Uno por línea. * es cualquier cosa. Estas notas salen del grafo pero siguen en tus archivos.",
    sHiddenPaths: "Ocultas una por una",
    sHiddenPathsDesc: "{n} notas ocultas por ruta.",
    sLanguage: "Idioma",
    sLanguageDesc: "Automático sigue a Obsidian.",
    lAuto: "Automático",
    wTitle1: "Paso 1 de 3: ¿cómo lo querés ver?",
    wText1: "Elegí una. Claro u oscuro sigue solo el tema de Obsidian.",
    wTitle2: "Paso 2 de 3: tus temas",
    wText2: "Estas son tus carpetas principales. Marcá las que para vos son un tema. Los nombres se cambian después.",
    wTitle3: "Paso 3 de 3: listo",
    wText3: "Tu grafo ya tiene etiquetas cortas, una nota por tema y un layout tranquilo. Abrí el grafo para verlo.",
    wNext: "Siguiente",
    wDone: "Abrir el grafo",
    wSkip: "Saltear",
  },
};

function makeT(language) {
  const table = STRINGS[language] || STRINGS.en;
  return (key, vars) => {
    let s = table[key] !== undefined ? table[key] : STRINGS.en[key] !== undefined ? STRINGS.en[key] : key;
    if (vars) for (const k of Object.keys(vars)) s = s.split("{" + k + "}").join(String(vars[k]));
    return s;
  };
}

/* ------------------------------------------------------------------ */
/* Short labels (pure)                                                 */
/* ------------------------------------------------------------------ */

const len = (s) => Array.from(s).length;
const firstChars = (s, n) => Array.from(s).slice(0, n).join("");

// Cuts at a whole word when it can, and marks the cut with …
function cut(s, n) {
  if (len(s) <= n) return s;
  let t = firstChars(s, n - 1);
  const wholeWord = Array.from(s)[n - 1] === " ";  // the cut already falls between two words
  const space = t.lastIndexOf(" ");
  if (!wholeWord && space >= Math.floor(t.length / 2)) t = t.slice(0, space);
  return t.trimEnd() + "…";
}

// Removes what the context already says: dates, type prefixes, the author in "Title - Author",
// and the parent path of folder hubs named "📁 project – folder (kind)".
function clean(base) {
  let s = base.trim();
  let hub = false;
  let hubParts = [];
  const m = s.match(/^📁\s*(.*)$/u);
  if (m) {
    hub = true;
    s = m[1].replace(/\s*\([^)]*\)\s*$/u, "");
    hubParts = s.split(" – ");
    s = hubParts[hubParts.length - 1];
  }
  s = s.replace(/^(handoff|prompt-code|prompt)[-_ ]/i, "");
  const date = s.match(/\d{4}-(\d{2})-(\d{2})/);
  s = s.replace(/(^|[-_ ])\d{4}-\d{2}-\d{2}(?=$|[-_ ])/g, " ");
  if (s.includes(" - ")) s = s.split(" - ")[0];
  s = s.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return { text: s || base, hub, hubParts, date: date ? `${+date[2]}/${+date[1]}` : "" };
}

function build(cleaned, context, max) {
  const pre = cleaned.hub ? "📁" : "";
  let s = cleaned.text;
  if (context) {
    const room = Math.max(3, max - len(pre) - len(s) - 1);
    s = firstChars(context.replace(/[-_]+/g, " ").trim(), room).trimEnd() + "·" + s;
  }
  return pre + cut(s, max - len(pre));
}

// Ways to tell two equal names apart, shortest first.
function contexts(item, cleaned) {
  const lastWord = (x) => (x || "").split(/[-_ ]+/).filter(Boolean).pop() || "";
  const out = [];
  if (cleaned.hub) {
    const p = cleaned.hubParts;
    if (p.length > 1) out.push(p[p.length - 2], p[0].replace(/^_+/, ""), p.slice(0, -1).join(" "));
  } else {
    const folders = (item.path || "").split("/").slice(0, -1);
    const parent = folders[folders.length - 1] || "";
    const grand = folders[folders.length - 2] || "";
    out.push(lastWord(parent), parent, cleaned.date, grand, lastWord(grand));
  }
  return out.filter(Boolean);
}

// items: [{key, base, path, own}] -> Map key -> label of at most `max` letters.
// `own` is a label the user wrote in the note's `label` property: it always wins.
// Equal names (README, GATES) get the first context that tells them apart.
function shortLabels(items, max) {
  const out = new Map();
  const groups = new Map();
  for (const it of items) {
    if (it.own) { out.set(it.key, cut(String(it.own).trim(), max)); continue; }
    const c = clean(it.base);
    out.set(it.key, build(c, "", max));
    const k = (c.hub ? "📁" : "") + c.text.toLowerCase();
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push({ it, c, ctx: contexts(it, c) });
  }
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    const levels = Math.max(...g.map((x) => x.ctx.length));
    const unique = [];
    for (let i = 0; i < levels; i++) {
      const labels = g.map((x) => (x.ctx[i] ? build(x.c, x.ctx[i], max).toLowerCase() : null));
      const count = new Map();
      for (const l of labels) if (l) count.set(l, (count.get(l) || 0) + 1);
      unique.push(labels.map((l) => !!l && count.get(l) === 1));
    }
    g.forEach((x, j) => {
      let i = unique.findIndex((u) => u[j]);
      if (i < 0) i = x.ctx.length - 1;
      out.set(x.it.key, build(x.c, x.ctx[i] || "", max));
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Topics and hidden notes (pure)                                      */
/* ------------------------------------------------------------------ */

const DEFAULT_HIDE = ["GATES*", "CLAUDE", "AGENTS", "README", "handoff-*", "prompt-*"];

function globToRegExp(glob) {
  const esc = glob.trim().replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp("^" + esc + "$", "i");
}

function isHidden(path, settings) {
  if ((settings.hiddenPaths || []).includes(path)) return true;
  const base = path.split("/").pop().replace(/\.md$/i, "");
  return (settings.hiddenPatterns || []).some((g) => g.trim() && globToRegExp(g).test(base));
}

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// files: [{path, basename, tags}] -> Map path -> [topic names]. Manual assignments win over rules.
function assignTopics(files, settings) {
  const out = new Map();
  const folder = (settings.topicsFolder || "").replace(/\/+$/, "");
  for (const f of files) {
    if (folder && (f.path === folder || f.path.startsWith(folder + "/"))) continue;
    if (isHidden(f.path, settings)) continue;
    const manual = (settings.assignments || {})[f.path];
    if (manual && manual.length) { out.set(f.path, manual.slice()); continue; }
    const title = norm(f.basename);
    const tags = (f.tags || []).map((t) => norm(t.replace(/^#/, "")));
    const hits = [];
    for (const topic of settings.topics || []) {
      const r = topic.rules || {};
      const byFolder = (r.folders || []).some((d) => d.trim() && (f.path.startsWith(d.replace(/\/+$/, "") + "/")));
      const byWord = (r.words || []).some((w) => w.trim() && new RegExp("(^|[^\\p{L}\\p{N}])" + norm(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^\\p{L}\\p{N}])", "u").test(title));
      const byTag = (r.tags || []).some((tg) => tg.trim() && tags.some((x) => x === norm(tg.replace(/^#/, "")) || x.startsWith(norm(tg.replace(/^#/, "")) + "/")));
      if (byFolder || byWord || byTag) hits.push(topic.name);
    }
    if (hits.length) out.set(f.path, hits.slice(0, 2));
  }
  return out;
}

function hubFileName(topic) {
  return `${topic.emoji ? topic.emoji + " " : ""}${topic.name}`.replace(/[\\/:*?"<>|#^[\]]/g, " ").replace(/\s+/g, " ").trim();
}

const HUB_MARK = "adhd-hyperfocus-graph: topic";

function hubBody(topic, paths, t) {
  const lines = ["---", HUB_MARK, "---", "", `# ${hubFileName(topic)}`, "", t("hubIntro"), ""];
  if (!paths.length) lines.push(t("hubEmpty"));
  for (const p of paths.slice().sort((a, b) => a.localeCompare(b))) {
    const target = p.replace(/\.md$/i, "");
    lines.push(`- [[${target}|${target.split("/").pop()}]]`);
  }
  return lines.join("\n") + "\n";
}

// Builds a graph search query that hides the given notes. A folder whose notes are all hidden
// becomes one -path: term, so the query stays short.
function hideQuery(allPaths, hiddenSet, patterns) {
  const terms = [];
  const folders = new Map();
  for (const p of allPaths) {
    const parts = p.split("/");
    for (let i = 1; i < parts.length; i++) {
      const d = parts.slice(0, i).join("/");
      if (!folders.has(d)) folders.set(d, { all: 0, hidden: 0 });
      const f = folders.get(d);
      f.all++;
      if (hiddenSet.has(p)) f.hidden++;
    }
  }
  const fullyHidden = [...folders.entries()].filter(([, f]) => f.all > 0 && f.hidden === f.all).map(([d]) => d);
  const top = fullyHidden.filter((d) => !fullyHidden.some((o) => o !== d && d.startsWith(o + "/")));
  for (const d of top.sort()) terms.push(`-path:"${d}/"`);
  for (const p of [...hiddenSet].sort()) if (!top.some((d) => p.startsWith(d + "/"))) terms.push(`-path:"${p}"`);
  for (const g of patterns || []) {
    const word = g.trim().replace(/\*/g, "");
    if (word) terms.push(`-file:"${word}"`);
  }
  return terms.join(" ");
}

/* ------------------------------------------------------------------ */
/* Palettes (pure)                                                     */
/* ------------------------------------------------------------------ */

const PALETTES = {
  vivid: {
    dark: ["#BD93F9", "#FF79C6", "#50FA7B", "#8BE9FD", "#FFB86C", "#F1FA8C", "#FF5555", "#82AAFF", "#7DF9C2", "#C3E88D", "#FF9AA2", "#E0B0FF"],
    light: ["#7C3AED", "#DB2777", "#047857", "#0E7490", "#C2410C", "#A16207", "#DC2626", "#4F46E5", "#4D7C0F", "#0369A1", "#9D174D", "#57534E"],
  },
  calm: {
    dark: ["#B4A7D6", "#D7AFC6", "#A3C9A8", "#9CC3CF", "#D9B996", "#CFC9A0", "#D6A3A3", "#A9B2CC", "#B7C9B5", "#C5B8A5", "#A8C0DD", "#C9A9D9"],
    light: ["#6B5B95", "#9E5A7A", "#4E7D5B", "#3F7A8A", "#8F6339", "#7A6F2A", "#9A4F4F", "#55618A", "#5E6E5C", "#6B5A45", "#4A6A8F", "#7D5A8C"],
  },
  colorblind: {
    dark: ["#E69F00", "#56B4E9", "#009E73", "#F0E442", "#3D9BE0", "#D55E00", "#CC79A7", "#BBBBBB", "#88CCEE", "#44AA99", "#DDCC77", "#999933"],
    light: ["#A86A00", "#1F6FA6", "#007A5A", "#7A7300", "#0072B2", "#B34700", "#A8558A", "#666666", "#33779A", "#2E7D72", "#857A2E", "#882255"],
  },
};

function hexToRgbInt(hex) { return parseInt(hex.replace("#", ""), 16); }

function luminance(hex) {
  const n = hexToRgbInt(hex);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function paletteFor(settings, dark) {
  const name = settings.colorblind ? "colorblind" : settings.palette === "calm" ? "calm" : "vivid";
  return PALETTES[name][dark ? "dark" : "light"];
}

// One color per topic: its hub and every note in it share the color (first match wins in Obsidian,
// so a note in two topics takes the first one). Without topics, one color per folder.
function colorGroups(topics, topicsFolder, notesByTopic, folders, colors) {
  const q = (p) => `path:"${p.replace(/"/g, '\\"')}"`;
  const color = (i) => ({ a: 1, rgb: hexToRgbInt(colors[i % colors.length]) });
  if (topics.length) {
    return topics.map((tp, i) => ({
      query: [q(`${topicsFolder}/${hubFileName(tp)}.md`), ...(notesByTopic.get(tp.name) || []).map(q)].join(" OR "),
      color: color(i),
    }));
  }
  return folders.map((d, i) => ({ query: q(d + "/"), color: color(i) }));
}

// Below this zoom the graph is an overview: only topic hubs are labelled.
const FAR_ZOOM = 0.3;

const CALM_LAYOUT = {
  // Obsidian shows labels when log2(zoom) + 1 - textFadeMultiplier > 0: -3 keeps short labels visible
  // even zoomed out (measured on Obsidian 1.14.4). Forces tuned on a 113-note vault: room for labels, still one picture.
  textFadeMultiplier: -3, nodeSizeMultiplier: 1.4, lineSizeMultiplier: 1, showArrow: false,
  showTags: false, showAttachments: false, hideUnresolved: true, showOrphans: true,
  centerStrength: 0.4, repelStrength: 16, linkStrength: 1, linkDistance: 160,
};

const DEFAULTS = {
  language: "auto",
  shortLabels: true,
  maxLabel: 16,
  labelSize: 1.2,
  palette: "vivid",
  colorblind: false,
  stillGraph: true,
  topicsFolder: "Topics",
  topics: [],
  assignments: {},
  hiddenPatterns: DEFAULT_HIDE.slice(),
  hiddenPaths: [],
  colorFolders: [],
  baseQuery: "",
  showOrphans: true,
  onboarded: false,
  applyOnNextLoad: false,
};

module.exports.__test = { shortLabels, cut, clean, assignTopics, isHidden, hideQuery, hubBody, hubFileName, colorGroups, paletteFor, contrast, PALETTES, DEFAULTS, makeT, STRINGS, DEFAULT_HIDE };

/* ------------------------------------------------------------------ */
/* Obsidian                                                            */
/* ------------------------------------------------------------------ */

if (obsidian) {
  const { Plugin, PluginSettingTab, Setting, Modal, SuggestModal, Notice, TFile, normalizePath, debounce } = obsidian;
  const GRAPH_TYPES = ["graph", "localgraph"];

  const graphViews = (app) => {
    const out = [];
    for (const type of GRAPH_TYPES) for (const leaf of app.workspace.getLeavesOfType(type)) if (leaf.view && leaf.view.renderer) out.push(leaf.view);
    return out;
  };
  const nodesOf = (r) => (Array.isArray(r.nodes) ? r.nodes : r.nodes instanceof Map ? [...r.nodes.values()] : []);

  class HyperfocusPlugin extends Plugin {
    async onload() {
      await this.loadSettings();
      this.t = makeT(this.language());
      this.patched = new Map();
      this.dirty = true;
      this.signatures = new WeakMap();
      this.stillTimers = new WeakMap();

      const markDirty = () => { this.dirty = true; };
      this.scheduleHubs = debounce(() => this.updateHubs(false), 4000, true);
      this.registerEvent(this.app.vault.on("create", () => { markDirty(); this.scheduleHubs(); }));
      this.registerEvent(this.app.vault.on("delete", (f) => { markDirty(); this.forgetPath(f.path); this.scheduleHubs(); }));
      this.registerEvent(this.app.vault.on("rename", (f, old) => { markDirty(); this.movePath(old, f.path); this.scheduleHubs(); }));
      this.registerEvent(this.app.metadataCache.on("changed", () => { markDirty(); this.scheduleHubs(); }));
      this.registerEvent(this.app.workspace.on("layout-change", markDirty));
      this.registerEvent(this.app.workspace.on("css-change", () => this.applyColors()));
      this.registerInterval(window.setInterval(() => this.refreshGraphs(), 1000));

      this.addCommand({ id: "apply-calm-layout", name: this.t("cmdCalm"), callback: () => this.applyCalmLayout(true) });
      this.addCommand({ id: "update-topic-hubs", name: this.t("cmdTopics"), callback: () => this.updateHubs(true) });
      this.addCommand({ id: "focus-topic", name: this.t("cmdFocus"), callback: () => new TopicSuggest(this).open() });
      this.addCommand({ id: "toggle-short-labels", name: this.t("cmdLabels"), callback: () => this.toggleLabels() });
      this.addCommand({ id: "notes-without-topic", name: this.t("cmdLoose"), callback: () => new LooseModal(this).open() });
      this.addCommand({ id: "open-setup", name: this.t("cmdWelcome"), callback: () => new WelcomeModal(this).open() });
      this.addRibbonIcon("target", this.t("cmdFocus"), () => new TopicSuggest(this).open());

      this.status = this.addStatusBarItem();
      this.status.addClass("hyperfocus-status");
      this.status.addEventListener("click", () => new LooseModal(this).open());

      this.addSettingTab(new HyperfocusSettings(this));
      this.app.workspace.onLayoutReady(() => {
        this.refreshGraphs();
        this.updateStatus();
        if (this.settings.applyOnNextLoad) {
          // set by a script that writes data.json while Obsidian is closed: build hubs and layout once
          this.settings.applyOnNextLoad = false;
          this.saveData(this.settings).then(() => this.updateHubs(false)).then(() => this.applyCalmLayout(false));
        } else if (!this.settings.onboarded && !this.settings.topics.length) new WelcomeModal(this).open();
      });
    }

    onunload() {
      this.restoreLabels();
    }

    language() {
      if (this.settings.language !== "auto") return this.settings.language;
      const l = (window.localStorage.getItem("language") || "en").toLowerCase();
      return l.startsWith("es") ? "es" : "en";
    }

    async loadSettings() {
      this.settings = Object.assign({}, DEFAULTS, await this.loadData());
    }

    async saveSettings() {
      await this.saveData(this.settings);
      this.dirty = true;
      this.refreshGraphs();
      this.updateStatus();
    }

    forgetPath(path) {
      if (this.settings.assignments[path]) { delete this.settings.assignments[path]; this.saveData(this.settings); }
    }

    movePath(oldPath, newPath) {
      const s = this.settings;
      let changed = false;
      if (s.assignments[oldPath]) { s.assignments[newPath] = s.assignments[oldPath]; delete s.assignments[oldPath]; changed = true; }
      const i = s.hiddenPaths.indexOf(oldPath);
      if (i >= 0) { s.hiddenPaths[i] = newPath; changed = true; }
      if (changed) this.saveData(s);
    }

    isDark() { return document.body.classList.contains("theme-dark"); }

    markdownFiles() {
      const ignored = (p) => typeof this.app.metadataCache.isUserIgnored === "function" && this.app.metadataCache.isUserIgnored(p);
      return this.app.vault.getMarkdownFiles().filter((f) => !ignored(f.path)).map((f) => {
        const cache = this.app.metadataCache.getFileCache(f) || {};
        const tags = obsidian.getAllTags ? obsidian.getAllTags(cache) || [] : [];
        return { path: f.path, basename: f.basename, tags };
      });
    }

    currentAssignments() { return assignTopics(this.markdownFiles(), this.settings); }

    /* --- labels --- */

    // If Obsidian changes the graph internals, short labels and the still graph switch themselves off
    // and the graph keeps working as the core plugin draws it.
    refreshGraphs() {
      if (this.broken) return;
      try { this.refreshGraphsUnsafe(); } catch (e) {
        this.broken = true;
        try { this.restoreLabels(); } catch (e2) { /* nothing left to undo */ }
        console.error("ADHD Hyperfocus Graph: graph internals changed, short labels and still graph are off.", e);
      }
    }

    refreshGraphsUnsafe() {
      const dirty = this.dirty;
      this.dirty = false;
      for (const view of graphViews(this.app)) {
        const r = view.renderer;
        const nodes = nodesOf(r).filter((n) => n && typeof n.id === "string");
        if (!this.settings.shortLabels) { this.restoreLabels(); continue; }
        // Zoomed out, only topic hubs keep a label, drawn bigger so it stays readable (Obsidian shrinks text
        // with zoom). Zoom into a cluster and every note shows its short label. Little text at any zoom.
        const scale = r.scale || 1;
        const far = scale < FAR_ZOOM;
        const boost = far ? Math.round(Math.min(3, FAR_ZOOM / scale) * 4) / 4 : 1;
        const signature = nodes.length + ":" + this.settings.maxLabel + ":" + this.settings.labelSize + ":" + far + ":" + boost;
        if (!dirty && this.signatures.get(r) === signature) continue;
        this.signatures.set(r, signature);
        const items = nodes.map((n) => {
          const f = this.app.vault.getAbstractFileByPath(n.id);
          if (f instanceof TFile) {
            const fm = (this.app.metadataCache.getFileCache(f) || {}).frontmatter || {};
            return { key: n.id, base: f.basename, path: f.path, own: fm.label };
          }
          return { key: n.id, base: n.id.split("/").pop(), path: n.id };
        });
        const labels = shortLabels(items, this.settings.maxLabel);
        let changed = false;
        const hubPrefix = normalizePath(this.settings.topicsFolder || "Topics") + "/";
        for (const n of nodes) {
          const hub = n.id.startsWith(hubPrefix);
          const text = far && !hub && this.settings.topics.length ? " " : labels.get(n.id);
          changed = this.label(n, text, this.settings.labelSize * (hub ? boost : 1)) || changed;
        }
        if (changed && typeof r.changed === "function") r.changed();
        this.keepStill(view);
      }
    }

    label(node, text, size) {
      if (!text) return false;
      if (!this.patched.has(node)) {
        this.patched.set(node, {
          display: Object.prototype.hasOwnProperty.call(node, "getDisplayText") ? node.getDisplayText : null,
          style: Object.prototype.hasOwnProperty.call(node, "getTextStyle") ? node.getTextStyle : null,
        });
        const baseStyle = Object.getPrototypeOf(node).getTextStyle;
        if (typeof baseStyle === "function") {
          node.getTextStyle = function () {
            const st = baseStyle.call(this);
            st.fontSize = st.fontSize * (this.__hyperfocusSize || 1);
            return st;
          };
        }
      }
      let changed = false;
      if (node.__hyperfocusSize !== size) { node.__hyperfocusSize = size; node.fontDirty = true; changed = true; }
      node.getDisplayText = () => text;
      if (node.text && typeof node.text.text === "string" && node.text.text !== text) { node.text.text = text; node.fontDirty = true; changed = true; }
      return changed;
    }

    restoreLabels() {
      for (const [node, orig] of this.patched) {
        if (orig.display) node.getDisplayText = orig.display; else delete node.getDisplayText;
        if (orig.style) node.getTextStyle = orig.style; else delete node.getTextStyle;
        delete node.__hyperfocusSize;
        if (node.text && typeof node.getDisplayText === "function") node.text.text = node.getDisplayText();
        node.fontDirty = true;
      }
      if (this.patched.size) for (const v of graphViews(this.app)) if (typeof v.renderer.changed === "function") v.renderer.changed();
      this.patched.clear();
    }

    async toggleLabels() {
      this.settings.shortLabels = !this.settings.shortLabels;
      await this.saveSettings();
      new Notice(this.t(this.settings.shortLabels ? "noticeLabelsOn" : "noticeLabelsOff"));
    }

    /* --- still graph: stop the simulation a few seconds after the last change --- */

    keepStill(view) {
      if (!this.settings.stillGraph) return;
      const r = view.renderer;
      if (!r.worker || this.stillTimers.has(r)) return;
      const id = window.setTimeout(() => {
        this.stillTimers.delete(r);
        try {
          if (this.settings.stillGraph && !this.broken && r.worker && !r.dragNode) r.worker.postMessage({ alpha: 0, run: false });
        } catch (e) { this.broken = true; }
      }, 5000);
      this.stillTimers.set(r, id);
    }

    /* --- topics --- */

    async updateHubs(manual) {
      const s = this.settings;
      if (!s.topics.length) { if (manual) new Notice(this.t("noticeNoTopics")); return; }
      const folder = normalizePath(s.topicsFolder || "Topics");
      if (!this.app.vault.getAbstractFileByPath(folder)) await this.app.vault.createFolder(folder);
      const byTopic = new Map(s.topics.map((tp) => [tp.name, []]));
      for (const [path, names] of this.currentAssignments()) for (const n of names) if (byTopic.has(n)) byTopic.get(n).push(path);
      let count = 0;
      for (const tp of s.topics) {
        const path = normalizePath(`${folder}/${hubFileName(tp)}.md`);
        const body = hubBody(tp, byTopic.get(tp.name), this.t);
        const existing = this.app.vault.getAbstractFileByPath(path);
        if (existing instanceof TFile) {
          const now = await this.app.vault.cachedRead(existing);
          if (!now.includes(HUB_MARK)) continue; // a note of the user's with the same name: never touched
          if (now !== body) await this.app.vault.process(existing, () => body);
        } else {
          await this.app.vault.create(path, body);
        }
        count++;
      }
      this.updateStatus();
      if (manual) new Notice(this.t("noticeTopics", { n: count }));
    }

    looseNotes() {
      const assigned = this.currentAssignments();
      const folder = this.settings.topicsFolder;
      return this.markdownFiles()
        .filter((f) => !assigned.has(f.path) && !isHidden(f.path, this.settings) && !f.path.startsWith(folder + "/"))
        .map((f) => f.path);
    }

    updateStatus() {
      if (!this.status) return;
      if (!this.settings.topics.length) { this.status.setText(""); return; }
      const n = this.looseNotes().length;
      this.status.setText(n ? "◎ " + this.t("statusLoose", { n }) : "◎ " + this.t("statusNoneLoose"));
    }

    async focusTopic(topic) {
      const path = normalizePath(`${this.settings.topicsFolder}/${hubFileName(topic)}.md`);
      let file = this.app.vault.getAbstractFileByPath(path);
      if (!(file instanceof TFile)) { await this.updateHubs(false); file = this.app.vault.getAbstractFileByPath(path); }
      if (!(file instanceof TFile)) return;
      const leaf = this.app.workspace.getLeaf("tab");
      await leaf.openFile(file);
      this.app.workspace.setActiveLeaf(leaf, { focus: true });
      this.app.commands.executeCommandById("graph:open-local");
      // the local graph keeps its own options: give it the same colors and layout
      window.setTimeout(() => {
        const opts = this.graphOptions();
        delete opts.search;
        for (const l of this.app.workspace.getLeavesOfType("localgraph")) {
          const engine = l.view.dataEngine || l.view.engine;  // the local graph calls it engine
          if (engine && typeof engine.setOptions === "function") engine.setOptions(opts);
        }
        this.dirty = true;
      }, 500);
    }

    /* --- layout and colors --- */

    graphOptions() {
      const s = this.settings;
      const all = this.markdownFiles().map((f) => f.path);
      const hidden = new Set(all.filter((p) => (s.hiddenPaths || []).includes(p)));
      const top = s.colorFolders.length ? s.colorFolders : [...new Set(all.filter((p) => p.includes("/") && !p.startsWith(s.topicsFolder + "/")).map((p) => p.split("/")[0]))].sort();
      const byTopic = new Map(s.topics.map((tp) => [tp.name, []]));
      for (const [path, names] of this.currentAssignments()) if (byTopic.has(names[0])) byTopic.get(names[0]).push(path);
      return Object.assign({}, CALM_LAYOUT, {
        showOrphans: s.showOrphans,
        search: [s.baseQuery || "", hideQuery(all, hidden, s.hiddenPatterns)].join(" ").trim(),
        colorGroups: colorGroups(s.topics, s.topicsFolder, byTopic, top, paletteFor(s, this.isDark())),
      });
    }

    async applyCalmLayout(manual) {
      const graph = this.app.internalPlugins && this.app.internalPlugins.getPluginById("graph");
      const opts = this.graphOptions();
      if (graph && graph.instance) {
        graph.instance.options = Object.assign({}, graph.instance.options, opts);
        if (typeof graph.instance.saveOptions === "function") await graph.instance.saveOptions();
      }
      for (const v of graphViews(this.app)) {
        const engine = v.dataEngine || v.engine;
        if (engine && typeof engine.setOptions === "function") engine.setOptions(v.getViewType() === "localgraph" ? Object.assign({}, opts, { search: undefined }) : opts);
      }
      this.dirty = true;
      if (manual) new Notice(this.t("noticeCalm"));
    }

    applyColors() {
      const graph = this.app.internalPlugins && this.app.internalPlugins.getPluginById("graph");
      if (!graph || !graph.instance || !graph.instance.options || !(graph.instance.options.colorGroups || []).length) return;
      const s = this.settings;
      const colors = paletteFor(s, this.isDark());
      const groups = graph.instance.options.colorGroups.map((g, i) => Object.assign({}, g, { color: { a: 1, rgb: hexToRgbInt(colors[i % colors.length]) } }));
      graph.instance.options = Object.assign({}, graph.instance.options, { colorGroups: groups });
      if (typeof graph.instance.saveOptions === "function") graph.instance.saveOptions();
      for (const v of graphViews(this.app)) {
        const engine = v.dataEngine || v.engine;
        if (engine && typeof engine.setOptions === "function") engine.setOptions({ colorGroups: groups });
      }
    }
  }

  /* --- focus on one topic --- */

  class TopicSuggest extends SuggestModal {
    constructor(plugin) {
      super(plugin.app);
      this.plugin = plugin;
      this.setPlaceholder(plugin.t("focusPlaceholder"));
    }
    getSuggestions(query) {
      const q = norm(query);
      return this.plugin.settings.topics.filter((tp) => norm(tp.name).includes(q));
    }
    renderSuggestion(tp, el) { el.setText(hubFileName(tp)); }
    onChooseSuggestion(tp) { this.plugin.focusTopic(tp); }
  }

  /* --- notes without a topic --- */

  class LooseModal extends Modal {
    constructor(plugin) { super(plugin.app); this.plugin = plugin; }
    onOpen() {
      const { contentEl } = this;
      const t = this.plugin.t;
      contentEl.addClass("hyperfocus-modal");
      this.titleEl.setText(t("looseTitle"));
      const loose = this.plugin.looseNotes();
      if (!loose.length) { contentEl.createEl("p", { text: t("looseEmpty") }); return; }
      contentEl.createEl("p", { text: t("looseHelp"), cls: "hyperfocus-help" });
      for (const path of loose.slice(0, 50)) {
        new Setting(contentEl).setName(path.split("/").pop().replace(/\.md$/, "")).setDesc(path).addDropdown((d) => {
          d.addOption("", t("looseNone"));
          for (const tp of this.plugin.settings.topics) d.addOption(tp.name, hubFileName(tp));
          d.onChange(async (v) => {
            if (v) this.plugin.settings.assignments[path] = [v]; else delete this.plugin.settings.assignments[path];
            await this.plugin.saveSettings();
            this.plugin.scheduleHubs();
          });
        });
      }
    }
    onClose() { this.contentEl.empty(); }
  }

  /* --- 3-step setup --- */

  class WelcomeModal extends Modal {
    constructor(plugin) { super(plugin.app); this.plugin = plugin; this.step = 1; this.picked = new Set(); }
    onOpen() { this.render(); }
    render() {
      const { contentEl } = this;
      const p = this.plugin;
      const t = p.t;
      contentEl.empty();
      contentEl.addClass("hyperfocus-modal");
      if (this.step === 1) {
        this.titleEl.setText(t("wTitle1"));
        contentEl.createEl("p", { text: t("wText1"), cls: "hyperfocus-help" });
        const row = contentEl.createDiv({ cls: "hyperfocus-choices" });
        for (const [key, label] of [["vivid", t("pVivid")], ["calm", t("pCalm")]]) {
          const b = row.createEl("button", { text: label, cls: p.settings.palette === key ? "mod-cta" : "" });
          b.addEventListener("click", async () => { p.settings.palette = key; await p.saveSettings(); this.step = 2; this.render(); });
        }
      } else if (this.step === 2) {
        this.titleEl.setText(t("wTitle2"));
        contentEl.createEl("p", { text: t("wText2"), cls: "hyperfocus-help" });
        const tops = [...new Set(p.app.vault.getMarkdownFiles().map((f) => f.path).filter((x) => x.includes("/")).map((x) => x.split("/")[0]))]
          .filter((d) => d !== p.settings.topicsFolder && !d.startsWith(".")).sort().slice(0, 12);
        for (const d of tops) new Setting(contentEl).setName(d).addToggle((tg) => tg.setValue(this.picked.has(d)).onChange((v) => { if (v) this.picked.add(d); else this.picked.delete(d); }));
        new Setting(contentEl).addButton((b) => b.setButtonText(t("wNext")).setCta().onClick(async () => {
          for (const d of this.picked) if (!p.settings.topics.some((tp) => tp.name === d)) p.settings.topics.push({ name: d, emoji: "", rules: { folders: [d], words: [], tags: [] } });
          await p.saveSettings();
          this.step = 3; this.render();
        }));
      } else {
        this.titleEl.setText(t("wTitle3"));
        contentEl.createEl("p", { text: t("wText3"), cls: "hyperfocus-help" });
        new Setting(contentEl).addButton((b) => b.setButtonText(t("wDone")).setCta().onClick(async () => {
          p.settings.onboarded = true;
          await p.saveSettings();
          await p.updateHubs(false);
          await p.applyCalmLayout(false);
          this.close();
          p.app.commands.executeCommandById("graph:open");
        }));
      }
      if (this.step < 3) new Setting(contentEl).addButton((b) => b.setButtonText(t("wSkip")).onClick(async () => { p.settings.onboarded = true; await p.saveSettings(); this.close(); }));
    }
    onClose() { this.contentEl.empty(); }
  }

  /* --- settings --- */

  class HyperfocusSettings extends PluginSettingTab {
    constructor(plugin) { super(plugin.app, plugin); this.plugin = plugin; }
    display() {
      const { containerEl } = this;
      const p = this.plugin;
      const s = p.settings;
      const t = p.t;
      const save = async () => { this.changed = true; await p.saveSettings(); };
      containerEl.empty();
      containerEl.addClass("hyperfocus-settings");

      new Setting(containerEl).setName(t("hLabels")).setHeading();
      new Setting(containerEl).setName(t("sShort")).setDesc(t("sShortDesc")).addToggle((x) => x.setValue(s.shortLabels).onChange(async (v) => { s.shortLabels = v; await save(); }));
      new Setting(containerEl).setName(t("sMax")).setDesc(t("sMaxDesc")).addSlider((x) => x.setLimits(8, 30, 1).setValue(s.maxLabel).setDynamicTooltip().onChange(async (v) => { s.maxLabel = v; await save(); }));
      new Setting(containerEl).setName(t("sSize")).setDesc(t("sSizeDesc")).addSlider((x) => x.setLimits(1, 2, 0.1).setValue(s.labelSize).setDynamicTooltip().onChange(async (v) => { s.labelSize = v; await save(); }));

      new Setting(containerEl).setName(t("hColors")).setHeading();
      new Setting(containerEl).setName(t("sPalette")).setDesc(t("sPaletteDesc")).addDropdown((x) => x.addOption("vivid", t("pVivid")).addOption("calm", t("pCalm")).setValue(s.palette).onChange(async (v) => { s.palette = v; await save(); p.applyColors(); }));
      new Setting(containerEl).setName(t("sCb")).setDesc(t("sCbDesc")).addToggle((x) => x.setValue(s.colorblind).onChange(async (v) => { s.colorblind = v; await save(); p.applyColors(); }));

      new Setting(containerEl).setName(t("hMotion")).setHeading();
      new Setting(containerEl).setName(t("sStill")).setDesc(t("sStillDesc")).addToggle((x) => x.setValue(s.stillGraph).onChange(async (v) => { s.stillGraph = v; await save(); }));

      new Setting(containerEl).setName(t("hTopics")).setHeading();
      new Setting(containerEl).setName(t("sFolder")).setDesc(t("sFolderDesc")).addText((x) => x.setValue(s.topicsFolder).onChange(async (v) => { s.topicsFolder = normalizePath(v || "Topics"); await save(); }));
      s.topics.forEach((tp, i) => {
        const lines = (a) => (a || []).join("\n");
        const parse = (v) => v.split("\n").map((x) => x.trim()).filter(Boolean);
        tp.rules = tp.rules || { folders: [], words: [], tags: [] };
        new Setting(containerEl).setName(`${t("sTopic")}: ${hubFileName(tp)}`).setDesc(t("sTopicDesc"))
          .addText((x) => x.setPlaceholder(t("sTopicEmoji")).setValue(tp.emoji || "").onChange(async (v) => { tp.emoji = v.trim(); await save(); }))
          .addText((x) => x.setPlaceholder(t("sTopicName")).setValue(tp.name).onChange(async (v) => { tp.name = v.trim() || tp.name; await save(); }))
          .addExtraButton((x) => x.setIcon("trash").setTooltip(t("sRemove")).onClick(async () => { s.topics.splice(i, 1); await save(); this.display(); }));
        const rules = new Setting(containerEl).setClass("hyperfocus-rules");
        rules.addTextArea((x) => x.setPlaceholder(t("sTopicFolders")).setValue(lines(tp.rules.folders)).onChange(async (v) => { tp.rules.folders = parse(v); await save(); }));
        rules.addTextArea((x) => x.setPlaceholder(t("sTopicWords")).setValue(lines(tp.rules.words)).onChange(async (v) => { tp.rules.words = parse(v); await save(); }));
        rules.addTextArea((x) => x.setPlaceholder(t("sTopicTags")).setValue(lines(tp.rules.tags)).onChange(async (v) => { tp.rules.tags = parse(v); await save(); }));
      });
      new Setting(containerEl).addButton((x) => x.setButtonText(t("sAddTopic")).onClick(async () => { s.topics.push({ name: `${t("sTopic")} ${s.topics.length + 1}`, emoji: "", rules: { folders: [], words: [], tags: [] } }); await save(); this.display(); }));

      new Setting(containerEl).setName(t("hHidden")).setHeading();
      new Setting(containerEl).setName(t("sHiddenPatterns")).setDesc(t("sHiddenPatternsDesc")).addTextArea((x) => x.setValue((s.hiddenPatterns || []).join("\n")).onChange(async (v) => { s.hiddenPatterns = v.split("\n").map((y) => y.trim()).filter(Boolean); await save(); }));
      new Setting(containerEl).setName(t("sHiddenPaths")).setDesc(t("sHiddenPathsDesc", { n: (s.hiddenPaths || []).length }));

      new Setting(containerEl).setName(t("hLanguage")).setHeading();
      new Setting(containerEl).setName(t("sLanguage")).setDesc(t("sLanguageDesc")).addDropdown((x) => x.addOption("auto", t("lAuto")).addOption("en", "English").addOption("es", "Español").setValue(s.language).onChange(async (v) => { s.language = v; await save(); p.t = makeT(p.language()); this.display(); }));
    }
    hide() {
      if (!this.changed) return;
      this.changed = false;
      this.plugin.applyCalmLayout(false);
      this.plugin.updateHubs(false);
    }
  }

  module.exports.default = HyperfocusPlugin;
}
