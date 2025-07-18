/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import _ from 'lodash';
import { usePathname } from 'next/navigation';
import React, { FC, memo, useCallback, useMemo } from 'react';

import { useActions } from '@/hooks/useActions';
import { useDynamicGenerate } from '@/hooks/useDynamicGenerate';
import { useHandleProps } from '@/hooks/useHandleProps';
import { cn, getDeviceSize } from '@/lib/utils';
import { GridItem } from '@/types/gridItem';
import { useQuery } from '@tanstack/react-query';

import { componentRegistry } from '../commons';
import LoadingPage from './loadingPage';
import RenderSliceItem from './RenderSliceItem';
import { GridSystemProps } from './types';

const componentHasAction = ['pagination', 'button', 'input_text'];
const componentHasMenu = ['dropdown'];
const allowUpdateTitle = ['content'];

type TRenderSlice = {
  slice: GridItem | null | undefined;
  idParent?: string;
  isMenu?: boolean;
};

// Define common props interface that all components should accept
interface ComponentProps {
  id?: string;
  style?: React.CSSProperties;
  data?: GridItem;
  childs?: GridItem[];
  styleDevice?: string;
  pathname?: string;
  className?: string;
  [key: string]: any; // Allow additional props
}

export const RenderSlice: React.FC<TRenderSlice> = memo(
  ({ slice: sliceProp, idParent, isMenu }) => {
    const pathname = usePathname();

    const { dynamicData: slice, loading } = useDynamicGenerate({ data: sliceProp! });

    const { handleAction } = useActions(slice);
    const { multiples } = useHandleProps({ actionsProp: slice?.props });

    const onPageLoad = useMemo(() => slice?.actions?.onPageLoad, [slice?.actions]);

    const queryFn = useCallback(async () => {
      if (!handleAction) return true;
      try {
        await handleAction('onPageLoad');
        return true;
      } catch (error) {
        console.error('Error in onPageLoad action:', error);
        throw error;
      }
    }, [handleAction]);

    const { isLoading, error } = useQuery({
      queryKey: ['onPageLoad', slice?.id],
      queryFn,
      enabled: !!onPageLoad && !!handleAction,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retryDelay: 1000,
    });
    const key = useMemo(() => {
      if (!slice?.id) return null;
      const componentKey = slice.id.split('$')[0];
      return _.upperFirst(componentKey);
    }, [slice?.id]);

    const SliceComponent = useMemo(() => {
      if (!key) return null;
      const component = componentRegistry[key as keyof typeof componentRegistry];
      return component;
    }, [key]);
    // Early return if slice is null/undefined
    if (!sliceProp) {
      console.warn('RenderSlice: slice is null or undefined');
      return null;
    }

    // Handle loading state from useDynamicGenerate
    if (loading) {
      return <LoadingPage />;
    }

    // Early return if dynamic generation failed
    if (!slice) {
      console.warn('RenderSlice: dynamic generation returned null');
      return null;
    }
    // Handle query error
    if (error) {
      console.error(`Error loading slice ${slice?.id}:`, error);
      return null;
    }

    // Enhanced error handling
    if (!key) {
      console.warn(`RenderSlice: Invalid slice id for slice:`, slice);
      return null;
    }

    if (!SliceComponent) {
      console.warn(`Component "${key}" not found in componentRegistry`);
      return null;
    }

    const styleDevice: string = getDeviceSize() as string;

    const styleSlice = (_.get(slice, [styleDevice]) as React.CSSProperties) || slice?.style;

    if (isLoading) return <LoadingPage />;

    // Prepare props more carefully
    const componentProps: ComponentProps = {
      id: slice?.id || '',
      style: styleSlice,
      data: slice,
      childs: slice?.childs,
      styleDevice,
      pathname,
      idParent,
      isMenu,
      // Spread multiples safely
      ...(multiples && typeof multiples === 'object' ? multiples : {}),
    };

    // Filter out undefined/null values to avoid prop warnings
    const cleanProps = Object.entries(componentProps).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    try {
      return React.createElement(SliceComponent, cleanProps);
    } catch (renderError) {
      console.error(`Error rendering component "${key}":`, renderError);
      console.error('Props passed:', cleanProps);
      return null;
    }
  }
);
RenderSlice.displayName = 'RenderSlice';
//#region Grid System
const GridSystemContainer: FC<GridSystemProps> = ({
  page,
  isBody,
  isFooter,
  style,
}) => {
  const { isLoading } = useActions(page);

  if (isLoading) return <LoadingPage />;

  return (
    <div
      className={cn('relative', isBody ? 'z-1 min-h-screen' : '', isFooter ? 'z-3' : '')}
      style={{ ...page?.componentProps?.styleMultiple?.normal, ...style }}
    >
      {page?.childs?.map((item) => (
        <RenderSliceItem data={item} key={item.id} />
      ))}
    </div>
  );
};

export default GridSystemContainer;
