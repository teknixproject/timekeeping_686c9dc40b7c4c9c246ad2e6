import styled, { css } from 'styled-components';

interface StylesProps {
  styledComponentCss?: string;
}

export const StyleBox = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'styledComponentCss',
})<StylesProps>`
  &&& {
    ${(props) => {
      if (!props.styledComponentCss) return '';

      // Tự động thêm !important vào các CSS property
      const cssWithImportant = props.styledComponentCss.replace(
        /([^;{}]+):\s*([^;{}]+);/g,
        (match, property, value) => {
          if (value.includes('!important')) {
            return match; // Đã có !important rồi
          }
          return `${property}: ${value} !important;`;
        }
      );

      return css`
        ${cssWithImportant}
      `;
    }}
  }
`;
