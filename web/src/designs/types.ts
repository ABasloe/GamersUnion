import type { ComponentType } from 'react';

/**
 * Every design is a complete, self-contained website implementation: its own
 * layout, page components, and styling (Tailwind or CSS). Designs share only
 * the app store (useApp), the data catalog, and the route structure.
 */
export interface DesignPages {
  Layout: ComponentType; // must render react-router's <Outlet />
  Home: ComponentType;
  Browse: ComponentType;
  GameDetail: ComponentType;
  Library: ComponentType;
  Groups: ComponentType;
  GroupDetail: ComponentType;
  Profile: ComponentType;
}

export interface DesignDefinition {
  id: string;
  label: string;
  blurb: string;
  pages: DesignPages;
}
