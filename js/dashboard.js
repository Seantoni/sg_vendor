// Dashboard Management Functions
// ==============================

// Function to calculate returning users by month based on returningWindow
function calculateReturningUsersByMonth(data, months) {
    const returningUsersByMonth = [];
    
    for (let i = 0; i < months.length; i++) {
        const currentMonth = months[i];
        const currentMonthDate = new Date(currentMonth + '-01');
        
        // Get users from current month
        const currentMonthUsers = new Set(
            data.filter(item => {
                const date = parseDate(item.date);
                return date && formatYearMonth(date) === currentMonth;
            }).map(item => item.email)
        );
        
        let returningCount = 0;
        
        if (AppState.returningWindow === 0) {
            // Same month: users with multiple visits in the same month
            const userVisitsInMonth = {};
            data.forEach(item => {
                const date = parseDate(item.date);
                if (date && formatYearMonth(date) === currentMonth) {
                    if (!userVisitsInMonth[item.email]) {
                        userVisitsInMonth[item.email] = 0;
                    }
                    userVisitsInMonth[item.email]++;
                }
            });
            
            returningCount = Object.values(userVisitsInMonth).filter(visits => visits > 1).length;
        } else {
            // Previous months: users who visited before the current month
            const lookbackDate = new Date(currentMonthDate);
            lookbackDate.setMonth(lookbackDate.getMonth() - AppState.returningWindow);
            
            const historicalUsers = new Set(
                data.filter(item => {
                    const date = parseDate(item.date);
                    if (!date) return false;
                    return date >= lookbackDate && date < currentMonthDate;
                }).map(item => item.email)
            );
            
            returningCount = [...currentMonthUsers].filter(email => historicalUsers.has(email)).length;
        }
        
        returningUsersByMonth.push(returningCount);
    }
    
    return returningUsersByMonth;
}

// Store debug data for the modal
window.firstTimeUsersDebugData = {};

// Function to calculate first-time users by month
function calculateFirstTimeUsersByMonth(data, months) {
    const firstTimeUsersByMonth = [];
    
    // Reset debug data
    window.firstTimeUsersDebugData = {};

    // Helper to check if user had any transactions in selected business within [start, end)
    function hasBusinessTxInWindow(email, businessName, startDate, endDate) {
        // Scan global transactionData to ensure we see outside current filters
        for (const item of (AppState.transactionData || [])) {
            if (item.email !== email) continue;
            const b = extractBusinessName(item.merchant);
            if (b !== businessName) continue;
            const d = parseDate(item.date);
            if (!d) continue;
            if (d >= startDate && d < endDate) return true;
        }
        return false;
    }

    const thresholdDays = AppState.firstTimeUsersThreshold || 0;
    
    // Find the selected business's first transaction date to validate threshold
    let businessFirstTransactionDate = null;
    const selectedBusiness = AppState.selectedBusiness;
    
    if (selectedBusiness && selectedBusiness !== 'all') {
        // Find earliest transaction for selected business
        for (const item of (AppState.transactionData || [])) {
            const businessName = extractBusinessName(item.merchant);
            if (businessName === selectedBusiness) {
                const d = parseDate(item.date);
                if (d) {
                    if (!businessFirstTransactionDate || d < businessFirstTransactionDate) {
                        businessFirstTransactionDate = d;
                    }
                }
            }
        }
        
        // Check if business has enough history for the threshold
        if (businessFirstTransactionDate) {
            const today = new Date();
            const businessAgeDays = Math.floor((today - businessFirstTransactionDate) / (1000 * 60 * 60 * 24));
            
            if (businessAgeDays < thresholdDays) {
                console.warn(`⚠️ Selected business has only ${businessAgeDays} days of history, but threshold is ${thresholdDays} days. No "Nuevos o Reactivados" can be counted yet.`);
                // Return zeros for all months - business too new for this threshold
                return months.map(() => 0);
            }
        }
    }

    for (let i = 0; i < months.length; i++) {
        const currentMonth = months[i];
        const currentMonthDate = new Date(currentMonth + '-01');

        // Get transactions from current month only
        const currentMonthTx = data.filter(item => {
            const date = parseDate(item.date);
            return date && formatYearMonth(date) === currentMonth;
        });

        let count = 0;
        const monthDebugData = [];

        currentMonthTx.forEach(item => {
            const email = item.email;
            const businessName = extractBusinessName(item.merchant);

            // Respect selected business (in case data still includes multiple)
            if (AppState.selectedBusiness && AppState.selectedBusiness !== 'all') {
                if (businessName !== AppState.selectedBusiness) return;
            }

            const itemDate = parseDate(item.date);
            if (!itemDate) return;

            // User's first transaction anywhere (program entry)
            const globalFirstStr = AppState.globalUserFirstVisit && AppState.globalUserFirstVisit.get(email);
            if (!globalFirstStr) return; // no program entry date
            const globalFirst = parseDate(globalFirstStr);
            if (!globalFirst) return;

            // Must be at least thresholdDays after program entry
            const daysSinceProgramEntry = Math.floor((itemDate - globalFirst) / (1000 * 60 * 60 * 24));
            
            // Ensure NO transactions in this business within the first thresholdDays after program entry
            const windowStart = new Date(globalFirst);
            const windowEnd = new Date(globalFirst);
            windowEnd.setDate(windowEnd.getDate() + thresholdDays);

            const hadBusinessTxInWindow = hasBusinessTxInWindow(email, businessName, windowStart, windowEnd);
            const qualifies = daysSinceProgramEntry >= thresholdDays && !hadBusinessTxInWindow;

            // Store debug info for this user
            monthDebugData.push({
                email: email,
                globalFirst: globalFirst,
                daysSinceProgramEntry: daysSinceProgramEntry,
                transactionDate: itemDate,
                hadBusinessTxInWindow: hadBusinessTxInWindow,
                qualifies: qualifies,
                reason: !qualifies ? 
                    (daysSinceProgramEntry < thresholdDays ? 
                        `Solo ${daysSinceProgramEntry} días desde primera (necesita ${thresholdDays})` : 
                        'Ya tenía transacciones en el período inicial') : 
                    '✅ Califica'
            });

            if (qualifies) {
                count++;
            }
        });

        // Store debug data for this month
        window.firstTimeUsersDebugData[currentMonth] = monthDebugData;

        firstTimeUsersByMonth.push(count);
    }

    return firstTimeUsersByMonth;
}

