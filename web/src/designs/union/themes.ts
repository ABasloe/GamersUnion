import type { CSSProperties } from 'react';

/**
 * Union themes. Every theme fills the same slots — ground/surface/raised/line
 * for structure, text/muted/faint for type, heat (community) and you
 * (personal) for the two meaning-bearing accents. No browns, no purple-blue.
 */
export interface Theme {
  id: string;
  label: string;
  blurb: string;
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    id: 'graphite',
    label: 'Graphite',
    blurb: 'neutral dark',
    vars: {
      '--gu-ground': '#131414',
      '--gu-surface': '#1a1c1b',
      '--gu-raised': '#212423',
      '--gu-line': '#2f332f',
      '--gu-text': '#e2e4e0',
      '--gu-muted': '#8e938d',
      '--gu-faint': '#6b706a',
      '--gu-heat': '#c94f45',
      '--gu-you': '#96b285',
      '--gu-danger': '#b5484d',
    },
  },
  {
    id: 'pine',
    label: 'Pine',
    blurb: 'deep green dark',
    vars: {
      '--gu-ground': '#0e1411',
      '--gu-surface': '#141b17',
      '--gu-raised': '#1a231e',
      '--gu-line': '#27332c',
      '--gu-text': '#dbe3dd',
      '--gu-muted': '#82948a',
      '--gu-faint': '#62736a',
      '--gu-heat': '#c9564c',
      '--gu-you': '#a3c489',
      '--gu-danger': '#b5484d',
    },
  },
  {
    id: 'void',
    label: 'Void',
    blurb: 'near black',
    vars: {
      '--gu-ground': '#0b0b0c',
      '--gu-surface': '#121214',
      '--gu-raised': '#19191c',
      '--gu-line': '#29292e',
      '--gu-text': '#e5e5e8',
      '--gu-muted': '#8f8f96',
      '--gu-faint': '#6a6a71',
      '--gu-heat': '#d84f46',
      '--gu-you': '#9db88a',
      '--gu-danger': '#c04a55',
    },
  },
  {
    id: 'porcelain',
    label: 'Porcelain',
    blurb: 'cool light',
    vars: {
      '--gu-ground': '#eff1ef',
      '--gu-surface': '#f8f9f8',
      '--gu-raised': '#e4e8e4',
      '--gu-line': '#c5cbc5',
      '--gu-text': '#24282b',
      '--gu-muted': '#666d67',
      '--gu-faint': '#8b918b',
      '--gu-heat': '#a83a32',
      '--gu-you': '#46703f',
      '--gu-danger': '#99323c',
    },
  },
];

const STORAGE_KEY = 'gu-theme';

export function loadThemeId(): string {
  const saved = localStorage.getItem(STORAGE_KEY);
  return THEMES.some((t) => t.id === saved) ? (saved as string) : THEMES[0].id;
}

export function saveThemeId(id: string) {
  localStorage.setItem(STORAGE_KEY, id);
}

export function themeStyle(id: string): CSSProperties {
  const theme = THEMES.find((t) => t.id === id) ?? THEMES[0];
  return theme.vars as CSSProperties;
}
