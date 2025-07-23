'use client';

import _ from 'lodash';
import dynamic from 'next/dynamic';
import { FC, useEffect, useMemo, useRef, useState } from 'react';

import { useInitStatePreview, useInitStateRender } from '@/hooks/useInitState';

const GridSystemContainer = dynamic(() => import('@/components/grid-systems'), {
  loading: () => <LoadingPage />,
  ssr: false,
});

const LoadingPage = dynamic(() => import('./loadingPage'), {
  ssr: false,
});

//#region RenderUIClient
export const RenderUIClient: FC = () => {
  const { deviceType, isLoading, selectedBodyLayout } = useInitStateRender();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="relative h-screen">
      {!_.isEmpty(selectedBodyLayout) && (
        <GridSystemContainer page={selectedBodyLayout} deviceType={deviceType} isBody />
      )}
    </div>
  );
};

//#region PreviewUI
export const PreviewUI: FC = () => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);

  // ALWAYS call hooks first, before any conditional logic
  const {
    deviceType,
    isLoading,
    selectedBodyLayout,
    selectedFooterLayout,
    selectedHeaderLayout,
    selectedSidebarLayout,
    sidebarPosition,
    // customWidgetName,
    isPage,
  } = useInitStatePreview();

  // useEffect must also be called consistently
  useEffect(() => {
    if (!headerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeaderHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(headerRef.current);

    // Set initial height
    setHeaderHeight(headerRef.current.offsetHeight);

    return () => resizeObserver.disconnect();
  }, [selectedHeaderLayout]);

  const sidebarStyle = useMemo(() => ({
    flexShrink: 0,
    position: 'sticky' as const,
    top: `${headerHeight}px`,
    zIndex: 10,
    maxHeight: `calc(100vh - ${headerHeight}px)`,
    overflow: 'hidden',
  }), [headerHeight]);

  const isSidebarLeft = sidebarPosition === 'left';
  const isSidebarRight = sidebarPosition === 'right';

  // Conditional rendering AFTER all hooks have been called
  if (isLoading) {
    return <LoadingPage />;
  }

  if (!selectedBodyLayout && !isPage) {
    return <></>;
  }

  console.log('selectedHeaderLayout', {
    selectedHeaderLayout,
    selectedSidebarLayout,
    selectedBodyLayout,
    selectedFooterLayout
  });


  return (
    <div className="relative !z-0 h-screen">
      {!_.isEmpty(selectedHeaderLayout) && (
        <div id="header" ref={headerRef} className="sticky top-0 z-10 max-h-screen overflow-hidden">
          <GridSystemContainer
            page={selectedHeaderLayout}
            deviceType={deviceType}
            isFooter
            style={{ width: '100%' }}
          />
        </div>
      )}
      <div className="z-10 flex">
        {isSidebarLeft && !_.isEmpty(selectedSidebarLayout) && (
          <div id="sidebar" style={{ ...sidebarStyle }} className="sticky top-0 z-10 max-h-screen overflow-hidden">
            <GridSystemContainer
              page={selectedSidebarLayout}
              deviceType={deviceType}
              isHeader
            />
          </div>
        )}
        <main style={{ flex: 1, overflow: 'hidden' }}>
          {/* {!_.isEmpty(selectedBodyLayout) ? (
            <GridSystemContainer page={selectedBodyLayout || {}} deviceType={deviceType} isBody />
          ) : (
            <div className="h-[300px]" />
          )} */}
          <div className="relative h-screen">
            {!_.isEmpty(selectedBodyLayout) && (
              <GridSystemContainer page={selectedBodyLayout} deviceType={deviceType} isBody />
            )}
          </div>
        </main>
        {isSidebarRight && !_.isEmpty(selectedSidebarLayout) && (
          <div id="sidebar" style={{ ...sidebarStyle }} className="sticky top-0 z-10 max-h-screen overflow-hidden">
            <GridSystemContainer
              page={selectedSidebarLayout}
              deviceType={deviceType}
              isHeader
            />
          </div>
        )}
      </div>
      {!_.isEmpty(selectedFooterLayout) && (
        <GridSystemContainer
          page={selectedFooterLayout}
          deviceType={deviceType}
          isFooter
          style={{ width: '100%' }}
        />
      )}
    </div>
  );
};