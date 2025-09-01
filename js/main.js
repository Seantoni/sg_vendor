// Main Application Entry Point
// ============================

// Global variables that need to be accessed from legacy code
window.transactionData = [];
window.locationChartInitialized = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    // Check if we're on the correct page by looking for essential elements
    if (!document.getElementById('businessSearch') || !document.getElementById('uniqueUsers')) {
        console.log('Main.js: Not on the main analytics page, skipping initialization');
        return;
    }
    
    // Initialize authentication
    initializeAuth();

    // Load data from API if authenticated
    if (isAuthenticated()) {
        loadDataFromApi();
    }

    // Initialize date pickers
    initializeDatePickers();
    
    // Setup filter listeners
    setupFilterListeners();
    
    // Setup quick date filter
    setupQuickDateFilter();
    
    // Set default filters
    setDefaultFilters();
    
    // Note: UI components (sidebar, filters, modal) are now initialized by ui-components.js
});

// Function to handle file selection (if needed for local testing)
function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    console.log('Processing new file...');

    reader.onload = function (e) {
        const text = e.target.result;
        try {
            processData(text);
            filterAndUpdateDashboard();
        } catch (error) {
            alert(`Error processing file: ${error.message}`);
            console.error('Error processing file:', error);
        }
    };

    reader.readAsText(file);
}

// Load data from API
async function loadDataFromApi() {
    try {
        console.log('Loading data from API...');
        const csvData = await fetchCsvData();
        processData(csvData);
        
        // Ensure transactionData is available globally for other scripts
        window.transactionData = AppState.transactionData;
        
        filterAndUpdateDashboard();
        console.log('Data loaded and processed successfully');
    } catch (error) {
        console.error('Error loading data from API:', error);
        
        // Check if it's a session expiration error
        if (error.message === 'Session expired') {
            alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            window.location.href = 'login.html';
            return;
        }
        
        // Handle other API errors
        const errorMessage = error.message || 'Error desconocido al cargar los datos';
        alert(`Error al cargar los datos: ${errorMessage}`);
        
        // Clear dashboard data on error
        clearDashboardData();
    }
}

// Make key functions available globally for backward compatibility
window.AppState = AppState;
window.Charts = Charts;
window.DatePickers = DatePickers;
window.processData = processData;
window.filterAndUpdateDashboard = filterAndUpdateDashboard;
window.updateDashboard = updateDashboard;
window.loadDataFromApi = loadDataFromApi;
window.handleFileSelect = handleFileSelect;
