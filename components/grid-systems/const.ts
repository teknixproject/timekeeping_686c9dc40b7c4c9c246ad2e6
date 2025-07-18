export const GridCol = (col_number: number) => `grid-cols-${Math.min(Math.max(col_number, 1), 24)}`;

export const GridRow = (row_number: number) => `grid-rows-${Math.min(Math.max(row_number, 1), 24)}`;

export const SpanCol = (col_span_number: number) =>
  `col-span-${Math.min(Math.max(col_span_number, 1), 24)}`;

export const SpanRow = (row_span_number: number) =>
  `row-span-${Math.min(Math.max(row_span_number, 1), 24)}`;

export const ColStart = (col_start_number: number) =>
  `col-start-${Math.min(Math.max(col_start_number, 1), 24)}`;

export const RowStart = (row_start_number: number) =>
  `row-start-${Math.min(Math.max(row_start_number, 1), 24)}`;

// Map JSON justifyContent to Tailwind classes
export const mapJustifyContent = (value?: string) => {
  switch (value) {
    case 'flex-start':
      return 'justify-start';
    case 'flex-end':
      return 'justify-end';
    case 'center':
      return 'justify-center';
    case 'space-between':
      return 'justify-between';
    case 'space-around':
      return 'justify-around';
    case 'space-evenly':
      return 'justify-evenly';
    default:
      return '';
  }
};

export const mapAlineItem = (value?: string) => {
  switch (value) {
    case 'flex-start':
      return 'items-start';
    case 'flex-end':
      return 'items-end';
    case 'center':
      return 'items-center';
    case 'baseline':
      return 'items-baseline';
    case 'stretch':
      return 'items-stretch';
    default:
      return '';
  }
};

export const GapGrid = (row_span_number: number) => {
  if (row_span_number === 0 || !row_span_number) {
    return 'gap-0';
  } else {
    return `gap-${row_span_number}`;
  }
};

export const BREAKPOINTS = {
  mobile: {
    title: 'Mobile',
    style: 'style_mobile',
    minWidth: 0,
    maxWidth: 479,
    type: 'mobile',
  },
  tablet: {
    title: 'Tablet',
    style: 'style_tablet',
    minWidth: 480,
    maxWidth: 1023,
    type: 'tablet',
  },
  laptop: {
    title: 'Laptop',
    style: 'style_laptop',
    minWidth: 1024,
    maxWidth: 1439,
    type: 'laptop',
  },
  pc: {
    title: 'PC',
    style: 'style_pc',
    minWidth: 1440,
    maxWidth: Infinity,
    type: 'pc',
  },
};
