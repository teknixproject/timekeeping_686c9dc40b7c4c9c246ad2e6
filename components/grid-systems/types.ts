// import { Content } from '@prismicio/client';

import { GridItem } from '@/types/gridItem';

// import { GridItem } from './const';

export interface GridSystemProps {
  page?: GridItem;
  layoutId?: string;
  deviceType?: string;
  isHeader?: boolean;
  isBody?: boolean;
  isFooter?: boolean;
  style?: any;
}

// export type SliceItemsType =
//   | Content.PageDocumentDataSlicesSlice
//   | Content.PageDocumentDataSlicesSlice;

export type RenderGripProps = {
  items: GridItem[];
  idParent: string;
  grid?: any;
  slice: GridItem;
};

export type RenderSliceProps = {
  slice: GridItem | null | undefined;
  dataSlice: any;
};

export type MonacoFunctionsProps = {
  slice: GridItem | null | undefined;
};
