/**
 * Full Business Analysis Module
 * Generates comprehensive analysis of all metrics with insights and recommendations
 */

// Open full analysis modal
function openFullAnalysisModal() {
    const modal = document.getElementById('fullAnalysisModal');
    const body = document.getElementById('fullAnalysisBody');
    const subtitle = document.getElementById('fullAnalysisSubtitle');
    
    // Show modal with loading state
    modal.classList.remove('hidden');
    body.innerHTML = `
        <div class="analysis-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Generando análisis completo...</p>
        </div>
    `;
    
    // Update subtitle with business name and date range
    const businessName = AppState.selectedBusiness === 'all' 
        ? 'Todos los Negocios' 
        : AppState.selectedBusiness;
    
    let dateRangeText = '';
    if (AppState.currentDateRange && AppState.currentDateRange.length === 2) {
        const startDate = new Date(AppState.currentDateRange[0]);
        const endDate = new Date(AppState.currentDateRange[1]);
        const startStr = startDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
        const endStr = endDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
        dateRangeText = ` (${startStr} - ${endStr})`;
    }
    
    subtitle.textContent = `Análisis de: ${businessName}${dateRangeText}`;
    
    // Generate analysis after a short delay (for UX)
    setTimeout(() => {
        const analysisHTML = generateFullAnalysis();
        body.innerHTML = analysisHTML;
    }, 500);
}

// Close full analysis modal
function closeFullAnalysisModal() {
    const modal = document.getElementById('fullAnalysisModal');
    modal.classList.add('hidden');
}

// Close modal when clicking outside
function handleModalOutsideClick(event) {
    const modal = document.getElementById('fullAnalysisModal');
    if (event.target === modal) {
        closeFullAnalysisModal();
    }
}

// Generate full analysis HTML
function generateFullAnalysis() {
    // Get current metrics from DOM
    const metrics = extractCurrentMetrics();
    
    // Calculate comparison metrics if a specific business is selected
    const comparison = AppState.selectedBusiness !== 'all' ? calculateBusinessComparison(metrics) : null;
    
    // Calculate quarterly analysis
    const quarterlyAnalysis = calculateQuarterlyAnalysis();
    
    // Calculate temporal patterns and gaps
    const temporalAnalysis = calculateTemporalPatterns();
    
    // Generate insights based on metrics
    const insights = generateInsights(metrics, comparison);
    
    // Generate recommendations
    const recommendations = generateRecommendations(metrics, insights, comparison);
    
    // Build HTML
    let html = '';
    
    // Executive Summary
    html += generateExecutiveSummary(metrics, comparison, quarterlyAnalysis, insights, temporalAnalysis);
    
    // Overview Section
    html += generateOverviewSection(metrics, comparison);
    
    // Quarterly Analysis Section
    if (quarterlyAnalysis) {
        html += generateQuarterlySection(quarterlyAnalysis);
    }
    
    // Temporal Patterns Section
    if (temporalAnalysis) {
        html += generateTemporalPatternsSection(temporalAnalysis);
    }
    
    // Comparison Section (if applicable)
    if (comparison) {
        html += generateComparisonSection(comparison);
    }
    
    // User Analysis Section
    html += generateUserAnalysisSection(metrics, insights);
    
    // Financial Analysis Section
    html += generateFinancialAnalysisSection(metrics, insights);
    
    // Retention Analysis Section
    html += generateRetentionAnalysisSection(metrics, insights);
    
    return html;
}

// Extract current metrics from the dashboard
function extractCurrentMetrics() {
    const getTextContent = (id) => {
        const el = document.getElementById(id);
        return el ? el.textContent.trim() : '0';
    };
    
    const parseNumber = (str) => {
        return parseFloat(str.replace(/[^0-9.-]/g, '')) || 0;
    };
    
    return {
        uniqueUsers: parseNumber(getTextContent('uniqueUsers')),
        uniqueUsersPrev: parseNumber(getTextContent('uniqueUsersPrev')),
        totalAmount: parseNumber(getTextContent('totalAmount')),
        totalAmountPrev: parseNumber(getTextContent('totalAmountPrev')),
        returningUsers: parseNumber(getTextContent('returningUsers')),
        returningUsersPrev: parseNumber(getTextContent('returningUsersPrev')),
        avgVisits: parseNumber(getTextContent('avgVisits')),
        avgVisitsPrev: parseNumber(getTextContent('avgVisitsPrev')),
        avgTicket: parseNumber(getTextContent('avgTicket')),
        avgTicketPrev: parseNumber(getTextContent('avgTicketPrev')),
        usersGrowth: parseNumber(getTextContent('usersComparison')),
        amountGrowth: parseNumber(getTextContent('amountComparison')),
        returningGrowth: parseNumber(getTextContent('returningUsersComparison')),
        avgVisitsGrowth: parseNumber(getTextContent('avgVisitsComparison')),
        avgTicketGrowth: parseNumber(getTextContent('avgTicketComparison'))
    };
}

// Calculate business comparison metrics
function calculateBusinessComparison(currentMetrics) {
    if (!AppState.transactionData || AppState.selectedBusiness === 'all') {
        return null;
    }
    
    // Get all businesses metrics
    const allBusinesses = {};
    const currentDateRange = AppState.currentDateRange;
    
    AppState.transactionData.forEach(item => {
        const businessName = extractBusinessName(item.merchant);
        const itemDate = parseDate(item.date);
        
        // Filter by date range if applicable
        if (currentDateRange && currentDateRange.length === 2) {
            if (itemDate < currentDateRange[0] || itemDate > currentDateRange[1]) {
                return;
            }
        }
        
        if (!allBusinesses[businessName]) {
            allBusinesses[businessName] = {
                users: new Set(),
                totalAmount: 0,
                transactions: 0
            };
        }
        
        allBusinesses[businessName].users.add(item.email);
        allBusinesses[businessName].totalAmount += parseFloat(item.amount) || 0;
        allBusinesses[businessName].transactions++;
    });
    
    // Calculate metrics for each business
    const businessMetrics = Object.keys(allBusinesses).map(name => ({
        name,
        users: allBusinesses[name].users.size,
        totalAmount: allBusinesses[name].totalAmount,
        avgTicket: allBusinesses[name].transactions > 0 ? allBusinesses[name].totalAmount / allBusinesses[name].transactions : 0
    }));
    
    // Calculate averages and rankings
    const totalBusinesses = businessMetrics.length;
    const avgUsers = businessMetrics.reduce((sum, b) => sum + b.users, 0) / totalBusinesses;
    const avgAmount = businessMetrics.reduce((sum, b) => sum + b.totalAmount, 0) / totalBusinesses;
    const avgTicket = businessMetrics.reduce((sum, b) => sum + b.avgTicket, 0) / totalBusinesses;
    
    // Rank current business
    businessMetrics.sort((a, b) => b.users - a.users);
    const usersRank = businessMetrics.findIndex(b => b.name === AppState.selectedBusiness || 
        (window.businessGroups && window.businessGroups.find(g => g.primary === AppState.selectedBusiness && g.all.includes(b.name)))) + 1;
    
    businessMetrics.sort((a, b) => b.totalAmount - a.totalAmount);
    const amountRank = businessMetrics.findIndex(b => b.name === AppState.selectedBusiness || 
        (window.businessGroups && window.businessGroups.find(g => g.primary === AppState.selectedBusiness && g.all.includes(b.name)))) + 1;
    
    businessMetrics.sort((a, b) => b.avgTicket - a.avgTicket);
    const ticketRank = businessMetrics.findIndex(b => b.name === AppState.selectedBusiness || 
        (window.businessGroups && window.businessGroups.find(g => g.primary === AppState.selectedBusiness && g.all.includes(b.name)))) + 1;
    
    return {
        totalBusinesses,
        avgUsers,
        avgAmount,
        avgTicket,
        usersRank,
        amountRank,
        ticketRank,
        usersDiff: ((currentMetrics.uniqueUsers - avgUsers) / avgUsers) * 100,
        amountDiff: ((currentMetrics.totalAmount - avgAmount) / avgAmount) * 100,
        ticketDiff: ((currentMetrics.avgTicket - avgTicket) / avgTicket) * 100
    };
}

