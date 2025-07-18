'use client';

import _ from 'lodash';
import { CSSProperties, useMemo } from 'react';

import { useActions } from '@/hooks/useActions';
import { GridItem } from '@/types/gridItem';

import { StyleBox } from './StyleBox';

interface BackgroundCompoProps {
  data?: GridItem;
  style?: CSSProperties;
}

const BackgroundCompo = ({ data, style }: BackgroundCompoProps) => {
  const defaultUrl = '/default-bg.png';
  const url = data?.dataSlice?.url || defaultUrl;
  const { handleAction } = useActions();

  const computedStyle: CSSProperties = useMemo(
    () => ({
      ...style,
      inset: 0,
      objectFit: _.get(style, 'objectFit') || 'fill',
      height: '100%',
    }),
    [style]
  );

  return (
    <>
      {url ? (
        url.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i) ? (
          <StyleBox
            as={'img'}
            style={computedStyle}
            src={url}
            alt="Preview"
            className="w-full"
            styledComponentCss={data?.styledComponentCss}
            onClick={() => handleAction('onClick')}
            onChange={() => handleAction('onChange')}
          />
        ) : url.match(/\.(mp4|mov|avi|mkv|webm)$/i) ? (
          <StyleBox
            as={'video'}
            style={computedStyle}
            autoPlay
            loop
            muted
            playsInline
            className="w-full aspect-video"
            src={url}
            preload="metadata"
            styledComponentCss={data?.styledComponentCss}
            onClick={() => handleAction('onClick')}
            onChange={() => handleAction('onChange')}
          >
            <source src={`${url}.webm`} type="video/webm" />
            <source src={url} type="video/mp4" />
          </StyleBox>
        ) : (
          <p>Unsupported media type</p>
        )
      ) : null}
    </>
  );
};

export default BackgroundCompo;
