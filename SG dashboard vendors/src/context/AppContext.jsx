import React, { createContext, useContext, useReducer } from 'react';

// Initial state based on current vanilla JS config
const initialState = {
  // Data
  transactionData: [],
  
  // Filters
  selectedBusiness: 'all',
  selectedLocation: 'all',
  currentDateRange: null,
  previousDateRange: null,
  returningWindow: 0,
  firstTimeUsersThreshold: 1,
  
  // User tracking
  globalUserFirstVisit: new Map(),
  globalUserBusinessFirstVisit: new Map(),
  
  // Chart instances (will be managed differently in React)
  charts: {},
  
  // UI state
  loading: false,
  error: null,
  
  // Authentication
  isAuthenticated: false,
  userDisplayName: 'Usuario'
};

// Action types
const ActionTypes = {
  SET_TRANSACTION_DATA: 'SET_TRANSACTION_DATA',
  SET_BUSINESS_FILTER: 'SET_BUSINESS_FILTER',
  SET_LOCATION_FILTER: 'SET_LOCATION_FILTER',
  SET_DATE_RANGES: 'SET_DATE_RANGES',
  SET_RETURNING_WINDOW: 'SET_RETURNING_WINDOW',
  SET_FIRST_TIME_THRESHOLD: 'SET_FIRST_TIME_THRESHOLD',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_AUTH: 'SET_AUTH',
  RESET_FILTERS: 'RESET_FILTERS'
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_TRANSACTION_DATA:
      return {
        ...state,
        transactionData: action.payload,
        loading: false,
        error: null
      };
      
    case ActionTypes.SET_BUSINESS_FILTER:
      return {
        ...state,
        selectedBusiness: action.payload
      };
      
    case ActionTypes.SET_LOCATION_FILTER:
      return {
        ...state,
        selectedLocation: action.payload
      };
      
    case ActionTypes.SET_DATE_RANGES:
      return {
        ...state,
        currentDateRange: action.payload.current,
        previousDateRange: action.payload.previous
      };
      
    case ActionTypes.SET_RETURNING_WINDOW:
      return {
        ...state,
        returningWindow: action.payload
      };
      
    case ActionTypes.SET_FIRST_TIME_THRESHOLD:
      return {
        ...state,
        firstTimeUsersThreshold: action.payload
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
      
    case ActionTypes.SET_AUTH:
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        userDisplayName: action.payload.userDisplayName || 'Usuario'
      };
      
    case ActionTypes.RESET_FILTERS:
      return {
        ...state,
        selectedBusiness: 'all',
        selectedLocation: 'all',
        currentDateRange: null,
        previousDateRange: null
      };
      
    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const actions = {
    setTransactionData: (data) => dispatch({ type: ActionTypes.SET_TRANSACTION_DATA, payload: data }),
    setBusinessFilter: (business) => dispatch({ type: ActionTypes.SET_BUSINESS_FILTER, payload: business }),
    setLocationFilter: (location) => dispatch({ type: ActionTypes.SET_LOCATION_FILTER, payload: location }),
    setDateRanges: (current, previous) => dispatch({ 
      type: ActionTypes.SET_DATE_RANGES, 
      payload: { current, previous } 
    }),
    setReturningWindow: (window) => dispatch({ type: ActionTypes.SET_RETURNING_WINDOW, payload: window }),
    setFirstTimeThreshold: (threshold) => dispatch({ type: ActionTypes.SET_FIRST_TIME_THRESHOLD, payload: threshold }),
    setLoading: (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    setAuth: (isAuthenticated, userDisplayName) => dispatch({ 
      type: ActionTypes.SET_AUTH, 
      payload: { isAuthenticated, userDisplayName } 
    }),
    resetFilters: () => dispatch({ type: ActionTypes.RESET_FILTERS })
  };
  
  const value = {
    state,
    actions
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the app context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export { ActionTypes };