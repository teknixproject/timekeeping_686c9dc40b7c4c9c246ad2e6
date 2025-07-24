import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Define the state type
type TState = {
  values: {
    [key: string]: {
      formData: Record<string, any>;
      valueStream: any;
    };
  };
};

// Define actions interface
interface StoreActions {
  // Set entire values object
  setValues: (values: TState['values']) => void;

  // Set specific key's data
  setValue: (key: string, data: { formData: Record<string, any>; valueStream: any }) => void;

  // Update only formData for a specific key
  setFormData: (key: string, formData: Record<string, any>) => void;

  // Update only valueStream for a specific key
  setValueStream: (key: string, valueStream: any) => void;

  // Merge formData (useful for partial updates)
  mergeFormData: (key: string, partialFormData: Record<string, any>) => void;

  // Get specific key's data
  getValue: (key: string) => { formData: Record<string, any>; valueStream: any } | undefined;

  // Get only formData for a specific key
  getFormData: (key: string) => Record<string, any> | undefined;

  // Get only valueStream for a specific key
  getValueStream: (key: string) => any;

  // Check if key exists
  hasKey: (key: string) => boolean;

  // Remove specific key
  removeValue: (key: string) => void;

  // Clear all values
  clearValues: () => void;

  // Get all keys
  getKeys: () => string[];
}

// Combine state and actions
type Store = TState & StoreActions;

// Create the store
export const useDataStreamStore = create<Store>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      values: {},

      // Actions
      setValues: (values) =>
        set((state) => {
          state.values = values;
        }),

      setValue: (key, data) =>
        set((state) => {
          state.values[key] = data;
        }),

      setFormData: (key, formData) =>
        set((state) => {
          if (!state.values[key]) {
            state.values[key] = { formData: {}, valueStream: null };
          }
          state.values[key].formData = formData;
        }),

      setValueStream: (key, valueStream) =>
        set((state) => {
          if (!state.values[key]) {
            state.values[key] = { formData: {}, valueStream: null };
          }
          state.values[key].valueStream = valueStream;
        }),

      mergeFormData: (key, partialFormData) =>
        set((state) => {
          if (!state.values[key]) {
            state.values[key] = { formData: {}, valueStream: null };
          }
          state.values[key].formData = {
            ...state.values[key].formData,
            ...partialFormData,
          };
        }),

      getValue: (key) => {
        const state = get();
        return state.values[key];
      },

      getFormData: (key) => {
        const state = get();
        return state.values[key]?.formData;
      },

      getValueStream: (key) => {
        const state = get();
        return state.values[key]?.valueStream;
      },

      hasKey: (key) => {
        const state = get();
        return key in state.values;
      },

      removeValue: (key) =>
        set((state) => {
          delete state.values[key];
        }),

      clearValues: () =>
        set((state) => {
          state.values = {};
        }),

      getKeys: () => {
        const state = get();
        return Object.keys(state.values);
      },
    })),
    {
      name: 'data-stream-store', // Name for devtools
    }
  )
);

// Selector hooks for better performance (optional)
export const useFormValue = (key: string) => useDataStreamStore((state) => state.values[key]);

export const useFormData = (key: string) =>
  useDataStreamStore((state) => state.values[key]?.formData);

export const useValueStream = (key: string) =>
  useDataStreamStore((state) => state.values[key]?.valueStream);

export const useHasFormKey = (key: string) => useDataStreamStore((state) => key in state.values);
