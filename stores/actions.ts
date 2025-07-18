import { create } from 'zustand';

import { TActionApiCall, TActions, TActionsStateManagement } from '@/types';

type TState = {
  actions: TActions[];
  actionActive: TActions | null | undefined;
};

type TActionsStore = {
  setActions: (actions: TActions[]) => void;
  setActionActive: (action: TActions) => void;
  updateActions: ({ componentId, data }: { componentId: string; data?: TActions }) => TActions[];

  addAction: (action: TActions) => void;
  removeAction: ({
    componentId,
    actionId,
  }: {
    componentId: string;
    actionId: string;
  }) => TActions[];
  getActionById: ({
    componentId,
    actionId,
  }: {
    componentId: string;
    actionId: string;
  }) => TActions | undefined;
  getActionsByComponentId: (componentId: string) => TActions | undefined | null;
  getActionsByActionId: (actionId: string) => TActions | undefined | null;
  updateApiCallAction: ({
    componentId,
    actionId,
    apiCall,
  }: {
    componentId: string;
    actionId: string;
    apiCall: TActionApiCall;
  }) => void;
  updateStateManagementAction: ({
    componentId,
    actionId,
    stateManagement,
  }: {
    componentId: string;
    actionId: string;
    stateManagement: TActionsStateManagement;
  }) => void;
  updateActionName: ({
    componentId,
    actionId,
    name,
  }: {
    componentId: string;
    actionId: string;
    name: string;
  }) => void;
  reset: () => void;
};

const initValue: TState = {
  actionActive: null,
  actions: [],
};

export const actionsStore = create<TState & TActionsStore>((set, get) => ({
  ...initValue,

  setActions: (actions) => {
    set({ actions });
  },

  setActionActive(action) {
    set({ actionActive: action });
  },

  updateActions: ({ componentId, data }) => {
    console.log('🚀 updatedActions~ data:', data);
    set((state) => {
      // Recursive function to update actions
      const updateAction = (action: TActions, newData: TActions): TActions => {
        console.log(
          '🚀 ~ set ~ action.id === newData.id:',
          { 'action.id': action.id, 'newData.id': newData.id },
          action.id === newData.id
        );
        // If the current action matches the target ID, update it
        if (action.id === newData.id) {
          return {
            ...action,
            ...newData,
          };
        }

        // If the action has nested actions, recursively update them
        if (action.action) {
          return {
            ...action,
            action: updateAction(action.action, newData),
          };
        }

        // If no match, return the original action
        return action;
      };

      // Update the actions array
      const updatedActions = state.actions.map((action) => {
        // If the action belongs to the target component, update it
        console.log(
          '🚀 ~ updatedActions ~ action.componentId === componentId:',
          action.componentId === componentId,
          {
            'action.componentId': action.componentId,
            componentId,
          }
        );
        if (action.componentId === componentId) {
          return updateAction(action, data!);
        }
        return action;
      });
      console.log('🚀 ~ updatedActions ~ updatedActions:', updatedActions);

      // Return the updated state
      return { actions: updatedActions };
    });

    return get().actions;
  },

  addAction: (action) => {
    set((state) => ({
      actions: [...state.actions, action],
    }));
  },

  removeAction: ({ componentId, actionId }) => {
    set((state) => {
      const removeActionRecursive = (action: TActions): TActions | null => {
        if (action.id === actionId) {
          return null;
        }

        if (action.action) {
          const updatedNestedAction = removeActionRecursive(action.action);
          return {
            ...action,
            action: updatedNestedAction ?? undefined,
          };
        }

        return action;
      };

      const updatedActions = state.actions
        .map((action) => {
          if (action.componentId === componentId) {
            return removeActionRecursive(action);
          }
          return action;
        })
        .filter((action) => action !== null);

      return { actions: updatedActions };
    });

    return get().actions;
  },

  getActionById: ({ componentId, actionId }) => {
    return get().actions.find((item) => item.componentId === componentId && item.id === actionId);
  },

  getActionsByComponentId: (componentId) => {
    return get().actions.find((item) => item.componentId === componentId);
  },

  getActionsByActionId: (actionId) => {
    return get().actions.find((item) => item.id === actionId);
  },

  updateApiCallAction: ({ componentId, actionId, apiCall }) => {
    set((state) => {
      const updatedActions = state.actions.map((item) => {
        if (item.componentId === componentId && item.id === actionId) {
          return { ...item, apiCall };
        }
        return item;
      });
      return { actions: updatedActions };
    });
  },

  updateStateManagementAction: ({ componentId, actionId, stateManagement }) => {
    set((state) => {
      const updatedActions = state.actions.map((item) => {
        if (item.componentId === componentId && item.id === actionId) {
          return { ...item, stateManagement };
        }
        return item;
      });
      return { actions: updatedActions };
    });
  },

  updateActionName: ({ componentId, actionId, name }) => {
    set((state) => {
      const updatedActions = state.actions.map((item) => {
        if (item.componentId === componentId && item.id === actionId) {
          return { ...item, name };
        }
        return item;
      });
      return { actions: updatedActions };
    });
  },

  reset: () => {
    set(initValue);
  },
}));
