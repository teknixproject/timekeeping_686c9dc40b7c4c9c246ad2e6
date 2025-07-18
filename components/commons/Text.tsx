import _ from 'lodash';
import { CSSProperties, useMemo } from 'react';
import styled from 'styled-components';

import { useActions } from '@/hooks/useActions';
import { useHandleData } from '@/hooks/useHandleData';
import { GridItem } from '@/types/gridItem';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { StyleBox } from './StyleBox';

interface TextProps {
  data: GridItem;
  style?: CSSProperties;
}

const Text = ({ data, style }: TextProps) => {
  const { dataState } = useHandleData({ dataProp: data.data });
  const isCombineText = _.get(data, 'data.type') === 'combineText';
  const { handleAction } = useActions();
  const newStyle: CSSProperties = {
    ...style,
  };

  const tooltip = useMemo(() => {
    return data?.tooltip;
  }, [data]);

  const content = isCombineText ? (
    <TextComplex texts={dataState} style={style} />
  ) : (
    <StyleBox as={'p'} style={newStyle} styledComponentCss={data?.styledComponentCss}>
      {_.isObject(dataState) ? JSON.stringify(dataState || 'Text') : dataState || 'Text'}
    </StyleBox>
  );

  if (_.isEmpty(tooltip?.title)) return content;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent style={tooltip?.style}>
          <p onClick={() => handleAction('onClick')}>{tooltip?.title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const TextComplex = ({
  texts,
  style,
}: {
  texts: { text: string; style: CSSProperties & { textGradient?: string } }[];
  style: any;
}) => {
  return (
    <StyleBox
      style={{
        display: 'inline',
        ...style,
      }}
    >
      {texts?.map((item, index) => {
        return (
          <CsStrong
            as={'span'}
            gradient={item.style.textGradient}
            key={index}
            style={{
              display: 'inline',
              ...item.style,
            }}
          >
            {item.text}
          </CsStrong>
        );
      })}
    </StyleBox>
  );
};

const CsStrong = styled.strong<{ gradient?: string }>`
  ${(props) =>
    props.gradient
      ? `
      background: linear-gradient(${props.gradient});
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    `
      : ''}
`;
export default Text;
