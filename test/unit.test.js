const test = require("node:test");
const assert = require("node:assert");
const T = require("../main.js").__test;

test("labels never pass the maximum", () => {
  const names = ["handoff-2026-10-07-garden-planning-and-seed-list", "Los Secretos De Una Casa - David Bodanis", "📁 work – website – assets – illustration (images)", "a"];
  const m = T.shortLabels(names.map((n, i) => ({ key: String(i), base: n, path: n })), 16);
  for (const v of m.values()) assert.ok(Array.from(v).length <= 16, v);
});

test("labels drop dates, prefixes and the author", () => {
  const m = T.shortLabels([{ key: "a", base: "handoff-2026-10-06-team-retro", path: "x" }, { key: "b", base: "Ideario - Enrique Malatesta", path: "y" }], 16);
  assert.equal(m.get("a"), "team retro");
  assert.equal(m.get("b"), "Ideario");
});

test("equal names get a context that tells them apart", () => {
  const items = ["work/README.md", "home/README.md", "projects/audit-march/GATES.md", "projects/audit-april/GATES.md"].map((p) => ({ key: p, base: p.split("/").pop().replace(".md", ""), path: p }));
  const m = T.shortLabels(items, 16);
  assert.equal(new Set(m.values()).size, 4, [...m.values()].join(", "));
});

test("folder hubs with the same last folder use the project", () => {
  const m = T.shortLabels([{ key: "a", base: "📁 work – docs (notes)", path: "_grafo/a" }, { key: "b", base: "📁 _home – docs (notes)", path: "_grafo/b" }], 16);
  assert.deepEqual([...m.values()], ["📁work·docs", "📁home·docs"]);
});

test("a label property always wins", () => {
  const m = T.shortLabels([{ key: "a", base: "whatever-long-name-here", path: "x", own: "Mine" }], 16);
  assert.equal(m.get("a"), "Mine");
});

test("topics: manual first, then folder, word and tag rules", () => {
  const settings = Object.assign({}, T.DEFAULTS, {
    topicsFolder: "Topics",
    topics: [
      { name: "Travel", rules: { folders: [], words: ["travel"], tags: [] } },
      { name: "Events", rules: { folders: ["events"], words: [], tags: ["fair"] } },
    ],
    assignments: { "notes/x.md": ["Events"] },
  });
  const files = [
    { path: "notes/x.md", basename: "x", tags: [] },
    { path: "research/travel-tips.md", basename: "travel-tips", tags: [] },
    { path: "events/2027.md", basename: "2027", tags: [] },
    { path: "notes/market.md", basename: "market", tags: ["#fair/barcelona"] },
    { path: "notes/travelish.md", basename: "travelish", tags: [] },
    { path: "Topics/✈️ Travel.md", basename: "✈️ Travel", tags: [] },
    { path: "notes/GATES.md", basename: "GATES", tags: [] },
  ];
  const a = T.assignTopics(files, settings);
  assert.deepEqual(a.get("notes/x.md"), ["Events"]);
  assert.deepEqual(a.get("research/travel-tips.md"), ["Travel"]);
  assert.deepEqual(a.get("events/2027.md"), ["Events"]);
  assert.deepEqual(a.get("notes/market.md"), ["Events"]);
  assert.equal(a.has("notes/travelish.md"), false, "a word matches whole words only");
  assert.equal(a.has("Topics/✈️ Travel.md"), false, "hub notes are never assigned");
  assert.equal(a.has("notes/GATES.md"), false, "hidden notes are never assigned");
});

test("hide query folds fully hidden folders into one term", () => {
  const all = ["a/1.md", "a/2.md", "b/1.md", "b/2.md"];
  const q = T.hideQuery(all, new Set(["a/1.md", "a/2.md", "b/1.md"]), ["GATES*"]);
  assert.equal(q, '-path:"a/" -path:"b/1.md" -file:"GATES"');
});

test("hub notes carry the mark and link every note", () => {
  const t = T.makeT("en");
  const body = T.hubBody({ name: "Travel", emoji: "✈️" }, ["research/b.md", "a.md"], t);
  assert.ok(body.startsWith("---\nadhd-hyperfocus-graph: topic\n---"));
  assert.ok(body.includes("- [[a|a]]") && body.includes("- [[research/b|b]]"));
});

test("every palette color is readable on its background (3:1 or more)", () => {
  const bg = { dark: ["#1e1e1e", "#282a36", "#191a21"], light: ["#ffffff", "#f6f6f6", "#ede9da", "#fffbeb"] }; // Obsidian default, Dracula and Minimal Dracula
  for (const [name, p] of Object.entries(T.PALETTES)) for (const mode of ["dark", "light"]) for (const c of p[mode]) for (const b of bg[mode]) {
    assert.ok(T.contrast(c, b) >= 3, `${name} ${mode} ${c} on ${b}: ${T.contrast(c, b).toFixed(2)}`);
  }
});

test("both languages have every string", () => {
  for (const k of Object.keys(T.STRINGS.en)) assert.ok(T.STRINGS.es[k] !== undefined, k);
});

test("color groups: one per topic, hub and its notes together", () => {
  const g = T.colorGroups([{ name: "Travel", emoji: "✈️" }], "Topics", new Map([["Travel", ["research/a.md"]]]), [], T.PALETTES.vivid.dark);
  assert.equal(g.length, 1);
  assert.equal(g[0].query, 'path:"Topics/✈️ Travel.md" OR path:"research/a.md"');
});

test("color groups fall back to folders when there are no topics", () => {
  const g = T.colorGroups([], "Topics", new Map(), ["notas/autores", "notas/libros"], T.PALETTES.calm.light);
  assert.deepEqual(g.map((x) => x.query), ['path:"notas/autores/"', 'path:"notas/libros/"']);
});

test("a cut that falls between two words keeps the last word", () => {
  assert.equal(T.cut("my reading list for june", 16), "my reading list…");
});

test("bigger graphs need a closer zoom before every note is labelled", () => {
  assert.ok(T.farZoom(100) < T.farZoom(350) && T.farZoom(350) < T.farZoom(3000));
  assert.equal(T.farZoom(3000), 0.6);
  assert.equal(T.farZoom(10), 0.25);
});

test("main nodes: topic hubs, or the most connected nodes when there are no topics", () => {
  const node = (id, links) => ({ id, forward: Object.fromEntries(Array.from({ length: links }, (_, i) => [id + i, 1])), reverse: {} });
  const nodes = [node("Topics/A.md", 1), node("a.md", 9), node("b.md", 2), node("c.md", 5)];
  assert.deepEqual([...T.mainNodes(nodes, "Topics/", true)], ["Topics/A.md"]);
  assert.deepEqual([...T.mainNodes(nodes, "Topics/", false)], ["a.md", "c.md"]);
});

test("declutter keeps the most important of two labels that would overlap", () => {
  const nodes = [{ id: "big", x: 0, y: 0 }, { id: "near", x: 50, y: 5 }, { id: "far", x: 2000, y: 0 }];
  assert.deepEqual([...T.declutter(new Set(["big", "near", "far"]), nodes, 0.1)], ["big", "far"]);
  assert.deepEqual([...T.declutter(new Set(["big", "near", "far"]), nodes, 5)], ["big", "near", "far"]);
});
