import { kebabCase } from 'lodash';

import { CSSObject } from '@emotion/react';

type TForm = {
  normal: React.CSSProperties;
  hover: React.CSSProperties;
  active: React.CSSProperties;
  disabled: React.CSSProperties;
  focus: React.CSSProperties;
  visited: React.CSSProperties;
  target: React.CSSProperties;
  placeholder: React.CSSProperties;
  before: React.CSSProperties;
  after: React.CSSProperties;
};

export const convertToEmotionStyle = (formData: TForm): CSSObject => {
  if (!formData) return {};

  // Convert CSSProperties to CSSObject using Lodash's kebabCase
  const convertStyle = (style: React.CSSProperties): CSSObject => {
    return Object.entries(style).reduce((acc, [key, value]) => {
      // Skip undefined/null values
      if (value == null) return acc;

      // Special cases where kebabCase doesn't work directly
      if (key === 'MozOsxFontSmoothing') {
        acc['-moz-osx-font-smoothing'] = value;
      } else if (key === 'WebkitFontSmoothing') {
        acc['-webkit-font-smoothing'] = value;
      } else {
        // Use kebabCase for standard properties
        acc[kebabCase(key)] = `${value} !important`;
      }
      return acc;
    }, {} as CSSObject);
  };

  const style: CSSObject = {
    ...convertStyle(formData.normal || {}),
  };

  const pseudoMap: Partial<Record<keyof TForm, string>> = {
    hover: '&:hover',
    active: '&:active',
    disabled: '&:disabled',
    focus: '&:focus',
    visited: '&:visited',
    target: '&:target',
    placeholder: '&::placeholder',
    before: '&::before',
    after: '&::after',
  };

  for (const [key, selector] of Object.entries(pseudoMap)) {
    const typedKey = key as keyof TForm;
    const css = formData[typedKey];
    if (css && Object.keys(css).length > 0) {
      style[selector!] = convertStyle(css);
    }
  }

  return style;
};

// Utility function to convert kebab-case to camelCase for CSS properties
const kebabToCamel = (str: string): string => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

// Function to convert CSS object with kebab-case properties to camelCase
export const convertCssObjectToCamelCase = (cssObj: Record<string, any>): Record<string, any> => {
  if (!cssObj || typeof cssObj !== 'object') return cssObj;

  const convertedObj: Record<string, any> = {};

  Object.keys(cssObj).forEach((key) => {
    const camelCaseKey = kebabToCamel(key);
    convertedObj[camelCaseKey] = cssObj[key];
  });

  return convertedObj;
};
