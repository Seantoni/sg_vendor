// Configuration and Constants
// =========================

// Lista de transacciones a excluir (combinación de email y fecha)
const excludedTransactions = [
    { email: 'administracion@bhostels.mx', date: '2024-07-01' },
    { email: 'administracion@bhostels.mx', date: '2024-07-02' },
    { email: 'administracion@bhostels.mx', date: '2024-07-03' },
    { email: 'administracion@bhostels.mx', date: '2024-07-04' },
    { email: 'administracion@bhostels.mx', date: '2024-07-05' },
    { email: 'administracion@bhostels.mx', date: '2024-07-08' },
    { email: 'administracion@bhostels.mx', date: '2024-07-09' },
    { email: 'administracion@bhostels.mx', date: '2024-07-10' },
    { email: 'administracion@bhostels.mx', date: '2024-07-11' },
    { email: 'administracion@bhostels.mx', date: '2024-07-12' }
];

// Global state variables
const AppState = {
    transactionData: [],
    selectedBusiness: 'all',
    selectedLocation: 'all',
    currentDateRange: null,
    previousDateRange: null,
    returningWindow: 0, // Default to "Mismo Mes" (Same Month)
    firstTimeUsersThreshold: 1, // Default threshold for first-time users
    globalUserFirstVisit: new Map(), // Track first visit date for each user across all businesses
    globalUserBusinessFirstVisit: new Map() // Track first visit date for each user-business combination
};

// Chart instances
const Charts = {
    uniqueUsersChart: null,
    returningUsersChart: null,
    returningUsersPercentageChart: null,
    totalAmountChart: null,
    avgVisitsChart: null,
    firstTimeUsersChart: null,
    avgSpendPerUserChart: null,
    dailySalesChart: null,
    modalChart: null,
    currentExpandedChart: null,
    currentEnlargedChart: null,
    monthlyProjectionChart: null,
    locationUsersChart: null,
    locationGMVChart: null
};

// Date picker instances
const DatePickers = {
    currentDatePicker: null,
    previousDatePicker: null
};
