// Date Picker and Filter Handlers
// ================================

// Function to initialize date pickers
function initializeDatePickers() {
    // Initialize current period date picker
    DatePickers.currentDatePicker = flatpickr("#currentDateRange", {
        mode: "range",
        dateFormat: "M j, Y",
        defaultDate: null,
        onChange: function (selectedDates) {
            if (selectedDates.length === 2) {
                AppState.currentDateRange = selectedDates;
                
                // Calculate the number of days in the current period
                const days = getDaysBetween(selectedDates[0], selectedDates[1]);
                
                // Update the input display to show the day count
                const input = document.querySelector('#currentDateRange');
                if (input) {
                    input.value = `${selectedDates[0].toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })} to ${selectedDates[1].toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })} (${days} days)`;
                }

                // Automatically set previous period based on current selection
                const periodLength = selectedDates[1] - selectedDates[0];
                const previousEnd = new Date(selectedDates[0]);
                previousEnd.setDate(previousEnd.getDate() - 1); // Day before current start
                const previousStart = new Date(previousEnd);
                previousStart.setTime(previousEnd.getTime() - periodLength);

                AppState.previousDateRange = [previousStart, previousEnd];
                DatePickers.previousDatePicker.setDate([previousStart, previousEnd]);
                
                const previousDays = getDaysBetween(previousStart, previousEnd);
                const previousInput = document.querySelector('#previousDateRange');
                if (previousInput) {
                    previousInput.value = `${previousStart.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })} to ${previousEnd.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })} (${previousDays} days)`;
                }

                filterAndUpdateDashboard();
            }
        }
    });

    // Initialize previous period date picker (read-only)
    DatePickers.previousDatePicker = flatpickr("#previousDateRange", {
        mode: "range",
        dateFormat: "M j, Y",
        defaultDate: null,
        clickOpens: false, // Make it read-only
        onChange: function (selectedDates) {
            if (selectedDates.length === 2) {
                AppState.previousDateRange = selectedDates;
                filterAndUpdateDashboard();
            }
        }
    });
}

// Function to setup quick date filter
function setupQuickDateFilter() {
    document.getElementById('quickDateFilter').addEventListener('change', function (e) {
        const value = e.target.value;
        
        if (!value) return; // If no value selected, do nothing
        
        if (value === "historico") {
            // Set start date to May 1st, 2024
            const startDate = new Date(2024, 4, 1); // Note: month is 0-based (4 = May)
            
            // Get the latest transaction date
            const latestDate = findLatestTransactionDate(AppState.transactionData) || new Date();
            
            // Set the current date range
            AppState.currentDateRange = [startDate, latestDate];
            DatePickers.currentDatePicker.setDate([startDate, latestDate]);
            
            // Calculate previous period with same duration
            const duration = latestDate.getTime() - startDate.getTime();
            const prevEndDate = new Date(startDate);
            prevEndDate.setDate(prevEndDate.getDate() - 1);
            const prevStartDate = new Date(prevEndDate);
            prevStartDate.setTime(prevStartDate.getTime() - duration);
            
            // Set the previous date range
            AppState.previousDateRange = [prevStartDate, prevEndDate];
            DatePickers.previousDatePicker.setDate([prevStartDate, prevEndDate]);
        } else {
            // Handle numeric day values (existing functionality)
            const days = parseInt(value);
            
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - days);
            
            // Set the current date range
            AppState.currentDateRange = [startDate, endDate];
            DatePickers.currentDatePicker.setDate([startDate, endDate]);
            
            // Calculate and set the previous period
            const prevEndDate = new Date(startDate);
            prevEndDate.setDate(prevEndDate.getDate() - 1);
            const prevStartDate = new Date(prevEndDate);
            prevStartDate.setDate(prevStartDate.getDate() - days);
            
            // Set the previous date range
            AppState.previousDateRange = [prevStartDate, prevEndDate];
            DatePickers.previousDatePicker.setDate([prevStartDate, prevEndDate]);
        }
        
        // Update the dashboard with new date ranges
        filterAndUpdateDashboard();
    });
}

// Function to setup other filter listeners
function setupFilterListeners() {
    // Set up business filter listener
    document.getElementById('businessSearch').addEventListener('change', function (e) {
        AppState.selectedBusiness = e.target.value;
        updateLocationFilter();
        // Reset date ranges when business changes
        AppState.currentDateRange = null;
        AppState.previousDateRange = null;
        filterAndUpdateDashboard();
    });

    // Set up location filter listener
    document.getElementById('locationSearch').addEventListener('change', function (e) {
        AppState.selectedLocation = e.target.value;
        // Reset date ranges when location changes
        AppState.currentDateRange = null;
        AppState.previousDateRange = null;
        filterAndUpdateDashboard();
    });

    // Set up returning window listener
    document.getElementById('returningWindow').addEventListener('change', function (e) {
        AppState.returningWindow = parseInt(e.target.value);
        filterAndUpdateDashboard();
    });

    // Set up first time users threshold listener
    document.getElementById('firstTimeUsersThreshold').addEventListener('change', function (e) {
        AppState.firstTimeUsersThreshold = parseInt(e.target.value);
        filterAndUpdateDashboard();
    });
}

// Function to set default filters
function setDefaultFilters() {
    // Make sure the dropdown shows the correct default value
    document.getElementById('returningWindow').value = '0';
    
    // Set default 90-day filter and trigger it
    const quickDateFilter = document.getElementById('quickDateFilter');
    if (quickDateFilter) {
        quickDateFilter.value = '90';
        // Trigger the change event to apply the 90-day filter
        quickDateFilter.dispatchEvent(new Event('change'));
        
        // Location charts will be updated automatically by the filter flow
    }
}
