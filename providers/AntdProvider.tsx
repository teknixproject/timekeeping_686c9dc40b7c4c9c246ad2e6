'use client';
import React from 'react';

import { StyleProvider } from '@ant-design/cssinjs';
import { AntdRegistry } from '@ant-design/nextjs-registry';

type Props = {
  children: React.ReactNode;
};

const AntdProvider: React.FC<Props> = ({ children }) => {
  return (
    <AntdRegistry>
      <StyleProvider layer>{children}</StyleProvider>
    </AntdRegistry>
  );
};

export default AntdProvider;
