import axios from 'axios';
import { JSONPath } from 'jsonpath-plus';
import _ from 'lodash';

import { TApiData } from '@/stores';
import { TApiCallValue } from '@/types';
import { GridItem } from '@/types/gridItem';

const allowTypeGenerate = ['flex', 'grid'];
// Hàm lấy dữ liệu từ API hoặc store
const getDataFromApi = async (apiData: TApiData[], idParent: string, apiCall: TApiCallValue) => {
  try {
    const existingApiData = apiData.find((item: any) => item.id === apiCall?.apiId);
    if (!_.isEmpty(existingApiData)) return existingApiData.data;

    const response = await axios.request({
      url: apiCall?.url,
      method: apiCall?.method?.toLowerCase(),
      params: apiCall?.query,
      headers: apiCall?.headers,
    });
    const data = response.data;

    return data;
  } catch (error) {
    console.log('🚀 ~ getDataFromApi ~ error:', error);
    return null;
  }
};

// Hàm cập nhật jsonPath theo index của card
const updateJsonPath = (jsonPath: string, index: number) => {
  return _.replace(jsonPath, /\[\d*\]/, `[${index}]`);
};

const updateJsonPathForChild = (slice: GridItem, index: number, source: any) => {
  const jsonPath = updateJsonPath(slice.dynamicGenerate?.dataJsonPath ?? '', index);
  const title = JSONPath({ path: jsonPath!, json: source })[0];
  const updateSlide: GridItem = {
    ...slice,
    id: `${slice.id}_${index}`,
    dataSlice: {
      title,
    },
    dynamicGenerate: {
      ...slice?.dynamicGenerate,
      dataJsonPath: updateJsonPath(slice.dynamicGenerate?.dataJsonPath ?? '', index),
    },
  };
  const childs = updateSlide.childs;

  if (!childs?.length) return updateSlide;

  const updateChilds = childs.map((child) => updateJsonPathForChild(child, index, source));
  updateSlide.childs = updateChilds;

  return updateSlide;
};
// Hàm tạo các card từ dữ liệu API
const createCardsFromApi = (sliceRef: GridItem, apiData: any, jsonPath: string) => {
  let apiDataHaveJsonPath = apiData;
  if (jsonPath) {
    apiDataHaveJsonPath = JSONPath({ json: apiData, path: jsonPath })[0];
  }

  const childs = sliceRef.childs?.filter((value: GridItem) =>
    allowTypeGenerate.includes(value.type ?? '')
  );

  if (_.isEmpty(childs)) return [];

  const newCards = _.flatMap(_.range(apiDataHaveJsonPath.length), (index) =>
    _.map(childs, (value: GridItem) => {
      const newChild: GridItem = {
        ...value,
        id: `${value.id}_${index}`,
        // dynamicGenerate: {
        //   ...(value.dynamicGenerate ?? {}),
        //   dataJsonPath: updateJsonPath(value.dynamicGenerate?.dataJsonPath ?? '', index),
        // },
      };
      if (newChild?.childs?.length) {
        newChild.childs = newChild.childs.map((child) =>
          updateJsonPathForChild(child, index, apiData)
        );
      }

      return newChild;
    })
  );

  return newCards;
};

const updateTitleInText = (sliceRef: GridItem, result: any): string | undefined => {
  if (!sliceRef?.dynamicGenerate?.dataJsonPath) return;

  const jsonPath = sliceRef?.dynamicGenerate?.dataJsonPath;
  // console.log(`🚀 ~ updateTitleInText ~ jsonPath: ${sliceRef.id}`, jsonPath);

  if (_.isEmpty(jsonPath)) return;
  const title = JSONPath({ path: jsonPath!, json: result });

  // console.log(`🚀 ~ fetchData ~ title: ${sliceRef.id}`, title);
  return title;
};
export const dynamicGenarateUtil = {
  getDataFromApi,
  createCardsFromApi,
  updateTitleInText,
};
