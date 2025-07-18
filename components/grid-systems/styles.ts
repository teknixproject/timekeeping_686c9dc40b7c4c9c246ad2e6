import _ from 'lodash';
import styled, { css, CSSProperties } from 'styled-components';

interface StylesProps {
  style?: {
    hover?: CSSProperties;
    [key: string]: any;
  };
  'is-active'?: string;
  styledComponentCss?: string;
}

const flexCenter = {
  display: 'flex',
  'align-items': 'center',
  'justify-content': 'center',
};

export const CsContainerRenderSlice = styled.div<StylesProps>`
  ${(props) =>
    props.styledComponentCss
      ? css`
          ${props.styledComponentCss}
        `
      : ''}
  ${(props) =>
    _.get(props, 'style.after')
      ? Object.entries(flexCenter)
          .map(([key, value]) => `${key}: ${value};`)
          .join('\n')
      : ''}

  ${(props) =>
    props['is-active'] === 'true' && props.style?.hover
      ? Object.entries(props.style.hover)
          .map(([key, value]) => `${key}: ${value};`)
          .join('\n')
      : ''}

  &:hover {
    ${(props) =>
      props.style?.hover
        ? Object.entries(props.style.hover)
            .map(([key, value]) => `${key}: ${value} !important;`)
            .join('\n')
        : ''}
  }

  &::before {
    ${(props) =>
      props.style?.before
        ? Object.entries(props.style.before)
            .map(([key, value]) => `${key}: ${value};`)
            .join('\n')
        : ''}
  }

  &::after {
    ${(props) =>
      props.style?.after
        ? Object.entries(props.style.after)
            .map(([key, value]) => `${key}: ${value};`)
            .join('\n')
        : ''}
  }
`;
