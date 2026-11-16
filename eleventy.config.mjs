import Image from "@11ty/eleventy-img";
import { HtmlBasePlugin } from "@11ty/eleventy";
import yaml from "js-yaml";
import fs from "node:fs";
import path from "node:path";

// "/" on a custom domain; "/repo-name/" on a github.io project URL.
const PREFIX = (process.env.PATH_PREFIX || "/").replace(/\/?$/, "/");

const load = (f) => {
  const p = path.join("content", f);
  if (!fs.existsSync(p)) throw new Error(`Missing content file: ${p}`);
  return yaml.load(fs.readFileSync(p, "utf8")) || {};
};

// Resolve a CMS image path ("/images/art/x.jpg") to the source file; fail the build loudly if missing.
const src = (p) => {
  const file = path.join("src", p.replace(/^\//, ""));
  if (!fs.existsSync(file)) throw new Error(`Image not found: ${p} (expected at ${file})`);
  return file;
};

async function variants(p, widths) {
  return Image(src(p), {
    widths, formats: ["webp"], outputDir: "_site/img/", urlPath: "/img/",
    sharpWebpOptions: { quality: 82 }, sharpJpegOptions: { quality: 82, mozjpeg: true },
  });
}

export default function (cfg) {
  cfg.addGlobalData("site", () => load("settings.yml"));
  cfg.addGlobalData("art", () => load("art.yml"));
  cfg.addGlobalData("architecture", () => load("architecture.yml"));
  cfg.addGlobalData("about", () => load("about.yml"));
  cfg.addGlobalData("contact", () => load("contact.yml"));

  cfg.addPlugin(HtmlBasePlugin);
  cfg.addPassthroughCopy({ "src/assets": "assets" });
  cfg.addWatchTarget("content/");

  // Gallery tile (href/src/srcset get the path prefix from HtmlBasePlugin; data-* and inline styles don't, so prefix those here): square crop thumbnail + full-size URL for the lightbox.
  cfg.addAsyncShortcode("tile", async (p, alt, sizes) => {
    const m = await variants(p, [500, 900, 2000]);
    const w = m.webp;
    const full = w[w.length - 1];
    const srcset = (arr) => { const s = arr.filter((x) => x.width <= 900); return (s.length ? s : [arr[0]]).map((x) => x.srcset).join(", "); };
    return `<a class="tile" href="${full.url}" data-full="${PREFIX}${full.url.slice(1)}" data-w="${full.width}" data-h="${full.height}">` +
      `<img src="${w[0].url}" srcset="${srcset(w)}" sizes="${sizes}" alt="${alt.replace(/"/g, "&quot;")}" loading="lazy" decoding="async"></a>`;
  });

  cfg.addAsyncShortcode("bg", async (p) => {
    const m = await variants(p, [1200, 2000]);
    return PREFIX + m.webp[m.webp.length - 1].url.slice(1); // inline style isn't rewritten by HtmlBasePlugin
  });

  return { pathPrefix: PREFIX, dir: { input: "src", output: "_site", includes: "_includes" }, templateFormats: ["njk"] };
}