// Function to calculate growth
function calculateGrowth(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

// Function to format growth
function formatGrowth(growth) {
    const prefix = growth > 0 ? '+' : '';
    return `${prefix}${growth.toFixed(1)}%`;
}

// Function to update comparison display
function updateComparisonDisplay(elementId, growth) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = formatGrowth(growth);

    // Remove existing classes
    element.classList.remove('positive', 'negative', 'neutral');

    // Add appropriate class based on growth
    if (growth > 0) {
        element.classList.add('positive');
    } else if (growth < 0) {
        element.classList.add('negative');
    } else {
        element.classList.add('neutral');
    }
}

// Function to calculate average visits
function calculateAverageVisits(data) {
    // Group transactions by user
    const userVisits = {};
    data.forEach(item => {
        if (!userVisits[item.email]) {
            userVisits[item.email] = 0;
        }
        userVisits[item.email]++;
    });

    // Calculate average visits
    const totalUsers = Object.keys(userVisits).length;
    if (totalUsers === 0) return 0;

    const totalVisits = Object.values(userVisits).reduce((sum, visits) => sum + visits, 0);
    return totalVisits / totalUsers;
}

// Function to update dashboard with filtered data
function updateDashboard(data) {
    // Check if we're on the correct page before updating dashboard
    if (!document.getElementById('businessSearch') || !document.getElementById('uniqueUsers')) {
        console.log('UpdateDashboard: Not on the main analytics page, skipping dashboard update');
        return;
    }
    
    // Remove notification if it exists
    const notification = document.getElementById('selectBusinessNotification');
    if (notification) {
        notification.remove();
    }
    
    // Ensure data is an array
    const safeData = Array.isArray(data) ? data : [];

    // Apply date range filtering
    let filteredData = safeData;
    if (AppState.currentDateRange && AppState.currentDateRange.length === 2) {
        const startDate = new Date(AppState.currentDateRange[0]);
        const endDate = new Date(AppState.currentDateRange[1]);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        filteredData = safeData.filter(item => {
            const date = new Date(item.date);
            return date >= startDate && date <= endDate;
        });
    }

    // Get data for previous period
    let previousPeriodData = [];
    if (AppState.previousDateRange && AppState.previousDateRange.length === 2) {
        const prevStartDate = new Date(AppState.previousDateRange[0]);
        const prevEndDate = new Date(AppState.previousDateRange[1]);
        prevStartDate.setHours(0, 0, 0, 0);
        prevEndDate.setHours(23, 59, 59, 999);

        previousPeriodData = safeData.filter(item => {
            const date = new Date(item.date);
            return date >= prevStartDate && date <= prevEndDate;
        });
    }

    // Calculate metrics for current period
    const uniqueUsers = new Set(filteredData.map(item => item.email)).size;
    const uniqueUsersPrev = new Set(previousPeriodData.map(item => item.email)).size;
    safeSetText('uniqueUsers', uniqueUsers);
    safeSetText('uniqueUsersPrev', uniqueUsersPrev);
    
    // Update single period cards - Unique Users
    safeSetText('currentUniqueUsers', uniqueUsers);
    


    // Calculate returning users
    const userVisits = {};
    filteredData.forEach(item => {
        if (!userVisits[item.email]) {
            userVisits[item.email] = new Set();
        }
        userVisits[item.email].add(item.date.toDateString());
    });

    const userVisitsPrev = {};
    previousPeriodData.forEach(item => {
        if (!userVisitsPrev[item.email]) {
            userVisitsPrev[item.email] = new Set();
        }
        userVisitsPrev[item.email].add(item.date.toDateString());
    });

    // Calculate returning users based on selected window
    let returningUsers = 0;
    let returningUsersPrev = 0;

    if (AppState.returningWindow === 0) {
        // Same month: users with multiple visits in the same month
        returningUsers = Object.values(userVisits).filter(visits => visits.size > 1).length;
        returningUsersPrev = Object.values(userVisitsPrev).filter(visits => visits.size > 1).length;
    } else {
        // Previous months: users who visited before the current period
        const currentStartDate = AppState.currentDateRange ? new Date(AppState.currentDateRange[0]) : new Date();
        const lookbackDate = new Date(currentStartDate);
        lookbackDate.setMonth(lookbackDate.getMonth() - AppState.returningWindow);

        const currentUsers = new Set(filteredData.map(item => item.email));
        const historicalUsers = new Set(
            AppState.transactionData
                .filter(item => {
                    const date = new Date(item.date);
                    return date >= lookbackDate && date < currentStartDate;
                })
                .map(item => item.email)
        );

        returningUsers = [...currentUsers].filter(email => historicalUsers.has(email)).length;

        // For previous period
        const prevStartDate = AppState.previousDateRange ? new Date(AppState.previousDateRange[0]) : new Date();
        const prevLookbackDate = new Date(prevStartDate);
        prevLookbackDate.setMonth(prevLookbackDate.getMonth() - AppState.returningWindow);

        const prevUsers = new Set(previousPeriodData.map(item => item.email));
        const prevHistoricalUsers = new Set(
            AppState.transactionData
                .filter(item => {
                    const date = new Date(item.date);
                    return date >= prevLookbackDate && date < prevStartDate;
                })
                .map(item => item.email)
        );

        returningUsersPrev = [...prevUsers].filter(email => prevHistoricalUsers.has(email)).length;
    }

    safeSetText('returningUsers', returningUsers);
    safeSetText('returningUsersPrev', returningUsersPrev);

    // Calculate total amount
    const totalAmount = filteredData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const totalAmountPrev = previousPeriodData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    safeSetText('totalAmount', `$${totalAmount.toLocaleString()}`);
    safeSetText('totalAmountPrev', `$${totalAmountPrev.toLocaleString()}`);
    
    // Update single period cards - Total Amount
    safeSetText('currentTotalAmount', `$${totalAmount.toLocaleString()}`);

    // Calculate average visits
    const avgVisits = calculateAverageVisits(filteredData);
    const avgVisitsPrev = calculateAverageVisits(previousPeriodData);
    safeSetText('avgVisits', avgVisits.toFixed(1));
    safeSetText('avgVisitsPrev', avgVisitsPrev.toFixed(1));
    
    // Update single period cards - Average Visits
    safeSetText('currentAvgVisits', avgVisits.toFixed(1));

    // Calculate average ticket (average transaction amount)
    const avgTicket = uniqueUsers > 0 ? totalAmount / uniqueUsers : 0;
    safeSetText('currentAvgTicket', `$${avgTicket.toFixed(2)}`);

    // Update comparison displays
    const usersGrowth = calculateGrowth(uniqueUsers, uniqueUsersPrev);
    const returningUsersGrowth = calculateGrowth(returningUsers, returningUsersPrev);
    const amountGrowth = calculateGrowth(totalAmount, totalAmountPrev);
    const avgVisitsGrowth = calculateGrowth(avgVisits, avgVisitsPrev);

    updateComparisonDisplay('usersComparison', usersGrowth);
    updateComparisonDisplay('returningUsersComparison', returningUsersGrowth);
    updateComparisonDisplay('amountComparison', amountGrowth);
    updateComparisonDisplay('avgVisitsComparison', avgVisitsGrowth);

    // Update charts with processed data and calculated metrics
    updateCharts(filteredData, {
        returningUsers: returningUsers,
        returningUsersPrev: returningUsersPrev,
        uniqueUsers: uniqueUsers,
        uniqueUsersPrev: uniqueUsersPrev,
        totalAmount: totalAmount,
        totalAmountPrev: totalAmountPrev,
        avgVisits: avgVisits,
        avgVisitsPrev: avgVisitsPrev
    });
}

