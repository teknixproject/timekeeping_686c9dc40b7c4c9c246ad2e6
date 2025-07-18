export const getComponentType = (value: string) => {
  const valueType = value.toLowerCase();
  const isForm = ['form'].includes(valueType);
  const isNoChildren = ['list', 'collapse', 'icon'].includes(valueType);
  const isChart = valueType.includes('chart');
  const isUseOptionsData = ['select', 'radio', 'checkbox'].includes(valueType);
  const isInput = ['inputtext', 'inputnumber', 'textarea', 'radio', 'select', 'checkbox'].includes(
    valueType
  );
  const isDatePicker = valueType === 'datepicker';
  const isFeebBack = ['modal', 'drawer'].includes(valueType);
  return {
    isUseOptionsData,
    isForm,
    isNoChildren,
    isChart,
    isInput,
    isFeebBack,
    isDatePicker,
  };
};
