'use client';

import _ from 'lodash';
import dynamic from 'next/dynamic';
import { FC } from 'react';

import { useInitStatePreview, useInitStateRender } from '@/hooks/useInitState';

import DynamicComponent from './preview-ui';

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
    <div className="relative">
      {!_.isEmpty(selectedBodyLayout) && (
        <GridSystemContainer page={selectedBodyLayout} deviceType={deviceType} isBody />
      )}
    </div>
  );
};
//#region PreviewUI
export const PreviewUI: FC = () => {
  const {
    deviceType,
    isLoading,
    selectedBodyLayout,
    selectedFooterLayout,
    selectedHeaderLayout,
    customWidgetName,
    isPage,
  } = useInitStatePreview();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!selectedBodyLayout && !isPage) {
    return <></>;
  }
  return (
    <div className="component-preview-container">
      {isPage && !customWidgetName ? (
        <div className="relative flex flex-col min-h-screen">
          {!_.isEmpty(selectedHeaderLayout) && (
            <GridSystemContainer
              page={selectedHeaderLayout || {}}
              deviceType={deviceType}
              isHeader
            />
          )}

          {!_.isEmpty(selectedBodyLayout) ? (
            <GridSystemContainer page={selectedBodyLayout || {}} deviceType={deviceType} isBody />
          ) : (
            <div className="h-[300px]" />
          )}

          {!_.isEmpty(selectedFooterLayout) && (
            <GridSystemContainer
              page={selectedFooterLayout || {}}
              deviceType={deviceType}
              isFooter
            />
          )}
        </div>
      ) : (
        <DynamicComponent customWidgetName={customWidgetName} />
      )}
    </div>
  );
};
