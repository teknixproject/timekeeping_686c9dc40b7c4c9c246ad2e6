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
  sidebarLayout: layoutDataType;
  sidebarPosition: string;
  footerLayout: layoutDataType;
  setHeaderLayout: (layout: layoutDataType) => void;
  setSidebarLayout: (layout: layoutDataType) => void;
  setFooterLayout: (layout: layoutDataType) => void;
  setSidebarPosition: (value: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [headerLayout, setHeaderLayout] = useState<layoutDataType>({
    layoutJson: null,
    _id: '',
  });
  const [sidebarLayout, setSidebarLayout] = useState<layoutDataType>({
    layoutJson: null,
    _id: '',
  });
  const [footerLayout, setFooterLayout] = useState<layoutDataType>({
    layoutJson: null,
    _id: '',
  });
  const [sidebarPosition, setSidebarPosition] = useState<string>('top');

  return (
    <LayoutContext.Provider
      value={{
        headerLayout,
        sidebarLayout,
        footerLayout,
        sidebarPosition,
        setHeaderLayout,
        setSidebarLayout,
        setFooterLayout,
        setSidebarPosition,
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
