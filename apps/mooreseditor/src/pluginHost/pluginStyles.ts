function findPluginStyleLink(
  pluginId: string,
  href: string,
): HTMLLinkElement | null {
  for (const node of document.querySelectorAll<HTMLLinkElement>(
    "link[data-plugin-style='true']",
  )) {
    if (node.dataset.pluginId === pluginId && node.href === href) {
      return node;
    }
  }
  return null;
}

export function injectPluginStyleLink(pluginId: string, href: string): void {
  if (findPluginStyleLink(pluginId, href)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.pluginId = pluginId;
  link.dataset.pluginStyle = "true";
  document.head.appendChild(link);
}

export function removePluginStyleLinks(pluginId: string): void {
  for (const node of document.querySelectorAll<HTMLLinkElement>(
    "link[data-plugin-style='true']",
  )) {
    if (node.dataset.pluginId === pluginId) {
      node.remove();
    }
  }
}
