const isUseVariable = (value: any) => {
  const result =
    typeof value === 'string' &&
    value.startsWith('{{') &&
    value.endsWith('}}') &&
    value === `{{${value.slice(2, -2).trim()}}}`;

  return result;
};
const extractAllValuesFromTemplate = (template: string): string => {
  const matches = template.match(/\{\{(.*?)\}\}/g);

  if (matches) {
    // Extract the first value inside {{}} and remove {{ and }}
    return matches[0].replace(/\{\{|\}\}/g, '').trim();
  }

  return template;
};
export const variableUtil = { isUseVariable, extractAllValuesFromTemplate };