// Calculate quarterly analysis
function calculateQuarterlyAnalysis() {
    if (!AppState.transactionData || AppState.transactionData.length === 0) {
        return null;
    }
    
    // Get quarter from date
    const getQuarter = (date) => {
        const month = date.getMonth();
        return Math.floor(month / 3) + 1;
    };
    
    const getQuarterLabel = (year, quarter) => {
        return `Q${quarter} ${year}`;
    };
    
    // Group transactions by quarter
    const quarterlyData = {};
    
    AppState.transactionData.forEach(item => {
        const date = parseDate(item.date);
        if (!date) return;
        
        // Apply business/location filters
        const businessName = extractBusinessName(item.merchant);
        const location = extractLocation(item.merchant);
        
        if (AppState.selectedBusiness !== 'all' && businessName !== AppState.selectedBusiness) {
            // Check if same business group
            if (window.businessGroups) {
                const selectedGroup = window.businessGroups.find(g => g.primary === AppState.selectedBusiness);
                if (!selectedGroup || !selectedGroup.all.includes(businessName)) {
                    return;
                }
            } else {
                return;
            }
        }
        
        if (AppState.selectedLocation !== 'all' && location !== AppState.selectedLocation) {
            return;
        }
        
        const year = date.getFullYear();
        const quarter = getQuarter(date);
        const quarterKey = `${year}-Q${quarter}`;
        const quarterLabel = getQuarterLabel(year, quarter);
        
        if (!quarterlyData[quarterKey]) {
            quarterlyData[quarterKey] = {
                label: quarterLabel,
                year: year,
                quarter: quarter,
                users: new Set(),
                totalAmount: 0,
                transactions: 0
            };
        }
        
        quarterlyData[quarterKey].users.add(item.email);
        quarterlyData[quarterKey].totalAmount += parseFloat(item.amount) || 0;
        quarterlyData[quarterKey].transactions++;
    });
    
    // Sort quarters chronologically
    const sortedQuarters = Object.keys(quarterlyData).sort();
    
    if (sortedQuarters.length < 2) {
        return null; // Need at least 2 quarters for comparison
    }
    
    // Get up to last 4 quarters (or all available if less than 4)
    const numQuartersToShow = Math.min(4, sortedQuarters.length);
    const selectedQuarters = sortedQuarters.slice(-numQuartersToShow);
    
    // Get current and previous quarter (for main comparison)
    const currentQuarterKey = selectedQuarters[selectedQuarters.length - 1];
    const previousQuarterKey = selectedQuarters[selectedQuarters.length - 2];
    
    const currentQuarter = quarterlyData[currentQuarterKey];
    const previousQuarter = quarterlyData[previousQuarterKey];
    
    // Calculate metrics for all selected quarters with growth comparisons
    const allQuarters = selectedQuarters.map((key, index) => {
        const q = quarterlyData[key];
        const users = q.users.size;
        const avgTicket = q.transactions > 0 ? q.totalAmount / q.transactions : 0;
        
        // Calculate growth vs previous quarter
        let usersGrowth = null;
        let revenueGrowth = null;
        let ticketGrowth = null;
        
        if (index > 0) {
            const prevKey = selectedQuarters[index - 1];
            const prevQ = quarterlyData[prevKey];
            const prevUsers = prevQ.users.size;
            const prevRevenue = prevQ.totalAmount;
            const prevTicket = prevQ.transactions > 0 ? prevQ.totalAmount / prevQ.transactions : 0;
            
            usersGrowth = calculateGrowth(users, prevUsers);
            revenueGrowth = calculateGrowth(q.totalAmount, prevRevenue);
            ticketGrowth = calculateGrowth(avgTicket, prevTicket);
        }
        
        return {
            key: key,
            label: q.label,
            users: users,
            revenue: q.totalAmount,
            avgTicket: avgTicket,
            transactions: q.transactions,
            usersGrowth,
            revenueGrowth,
            ticketGrowth
        };
    });
    
    // Calculate metrics for current and previous
    const currentUsers = currentQuarter.users.size;
    const previousUsers = previousQuarter.users.size;
    const currentAmount = currentQuarter.totalAmount;
    const previousAmount = previousQuarter.totalAmount;
    const currentAvgTicket = currentQuarter.transactions > 0 ? currentQuarter.totalAmount / currentQuarter.transactions : 0;
    const previousAvgTicket = previousQuarter.transactions > 0 ? previousQuarter.totalAmount / previousQuarter.transactions : 0;
    
    return {
        currentQuarter: currentQuarter.label,
        previousQuarter: previousQuarter.label,
        allQuarters: allQuarters,
        hasMultipleQuarters: allQuarters.length > 2,
        users: {
            current: currentUsers,
            previous: previousUsers,
            growth: calculateGrowth(currentUsers, previousUsers)
        },
        revenue: {
            current: currentAmount,
            previous: previousAmount,
            growth: calculateGrowth(currentAmount, previousAmount)
        },
        avgTicket: {
            current: currentAvgTicket,
            previous: previousAvgTicket,
            growth: calculateGrowth(currentAvgTicket, previousAvgTicket)
        },
        transactions: {
            current: currentQuarter.transactions,
            previous: previousQuarter.transactions,
            growth: calculateGrowth(currentQuarter.transactions, previousQuarter.transactions)
        }
    };
}

