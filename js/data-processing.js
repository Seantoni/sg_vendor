// Data Processing Functions
// =========================

// Function to calculate first visit dates
function calculateFirstVisitDates(transactions) {
    // Clear existing data
    AppState.globalUserFirstVisit.clear();
    AppState.globalUserBusinessFirstVisit.clear();

    // Create email-to-code mapping for privacy (in order of first appearance)
    if (!window.emailToUserCode) {
        window.emailToUserCode = new Map();
        let userCodeCounter = 1;
        
        // Sort transactions by date to assign codes in chronological order
        const sortedTx = [...transactions].sort((a, b) => a.date - b.date);
        
        sortedTx.forEach(item => {
            if (!window.emailToUserCode.has(item.email)) {
                window.emailToUserCode.set(item.email, `Usuario #${userCodeCounter}`);
                userCodeCounter++;
            }
        });
        
        console.log(`📋 Created privacy codes for ${window.emailToUserCode.size} users`);
    }
    
    // Create transaction ID mapping (unique ID per transaction)
    if (!window.transactionIdMap) {
        window.transactionIdMap = new Map();
        let transactionIdCounter = 1;
        
        // Sort transactions by date, then by email, then by amount, then by merchant for deterministic ordering
        const sortedTx = [...transactions].sort((a, b) => {
            // Primary: sort by date
            const dateDiff = a.date - b.date;
            if (dateDiff !== 0) return dateDiff;
            
            // Secondary: sort by email (alphabetically)
            const emailCompare = a.email.localeCompare(b.email);
            if (emailCompare !== 0) return emailCompare;
            
            // Tertiary: sort by amount
            const amountDiff = a.amount - b.amount;
            if (amountDiff !== 0) return amountDiff;
            
            // Quaternary: sort by merchant (alphabetically)
            return a.merchant.localeCompare(b.merchant);
        });
        
        sortedTx.forEach(item => {
            // Create a unique key for this transaction
            const txKey = `${item.email}-${item.date.getTime()}-${item.amount}-${item.merchant}`;
            
            if (!window.transactionIdMap.has(txKey)) {
                window.transactionIdMap.set(txKey, transactionIdCounter);
                transactionIdCounter++;
            }
        });
        
        console.log(`🔢 Created transaction IDs for ${window.transactionIdMap.size} transactions`);
    }

    // Process each transaction to find first visits
    transactions.forEach(item => {
        const email = item.email;
        const businessName = extractBusinessName(item.merchant);

        // Track first visit ever (across all businesses)
        if (!AppState.globalUserFirstVisit.has(email)) {
            AppState.globalUserFirstVisit.set(email, item.date);
        } else if (item.date < AppState.globalUserFirstVisit.get(email)) {
            AppState.globalUserFirstVisit.set(email, item.date);
        }

        // Track first visit to specific business
        const userBusinessKey = `${email}-${businessName}`;
        if (!AppState.globalUserBusinessFirstVisit.has(userBusinessKey)) {
            AppState.globalUserBusinessFirstVisit.set(userBusinessKey, item.date);
        } else if (item.date < AppState.globalUserBusinessFirstVisit.get(userBusinessKey)) {
            AppState.globalUserBusinessFirstVisit.set(userBusinessKey, item.date);
        }
    });
}

