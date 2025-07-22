import _ from 'lodash';

import { getComponentType } from './component';

export const cleanProps = (props: any, valueType: string) => {
  // Validate inputs
  if (!props) {
    return {};
  }

  if (typeof props !== 'object' || props === null) {
    console.warn('cleanProps: Props is not an object', { props, valueType });
    return {};
  }

  if (!valueType || typeof valueType !== 'string') {
    console.warn('cleanProps: Invalid valueType', { valueType });
    return props;
  }

  try {
    const { isDatePicker, isNoChildren } = getComponentType(valueType);

    // Create a safe copy of props
    const cleanData: Record<string, any> = {};

    // Safely copy enumerable properties
    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        try {
          cleanData[key] = props[key];
        } catch (copyError) {
          console.warn(`cleanProps: Could not copy property ${key}`, copyError);
        }
      }
    }

    // Remove specific props
    const propsToRemove = ['styleMultiple', 'dataProps'];
    propsToRemove.forEach((prop) => {
      delete cleanData[prop];
    });

    // Component-specific cleanup
    const lowerValueType = valueType.toLowerCase();

    if (isDatePicker) {
      delete cleanData.value;
      delete cleanData.defaultValue;
    } else if (lowerValueType === 'form') {
      delete cleanData.formKeys;
    } else if (lowerValueType === 'tabs') {
      // Add tabs-specific cleanup if needed
      // For example: delete cleanData.tabBarExtraContent
    }

    if (isNoChildren) {
      delete cleanData.children;
    }

    if (lowerValueType === 'button') {
      delete cleanData.iconData;
    }

    // Filter out empty/invalid values safely
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(cleanData)) {
      try {
        // Skip null/undefined
        if (value === null || value === undefined) continue;

        // Skip empty strings
        if (value === '') continue;

        // Skip empty objects
        if (_.isPlainObject(value) && _.isEmpty(value)) continue;

        // Skip empty arrays
        if (_.isArray(value) && _.isEmpty(value)) continue;

        result[key] = value;
      } catch (filterError) {
        console.warn(`cleanProps: Error filtering property ${key}`, filterError);
      }
    }

    return result;
  } catch (error) {
    console.error('🛑 Error in cleanProps:', error, {
      valueType,
      propsKeys: typeof props === 'object' && props !== null ? Object.keys(props) : 'N/A',
      propsType: typeof props,
    });

    // Safe fallback
    return {};
  }
};
