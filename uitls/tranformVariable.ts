export type TVariable = {
  id: string;
  key: string;
  type: TTypeVariable;
  isList: boolean;
  value: any;
};

export type TTypeVariable = 'String' | 'Integer' | 'Float' | 'Boolean' | 'Date' | 'Object';

// Helper function: parse object string safely
const parseObjectString = (str: string): Record<string, any> => {
  try {
    const fixed = str
      .replace(/(\w+):/g, '"$1":') // key: → "key":
      .replace(/'/g, '"') // 'value' → "value"
      .replace(/,\s*}/g, '}'); // remove trailing commas
    return JSON.parse(fixed);
  } catch (e) {
    console.warn('Failed to parse object string:', str, e);
    return {};
  }
};

// Get default fallback value
const getDefaultValue = (type: TTypeVariable): any => {
  switch (type) {
    case 'String':
      return '';
    case 'Integer':
      return 0;
    case 'Float':
      return 0.0;
    case 'Boolean':
      return false;
    case 'Date':
      return new Date();
    case 'Object':
      return {};
    default:
      return null;
  }
};

// Type-safe transform function
export const transformVariable = (variable: Omit<TVariable, 'id' | 'key'>): any => {
  if (!variable || variable.value === null || variable.value === undefined) {
    return variable?.value ?? null;
  }

  const transformSingleValue = (value: any, type: TTypeVariable): any => {
    if (value === null || value === undefined) return value;

    try {
      switch (type) {
        case 'String':
          return String(value);

        case 'Integer':
          return typeof value === 'string'
            ? parseInt(value, 10) || 0
            : Math.floor(Number(value)) || 0;

        case 'Float':
          return typeof value === 'string' ? parseFloat(value) || 0.0 : Number(value) || 0.0;

        case 'Boolean':
          if (typeof value === 'string') {
            const lower = value.toLowerCase().trim();
            return lower === 'true' || lower === '1' || lower === 'yes';
          }
          return Boolean(value);

        case 'Date':
          if (value instanceof Date) return value;
          const date = new Date(value);
          return isNaN(date.getTime()) ? new Date() : date;

        // case 'Object':
        //   if (typeof value === 'string') {
        //     return parseObjectString(value);
        //   }
        //   if (typeof value === 'object') return value;
        //   return { value };

        default:
          return value;
      }
    } catch (error) {
      console.warn(`Failed to transform value ${value} to type ${type}:`, error);
      return getDefaultValue(type);
    }
  };

  if (variable.isList) {
    if (!Array.isArray(variable.value)) {
      console.warn('Expected array but got:', variable);
      return [transformSingleValue(variable.value, variable.type)];
    }
    return variable.value.map((item) => transformSingleValue(item, variable.type));
  }

  return transformSingleValue(variable.value, variable.type);
};

// With validation
export const transformVariableWithValidation = (
  variable: TVariable
): {
  success: boolean;
  data: any;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!variable) {
    return { success: false, data: null, errors: ['Variable is null or undefined'] };
  }

  try {
    const transformedValue = transformVariable(variable);
    return { success: true, data: transformedValue, errors: [] };
  } catch (error) {
    errors.push(`Transformation failed: ${error}`);
    return {
      success: false,
      data: variable.isList ? [] : getDefaultValue(variable.type),
      errors,
    };
  }
};

// Batch transform
export const transformVariables = (variables: TVariable[]): Record<string, any> => {
  return variables.reduce((acc, variable) => {
    acc[variable.key] = transformVariable(variable);
    return acc;
  }, {} as Record<string, any>);
};

// Optional: custom transformer factory
export const createVariableTransformer = (
  customHandlers?: Partial<Record<TTypeVariable, (value: any) => any>>
) => {
  return (variable: TVariable): any => {
    const transformSingleValue = (value: any, type: TTypeVariable): any => {
      if (customHandlers?.[type]) {
        try {
          return customHandlers[type]!(value);
        } catch (error) {
          console.warn(`Custom handler for ${type} failed:`, error);
        }
      }

      // Default fallback
      return transformVariable({ ...variable, value });
    };

    if (variable.isList) {
      if (!Array.isArray(variable.value)) {
        return [transformSingleValue(variable.value, variable.type)];
      }
      return variable.value.map((v: any) => transformSingleValue(v, variable.type));
    }

    return transformSingleValue(variable.value, variable.type);
  };
};