// Function to update charts
function updateCharts(data, calculatedMetrics = {}) {
    try {
        // Expose the currently filtered dataset globally for debug modals
        window.filteredTransactionData = Array.isArray(data) ? data : [];
        // Process data for chart visualization
        const monthlyData = {};
        
        data.forEach(item => {
            const date = parseDate(item.date);
            if (!date) return;
            
            const monthKey = formatYearMonth(date);
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    users: new Set(),
                    visits: 0,
                    amount: 0
                };
            }
            
            monthlyData[monthKey].users.add(item.email);
            monthlyData[monthKey].visits++;
            monthlyData[monthKey].amount += parseFloat(item.amount) || 0;
        });

        // Convert to chart-friendly format
        const sortedMonths = Object.keys(monthlyData).sort();
        
        // Calculate proper returning users for each month based on returningWindow
        const returningUsersByMonth = calculateReturningUsersByMonth(data, sortedMonths);
        const returningUsersPercentage = returningUsersByMonth.map((returning, index) => {
            const total = monthlyData[sortedMonths[index]]?.users.size || 0;
            return total > 0 ? (returning / total) * 100 : 0;
        });
        
        // Calculate first-time users for each month
        const firstTimeUsersByMonth = calculateFirstTimeUsersByMonth(data, sortedMonths);
        
        const avgSpendPerUser = sortedMonths.map(month => {
            const users = monthlyData[month].users.size;
            const amount = monthlyData[month].amount;
            return users > 0 ? amount / users : 0;
        });
        
        const chartData = {
            labels: sortedMonths,
            uniqueUsers: sortedMonths.map(month => monthlyData[month].users.size),
            totalAmount: sortedMonths.map(month => monthlyData[month].amount),
            avgVisits: sortedMonths.map(month => 
                monthlyData[month].users.size > 0 
                    ? monthlyData[month].visits / monthlyData[month].users.size 
                    : 0
            ),
            returningUsers: returningUsersByMonth,
            returningUsersPercentage: returningUsersPercentage,
            firstTimeUsers: firstTimeUsersByMonth,
            avgSpendPerUser: avgSpendPerUser
        };

        // Initialize all charts with the data
        initMetricsCharts(chartData);
        
        // Initialize daily sales chart with filtered data
        initDailySalesChart(data);
        
        // Initialize projection chart (always call to show empty state if needed)
        if (window.initMonthlyProjectionChart) {
            window.initMonthlyProjectionChart(data);
        }
        
        // Initialize location charts with filtered data
        if (data && data.length > 0) {
            // Reset location chart initialization flag to force update
            AppState.locationChartInitialized = false;
            
            // Use setTimeout to ensure charts are created after DOM is ready
            setTimeout(() => {
                if (window.initLocationUsersChart) {
                    window.initLocationUsersChart(data);
                }
                if (window.initLocationGMVChart) {
                    window.initLocationGMVChart(data);
                }
                AppState.locationChartInitialized = true;
            }, 50);
        }
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}
