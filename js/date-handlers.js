// Date Picker and Filter Handlers
// ================================

// Function to initialize date pickers
function initializeDatePickers() {
    // Initialize current period date picker - using month range selection
    DatePickers.currentDatePicker = flatpickr("#currentDateRange", {
        plugins: [
            new monthSelectPlugin({
                shorthand: false,
                dateFormat: "F Y",
                altFormat: "F Y",
                theme: "light"
            })
        ],
        mode: "range",
        onChange: function (selectedDates) {
            if (selectedDates.length === 2) {
                // User selected a range of months
                const startMonth = selectedDates[0];
                const endMonth = selectedDates[1];
                
                // Set to first day of start month
                const startDate = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
                // Set to last day of end month
                const endDate = new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0, 23, 59, 59, 999);
                
                AppState.currentDateRange = [startDate, endDate];
                
                // Update the input display to show the month range
                const input = document.querySelector('#currentDateRange');
                if (input) {
                    if (startMonth.getFullYear() === endMonth.getFullYear() && startMonth.getMonth() === endMonth.getMonth()) {
                        // Same month
                        input.value = startMonth.toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric'
                        });
                    } else {
                        // Different months
                        input.value = `${startMonth.toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                        })} - ${endMonth.toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                        })}`;
                    }
                }

                // Calculate the duration in months
                const monthsDiff = (endMonth.getFullYear() - startMonth.getFullYear()) * 12 + 
                                  (endMonth.getMonth() - startMonth.getMonth()) + 1;

                // Automatically set previous period with same duration
                const prevEndMonth = new Date(startMonth.getFullYear(), startMonth.getMonth() - 1, 1);
                const prevStartMonth = new Date(prevEndMonth.getFullYear(), prevEndMonth.getMonth() - monthsDiff + 1, 1);
                
                const prevStartDate = new Date(prevStartMonth.getFullYear(), prevStartMonth.getMonth(), 1);
                const prevEndDate = new Date(prevEndMonth.getFullYear(), prevEndMonth.getMonth() + 1, 0, 23, 59, 59, 999);

                AppState.previousDateRange = [prevStartDate, prevEndDate];
                DatePickers.previousDatePicker.setDate([prevStartMonth, prevEndMonth]);
                
                const previousInput = document.querySelector('#previousDateRange');
                if (previousInput) {
                    if (prevStartMonth.getFullYear() === prevEndMonth.getFullYear() && 
                        prevStartMonth.getMonth() === prevEndMonth.getMonth()) {
                        previousInput.value = prevStartMonth.toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric'
                        });
                    } else {
                        previousInput.value = `${prevStartMonth.toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                        })} - ${prevEndMonth.toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                        })}`;
                    }
                }

                filterAndUpdateDashboard();
            } else if (selectedDates.length === 1) {
                // User selected just one month (treat as single month range)
                const selectedMonth = selectedDates[0];
                const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
                const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59, 999);
                
                AppState.currentDateRange = [startDate, endDate];
                
                const input = document.querySelector('#currentDateRange');
                if (input) {
                    input.value = selectedMonth.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                    });
                }
            }
        }
    });

    // Initialize previous period date picker (read-only) - also using month range selection
    DatePickers.previousDatePicker = flatpickr("#previousDateRange", {
        plugins: [
            new monthSelectPlugin({
                shorthand: false,
                dateFormat: "F Y",
                altFormat: "F Y",
                theme: "light"
            })
        ],
        mode: "range",
        clickOpens: false, // Make it read-only
        onChange: function (selectedDates) {
            if (selectedDates.length === 2) {
                const startMonth = selectedDates[0];
                const endMonth = selectedDates[1];
                
                const startDate = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
                const endDate = new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0, 23, 59, 59, 999);
                
                AppState.previousDateRange = [startDate, endDate];
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
            // Set start date to May 2024 (all data)
            const startMonth = new Date(2024, 4, 1); // Note: month is 0-based (4 = May)
            
            // Get the latest transaction date
            const latestDate = findLatestTransactionDate(AppState.transactionData) || new Date();
            const endMonth = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
            
            const startDate = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
            const endDate = new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0, 23, 59, 59, 999);
            
            // Set the current date range
            AppState.currentDateRange = [startDate, endDate];
            DatePickers.currentDatePicker.setDate([startMonth, endMonth]);
            
            const currentInput = document.querySelector('#currentDateRange');
            if (currentInput) {
                currentInput.value = `May 2024 - ${endMonth.toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                })}`;
            }
            
            // Calculate months in range
            const monthsDiff = (endMonth.getFullYear() - startMonth.getFullYear()) * 12 + 
                              (endMonth.getMonth() - startMonth.getMonth()) + 1;
            
            // Set previous period with same duration
            const prevEndMonth = new Date(2024, 3, 1); // April 2024
            const prevStartMonth = new Date(prevEndMonth.getFullYear(), prevEndMonth.getMonth() - monthsDiff + 1, 1);
            
            const prevStartDate = new Date(prevStartMonth.getFullYear(), prevStartMonth.getMonth(), 1);
            const prevEndDate = new Date(prevEndMonth.getFullYear(), prevEndMonth.getMonth() + 1, 0, 23, 59, 59, 999);
            
            AppState.previousDateRange = [prevStartDate, prevEndDate];
            DatePickers.previousDatePicker.setDate([prevStartMonth, prevEndMonth]);
            
            const previousInput = document.querySelector('#previousDateRange');
            if (previousInput) {
                if (prevStartMonth.getMonth() === prevEndMonth.getMonth()) {
                    previousInput.value = prevStartMonth.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                    });
                } else {
                    previousInput.value = `${prevStartMonth.toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                    })} - ${prevEndMonth.toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                    })}`;
                }
            }
        } else {
            // Handle month-based values (convert days to approximate months)
            const days = parseInt(value);
            const monthsBack = Math.max(0, Math.floor(days / 30) - 1); // Convert to months, subtract 1 to get the end month
            
            const today = new Date();
            const endMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startMonth = new Date(today.getFullYear(), today.getMonth() - monthsBack, 1);
            
            // Set current period
            const startDate = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
            const endDate = new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0, 23, 59, 59, 999);
            
            AppState.currentDateRange = [startDate, endDate];
            DatePickers.currentDatePicker.setDate([startMonth, endMonth]);
            
            const currentInput = document.querySelector('#currentDateRange');
            if (currentInput) {
                if (startMonth.getMonth() === endMonth.getMonth() && startMonth.getFullYear() === endMonth.getFullYear()) {
                    currentInput.value = endMonth.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                    });
                } else {
                    currentInput.value = `${startMonth.toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                    })} - ${endMonth.toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                    })}`;
                }
            }
            
            // Set previous period with same duration
            const numMonths = monthsBack + 1;
            const prevEndMonth = new Date(startMonth.getFullYear(), startMonth.getMonth() - 1, 1);
            const prevStartMonth = new Date(prevEndMonth.getFullYear(), prevEndMonth.getMonth() - numMonths + 1, 1);
            
            const prevStartDate = new Date(prevStartMonth.getFullYear(), prevStartMonth.getMonth(), 1);
            const prevEndDate = new Date(prevEndMonth.getFullYear(), prevEndMonth.getMonth() + 1, 0, 23, 59, 59, 999);
            
            AppState.previousDateRange = [prevStartDate, prevEndDate];
            DatePickers.previousDatePicker.setDate([prevStartMonth, prevEndMonth]);
            
            const previousInput = document.querySelector('#previousDateRange');
            if (previousInput) {
                if (prevStartMonth.getMonth() === prevEndMonth.getMonth() && prevStartMonth.getFullYear() === prevEndMonth.getFullYear()) {
                    previousInput.value = prevStartMonth.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                    });
                } else {
                    previousInput.value = `${prevStartMonth.toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                    })} - ${prevEndMonth.toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                    })}`;
                }
            }
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
