'use client';

import { JSONPath } from 'jsonpath-plus';
import _ from 'lodash';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { CSSProperties } from 'styled-components';

import { useApiCallStore } from '@/providers';
import { GridItem } from '@/types/gridItem';
import { Icon } from '@iconify/react'; // Import Iconify for better icons

console.log();

type TProps = {
  data?: GridItem;
  style?: CSSProperties;
};
console.log();

const Pagination: React.FC<TProps> = ({ style, data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1000);
  const { apiData, findApiData } = useApiCallStore((state) => state);
  // const [isLoading, setIsLoading] = useState(false);
  // Handler functions
  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = async (page: number) => {
    setCurrentPage(page);
  };

  const caculateTotalPage = (dataApi: any) => {
    const totalValue = JSONPath({
      json: dataApi,
      path: data?.valueRender?.valueFields?.total ?? '',
    });
    const limit = queryString.parseUrl(data?.valueRender?.apiCall?.url ?? '').query.limit ?? 5;
    const total = Math.round(totalValue[0] / parseInt((limit as string) ?? '0'));
    return total;
  };
  // useEffect(() => {
  //   const getData = async () => {
  //     try {
  //       setIsLoading(true);

  //       const response = await handlePagination(data, currentPage);

  //       //get limit from url

  //       const totalValue = caculateTotalPage(response.data);
  //       if (_.isEmpty(totalValue)) setTotalPages(totalValue);
  //     } catch (error) {
  //       console.log('🚀 ~ handlePageClick ~ error:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   getData();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [currentPage]);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const maxVisiblePages = 5; // Increased for better visibility
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2)
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  // // Update total pages based on API data (unchanged logic)
  useEffect(() => {
    if (_.isEmpty(apiData)) return;
    const dataInStore = findApiData('id', data?.valueRender?.apiCall?.id ?? '');
    if (_.isEmpty(dataInStore)) return;

    const totalValue = caculateTotalPage(dataInStore.data);

    setTotalPages(totalValue);
    // Add totalPages logic here if needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiData, data, findApiData]);

  return (
    <div className="py-8 text-center" style={style}>
      <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gray-200 to-gray-200 p-2 shadow-lg dark:from-gray-800 dark:to-gray-900">
        <ul className="flex space-x-1 rounded-full bg-white p-1 dark:bg-gray-800">
          {/* Previous Button */}
          <li>
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-all hover:bg-gray-300 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <Icon icon="mdi:chevron-left" width={24} height={24} />
            </button>
          </li>

          {/* Page Numbers */}
          {getPageNumbers().map((page, index) => (
            <li key={index} className="cursor-pointer">
              <button
                type="button"
                onClick={() => typeof page === 'number' && handlePageClick(page)}
                disabled={typeof page !== 'number'}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700'
                } disabled:opacity-50 disabled:hover:bg-transparent`}
              >
                {page}
              </button>
            </li>
          ))}

          {/* Next Button */}
          <li>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-all hover:bg-gray-300 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <Icon icon="mdi:chevron-right" width={24} height={24} />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Pagination;
