// context/LayoutContext.tsx
'use client';
import { createContext, useContext, useState } from 'react';
import { GridItem } from '@/types/gridItem';

interface layoutDataType {
  layoutJson?: GridItem | null;
  _id?: string;
  [key: string]: unknown;
}
interface LayoutContextType {
  headerLayout: layoutDataType;
  headerPosition: string;
  footerLayout: layoutDataType;
  setHeaderLayout: (layout: layoutDataType) => void;
  setFooterLayout: (layout: layoutDataType) => void;
  setHeaderPosition: (value: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [headerLayout, setHeaderLayout] = useState<layoutDataType>({
    layoutJson: null,
    _id: '',
  });
  const [footerLayout, setFooterLayout] = useState<layoutDataType>({
    layoutJson: null,
    _id: '',
  });
  const [headerPosition, setHeaderPosition] = useState<string>('top');

  return (
    <LayoutContext.Provider
      value={{
        headerLayout,
        footerLayout,
        headerPosition,
        setHeaderLayout,
        setFooterLayout,
        setHeaderPosition,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) throw new Error('useLayoutContext must be used within a LayoutProvider');
  return context;
};
