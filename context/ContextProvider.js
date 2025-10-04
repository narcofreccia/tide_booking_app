import React, { createContext, useReducer, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reducer from './reducer';

const initialState = {
  currentUser: null,
  alert: { open: false, severity: 'info', message: '' },
  dialog: { open: false, close: false, title: '', message: '', onSubmit: undefined },
  loading: false,
  selectedRestaurant: { id: null, name: null, public_key: null },
  language: 'en',
};

// Create Context
const StateContext = createContext();
const DispatchContext = createContext();
// Context Provider Component
export const ContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Load currentUser and selectedRestaurant from AsyncStorage on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('currentUser');
        if (storedUser) {
          const currentUser = JSON.parse(storedUser);
          dispatch({ type: 'UPDATE_CURRENT_USER', payload: currentUser });
        }

        const storedSelectedRestaurant = await AsyncStorage.getItem('selectedRestaurant');
        if (storedSelectedRestaurant) {
          const selectedRestaurant = JSON.parse(storedSelectedRestaurant);
          dispatch({ type: 'UPDATE_SELECTED_RESTAURANT', payload: selectedRestaurant });
        }

        const storedBookingDate = await AsyncStorage.getItem('selectedBookingDate');
        if (storedBookingDate) {
          const selectedBookingDate = new Date(storedBookingDate);
          dispatch({ type: 'UPDATE_SELECTED_BOOKING_DATE', payload: selectedBookingDate });
        }

        const storedLanguage = await AsyncStorage.getItem('language');
        if (storedLanguage) {
          dispatch({ type: 'UPDATE_LANGUAGE', payload: storedLanguage });
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading persisted data from AsyncStorage:', error);
        setIsInitialized(true);
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
        }
      } catch (error) {
        console.error('Error persisting selectedRestaurant to AsyncStorage:', error);
      }
    };

    persistSelectedRestaurant();
  }, [state.selectedRestaurant]);

  // Persist selectedBookingDate to AsyncStorage whenever it changes
  useEffect(() => {
    const persistSelectedBookingDate = async () => {
      try {
        if (state.selectedBookingDate) {
          await AsyncStorage.setItem('selectedBookingDate', state.selectedBookingDate.toISOString());
        }
      } catch (error) {
        console.error('Error persisting selectedBookingDate to AsyncStorage:', error);
      }
    };

    persistSelectedBookingDate();
  }, [state.selectedBookingDate]);

  // Persist language to AsyncStorage whenever it changes
  useEffect(() => {
    // Don't persist on initial mount, only after data is loaded
    if (!isInitialized) return;
    
    const persistLanguage = async () => {
      try {
        if (state.language) {
          await AsyncStorage.setItem('language', state.language);
        }
      } catch (error) {
        console.error('Error persisting language to AsyncStorage:', error);
      }
    };

    persistLanguage();
  }, [state.language, isInitialized]);

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
