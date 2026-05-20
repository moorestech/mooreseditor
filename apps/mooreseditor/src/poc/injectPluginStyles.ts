/**
 * injectPluginStyles
 *
 * Phase 3 PoC / Task 6 implementation seed — Step 3 (CSS dynamic injection).
 *
 * A plugin manifest may declare a `styles` field: a list of CSS files the
 * plugin needs. Because plugins are loaded at runtime (raw dynamic import,
 * not bundled into the host), their CSS cannot be statically linked from
 * `index.html`. Instead the host reads `styles`, fetches each CSS file, and
 * injects one `<link rel="stylesheet">` element per entry into `<head>`.
 *
 * Plugin CSS lives alongside the plugin under `plugins/` — NOT under the
 * host's `public/` dir (which would ship the file in every prod build).
 * So `styles` entries are paths the host resolves through the plugin file
 * system. This primitive fetches the CSS text via a caller-supplied
 * resolver (in the PoC, the `/api/plugin-fs/read` dev endpoint), wraps it in
 * a `Blob`, and points a `<link rel="stylesheet">` at the resulting object
 * URL. That keeps the realistic plugin-loading path (CSS comes from the
 * plugin's own dir) while still exercising real `<link>` injection.
 *
 * This is the reusable injection primitive. The PoC verification
 * (`verifyStyleInjection.ts`) drives it against `poc-plugin.json` to confirm
 * that xyflow's stylesheet actually reaches `document.styleSheets` and that
 * real `.react-flow` rules become available to the page.
 *
 * Kept deliberately minimal (PoC quality):
 *  - de-dupes by `styles` entry so re-injecting the same manifest is a no-op
 *  - resolves the returned promise once every link has loaded (or errored)
 */

/** Minimal shape of the manifest fields this primitive cares about. */
export interface StyleManifest {
  /**
   * CSS files the plugin needs. Each entry is an identifier the
   * `cssResolver` knows how to turn into raw CSS text (e.g. a path under
   * the plugin's directory served via `/api/plugin-fs/read`).
   */
  styles?: string[];
}

/**
 * Turns a `styles` entry into the raw CSS text of that file. In production
 * this is the plugin-fs / asset bridge; in the PoC it hits the dev endpoint
 * `/api/plugin-fs/read`.
 */
export type CssResolver = (styleEntry: string) => Promise<string>;

const INJECTED_ATTR = "data-plugin-style";
/** Records the original `styles` entry on the injected link, for de-dup. */
const SOURCE_ATTR = "data-plugin-style-src";

/**
 * Inject every stylesheet declared by `manifest.styles` as a `<link>` in
 * `<head>`. Each entry is resolved to CSS text via `cssResolver`, wrapped in
 * a `Blob`, and linked through an object URL. Returns a promise that settles
 * once all links have finished loading. Entries already injected (matched by
 * their original `styles` value) are skipped.
 *
 * @param manifest     Object with an optional `styles` string array.
 * @param cssResolver  Fetches raw CSS text for a `styles` entry.
 * @param doc          Document to inject into (defaults to global document).
 */
export async function injectPluginStyles(
  manifest: StyleManifest,
  cssResolver: CssResolver,
  doc: Document = document,
): Promise<void> {
  const styles = manifest.styles ?? [];
  if (styles.length === 0) {
    return;
  }

  const pending: Promise<void>[] = [];

  for (const styleEntry of styles) {
    const already = doc.querySelector(
      `link[${INJECTED_ATTR}][${SOURCE_ATTR}="${styleEntry}"]`,
    );
    if (already) {
      continue;
    }

    const css = await cssResolver(styleEntry);
    const blobUrl = URL.createObjectURL(new Blob([css], { type: "text/css" }));

    const link = doc.createElement("link");
    link.rel = "stylesheet";
    link.href = blobUrl;
    link.setAttribute(INJECTED_ATTR, "");
    link.setAttribute(SOURCE_ATTR, styleEntry);

    pending.push(
      new Promise<void>((resolve) => {
        link.addEventListener("load", () => resolve(), { once: true });
        // Resolve on error too: the PoC verification inspects
        // `document.styleSheets` afterwards and reports the real outcome.
        link.addEventListener("error", () => resolve(), { once: true });
      }),
    );

    doc.head.appendChild(link);
  }

  await Promise.all(pending);
}
