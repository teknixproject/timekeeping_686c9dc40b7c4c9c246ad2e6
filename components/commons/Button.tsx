'use client';

import { Button as ButtonAntd } from 'antd';
import { CSSProperties } from 'react';

import { useActions } from '@/hooks/useActions';
import { useHandleData } from '@/hooks/useHandleData';
import { GridItem } from '@/types/gridItem';

interface ButtonCompoProps {
  data?: GridItem;
  style?: CSSProperties;
}

const Button = ({ data, style }: ButtonCompoProps) => {
  const { handleAction } = useActions(data);
  const { dataState } = useHandleData({ dataProp: data?.data });

  return (
    <ButtonAntd
      onClick={() => handleAction('onClick')}
      className="cursor-pointer"
      style={style}
    // styledComponentCss={data?.styledComponentCss}
    >
      {dataState || 'Button 123'}
    </ButtonAntd>
  );
};

export default Button;
