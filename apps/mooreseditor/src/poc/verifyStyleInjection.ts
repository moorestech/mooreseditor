/**
 * verifyStyleInjection
 *
 * Phase 3 PoC — Step 3 verification (CSS dynamic injection).
 *
 * Reproducible check that the `styles` field of a plugin manifest results in
 * working CSS on the page. Steps:
 *
 *  1. Fetch `poc-plugin.json` (the PoC manifest with a `styles` field).
 *  2. Hand its `styles` to `injectPluginStyles`, which appends one
 *     `<link rel="stylesheet">` per entry to `<head>`.
 *  3. Scan `document.styleSheets` for a CSS rule whose selector mentions
 *     `.react-flow` — proof that xyflow's stylesheet was actually parsed and
 *     applied (the manifest's CSS `@import`s `@xyflow/react/dist/style.css`).
 *
 * How to run (dev server must be up — `pnpm run dev`):
 *
 *   In a browser console at http://localhost:1420/ :
 *     const { verifyStyleInjection } = await import(
 *       "/src/poc/verifyStyleInjection.ts"
 *     );
 *     console.log(await verifyStyleInjection());
 *
 *   Or via Playwright `browser_evaluate` with the same import + call.
 *
 * A passing result looks like:
 *   { pass: true, injectedLinks: 1, reactFlowRuleCount: <n>, ... }
 */

import { injectPluginStyles } from "./injectPluginStyles";

import type { StyleManifest } from "./injectPluginStyles";

export interface StyleInjectionResult {
  /** True when at least one `.react-flow` CSS rule is live on the page. */
  pass: boolean;
  /** Number of `<link data-plugin-style>` elements present after injection. */
  injectedLinks: number;
  /** Count of CSS rules whose selector text mentions `.react-flow`. */
  reactFlowRuleCount: number;
  /** A sample of matched selectors, for eyeballing the evidence. */
  sampleSelectors: string[];
  /** Hrefs that were injected from the manifest. */
  injectedHrefs: string[];
}

/** URL of the committed PoC manifest, relative to the dev server root. */
const POC_MANIFEST_URL = "/src/poc/poc-plugin.json";

/** Count live CSS rules whose selector mentions `.react-flow`. */
function collectReactFlowRules(doc: Document): {
  count: number;
  samples: string[];
} {
  const samples: string[] = [];
  let count = 0;

  for (const sheet of Array.from(doc.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      // Cross-origin sheets throw on `cssRules` access — skip them.
      continue;
    }
    for (const rule of Array.from(rules)) {
      const selector = (rule as CSSStyleRule).selectorText;
      if (typeof selector === "string" && selector.includes(".react-flow")) {
        count += 1;
        if (samples.length < 5) {
          samples.push(selector);
        }
      }
    }
  }

  return { count, samples };
}

/**
 * Run the full Step 3 check and return structured evidence.
 *
 * @param doc  Document to operate on (defaults to the global document).
 */
export async function verifyStyleInjection(
  doc: Document = document,
): Promise<StyleInjectionResult> {
  const res = await fetch(POC_MANIFEST_URL);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch PoC manifest ${POC_MANIFEST_URL}: ${res.status}`,
    );
  }
  const manifest = (await res.json()) as StyleManifest;

  await injectPluginStyles(manifest, doc);

  const links = Array.from(
    doc.querySelectorAll<HTMLLinkElement>("link[data-plugin-style]"),
  );
  const { count, samples } = collectReactFlowRules(doc);

  return {
    pass: count > 0,
    injectedLinks: links.length,
    reactFlowRuleCount: count,
    sampleSelectors: samples,
    injectedHrefs: links.map((l) => l.href),
  };
}
