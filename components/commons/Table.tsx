/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import _ from 'lodash';
import { memo } from 'react';

import { RenderSlice } from '../grid-systems';
import { StyleBox } from './StyleBox';

interface TableProps {
  id?: string;
  data?: any;
  styleDevice?: string;
  [key: string]: unknown;
}

const optionsRender: any = {
  thead: 'headers',
  tbody: 'bodies',
  tfoot: 'footers',
};

const Table = ({ data = {}, styleDevice, ...props }: TableProps) => {
  console.log('🚀 ~ data:', data);
  const tableConstructor = _.get(data, 'dataSlice.table');

  const styleTable = data?.dataSlice?.table?.style_table || {};

  // Hàm render nội dung cell
  const renderCellContent = (cell: any, rowId: string) => {
    if (cell?.childs && cell.childs.length > 0) {
      // Render childs nếu có
      return _.map(cell.childs, (item) => (
        <RenderSlice key={item.id} slice={item} idParent={rowId} />
      ));
    } else {
      // Render placeholder hoặc nội dung mặc định cho cell rỗng
      return <div style={{ minHeight: '20px', minWidth: '20px' }}>{cell?.text || '\u00A0'}</div>;
    }
  };

  const getCellBorderRadius = (
    isFirstRow: boolean,
    isLastRow: boolean,
    isFirstCell: boolean,
    isLastCell: boolean
  ) => {
    const radius = styleTable?.borderRadius || '0px';
    let borderRadius = '0';

    if (isFirstRow && isFirstCell) {
      borderRadius = `${radius} 0 0 0`;
    } else if (isFirstRow && isLastCell) {
      borderRadius = `0 ${radius} 0 0`;
    } else if (isLastRow && isFirstCell) {
      borderRadius = `0 0 0 ${radius}`;
    } else if (isLastRow && isLastCell) {
      borderRadius = `0 0 ${radius} 0`;
    }

    return borderRadius;
  };

  const getTotalInfo = () => {
    const totalSections = tableConstructor?.sectionOrder?.length || 0;
    let totalRows = 0;

    tableConstructor?.sectionOrder?.forEach((section: any) => {
      const rows = tableConstructor[optionsRender[section?.type]]
        ? _.find(tableConstructor[optionsRender[section?.type]], { id: section?.id })
        : {};
      totalRows += rows?.rows?.length || 0;
    });

    return { totalSections, totalRows };
  };

  const { totalSections } = getTotalInfo();

  return !_.isEmpty(tableConstructor) ? (
    <>
      <StyleBox
        as={'table'}
        style={{
          ...styleTable,
          borderCollapse: 'separate',
          borderSpacing: 0,
          borderRadius: styleTable?.borderRadius,
        }}
        styledComponentCss={data?.styledComponentCss}
        className="w-full font-sans text-sm"
      >
        {_.map(tableConstructor?.sectionOrder, (s, sectionIndex) => {
          const rows = tableConstructor[optionsRender[s?.type]]
            ? _.find(tableConstructor[optionsRender[s?.type]], { id: s?.id })
            : {};
          console.log('🚀 ~ {_.map ~ rows:', rows);

          const isFirstSection = sectionIndex === 0;
          const isLastSection = sectionIndex === totalSections - 1;

          if (s?.type === 'thead') {
            return (
              <thead
                style={{
                  backgroundColor: styleTable?.headerBackgroundColor,
                }}
                key={s?.id}
              >
                {_.map(rows?.rows, (row, rowIndex) => {
                  const cells = row?.cells;
                  const isFirstRow = isFirstSection && rowIndex === 0;
                  const isLastRow = isLastSection && rowIndex === rows?.rows?.length - 1;

                  return (
                    <tr key={row?.id} style={row?.style}>
                      {_.map(cells, (cell, cellIndex) => {
                        const isFirstCell = cellIndex === 0;
                        const isLastCell = cellIndex === cells.length - 1;
                        const cellBorderRadius = getCellBorderRadius(
                          isFirstRow,
                          isLastRow,
                          isFirstCell,
                          isLastCell
                        );

                        return (
                          <th
                            key={cell?.id || `th-${row?.id}-${cellIndex}`}
                            scope={cell?.scope}
                            colSpan={cell?.colSpan}
                            rowSpan={cell?.rowSpan}
                            style={{
                              border: `${styleTable?.borderWidth} ${styleTable?.borderStyle} ${styleTable?.borderColor}`,
                              padding: styleTable?.cellPadding,
                              borderRadius: cellBorderRadius,
                              ...cell?.style_cell,
                            }}
                          >
                            <div style={cell?.[styleDevice as string]}>
                              {renderCellContent(cell, row?.id)}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  );
                })}
              </thead>
            );
          }

          if (s?.type === 'tbody') {
            return (
              <tbody key={s?.id}>
                {_.map(rows?.rows, (row, rowIndex) => {
                  const cells = row?.cells;
                  const isFirstRow = isFirstSection && rowIndex === 0;
                  const isLastRow = isLastSection && rowIndex === rows?.rows?.length - 1;
                  return (
                    <tr key={rowIndex} style={row?.style}>
                      {_.map(cells, (cell, cellIndex) => {
                        const isFirstCell = cellIndex === 0;
                        const isLastCell = cellIndex === cells.length - 1;
                        const cellBorderRadius = getCellBorderRadius(
                          isFirstRow,
                          isLastRow,
                          isFirstCell,
                          isLastCell
                        );
                        return (
                          <td
                            key={cell?.id || `td-${row?.id}-${cellIndex}`}
                            scope={cell?.scope}
                            colSpan={cell?.colSpan}
                            rowSpan={cell?.rowSpan}
                            style={{
                              border: `${styleTable?.borderWidth} ${styleTable?.borderStyle} ${styleTable?.borderColor}`,
                              padding: styleTable?.cellPadding,
                              borderRadius: cellBorderRadius,
                              ...cell?.style_cell,
                            }}
                          >
                            <div style={cell?.[styleDevice as string]}>
                              {renderCellContent(cell, row?.id)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            );
          }

          if (s?.type === 'tfoot') {
            return (
              <tfoot key={s?.id}>
                {_.map(rows?.rows, (row, rowIndex) => {
                  const cells = row?.cells;
                  const isFirstRow = isFirstSection && rowIndex === 0;
                  const isLastRow = isLastSection && rowIndex === rows?.rows?.length - 1;

                  return (
                    <tr key={rowIndex} style={row?.style}>
                      {_.map(cells, (cell, cellIndex) => {
                        const isFirstCell = cellIndex === 0;
                        const isLastCell = cellIndex === cells.length - 1;
                        const cellBorderRadius = getCellBorderRadius(
                          isFirstRow,
                          isLastRow,
                          isFirstCell,
                          isLastCell
                        );
                        return (
                          <td
                            key={cell?.id || `tf-${row?.id}-${cellIndex}`}
                            scope={cell?.scope}
                            colSpan={cell?.colSpan}
                            rowSpan={cell?.rowSpan}
                            style={{
                              border: `${styleTable?.borderWidth} ${styleTable?.borderStyle} ${styleTable?.borderColor}`,
                              padding: styleTable?.cellPadding,
                              borderRadius: cellBorderRadius,
                              ...cell?.style_cell,
                            }}
                          >
                            <div style={cell?.[styleDevice as string]}>
                              {/* Sử dụng RenderGrid cho tfoot như code gốc */}
                              {cell?.childs && cell.childs.length > 0 ? (
                                _.map(cell.childs, (item) => (
                                  <RenderSlice
                                    key={item.id}
                                    slice={item}
                                    idParent={row?.id}
                                    // items={[item]}
                                  />
                                ))
                              ) : (
                                <div style={{ minHeight: '20px', minWidth: '20px' }}>
                                  {cell?.text || '\u00A0'}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tfoot>
            );
          }
        })}
      </StyleBox>
    </>
  ) : (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-500">No data available for table</p>
    </div>
  );
};

export default memo(Table);
