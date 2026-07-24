/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DESIGNS, DEFAULT_DESIGN_ID } from './index';
import type { DesignDefinition } from './types';

interface DesignContextValue {
  design: DesignDefinition;
  designId: string;
  setDesignId: (id: string) => void;
}

const STORAGE_KEY = 'gamers-union-design';

const DesignContext = createContext<DesignContextValue | null>(null);

export function DesignProvider({ children }: { children: ReactNode }) {
  const [designId, setDesignIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return DESIGNS.some((d) => d.id === saved) ? (saved as string) : DEFAULT_DESIGN_ID;
  });

  const value = useMemo<DesignContextValue>(() => {
    const design = DESIGNS.find((d) => d.id === designId) ?? DESIGNS[0];
    return {
      design,
      designId: design.id,
      setDesignId: (id: string) => {
        if (DESIGNS.some((d) => d.id === id)) {
          localStorage.setItem(STORAGE_KEY, id);
          setDesignIdState(id);
        }
      },
    };
  }, [designId]);

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesign() {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error('useDesign must be used within DesignProvider');
  return ctx;
}