// Function to process CSV data
function processData(csvText) {
    const lines = csvText.split('\n');
    const headers = parseCSVLine(lines[0].toLowerCase());

    // Map the exact headers from the CSV file
    const columnMappings = {
        email: ['user email'],
        merchant: ['merchant'],
        date: ['date'],
        amount: ['transaction amount']
    };

    // Find actual column indices
    const columnIndices = {
        email: headers.findIndex(header => columnMappings.email.includes(header)),
        merchant: headers.findIndex(header => columnMappings.merchant.includes(header)),
        date: headers.findIndex(header => columnMappings.date.includes(header)),
        amount: headers.findIndex(header => columnMappings.amount.includes(header))
    };

    // Debug log to see what headers were found
    console.log('Found column indices:', {
        headers: headers,
        indices: columnIndices
    });

    // Validate that all required columns were found
    const missingColumns = Object.entries(columnIndices)
        .filter(([key, index]) => index === -1)
        .map(([key]) => key);

    if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Process data rows
    AppState.transactionData = [];
    let invalidDateCount = 0;
    let invalidAmountCount = 0;
    let excludedCount = 0;
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const values = parseCSVLine(line);
            
            if (values.length > Math.max(...Object.values(columnIndices))) {
                const email = values[columnIndices.email]?.replace(/^"|"$/g, '').trim();
                const merchant = values[columnIndices.merchant]?.replace(/^"|"$/g, '').trim();
                const dateStr = values[columnIndices.date]?.replace(/^"|"$/g, '').trim();
                const amountStr = values[columnIndices.amount]?.replace(/^"|"$/g, '').trim();

                if (email && merchant && dateStr && amountStr) {
                    const date = parseDate(dateStr);
                    const amount = parseFloat(amountStr);

                    if (!date) {
                        invalidDateCount++;
                        if (invalidDateCount <= 5) {
                            console.warn(`Invalid date at line ${i + 1}: "${dateStr}"`);
                        }
                    } else if (isNaN(amount)) {
                        invalidAmountCount++;
                    } else if (shouldExcludeTransaction(email, dateStr)) {
                        excludedCount++;
                    } else {
                        AppState.transactionData.push({
                            email: email,
                            merchant: merchant,
                            date: date,
                            amount: amount
                        });
                    }
                }
            }
        }
    }

    console.log(`Processed ${AppState.transactionData.length} valid transactions`);
    if (invalidDateCount > 0) console.log(`Skipped ${invalidDateCount} rows with invalid dates`);
    if (invalidAmountCount > 0) console.log(`Skipped ${invalidAmountCount} rows with invalid amounts`);
    if (excludedCount > 0) console.log(`Excluded ${excludedCount} transactions`);
    
    if (AppState.transactionData.length === 0) {
        throw new Error('No hay transacciones válidas para procesar. Por favor verifica el formato de los datos.');
    }
    
    // Calculate first visit dates
    calculateFirstVisitDates(AppState.transactionData);
    
    // Reset filters
    AppState.selectedBusiness = 'all';
    AppState.selectedLocation = 'all';
    
    // Reset location chart initialization flag
    AppState.locationChartInitialized = false;
    window.locationChartInitialized = false;

    // Update filters
    console.log('Updating business filter with', AppState.transactionData.length, 'transactions');
    initializeBusinessSearch(); // Reinitialize business search with new data
    updateLocationFilter();

    // Build businesses and locations lists for filtering
    updateBusinessFilter();
    updateLocationFilter();
    
    // Update the latest transaction date display
    updateLatestTransactionDate();
}

