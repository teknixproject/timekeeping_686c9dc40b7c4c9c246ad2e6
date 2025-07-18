import _ from 'lodash';
import React from 'react';

import { getDeviceSize } from '@/lib/utils';
import { GridItem } from '@/types/gridItem';

import { RenderSlice } from '../grid-systems';
import { StyleBox } from './StyleBox';

type Props = {
  data: GridItem;
};

const Box: React.FC<Props> = ({ data }) => {
  const styleDevice: string = getDeviceSize() as string;
  const styleSlice = (_.get(data, [styleDevice]) as React.CSSProperties) || data?.style;
  return (
    <StyleBox style={styleSlice}>
      {data?.childs?.map((item) => (
        <RenderSlice idParent={''} slice={item} key={item.id} />
      ))}
    </StyleBox>
  );
};

export default Box;
