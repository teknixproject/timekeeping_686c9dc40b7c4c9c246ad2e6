import dynamic from 'next/dynamic';
import React from 'react';

// Empty fallback component
const EmptyComponent: React.FC<any> = () => null;

// Helper function to create safe dynamic imports
const createSafeDynamicImport = (importFn: () => Promise<any>, componentName: string) => {
  return dynamic(
    async () => {
      try {
        const cpn = await importFn();
        return cpn.default || cpn;
      } catch (error) {
        console.warn(`Failed to import component "${componentName}":`, error);
        return EmptyComponent;
      }
    },
    {
      ssr: false,
      loading: () => null, // No loading state for failed imports
    }
  );
};

export const components = {
  Background: createSafeDynamicImport(() => import('./Background'), 'Background'),
  BannerVideo: createSafeDynamicImport(() => import('./BannerVideo'), 'BannerVideo'),
  Button: createSafeDynamicImport(() => import('./Button'), 'Button'),
  Description: createSafeDynamicImport(() => import('./Description'), 'Description'),
  Pagination: createSafeDynamicImport(() => import('./Pagination'), 'Pagination'),
  Icon: createSafeDynamicImport(() => import('./Icon'), 'Icon'),
  Image: createSafeDynamicImport(() => import('./Image'), 'Image'),
  Link: createSafeDynamicImport(() => import('./Link'), 'Link'),
  Text: createSafeDynamicImport(() => import('./Text'), 'Text'),
  InputText: createSafeDynamicImport(() => import('./InputText'), 'InputText'),
  Navigation: createSafeDynamicImport(() => import('./Navigation'), 'Navigate'),
  Dropdown: createSafeDynamicImport(() => import('./Dropdown'), 'Dropdown'),
  Collapse: createSafeDynamicImport(() => import('./Collapse'), 'Collapse'),
  InputSearch: createSafeDynamicImport(() => import('./InputSearch'), 'InputSearch'),
  Tabs: createSafeDynamicImport(() => import('./Tabs'), 'Tabs'),
  Table: createSafeDynamicImport(() => import('./Table'), 'Table'),
  LoginForm: createSafeDynamicImport(() => import('./LoginForm'), 'LoginForm'),
  ListDrivers: createSafeDynamicImport(() => import('./ListDrivers'), 'ListDrivers'),
  Grid: createSafeDynamicImport(() => import('./Box'), 'Grid'),
  Flex: createSafeDynamicImport(() => import('./Box'), 'Flex'),
};

// Alternative approach: Component registry with runtime safety
export const componentRegistry = new Proxy(components, {
  get(target, prop: string) {
    const component = target[prop as keyof typeof target];
    if (!component) {
      console.warn(`Component "${prop}" not found in registry, returning empty component`);
      return EmptyComponent;
    }
    return component;
  },
});

// Export both for flexibility
export default components;