// Function to filter and update dashboard
function filterAndUpdateDashboard() {
    // Ensure transactionData is an array
    if (!Array.isArray(AppState.transactionData)) {
        console.error('Transaction data is not an array');
        AppState.transactionData = [];
    }
    
    // First, filter out excluded transactions
    let filteredData = AppState.transactionData.filter(item => !shouldExcludeTransaction(item.email, item.date));
    
    // If no specific business is selected, show no data
    if (AppState.selectedBusiness === 'all') {
        // Clear all metrics
        clearDashboardData();
        return;
    }

    // Apply business and location filters
    if (AppState.selectedBusiness !== 'all' || AppState.selectedLocation !== 'all') {
        filteredData = filteredData.filter(item => {
            const businessName = extractBusinessName(item.merchant);
            const location = extractLocation(item.merchant);
            
            let businessMatch = false;
            
            if (AppState.selectedBusiness === 'all') {
                businessMatch = true;
            } else {
                // Exact match
                if (businessName === AppState.selectedBusiness) {
                    businessMatch = true;
                } else {
                    // Check if they belong to the same business group (handle typos/encoding)
                    const normalizedSelectedBusiness = normalizeBusinessName(AppState.selectedBusiness);
                    const normalizedBusinessName = normalizeBusinessName(businessName);
                    
                    if (normalizedBusinessName === normalizedSelectedBusiness) {
                        businessMatch = true;
                    } else {
                        // Additional check: see if they're in the same similarity group
                        if (window.businessGroups) {
                            const selectedGroup = window.businessGroups.find(group => 
                                group.all.includes(AppState.selectedBusiness)
                            );
                            
                            if (selectedGroup && selectedGroup.all.includes(businessName)) {
                                businessMatch = true;
                            }
                        } else {
                            // Fallback: use similarity function directly
                            const allBusinesses = [...new Set(AppState.transactionData.map(item => extractBusinessName(item.merchant)))];
                            const similarToSelected = findSimilarBusinesses(AppState.selectedBusiness, allBusinesses, 0.85);
                            
                            if (similarToSelected.includes(businessName)) {
                                businessMatch = true;
                            }
                        }
                    }
                }
            }
            
            const locationMatch = AppState.selectedLocation === 'all' || location === AppState.selectedLocation;
            return businessMatch && locationMatch;
        });
    }

    // Apply date filtering if date ranges are selected
    if (AppState.currentDateRange && AppState.currentDateRange.length === 2) {
        const [currentStart, currentEnd] = AppState.currentDateRange;
        filteredData = filteredData.filter(item => {
            const itemDate = parseDate(item.date);
            if (!itemDate) return false;
            
            // Check if item date is within current date range
            return itemDate >= currentStart && itemDate <= currentEnd;
        });
    }

    // If no date ranges are selected and we have data, set default periods to current quarter
    if ((!AppState.currentDateRange || AppState.currentDateRange.length !== 2) && filteredData.length > 0) {
        const sortedData = [...filteredData].sort((a, b) => a.date - b.date);
        const lastTransactionDate = new Date(sortedData[sortedData.length - 1].date);

        // Get current quarter based on last transaction date
        const getQuarter = (date) => Math.floor(date.getMonth() / 3);
        const currentQuarter = getQuarter(lastTransactionDate);
        const currentYear = lastTransactionDate.getFullYear();
        
        // Calculate start and end of current quarter
        const quarterStartMonth = currentQuarter * 3;
        const currentStartMonth = new Date(currentYear, quarterStartMonth, 1);
        const currentEndMonth = new Date(currentYear, quarterStartMonth + 2, 1);
        
        const currentStart = new Date(currentYear, quarterStartMonth, 1);
        const currentEnd = new Date(currentYear, quarterStartMonth + 3, 0, 23, 59, 59, 999);

        AppState.currentDateRange = [currentStart, currentEnd];
        DatePickers.currentDatePicker.setDate([currentStartMonth, currentEndMonth]);
        
        const currentInput = document.querySelector('#currentDateRange');
        if (currentInput) {
            const quarterLabel = `Q${currentQuarter + 1} ${currentYear}`;
            const startMonthName = currentStart.toLocaleDateString('es-MX', { month: 'short' });
            const endMonthName = currentEnd.toLocaleDateString('es-MX', { month: 'short' });
            currentInput.value = `${startMonthName} - ${endMonthName} ${currentYear} (${quarterLabel})`;
        }

        // Set previous period to the previous quarter
        const prevQuarter = currentQuarter - 1;
        const prevYear = prevQuarter < 0 ? currentYear - 1 : currentYear;
        const prevQuarterAdjusted = prevQuarter < 0 ? 3 : prevQuarter;
        
        const prevQuarterStartMonth = prevQuarterAdjusted * 3;
        const previousStartMonth = new Date(prevYear, prevQuarterStartMonth, 1);
        const previousEndMonth = new Date(prevYear, prevQuarterStartMonth + 2, 1);
        
        const previousStart = new Date(prevYear, prevQuarterStartMonth, 1);
        const previousEnd = new Date(prevYear, prevQuarterStartMonth + 3, 0, 23, 59, 59, 999);

        AppState.previousDateRange = [previousStart, previousEnd];
        DatePickers.previousDatePicker.setDate([previousStartMonth, previousEndMonth]);
        
        const previousInput = document.querySelector('#previousDateRange');
        if (previousInput) {
            const quarterLabel = `Q${prevQuarterAdjusted + 1} ${prevYear}`;
            const startMonthName = previousStart.toLocaleDateString('es-MX', { month: 'short' });
            const endMonthName = previousEnd.toLocaleDateString('es-MX', { month: 'short' });
            previousInput.value = `${startMonthName} - ${endMonthName} ${prevYear} (${quarterLabel})`;
        }
    }

    // Update the dashboard with filtered data
    updateDashboard(filteredData);
}

// Function to find latest transaction date
function findLatestTransactionDate(data) {
    if (!data || data.length === 0) return null;
    
    let latestDate = null;
    data.forEach(item => {
        const date = parseDate(item.date);
        if (date && (!latestDate || date > latestDate)) {
            latestDate = date;
        }
    });
    
    return latestDate;
}

// Function to update latest transaction date display
function updateLatestTransactionDate() {
    const latestDate = findLatestTransactionDate(AppState.transactionData);
    const element = document.getElementById('latestTransactionDate');
    
    if (element && latestDate) {
        const formattedDate = latestDate.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        element.textContent = `Fecha más reciente: ${formattedDate}`;
    } else if (element) {
        element.textContent = 'Fecha más reciente: No disponible';
    }
}
