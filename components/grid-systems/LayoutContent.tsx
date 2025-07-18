'use client';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

import { useLayoutContext } from '@/context/LayoutContext';
import { getDeviceType } from '@/lib/utils';

import LoadingPage from './loadingPage';

const GridSystemContainer = dynamic(() => import('@/components/grid-systems'), {
  loading: () => <LoadingPage />,
  ssr: false,
});

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { headerLayout, footerLayout, headerPosition } = useLayoutContext();
  const [deviceType, setDeviceType] = useState(getDeviceType());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setDeviceType(getDeviceType());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedHeaderLayout = useMemo(
    () =>
      (headerLayout?.layoutJson && (headerLayout?.layoutJson as any)[deviceType]) ??
      headerLayout?.layoutJson ??
      {},
    [headerLayout, deviceType]
  );
  const selectedFooterLayout = useMemo(
    () =>
      (footerLayout?.layoutJson && (footerLayout?.layoutJson as Record<string, any>)[deviceType]) ??
      footerLayout?.layoutJson ??
      {},
    [footerLayout, deviceType]
  );

  const containerStyle = useMemo(() => {
    if (headerPosition === 'left' || headerPosition === 'right') {
      return {
        display: 'flex',
      };
    }
    return {
      display: 'flex',
    };
  }, [headerPosition]);

  return (
    <div className="relative !z-0">
      <div className="z-10" style={containerStyle as any}>
        <div className="sticky top-0 z-10 max-h-screen overflow-hidden">
          {!_.isEmpty(selectedHeaderLayout) && (
            <GridSystemContainer
              page={selectedHeaderLayout}
              deviceType={deviceType}
              isHeader
              style={{
                flexShrink: 0,
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            />
          )}
        </div>
        <main style={{ flex: 1, overflow: 'hidden' }}>{children}</main>
      </div>
      {
        !_.isEmpty(selectedFooterLayout) && (
          <GridSystemContainer
            page={selectedFooterLayout}
            deviceType={deviceType}
            isFooter
            style={{ width: '100%' }}
          />
        )
      }
    </div >
  );
}