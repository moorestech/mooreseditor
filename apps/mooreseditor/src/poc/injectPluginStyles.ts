/**
 * injectPluginStyles
 *
 * Phase 3 PoC / Task 6 implementation seed — Step 3 (CSS dynamic injection).
 *
 * A plugin manifest may declare a `styles` field: a list of CSS files the
 * plugin needs. Because plugins are loaded at runtime (raw dynamic import,
 * not bundled into the host), their CSS cannot be statically linked from
 * `index.html`. Instead the host reads `styles` and injects one
 * `<link rel="stylesheet">` element per entry into `<head>`.
 *
 * This is the reusable injection primitive. The PoC verification
 * (`verifyStyleInjection.ts`) drives it against `poc-plugin.json` to confirm
 * that xyflow's stylesheet actually reaches `document.styleSheets` and that
 * real `.react-flow` rules become available to the page.
 *
 * Kept deliberately minimal (PoC quality):
 *  - de-dupes by resolved href so re-injecting the same manifest is a no-op
 *  - resolves the returned promise once every link has loaded (or errored)
 */

/** Minimal shape of the manifest fields this primitive cares about. */
export interface StyleManifest {
  /** CSS files (URLs relative to the document, or absolute) to inject. */
  styles?: string[];
}

const INJECTED_ATTR = "data-plugin-style";

/**
 * Inject every stylesheet declared by `manifest.styles` as a `<link>` in
 * `<head>`. Returns a promise that settles once all links have finished
 * loading. Already-injected hrefs are skipped.
 *
 * @param manifest  Object with an optional `styles` string array.
 * @param doc       Document to inject into (defaults to the global document).
 */
export function injectPluginStyles(
  manifest: StyleManifest,
  doc: Document = document,
): Promise<void> {
  const styles = manifest.styles ?? [];
  if (styles.length === 0) {
    return Promise.resolve();
  }

  const pending: Promise<void>[] = [];

  for (const href of styles) {
    // Resolve against the document so de-dup compares absolute URLs.
    const resolved = new URL(href, doc.baseURI).href;

    const already = doc.querySelector(
      `link[${INJECTED_ATTR}][href="${resolved}"]`,
    );
    if (already) {
      continue;
    }

    const link = doc.createElement("link");
    link.rel = "stylesheet";
    link.href = resolved;
    link.setAttribute(INJECTED_ATTR, "");

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

  return Promise.all(pending).then(() => undefined);
}
