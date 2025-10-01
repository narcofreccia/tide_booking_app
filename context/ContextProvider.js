import React, { createContext, useReducer, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reducer from './reducer';

const initialState = {
  currentUser: null,
  alert: { open: false, severity: 'info', message: '' },
  dialog: { open: false, close: false, title: '', message: '', onSubmit: undefined },
  loading: false,
  selectedRestaurant: { id: null, name: null, public_key: null },
};

// Create Context
const StateContext = createContext();
const DispatchContext = createContext();
// Context Provider Component
export const ContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load currentUser and selectedRestaurant from AsyncStorage on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('currentUser');
        if (storedUser) {
          const currentUser = JSON.parse(storedUser);
          dispatch({ type: 'UPDATE_CURRENT_USER', payload: currentUser });
        }

        const storedRestaurant = await AsyncStorage.getItem('selectedRestaurant');
        if (storedRestaurant) {
          const selectedRestaurant = JSON.parse(storedRestaurant);
          dispatch({ type: 'UPDATE_SELECTED_RESTAURANT', payload: selectedRestaurant });
        }
      } catch (error) {
        console.error('Error loading persisted data from AsyncStorage:', error);
      }
    };

    loadPersistedData();
  }, []);

  // Persist currentUser to AsyncStorage whenever it changes
  useEffect(() => {
    const persistCurrentUser = async () => {
      try {
        if (state.currentUser) {
          await AsyncStorage.setItem('currentUser', JSON.stringify(state.currentUser));
        } else {
          await AsyncStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error('Error persisting currentUser to AsyncStorage:', error);
      }
    };

    persistCurrentUser();
  }, [state.currentUser]);

  // Persist selectedRestaurant to AsyncStorage whenever it changes
  useEffect(() => {
    const persistSelectedRestaurant = async () => {
      try {
        if (state.selectedRestaurant && state.selectedRestaurant.id) {
          await AsyncStorage.setItem('selectedRestaurant', JSON.stringify(state.selectedRestaurant));
        } else {
          await AsyncStorage.removeItem('selectedRestaurant');
        }
      } catch (error) {
        console.error('Error persisting selectedRestaurant to AsyncStorage:', error);
      }
    };

    persistSelectedRestaurant();
  }, [state.selectedRestaurant]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

// Custom hooks to use the context
export const useStateContext = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useStateContext must be used within a ContextProvider');
  }
  return context;
};

export const useDispatchContext = () => {
  const context = useContext(DispatchContext);
  if (context === undefined) {
    throw new Error('useDispatchContext must be used within a ContextProvider');
  }
  return context;
};
