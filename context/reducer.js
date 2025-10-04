const initialState = {
  currentUser: null,
  alert: { open: false, severity: 'info', message: '' },
  dialog: { open: false, close: false, title: '', message: '', onSubmit: undefined },
  loading: false,
  selectedRestaurant: { id: null, name: null, public_key: null },
  selectedBookingDate: new Date(),
  language: 'en',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    
    case 'RESET_CURRENT_USER':
      return { ...state, currentUser: null };

    case 'UPDATE_ALERT':
      return { ...state, alert: action.payload };
    
    case 'OPEN_DIALOG':
      return { ...state, dialog: { open: true, close: false, title: action.payload.title, message: action.payload.message, onSubmit: action.payload.onSubmit } };
    
    case 'CLOSE_DIALOG':
      return { ...state, dialog: { open: false, close: true, title: '', message: '', onSubmit: undefined } };
    
    case 'START_LOADING':
      return { ...state, loading: true };
    
    case 'END_LOADING':
      return { ...state, loading: false };
    
    case 'UPDATE_SELECTED_RESTAURANT':
      return { ...state, selectedRestaurant: action.payload };
    
    case 'RESET_SELECTED_RESTAURANT':
      return { ...state, selectedRestaurant: { id: null, name: null, public_key: null } };
    
    case 'UPDATE_SELECTED_BOOKING_DATE':
      return { ...state, selectedBookingDate: action.payload };
    
    case 'UPDATE_LANGUAGE':
      return { ...state, language: action.payload };
    
    default:
      console.log('Unhandled action:', action);
      return state;
  }
};

export default reducer;