// Calculate temporal patterns and gaps
function calculateTemporalPatterns() {
    if (!AppState.transactionData || AppState.transactionData.length === 0) {
        return null;
    }
    
    // Apply business/location filters
    let filteredData = AppState.transactionData.filter(item => {
        const businessName = extractBusinessName(item.merchant);
        const location = extractLocation(item.merchant);
        
        let businessMatch = AppState.selectedBusiness === 'all';
        if (!businessMatch) {
            if (businessName === AppState.selectedBusiness) {
                businessMatch = true;
            } else if (window.businessGroups) {
                const selectedGroup = window.businessGroups.find(g => g.primary === AppState.selectedBusiness);
                if (selectedGroup && selectedGroup.all.includes(businessName)) {
                    businessMatch = true;
                }
            }
        }
        
        const locationMatch = AppState.selectedLocation === 'all' || location === AppState.selectedLocation;
        return businessMatch && locationMatch;
    });
    
    if (filteredData.length < 2) return null;
    
    // Group transactions by day
    const dailyTransactions = {};
    filteredData.forEach(item => {
        const date = parseDate(item.date);
        if (!date) return;
        
        const dateKey = date.toISOString().split('T')[0];
        if (!dailyTransactions[dateKey]) {
            dailyTransactions[dateKey] = {
                count: 0,
                amount: 0,
                users: new Set()
            };
        }
        
        dailyTransactions[dateKey].count++;
        dailyTransactions[dateKey].amount += parseFloat(item.amount) || 0;
        dailyTransactions[dateKey].users.add(item.email);
    });
    
    // Sort dates
    const sortedDates = Object.keys(dailyTransactions).sort();
    if (sortedDates.length < 2) return null;
    
    const firstDate = new Date(sortedDates[0]);
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);
    
    // Calculate average daily transactions
    const totalDays = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    const avgDailyTransactions = filteredData.length / totalDays;
    
    // Find gaps (days with no transactions or significantly lower activity)
    const gaps = [];
    const activityDrops = [];
    
    for (let i = 0; i < sortedDates.length - 1; i++) {
        const currentDate = new Date(sortedDates[i]);
        const nextDate = new Date(sortedDates[i + 1]);
        const daysDiff = Math.ceil((nextDate - currentDate) / (1000 * 60 * 60 * 24));
        
        // Gap: more than 7 days without transactions
        if (daysDiff > 7) {
            gaps.push({
                startDate: currentDate,
                endDate: nextDate,
                days: daysDiff,
                type: 'gap'
            });
        }
        
        // Activity drop: significant decrease in transactions
        if (i > 0) {
            const currentCount = dailyTransactions[sortedDates[i]].count;
            const previousCount = dailyTransactions[sortedDates[i - 1]].count;
            
            if (previousCount > avgDailyTransactions && currentCount < avgDailyTransactions * 0.3) {
                activityDrops.push({
                    date: currentDate,
                    previousCount: previousCount,
                    currentCount: currentCount,
                    dropPercentage: ((previousCount - currentCount) / previousCount) * 100
                });
            }
        }
    }
    
    // Calculate weekly patterns
    const weeklyActivity = {};
    sortedDates.forEach(dateStr => {
        const date = new Date(dateStr);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyActivity[weekKey]) {
            weeklyActivity[weekKey] = {
                transactions: 0,
                amount: 0,
                users: new Set()
            };
        }
        
        weeklyActivity[weekKey].transactions += dailyTransactions[dateStr].count;
        weeklyActivity[weekKey].amount += dailyTransactions[dateStr].amount;
        dailyTransactions[dateStr].users.forEach(user => weeklyActivity[weekKey].users.add(user));
    });
    
    const weeks = Object.keys(weeklyActivity).sort();
    let bestWeek = null;
    let worstWeek = null;
    let maxTransactions = 0;
    let minTransactions = Infinity;
    
    weeks.forEach(week => {
        const txCount = weeklyActivity[week].transactions;
        if (txCount > maxTransactions) {
            maxTransactions = txCount;
            bestWeek = { date: new Date(week), ...weeklyActivity[week], transactions: txCount };
        }
        if (txCount < minTransactions) {
            minTransactions = txCount;
            worstWeek = { date: new Date(week), ...weeklyActivity[week], transactions: txCount };
        }
    });
    
    return {
        totalDays,
        avgDailyTransactions,
        gaps,
        activityDrops: activityDrops.slice(0, 5), // Top 5 drops
        bestWeek,
        worstWeek,
        firstDate,
        lastDate
    };
}

