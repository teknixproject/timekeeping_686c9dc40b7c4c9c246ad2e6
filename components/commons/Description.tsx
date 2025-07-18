import { CSSProperties } from 'react';

import { useActions } from '@/hooks/useActions';
import { useHandleData } from '@/hooks/useHandleData';

import { StyleBox } from './StyleBox';

interface DescriptionProps {
  data?: any;
  style?: CSSProperties;
}

const Description = ({ data, style }: DescriptionProps) => {
  const { dataState } = useHandleData({ dataProp: data?.data });

  const { handleAction } = useActions();
  return (
    <StyleBox
      as={'p'}
      style={style}
      styledComponentCss={data?.styledComponentCss}
      onClick={() => handleAction('onClick')}
      onChange={() => handleAction('onChange')}
    >
      {dataState}
    </StyleBox>
  );
};

export default Description;
