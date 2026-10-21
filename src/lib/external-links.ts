import type { HastPluginDefinition } from 'satteri';

const EXTERNAL_HREF_PATTERN = /^https?:\/\//;

const isExternalHref = (href: unknown): boolean =>
  typeof href === 'string' && EXTERNAL_HREF_PATTERN.test(href);

export const externalLinksPlugin: HastPluginDefinition = {
  name: 'external-links',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      if (!isExternalHref(node.properties?.href)) return;
      ctx.setProperty(node, 'target', '_blank');
      ctx.setProperty(node, 'rel', ['noopener', 'noreferrer']);
    },
  },
};