// Calculate growth percentage
function calculateGrowth(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

// Format currency
function formatCurrency(value) {
    return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Format percentage
function formatPercentage(value) {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
}

// Generate executive summary
function generateExecutiveSummary(metrics, comparison, quarterlyAnalysis, insights, temporalAnalysis) {
    const businessName = AppState.selectedBusiness === 'all' ? 'todos los negocios' : AppState.selectedBusiness;
    
    // Get latest transaction date
    const getLatestDate = () => {
        if (!AppState.transactionData || AppState.transactionData.length === 0) {
            return new Date();
        }
        const sorted = [...AppState.transactionData].sort((a, b) => b.date - a.date);
        return new Date(sorted[0].date);
    };
    
    const latestDate = getLatestDate();
    const latestDateStr = latestDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    
    // Calculate rolling 90 days analysis
    const calculate90DaysAnalysis = () => {
        if (!AppState.transactionData) return null;
        
        const end90Current = new Date(latestDate);
        const start90Current = new Date(latestDate);
        start90Current.setDate(start90Current.getDate() - 89);
        
        const end90Previous = new Date(start90Current);
        end90Previous.setDate(end90Previous.getDate() - 1);
        const start90Previous = new Date(end90Previous);
        start90Previous.setDate(start90Previous.getDate() - 89);
        
        // Filter data for current 90 days
        const current90Data = AppState.transactionData.filter(item => {
            const date = parseDate(item.date);
            if (!date) return false;
            const businessName = extractBusinessName(item.merchant);
            const location = extractLocation(item.merchant);
            
            let businessMatch = AppState.selectedBusiness === 'all' || businessName === AppState.selectedBusiness;
            if (!businessMatch && window.businessGroups) {
                const selectedGroup = window.businessGroups.find(g => g.primary === AppState.selectedBusiness);
                if (selectedGroup && selectedGroup.all.includes(businessName)) businessMatch = true;
            }
            const locationMatch = AppState.selectedLocation === 'all' || location === AppState.selectedLocation;
            
            return businessMatch && locationMatch && date >= start90Current && date <= end90Current;
        });
        
        // Filter data for previous 90 days
        const prev90Data = AppState.transactionData.filter(item => {
            const date = parseDate(item.date);
            if (!date) return false;
            const businessName = extractBusinessName(item.merchant);
            const location = extractLocation(item.merchant);
            
            let businessMatch = AppState.selectedBusiness === 'all' || businessName === AppState.selectedBusiness;
            if (!businessMatch && window.businessGroups) {
                const selectedGroup = window.businessGroups.find(g => g.primary === AppState.selectedBusiness);
                if (selectedGroup && selectedGroup.all.includes(businessName)) businessMatch = true;
            }
            const locationMatch = AppState.selectedLocation === 'all' || location === AppState.selectedLocation;
            
            return businessMatch && locationMatch && date >= start90Previous && date <= end90Previous;
        });
        
        const current90Users = new Set(current90Data.map(t => t.email)).size;
        const prev90Users = new Set(prev90Data.map(t => t.email)).size;
        const current90Revenue = current90Data.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        const prev90Revenue = prev90Data.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        
        return {
            start90Current: start90Current.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
            end90Current: end90Current.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
            start90Previous: start90Previous.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
            end90Previous: end90Previous.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
            usersGrowth: calculateGrowth(current90Users, prev90Users),
            revenueGrowth: calculateGrowth(current90Revenue, prev90Revenue)
        };
    };
    
    const rolling90 = calculate90DaysAnalysis();
    
    // Calculate days in current quarter
    const getCurrentQuarterDays = () => {
        if (!quarterlyAnalysis) return 0;
        const quarterStart = new Date(latestDate);
        const currentQuarter = Math.floor(latestDate.getMonth() / 3);
        quarterStart.setMonth(currentQuarter * 3, 1);
        quarterStart.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.ceil((latestDate - quarterStart) / (1000 * 60 * 60 * 24)) + 1;
        return daysDiff;
    };
    
    const currentQuarterDays = getCurrentQuarterDays();
    
    // Count insights by type
    const positiveCount = insights.positive.length;
    const negativeCount = insights.negative.length;
    const warningCount = insights.warning.length;
    
    // Decide which analysis to show first based on current quarter days
    const showQuarterlyFirst = currentQuarterDays > 60;
    
    // Determine overall health based on primary analysis
    let healthStatus = 'estable';
    let healthColor = 'neutral';
    
    if (showQuarterlyFirst) {
        // Base health on quarterly comparison
        if (metrics.usersGrowth > 10 && metrics.amountGrowth > 10) {
            healthStatus = 'saludable';
            healthColor = 'positive';
        } else if (metrics.usersGrowth < -10 || metrics.amountGrowth < -20) {
            healthStatus = 'requiere atención';
            healthColor = 'negative';
        }
    } else if (rolling90) {
        // Base health on 90-day rolling analysis
        if (rolling90.usersGrowth > 10 && rolling90.revenueGrowth > 10) {
            healthStatus = 'saludable';
            healthColor = 'positive';
        } else if (rolling90.usersGrowth < -10 || rolling90.revenueGrowth < -20) {
            healthStatus = 'requiere atención';
            healthColor = 'negative';
        }
    } else {
        // Fallback to insights-based health
        if (positiveCount > negativeCount + warningCount) {
            healthStatus = 'saludable';
            healthColor = 'positive';
        } else if (negativeCount > positiveCount) {
            healthStatus = 'requiere atención';
            healthColor = 'negative';
        }
    }
    
    // Helper function to format highlighted percentage with background
    const formatHighlightedPercent = (value) => {
        const colorClass = value >= 0 ? 'positive-badge' : 'negative-badge';
        return `<span class="${colorClass}">${formatPercentage(value)}</span>`;
    };
    
    // Build summary text
    let summaryText = `El análisis de ${businessName} al ${latestDateStr} muestra un estado "${healthStatus}".\n`;
    
    // First paragraph: Quarterly or 90-day analysis
    if (showQuarterlyFirst && quarterlyAnalysis) {
        // Quarterly analysis first
        summaryText += `En los ${currentQuarterDays} días de actividad registrados del trimestre actual (${quarterlyAnalysis.currentQuarter}) se contabilizan <strong>${metrics.uniqueUsers.toLocaleString()}</strong> usuarios únicos y un GMV de <strong>${formatCurrency(metrics.totalAmount)}</strong>, lo que implica ${metrics.usersGrowth >= 0 ? 'crecimientos' : 'caídas'} de ${formatHighlightedPercent(metrics.usersGrowth)} en usuarios y ${formatHighlightedPercent(metrics.amountGrowth)} en ingresos frente al trimestre anterior (${quarterlyAnalysis.previousQuarter}).\n\n`;
        
        // Add 90-day analysis as second paragraph
        if (rolling90) {
            const trend90 = rolling90.usersGrowth < 0 && rolling90.revenueGrowth < 0 ? 'negativa' : 
                           rolling90.usersGrowth > 0 && rolling90.revenueGrowth > 0 ? 'positiva' : 'mixta';
            summaryText += `En el análisis rolling 90 días (${rolling90.start90Current} – ${rolling90.end90Current} vs ${rolling90.start90Previous} – ${rolling90.end90Previous}), la tendencia es ${trend90} (${formatHighlightedPercent(rolling90.usersGrowth)} usuarios, ${formatHighlightedPercent(rolling90.revenueGrowth)} ingresos), evidenciando una ${trend90 === 'negativa' ? 'desaceleración sostenida' : trend90 === 'positiva' ? 'aceleración sostenida' : 'evolución variable'}.\n\n`;
        }
    } else if (rolling90) {
        // 90-day analysis first
        const trend90 = rolling90.usersGrowth < 0 && rolling90.revenueGrowth < 0 ? 'negativa' : 
                       rolling90.usersGrowth > 0 && rolling90.revenueGrowth > 0 ? 'positiva' : 'mixta';
        summaryText += `En el análisis rolling 90 días (${rolling90.start90Current} – ${rolling90.end90Current} vs ${rolling90.start90Previous} – ${rolling90.end90Previous}), se registraron <strong>${metrics.uniqueUsers.toLocaleString()}</strong> usuarios únicos y un GMV de <strong>${formatCurrency(metrics.totalAmount)}</strong>, mostrando una tendencia ${trend90} con ${formatHighlightedPercent(rolling90.usersGrowth)} en usuarios y ${formatHighlightedPercent(rolling90.revenueGrowth)} en ingresos.\n\n`;
        
        // Add quarterly if available
        if (quarterlyAnalysis && currentQuarterDays > 0) {
            summaryText += `Del trimestre actual (${quarterlyAnalysis.currentQuarter}), se han registrado ${currentQuarterDays} días de actividad, mostrando ${metrics.usersGrowth >= 0 ? 'crecimientos' : 'caídas'} de ${formatHighlightedPercent(metrics.usersGrowth)} en usuarios y ${formatHighlightedPercent(metrics.amountGrowth)} en ingresos frente al trimestre anterior.\n\n`;
        }
    }
    
    // Last paragraph: Ranking and recommendation
    if (comparison) {
        summaryText += `Aun así, el negocio se mantiene <strong>#${comparison.usersRank}</strong> de <strong>${comparison.totalBusinesses}</strong> en usuarios`;
        
        if (comparison.amountRank) {
            summaryText += ` y <strong>#${comparison.amountRank}</strong> en GMV`;
        }
        
        if (comparison.usersDiff !== 0) {
            const perfWord = comparison.usersDiff > 0 ? 'superando' : 'por debajo de';
            const colorClass = comparison.usersDiff > 0 ? 'positive-badge' : 'negative-badge';
            summaryText += `, ${perfWord} el promedio general en <span class="${colorClass}">${formatPercentage(Math.abs(comparison.usersDiff))}</span>`;
        }
        
        summaryText += '. ';
        
        // Add recommendation if quarter is early
        if (currentQuarterDays < 60 && currentQuarterDays > 0) {
            summaryText += `Se recomienda monitorear el avance del trimestre, ya que el período evaluado aún está en su fase inicial.`;
        }
    }
    
    // Build compact numeric summary box
    const formatCompactCurrency = (value) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(1)}K`;
        }
        return `$${value.toFixed(0)}`;
    };
    
    let numericSummary = `
        <div class="numeric-summary-box">
            <div class="numeric-summary-title">Resumen Ejecutivo Numérico</div>
            <div class="numeric-summary-grid">
                <div class="numeric-item">
                    <i class="fas fa-users"></i>
                    <strong>${metrics.uniqueUsers.toLocaleString()}</strong> usuarios
                </div>
                <div class="numeric-item">
                    <i class="fas fa-dollar-sign"></i>
                    <strong>${formatCompactCurrency(metrics.totalAmount)}</strong> GMV
                </div>
                <div class="numeric-item">
                    <i class="fas fa-receipt"></i>
                    Ticket <strong>${formatCompactCurrency(metrics.avgTicket)}</strong>
                </div>
    `;
    
    if (comparison) {
        numericSummary += `
                <div class="numeric-item highlight">
                    <i class="fas fa-trophy"></i>
                    Ranking <strong>#${comparison.amountRank}</strong> en GMV, <strong>#${comparison.usersRank}</strong> en usuarios
                </div>
        `;
    }
    
    if (temporalAnalysis && (temporalAnalysis.gaps.length > 0 || temporalAnalysis.activityDrops.length > 0)) {
        const totalGaps = temporalAnalysis.gaps.length + temporalAnalysis.activityDrops.length;
        numericSummary += `
                <div class="numeric-item warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>${totalGaps}</strong> ${totalGaps === 1 ? 'anomalía operativa' : 'anomalías operativas'}
                </div>
        `;
    }
    
    const totalConcerns = negativeCount + warningCount;
    if (totalConcerns > 0) {
        numericSummary += `
                <div class="numeric-item alert">
                    <i class="fas fa-flag"></i>
                    <strong>${totalConcerns}</strong> ${totalConcerns === 1 ? 'área de mejora' : 'áreas de mejora'} detectada${totalConcerns === 1 ? '' : 's'}
                </div>
        `;
    }
    
    numericSummary += `
            </div>
        </div>
    `;
    
    return `
        <div class="analysis-section">
            <div class="analysis-section-header">
                <div class="section-title">Resumen Ejecutivo</div>
            </div>
            <div class="executive-summary">
                <div class="summary-status ${healthColor}">
                    <i class="fas ${healthColor === 'positive' ? 'fa-check-circle' : healthColor === 'negative' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                    <span>Estado: ${healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}</span>
                </div>
                <p class="summary-text">${summaryText}</p>
            </div>
            ${numericSummary}
        </div>
    `;
}

// Generate quarterly section
function generateQuarterlySection(quarterly) {
    if (!quarterly) return '';
    
    const quartersCount = quarterly.allQuarters.length;
    const subtitle = quartersCount > 2 
        ? `Últimos ${quartersCount} trimestres` 
        : `${quarterly.currentQuarter} vs ${quarterly.previousQuarter}`;
    
    return `
        <div class="analysis-section">
            <div class="analysis-section-header">
                <div class="section-title">Análisis Trimestral</div>
                <div class="section-subtitle">${subtitle}</div>
            </div>
            <div class="analysis-metrics-grid">
                <div class="metric-card">
                    <div class="metric-label">Usuarios (${quarterly.currentQuarter})</div>
                    <div class="metric-value">${quarterly.users.current.toLocaleString()}</div>
                    <div class="metric-change ${quarterly.users.growth >= 0 ? 'positive' : 'negative'}">
                        ${formatPercentage(quarterly.users.growth)} vs ${quarterly.previousQuarter}
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">GMV (${quarterly.currentQuarter})</div>
                    <div class="metric-value">${formatCurrency(quarterly.revenue.current)}</div>
                    <div class="metric-change ${quarterly.revenue.growth >= 0 ? 'positive' : 'negative'}">
                        ${formatPercentage(quarterly.revenue.growth)} vs ${quarterly.previousQuarter}
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Ticket Promedio (${quarterly.currentQuarter})</div>
                    <div class="metric-value">${formatCurrency(quarterly.avgTicket.current)}</div>
                    <div class="metric-change ${quarterly.avgTicket.growth >= 0 ? 'positive' : 'negative'}">
                        ${formatPercentage(quarterly.avgTicket.growth)} vs ${quarterly.previousQuarter}
                    </div>
                </div>
            </div>
            <div class="quarterly-comparison">
                <div class="quarterly-table-header">
                    <span class="table-col">Trimestre</span>
                    <span class="table-col">Usuarios</span>
                    <span class="table-col">GMV</span>
                    <span class="table-col">Ticket Promedio</span>
                    <span class="table-col">Transacciones</span>
                </div>
                ${quarterly.allQuarters.map((q, index) => {
                    const isLatest = index === quarterly.allQuarters.length - 1;
                    const hasGrowth = q.usersGrowth !== null;
                    
                    return `
                        <div class="comparison-row ${isLatest ? 'latest-quarter' : ''}">
                            <span class="comparison-label-text">${q.label}</span>
                            <span class="comparison-value">
                                ${q.users.toLocaleString()}
                                ${hasGrowth ? `<span class="growth-indicator ${q.usersGrowth >= 0 ? 'positive' : 'negative'}">${formatPercentage(q.usersGrowth)}</span>` : ''}
                            </span>
                            <span class="comparison-value">
                                ${formatCurrency(q.revenue)}
                                ${hasGrowth ? `<span class="growth-indicator ${q.revenueGrowth >= 0 ? 'positive' : 'negative'}">${formatPercentage(q.revenueGrowth)}</span>` : ''}
                            </span>
                            <span class="comparison-value">
                                ${formatCurrency(q.avgTicket)}
                                ${hasGrowth ? `<span class="growth-indicator ${q.ticketGrowth >= 0 ? 'positive' : 'negative'}">${formatPercentage(q.ticketGrowth)}</span>` : ''}
                            </span>
                            <span class="comparison-value">${q.transactions.toLocaleString()}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// Generate overview section
function generateOverviewSection(metrics, comparison) {
    // Get current and previous date ranges
    let dateNote = '';
    if (AppState.currentDateRange && AppState.currentDateRange.length === 2) {
        const currentStart = new Date(AppState.currentDateRange[0]);
        const currentEnd = new Date(AppState.currentDateRange[1]);
        const currentStartStr = currentStart.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
        const currentEndStr = currentEnd.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
        
        dateNote = `Período actual: ${currentStartStr} – ${currentEndStr}`;
        
        if (AppState.previousDateRange && AppState.previousDateRange.length === 2) {
            const prevStart = new Date(AppState.previousDateRange[0]);
            const prevEnd = new Date(AppState.previousDateRange[1]);
            const prevStartStr = prevStart.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
            const prevEndStr = prevEnd.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
            
            dateNote += ` | Período anterior: ${prevStartStr} – ${prevEndStr}`;
        }
    }
    
    return `
        <div class="analysis-section">
            <div class="analysis-section-header">
                <div class="section-title">Resumen General</div>
                ${dateNote ? `<div class="section-subtitle">${dateNote}</div>` : ''}
            </div>
            <div class="analysis-metrics-grid">
                <div class="metric-card">
                    <div class="metric-label">Usuarios Únicos</div>
                    <div class="metric-value">${metrics.uniqueUsers.toLocaleString()}</div>
                    <div class="metric-change ${metrics.usersGrowth >= 0 ? 'positive' : 'negative'}">
                        ${formatPercentage(metrics.usersGrowth)}
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">GMV Total</div>
                    <div class="metric-value">${formatCurrency(metrics.totalAmount)}</div>
                    <div class="metric-change ${metrics.amountGrowth >= 0 ? 'positive' : 'negative'}">
                        ${formatPercentage(metrics.amountGrowth)}
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Ticket Promedio</div>
                    <div class="metric-value">${formatCurrency(metrics.avgTicket)}</div>
                    <div class="metric-change ${metrics.avgTicketGrowth >= 0 ? 'positive' : 'negative'}">
                        ${formatPercentage(metrics.avgTicketGrowth)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Generate temporal patterns section
function generateTemporalPatternsSection(temporal) {
    if (!temporal) return '';
    
    const formatDate = (date) => {
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    
    let gapsHTML = '';
    if (temporal.gaps && temporal.gaps.length > 0) {
        gapsHTML = '<div class="temporal-alerts">';
        gapsHTML += '<h5><i class="fas fa-exclamation-triangle"></i> Gaps Detectados</h5>';
        temporal.gaps.slice(0, 3).forEach(gap => {
            gapsHTML += `
                <div class="temporal-alert-item warning">
                    <div class="alert-icon"><i class="fas fa-calendar-times"></i></div>
                    <div class="alert-content">
                        <strong>${gap.days} días sin transacciones</strong>
                        <span>Del ${formatDate(gap.startDate)} al ${formatDate(gap.endDate)}</span>
                    </div>
                </div>
            `;
        });
        gapsHTML += '</div>';
    }
    
    let dropsHTML = '';
    if (temporal.activityDrops && temporal.activityDrops.length > 0) {
        dropsHTML = '<div class="temporal-alerts">';
        dropsHTML += '<h5><i class="fas fa-arrow-down"></i> Caídas Significativas</h5>';
        temporal.activityDrops.slice(0, 3).forEach(drop => {
            dropsHTML += `
                <div class="temporal-alert-item negative">
                    <div class="alert-icon"><i class="fas fa-chart-line-down"></i></div>
                    <div class="alert-content">
                        <strong>Caída del ${drop.dropPercentage.toFixed(0)}%</strong>
                        <span>${formatDate(drop.date)}: de ${drop.previousCount} a ${drop.currentCount} transacciones</span>
                    </div>
                </div>
            `;
        });
        dropsHTML += '</div>';
    }
    
    const hasAlerts = gapsHTML || dropsHTML;
    
    return `
        <div class="analysis-section">
            <div class="analysis-section-header">
                <div class="section-title">Patrones Temporales</div>
                <div class="section-subtitle">Análisis de ${temporal.totalDays} días de actividad</div>
            </div>
            
            <div class="temporal-metrics-grid">
                <div class="temporal-metric-card">
                    <div class="metric-label">Promedio Diario</div>
                    <div class="metric-value">${temporal.avgDailyTransactions.toFixed(1)}</div>
                    <div class="metric-sublabel">transacciones/día</div>
                </div>
                <div class="temporal-metric-card ${temporal.gaps.length > 0 ? 'alert' : ''}">
                    <div class="metric-label">Gaps Detectados</div>
                    <div class="metric-value">${temporal.gaps.length}</div>
                    <div class="metric-sublabel">${temporal.gaps.length === 1 ? 'período' : 'períodos'} sin actividad</div>
                </div>
                <div class="temporal-metric-card ${temporal.activityDrops.length > 0 ? 'warning' : ''}">
                    <div class="metric-label">Caídas Detectadas</div>
                    <div class="metric-value">${temporal.activityDrops.length}</div>
                    <div class="metric-sublabel">${temporal.activityDrops.length === 1 ? 'evento' : 'eventos'} de baja actividad</div>
                </div>
            </div>
            
            ${hasAlerts ? `
                <div class="temporal-alerts-container">
                    ${gapsHTML}
                    ${dropsHTML}
                </div>
            ` : `
                <div class="temporal-summary positive">
                    <i class="fas fa-check-circle"></i>
                    <p>No se detectaron gaps significativos ni caídas abruptas de actividad. El negocio muestra un patrón de transacciones estable.</p>
                </div>
            `}
            
            ${temporal.bestWeek && temporal.worstWeek ? `
                <div class="temporal-comparison">
                    <div class="week-comparison">
                        <div class="week-card best">
                            <div class="week-label">
                                <i class="fas fa-trophy"></i>
                                <span>Mejor Semana</span>
                            </div>
                            <div class="week-date">${formatDate(temporal.bestWeek.date)}</div>
                            <div class="week-stats">
                                <span>${temporal.bestWeek.transactions} transacciones</span>
                                <span>${formatCurrency(temporal.bestWeek.amount)}</span>
                            </div>
                        </div>
                        <div class="week-card worst">
                            <div class="week-label">
                                <i class="fas fa-arrow-down"></i>
                                <span>Semana Más Baja</span>
                            </div>
                            <div class="week-date">${formatDate(temporal.worstWeek.date)}</div>
                            <div class="week-stats">
                                <span>${temporal.worstWeek.transactions} transacciones</span>
                                <span>${formatCurrency(temporal.worstWeek.amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Generate comparison section
function generateComparisonSection(comparison) {
    if (!comparison) return '';
    
    return `
        <div class="analysis-section">
            <div class="analysis-section-header">
                <div class="section-title">Comparación con Otros Negocios</div>
                <div class="section-subtitle">Basado en ${comparison.totalBusinesses} negocios en el sistema</div>
            </div>
            <div class="comparison-grid">
                <div class="comparison-card">
                    <div class="comparison-metric">
                        <div class="comparison-label">Ranking en Usuarios</div>
                        <div class="comparison-rank">#${comparison.usersRank} <span class="rank-total">de ${comparison.totalBusinesses}</span></div>
                        <div class="comparison-diff ${comparison.usersDiff >= 0 ? 'positive' : 'negative'}">
                            ${formatPercentage(comparison.usersDiff)} vs promedio
                        </div>
                    </div>
                </div>
                <div class="comparison-card">
                    <div class="comparison-metric">
                        <div class="comparison-label">Ranking en GMV</div>
                        <div class="comparison-rank">#${comparison.amountRank} <span class="rank-total">de ${comparison.totalBusinesses}</span></div>
                        <div class="comparison-diff ${comparison.amountDiff >= 0 ? 'positive' : 'negative'}">
                            ${formatPercentage(comparison.amountDiff)} vs promedio
                        </div>
                    </div>
                </div>
                <div class="comparison-card">
                    <div class="comparison-metric">
                        <div class="comparison-label">Ranking en Ticket</div>
                        <div class="comparison-rank">#${comparison.ticketRank} <span class="rank-total">de ${comparison.totalBusinesses}</span></div>
                        <div class="comparison-diff ${comparison.ticketDiff >= 0 ? 'positive' : 'negative'}">
                            ${formatPercentage(comparison.ticketDiff)} vs promedio
                        </div>
                    </div>
                </div>
            </div>
            <div class="comparison-benchmarks">
                <div class="benchmark-item">
                    <span class="benchmark-label">Promedio de Usuarios:</span>
                    <span class="benchmark-value">${Math.round(comparison.avgUsers).toLocaleString()}</span>
                </div>
                <div class="benchmark-item">
                    <span class="benchmark-label">Promedio de GMV:</span>
                    <span class="benchmark-value">${formatCurrency(comparison.avgAmount)}</span>
                </div>
                <div class="benchmark-item">
                    <span class="benchmark-label">Promedio de Ticket:</span>
                    <span class="benchmark-value">${formatCurrency(comparison.avgTicket)}</span>
                </div>
            </div>
        </div>
    `;
}

// Generate insights
function generateInsights(metrics) {
    const insights = {
        positive: [],
        negative: [],
        warning: [],
        info: []
    };
    
    // User growth insights
    if (metrics.usersGrowth > 10) {
        insights.positive.push({
            title: 'Excelente crecimiento de usuarios',
            description: `Los usuarios únicos han crecido un ${formatPercentage(metrics.usersGrowth)}, superando el objetivo del 10%.`
        });
    } else if (metrics.usersGrowth < -5) {
        insights.negative.push({
            title: 'Disminución en base de usuarios',
            description: `Se observa una caída del ${formatPercentage(Math.abs(metrics.usersGrowth))} en usuarios únicos. Se requiere atención inmediata.`
        });
    } else if (metrics.usersGrowth < 5) {
        insights.warning.push({
            title: 'Crecimiento de usuarios estancado',
            description: `El crecimiento de usuarios es bajo (${formatPercentage(metrics.usersGrowth)}). Considere estrategias de adquisición.`
        });
    }
    
    // Revenue insights
    if (metrics.amountGrowth > 15) {
        insights.positive.push({
            title: 'Crecimiento excepcional en ingresos',
            description: `Los ingresos han aumentado un ${formatPercentage(metrics.amountGrowth)}, indicando una fuerte monetización.`
        });
    } else if (metrics.amountGrowth < -10) {
        insights.negative.push({
            title: 'Caída significativa en ingresos',
            description: `Los ingresos han disminuido un ${formatPercentage(Math.abs(metrics.amountGrowth))}. Revisar estrategia de precios y ofertas.`
        });
    }
    
    // Ticket size insights
    if (metrics.avgTicketGrowth > 10) {
        insights.positive.push({
            title: 'Aumento en valor de transacción',
            description: `El ticket promedio ha crecido un ${formatPercentage(metrics.avgTicketGrowth)}, sugiriendo mejor monetización por usuario.`
        });
    } else if (metrics.avgTicketGrowth < -10) {
        insights.warning.push({
            title: 'Disminución en ticket promedio',
            description: `El ticket promedio ha bajado un ${formatPercentage(Math.abs(metrics.avgTicketGrowth))}. Los usuarios están gastando menos por transacción.`
        });
    }
    
    // Retention insights
    const retentionRate = metrics.uniqueUsers > 0 ? (metrics.returningUsers / metrics.uniqueUsers) * 100 : 0;
    if (retentionRate > 40) {
        insights.positive.push({
            title: 'Excelente retención de usuarios',
            description: `${retentionRate.toFixed(1)}% de los usuarios son recurrentes, indicando alta lealtad.`
        });
    } else if (retentionRate < 20) {
        insights.negative.push({
            title: 'Baja retención de usuarios',
            description: `Solo ${retentionRate.toFixed(1)}% de usuarios son recurrentes. Implementar programas de fidelización.`
        });
    } else {
        insights.info.push({
            title: 'Retención moderada',
            description: `${retentionRate.toFixed(1)}% de usuarios son recurrentes. Hay oportunidad de mejora.`
        });
    }
    
    // Visit frequency insights
    if (metrics.avgVisits > 3) {
        insights.positive.push({
            title: 'Alta frecuencia de visitas',
            description: `Los usuarios realizan ${metrics.avgVisits.toFixed(1)} visitas en promedio, mostrando alto engagement.`
        });
    } else if (metrics.avgVisits < 1.5) {
        insights.warning.push({
            title: 'Baja frecuencia de visitas',
            description: `Los usuarios realizan solo ${metrics.avgVisits.toFixed(1)} visitas en promedio. Considere estrategias de re-engagement.`
        });
    }
    
    return insights;
}

// Generate user analysis section
function generateUserAnalysisSection(metrics, insights) {
    const retentionRate = metrics.uniqueUsers > 0 ? (metrics.returningUsers / metrics.uniqueUsers) * 100 : 0;
    
    let insightsHTML = '';
    [...insights.positive, ...insights.negative, ...insights.warning, ...insights.info]
        .filter(i => i.title.toLowerCase().includes('usuario') || i.title.toLowerCase().includes('retención') || i.title.toLowerCase().includes('visita'))
        .forEach(insight => {
            const type = insights.positive.includes(insight) ? 'positive' : 
                        insights.negative.includes(insight) ? 'negative' :
                        insights.warning.includes(insight) ? 'warning' : 'info';
            const icon = type === 'positive' ? 'fa-check-circle' :
                        type === 'negative' ? 'fa-exclamation-circle' :
                        type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
            
            insightsHTML += `
                <div class="insight-item ${type}">
                    <i class="fas ${icon} insight-icon"></i>
                    <div class="insight-content">
                        <div class="insight-title">${insight.title}</div>
                        <p class="insight-description">${insight.description}</p>
                    </div>
                </div>
            `;
        });
    
    return `
        <div class="analysis-section">
            <div class="analysis-section-header">
                <div class="section-title">Usuarios</div>
            </div>
            ${insightsHTML ? `<div class="analysis-insights">${insightsHTML}</div>` : ''}
        </div>
    `;
}

// Generate financial analysis section
function generateFinancialAnalysisSection(metrics, insights) {
    let insightsHTML = '';
    [...insights.positive, ...insights.negative, ...insights.warning, ...insights.info]
        .filter(i => i.title.toLowerCase().includes('ingreso') || i.title.toLowerCase().includes('ticket') || i.title.toLowerCase().includes('monetización'))
        .forEach(insight => {
            const type = insights.positive.includes(insight) ? 'positive' : 
                        insights.negative.includes(insight) ? 'negative' :
                        insights.warning.includes(insight) ? 'warning' : 'info';
            const icon = type === 'positive' ? 'fa-check-circle' :
                        type === 'negative' ? 'fa-exclamation-circle' :
                        type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
            
            insightsHTML += `
                <div class="insight-item ${type}">
                    <i class="fas ${icon} insight-icon"></i>
                    <div class="insight-content">
                        <div class="insight-title">${insight.title}</div>
                        <p class="insight-description">${insight.description}</p>
                    </div>
                </div>
            `;
        });
    
    return `
        <div class="analysis-section">
            <div class="analysis-section-header">
                <div class="section-title">Finanzas</div>
            </div>
            ${insightsHTML ? `<div class="analysis-insights">${insightsHTML}</div>` : ''}
        </div>
    `;
}

// Generate retention analysis section
function generateRetentionAnalysisSection(metrics, insights) {
    return `
        <div class="analysis-section">
            <div class="analysis-section-header">
                <div class="section-title">Retención</div>
            </div>
        </div>
    `;
}

// Generate recommendations
function generateRecommendations(metrics, insights) {
    const recommendations = [];
    
    // User acquisition recommendations
    if (metrics.usersGrowth < 5) {
        recommendations.push('Implementar campañas de adquisición de usuarios para aumentar la base de clientes.');
        recommendations.push('Analizar canales de marketing más efectivos y optimizar inversión publicitaria.');
    }
    
    // Retention recommendations
    const retentionRate = metrics.uniqueUsers > 0 ? (metrics.returningUsers / metrics.uniqueUsers) * 100 : 0;
    if (retentionRate < 30) {
        recommendations.push('Desarrollar programa de lealtad para incentivar compras recurrentes.');
        recommendations.push('Implementar estrategias de email marketing para re-engagement de usuarios inactivos.');
    }
    
    // Revenue recommendations
    if (metrics.avgTicketGrowth < 0) {
        recommendations.push('Revisar estrategia de precios y considerar técnicas de upselling y cross-selling.');
        recommendations.push('Analizar productos/servicios de mayor margen para promocionar estratégicamente.');
    }
    
    // Frequency recommendations
    if (metrics.avgVisits < 2) {
        recommendations.push('Crear incentivos para aumentar frecuencia de compra (descuentos por volumen, suscripciones).');
        recommendations.push('Implementar notificaciones push o recordatorios para aumentar engagement.');
    }
    
    // Growth recommendations
    if (metrics.amountGrowth < 10 && metrics.usersGrowth < 10) {
        recommendations.push('Realizar análisis de mercado para identificar nuevas oportunidades de crecimiento.');
        recommendations.push('Considerar expansión de línea de productos o servicios complementarios.');
    }
    
    // Positive reinforcement
    if (metrics.usersGrowth > 10 && metrics.amountGrowth > 10) {
        recommendations.push('Mantener estrategias actuales que están generando crecimiento sostenido.');
        recommendations.push('Documentar mejores prácticas para escalar operaciones exitosas.');
    }
    
    // Default recommendations if none generated
    if (recommendations.length === 0) {
        recommendations.push('Continuar monitoreando métricas clave y ajustar estrategias según tendencias.');
        recommendations.push('Realizar análisis de cohortes para entender mejor el comportamiento de usuarios.');
        recommendations.push('Implementar pruebas A/B para optimizar conversión y retención.');
    }
    
    return recommendations;
}

// Generate recommendations section
function generateRecommendationsSection(recommendations) {
    let recommendationsHTML = '';
    recommendations.forEach(rec => {
        recommendationsHTML += `
            <div class="recommendation-item">
                <i class="fas fa-lightbulb"></i>
                <p>${rec}</p>
            </div>
        `;
    });
    
    return `
        <div class="analysis-section">
            <div class="analysis-recommendations">
                <h4><i class="fas fa-star"></i> Recomendaciones Estratégicas</h4>
                <div class="recommendations-list">
                    ${recommendationsHTML}
                </div>
            </div>
        </div>
    `;
}

// Export functions
window.openFullAnalysisModal = openFullAnalysisModal;
window.closeFullAnalysisModal = closeFullAnalysisModal;

// Initialize event listener when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('generateFullAnalysisBtn');
    if (btn) {
        btn.addEventListener('click', openFullAnalysisModal);
    }
    
    // Add click outside listener to modal
    const modal = document.getElementById('fullAnalysisModal');
    if (modal) {
        modal.addEventListener('click', handleModalOutsideClick);
    }
    
    // Add ESC key listener to close modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modal = document.getElementById('fullAnalysisModal');
            if (modal && !modal.classList.contains('hidden')) {
                closeFullAnalysisModal();
            }
        }
    });
});

