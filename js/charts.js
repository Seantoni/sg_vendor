// Chart Management Functions
// ==========================

// Utility function to safely destroy charts
function safeDestroyChart(chart) {
    if (chart) {
        try {
            // Check if chart is already destroyed
            if (chart.ctx && chart.ctx.canvas) {
                chart.destroy();
            }
            return null;
        } catch (e) {
            console.warn('Error destroying chart:', e);
            return null;
        }
    }
    return null;
}

// Comprehensive chart cleanup function
function cleanupAllCharts() {
    Charts.uniqueUsersChart = safeDestroyChart(Charts.uniqueUsersChart);
    Charts.returningUsersChart = safeDestroyChart(Charts.returningUsersChart);
    Charts.returningUsersPercentageChart = safeDestroyChart(Charts.returningUsersPercentageChart);
    Charts.totalAmountChart = safeDestroyChart(Charts.totalAmountChart);
    Charts.avgVisitsChart = safeDestroyChart(Charts.avgVisitsChart);
    Charts.firstTimeUsersChart = safeDestroyChart(Charts.firstTimeUsersChart);
    Charts.avgSpendPerUserChart = safeDestroyChart(Charts.avgSpendPerUserChart);
    Charts.dailySalesChart = safeDestroyChart(Charts.dailySalesChart);
    Charts.modalChart = safeDestroyChart(Charts.modalChart);
    Charts.monthlyProjectionChart = safeDestroyChart(Charts.monthlyProjectionChart);
    Charts.locationUsersChart = safeDestroyChart(Charts.locationUsersChart);
    Charts.locationGMVChart = safeDestroyChart(Charts.locationGMVChart);
}

// Function to initialize location users chart
function initLocationUsersChart(data) {
    console.log('📊 initLocationUsersChart called with', data ? data.length : 0, 'items');
    console.log('📊 Sample data dates:', data ? data.slice(0, 5).map(d => d.date) : []);
    
    const ctx = document.getElementById('locationUsersChart');
    if (!ctx) return;

    // Destroy existing chart completely
    Charts.locationUsersChart = safeDestroyChart(Charts.locationUsersChart);
    
    // Clear the canvas to prevent reuse issues
    const canvas = ctx;
    if (canvas) {
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // Process data to get unique users by location and month
    const locationData = {};
    const monthsSet = new Set();
    
    let processedCount = 0;

    data.forEach(item => {
        const date = parseDate(item.date);
        if (!date) return;
        
        processedCount++;

        const businessName = extractBusinessName(item.merchant);
        const location = extractLocation(item.merchant);
        const email = item.email;

        // Filter by selected business if one is selected (using business group logic)
        if (AppState.selectedBusiness !== 'all') {
            let businessMatch = false;
            
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
            
            if (!businessMatch) {
            return; // Skip this item if it doesn't match the selected business
            }
        }

        const month = formatYearMonth(date);
        monthsSet.add(month);

        if (!locationData[location]) {
            locationData[location] = {};
        }
        if (!locationData[location][month]) {
            locationData[location][month] = new Set();
        }
        locationData[location][month].add(email);
    });

    // Convert sets to counts for all months
    const processedData = {};
    const months = Array.from(monthsSet).sort();

    Object.keys(locationData).forEach(location => {
        processedData[location] = {};
        Object.keys(locationData[location]).forEach(month => {
            processedData[location][month] = locationData[location][month].size;
        });
    });

    // Calculate total users per location for sorting
    const locationTotals = {};
    Object.keys(processedData).forEach(location => {
        locationTotals[location] = Object.values(processedData[location]).reduce((sum, count) => sum + count, 0);
    });

    // Sort locations by total users (descending - highest at top)
    const locations = Object.keys(processedData).sort((a, b) => locationTotals[b] - locationTotals[a]);
    
    console.log('📊 Processed', processedCount, 'items');
    console.log('📊 Found months:', months);
    console.log('📊 Found locations:', locations);
    console.log('📊 Location totals:', locationTotals);
    
    const datasets = months.map((month, index) => ({
        label: month,
        data: locations.map(location => processedData[location][month] || 0),
        backgroundColor: `hsla(${(index * 40) % 360}, 70%, 60%, 0.8)`,
        borderColor: `hsla(${(index * 40) % 360}, 70%, 60%, 1)`,
        borderWidth: 1,
        borderRadius: 4,
    }));


    Charts.locationUsersChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: locations,
            datasets: datasets
        },
        options: {
            indexAxis: 'y', // Horizontal bars
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Usuarios Únicos por Ubicación',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 20
                    },
                    color: '#2d3436'
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                datalabels: {
                    display: function(context) {
                        // Only show labels for values greater than 0, with safe property access
                        return context.parsed && context.parsed.x !== undefined && context.parsed.x > 0;
                    },
                    anchor: 'end',
                    align: 'right',
                    offset: 5,
                    formatter: function(value) {
                        return value > 0 ? value : '';
                    },
                    font: {
                        weight: 'bold',
                        size: 11
                    },
                    color: '#2d3436'
                }
            },
            scales: {
                x: {
                    stacked: true,
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        precision: 0
                    }
                },
                y: {
                    stacked: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        color: '#2d3436',
                        autoSkip: false
                    }
                }
            }
        }
    });
    
    // Add chart note
    const locationUsersContainer = ctx.closest('.full-width') || ctx.closest('.metrics-chart');
    if (locationUsersContainer && window.generateChartAnalysis) {
        const values = locations.map(location => locationTotals[location]);
        window.generateChartAnalysis('locationUsers', locations, values, {
            type: 'number',
            note: 'Distribución de usuarios únicos por ubicación geográfica acumulada durante todo el período seleccionado.'
        });
    }
}

// Function to initialize location GMV chart
function initLocationGMVChart(data) {
    const ctx = document.getElementById('locationGMVChart');
    if (!ctx) return;

    // Destroy existing chart completely
    Charts.locationGMVChart = safeDestroyChart(Charts.locationGMVChart);
    
    // Clear the canvas to prevent reuse issues
    const canvas = ctx;
    if (canvas) {
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // Process data to get GMV by location and month
    const locationData = {};
    const monthsSet = new Set();

    data.forEach(item => {
        const date = parseDate(item.date);
        if (!date) return;

        const businessName = extractBusinessName(item.merchant);
        const location = extractLocation(item.merchant);
        const amount = parseFloat(item.amount) || 0;

        // Filter by selected business if one is selected (using business group logic)
        if (AppState.selectedBusiness !== 'all') {
            let businessMatch = false;
            
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
            
            if (!businessMatch) {
            return; // Skip this item if it doesn't match the selected business
            }
        }

        const month = formatYearMonth(date);
        monthsSet.add(month);

        if (!locationData[location]) {
            locationData[location] = {};
        }
        if (!locationData[location][month]) {
            locationData[location][month] = 0;
        }
        locationData[location][month] += amount;
    });

    // Convert to processed data for all months
    const processedData = {};
    const months = Array.from(monthsSet).sort();

    Object.keys(locationData).forEach(location => {
        processedData[location] = {};
        Object.keys(locationData[location]).forEach(month => {
            processedData[location][month] = locationData[location][month];
        });
    });

    // Calculate total GMV per location for sorting
    const locationTotals = {};
    Object.keys(processedData).forEach(location => {
        locationTotals[location] = Object.values(processedData[location]).reduce((sum, amount) => sum + amount, 0);
    });

    // Sort locations by total GMV (descending - highest at top)
    const locations = Object.keys(processedData).sort((a, b) => locationTotals[b] - locationTotals[a]);
    
    // Debug: Log locations to see what we have
    console.log('Location GMV Chart - Locations found (sorted):', locations);
    console.log('Location GMV Chart - Location totals:', locationTotals);
    
    const datasets = months.map((month, index) => ({
        label: month,
        data: locations.map(location => processedData[location][month] || 0),
        backgroundColor: `hsla(${(index * 40) % 360}, 70%, 60%, 0.8)`,
        borderColor: `hsla(${(index * 40) % 360}, 70%, 60%, 1)`,
        borderWidth: 1,
        borderRadius: 4,
    }));


    Charts.locationGMVChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: locations,
            datasets: datasets
        },
        options: {
            indexAxis: 'y', // Horizontal bars
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'GMV por Ubicación',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 20
                    },
                    color: '#2d3436'
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                datalabels: {
                    display: function(context) {
                        // Only show labels for values greater than 0, with safe property access
                        return context.parsed && context.parsed.x !== undefined && context.parsed.x > 0;
                    },
                    anchor: 'end',
                    align: 'right',
                    offset: 5,
                    formatter: function(value) {
                        return '$' + value.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                    },
                    font: {
                        weight: 'bold',
                        size: 11
                    },
                    padding: 6,
                    color: '#2d3436'
                }
            },
            scales: {
                x: {
                    stacked: true,
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                    }
                },
                y: {
                    stacked: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        color: '#2d3436',
                        autoSkip: false
                    }
                }
            }
        }
    });
    
    // Add chart note
    const locationGMVContainer = ctx.closest('.full-width') || ctx.closest('.metrics-chart');
    if (locationGMVContainer && window.generateChartAnalysis) {
        const values = locations.map(location => locationTotals[location]);
        window.generateChartAnalysis('locationGMV', locations, values, {
            type: 'currency',
            prefix: '$',
            note: 'Valor Bruto de Mercancía (GMV) por ubicación geográfica, mostrando el monto total transaccionado en cada región.'
        });
    }
}


// Function to initialize monthly projection chart
function initMonthlyProjectionChart(data) {
    console.log('🔮 Initializing monthly projection chart with data:', data ? data.length : 0, 'items');
    
    const ctx = document.getElementById('monthlyProjectionChart');
    const summaryText = document.getElementById('projectionSummaryText');
    
    if (!ctx) {
        console.error('❌ monthlyProjectionChart canvas not found');
        // Show error in the summary text
        if (summaryText) {
            summaryText.innerHTML = '<p style="color: red;">Error: No se encontró el canvas del gráfico de proyecciones.</p>';
        }
        return;
    }
    
    // Destroy existing chart first
    if (Charts.monthlyProjectionChart) {
        Charts.monthlyProjectionChart = safeDestroyChart(Charts.monthlyProjectionChart);
    }
    
    // Clear the canvas
    const context = ctx.getContext('2d');
    if (context) {
        context.clearRect(0, 0, ctx.width, ctx.height);
    }
    
    if (!data || data.length === 0) {
        console.warn('⚠️ No data provided for projection chart');
        // Show no data message with call to action
        if (summaryText) {
            summaryText.innerHTML = `
                <div class="empty-state">
                    <h4>📈 Proyecciones de Usuarios</h4>
                    <p>Selecciona un negocio específico para ver las proyecciones de crecimiento basadas en datos históricos.</p>
                    <button onclick="window.showFilterModal && window.showFilterModal()" class="empty-state-btn">Seleccionar Negocio</button>
                </div>
            `;
        }
        return;
    }
    
    // Show loading message
    if (summaryText) {
        summaryText.innerHTML = '<p>Generando proyecciones...</p>';
    }

    // Process historical data for projection
    const monthlyData = {};
    
    // Filter data based on selected business
    const filteredData = data.filter(item => {
        if (AppState.selectedBusiness && AppState.selectedBusiness !== 'all') {
            const businessName = extractBusinessName(item.merchant || '');
            return businessName === AppState.selectedBusiness;
        }
        return true;
    });
    
    console.log('📈 Filtered data for projections:', {
        totalItems: data.length,
        filteredItems: filteredData.length,
        selectedBusiness: AppState.selectedBusiness
    });

    // Group data by month
    filteredData.forEach(item => {
        const date = parseDate(item.date);
        if (date) {
            const monthKey = formatYearMonth(date);
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = new Set();
            }
            monthlyData[monthKey].add(item.email);
        }
    });
    
    console.log('📅 Monthly data grouped:', {
        monthlyData: Object.keys(monthlyData).map(month => ({
            month,
            users: monthlyData[month].size
        }))
    });

    // Get historical months and user counts
    const sortedMonths = Object.keys(monthlyData).sort();
    const historicalCounts = sortedMonths.map(month => monthlyData[month].size);

    console.log('📊 Historical data processed:', {
        months: sortedMonths,
        counts: historicalCounts,
        selectedBusiness: AppState.selectedBusiness
    });

    if (sortedMonths.length < 3) {
        console.warn('⚠️ Not enough historical data for projection:', sortedMonths.length, 'months');
        // Not enough data for projection
        const summaryText = document.getElementById('projectionSummaryText');
        if (summaryText) {
            summaryText.innerHTML = '<p>Se necesitan al menos 3 meses de datos para generar proyecciones confiables.</p>';
        }
        return;
    }

    // Advanced forecasting with seasonal decomposition (Triple Exponential Smoothing approach)
    const projectionMonths = [];
    const projectionCounts = [];
    
    // Step 1: Calculate seasonal indices (month-over-month patterns)
    const seasonalIndices = new Array(12).fill(0);
    const seasonalCounts = new Array(12).fill(0);
    
    // Analyze historical data to detect seasonal patterns
    for (let i = 0; i < sortedMonths.length; i++) {
        const monthDate = new Date(sortedMonths[i] + '-01');
        const monthIndex = monthDate.getMonth(); // 0-11
        seasonalIndices[monthIndex] += historicalCounts[i];
        seasonalCounts[monthIndex]++;
    }
    
    // Calculate average for each month and normalize
    const overallAverage = historicalCounts.reduce((a, b) => a + b, 0) / historicalCounts.length;
    const seasonalFactors = seasonalIndices.map((sum, index) => {
        if (seasonalCounts[index] > 0) {
            const monthAverage = sum / seasonalCounts[index];
            return monthAverage / overallAverage; // Ratio to overall average
        }
        return 1.0; // Neutral if no data for this month
    });
    
    console.log('🌊 Seasonal factors calculated:', seasonalFactors.map((f, i) => ({
        month: i + 1,
        factor: f.toFixed(2),
        meaning: f > 1 ? 'above average' : 'below average'
    })));
    
    // Step 2: Deseasonalize data for trend analysis
    const deseasonalizedData = historicalCounts.map((count, index) => {
        const monthDate = new Date(sortedMonths[index] + '-01');
        const monthIndex = monthDate.getMonth();
        const seasonalFactor = seasonalFactors[monthIndex];
        return seasonalFactor !== 0 ? count / seasonalFactor : count;
    });
    
    // Step 3: Linear regression on deseasonalized data
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const n = deseasonalizedData.length;
    
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += deseasonalizedData[i];
        sumXY += i * deseasonalizedData[i];
        sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Step 4: Exponential smoothing for recent trend adjustment
    const alpha = 0.3; // Smoothing factor (0-1, higher = more weight on recent data)
    const recentMonths = Math.min(6, sortedMonths.length);
    const recentCounts = historicalCounts.slice(-recentMonths);
    
    let smoothedValue = recentCounts[0];
    for (let i = 1; i < recentCounts.length; i++) {
        smoothedValue = alpha * recentCounts[i] + (1 - alpha) * smoothedValue;
    }
    
    const recentMomentum = smoothedValue / (historicalCounts[historicalCounts.length - 1] || 1);
    
    // Step 5: Calculate overall growth rate
    const baseValue = historicalCounts[historicalCounts.length - 1] || 0;
    const avgGrowthRate = baseValue > 0 ? slope / baseValue : 0.05;
    
    console.log('📊 Advanced projection model:', {
        slope: slope.toFixed(2),
        intercept: intercept.toFixed(2),
        avgGrowthRate: (avgGrowthRate * 100).toFixed(2) + '%',
        baseValue: baseValue,
        recentMomentum: recentMomentum.toFixed(2),
        seasonalityDetected: seasonalFactors.some(f => Math.abs(f - 1) > 0.15)
    });
    
    // Step 6: Generate projections with seasonality
    const lastDate = new Date(sortedMonths[sortedMonths.length - 1] + '-01');
    
    for (let i = 1; i <= 12; i++) {
        const projectionDate = new Date(lastDate);
        projectionDate.setMonth(projectionDate.getMonth() + i);
        
        const monthKey = formatYearMonth(projectionDate);
        const monthIndex = projectionDate.getMonth(); // 0-11
        projectionMonths.push(monthKey);
        
        // Base projection from trend
        const trendValue = slope * (n + i - 1) + intercept;
        
        // Growth-based projection
        const growthValue = baseValue * Math.pow(1 + avgGrowthRate, i);
        
        // Blend trend and growth with decay
        const decayFactor = Math.max(0.3, 1 - (i * 0.05));
        let baseProjection = trendValue * decayFactor + growthValue * (1 - decayFactor);
        
        // Apply seasonal adjustment
        const seasonalFactor = seasonalFactors[monthIndex] || 1.0;
        let seasonalProjection = baseProjection * seasonalFactor;
        
        // Apply recent momentum for near-term projections (first 3 months)
        if (i <= 3) {
            seasonalProjection *= recentMomentum;
        }
        
        // Conservative floor (never drop below 60% of current)
        const floorValue = Math.round(baseValue * 0.6);
        
        // Apply ceiling to prevent unrealistic growth (max 3x current value)
        const ceilingValue = baseValue * 3;
        
        const finalValue = Math.max(floorValue, Math.min(ceilingValue, Math.round(seasonalProjection)));
        
        projectionCounts.push(finalValue);
    }

    // Combine historical and projected data
    const allLabels = [...sortedMonths, ...projectionMonths];
    const allData = [...historicalCounts, ...projectionCounts];
    
    // Create datasets
    const datasets = [{
        label: 'Datos Históricos',
        data: [...historicalCounts, ...new Array(projectionMonths.length).fill(null)],
        backgroundColor: 'rgba(107, 100, 219, 0.7)',
        borderColor: '#6B64DB',
        borderWidth: 2,
        fill: false
    }, {
        label: 'Proyección',
        data: [...new Array(sortedMonths.length).fill(null), ...projectionCounts],
        backgroundColor: 'rgba(255, 159, 64, 0.7)',
        borderColor: '#FF9F40',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false
    }];

    Charts.monthlyProjectionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allLabels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Proyección de Usuarios Únicos',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 20
                    },
                    color: '#2d3436'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'Período'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'Usuarios Únicos'
                    }
                }
            }
        }
    });
    
    console.log('✅ Monthly projection chart created successfully');

    // Add chart note with seasonality information
    const projectionContainer = ctx.closest('.daily-sales-chart') || ctx.closest('.full-width');
    if (projectionContainer) {
        const hasSeasonality = seasonalFactors.some(f => Math.abs(f - 1) > 0.15);
        const noteText = hasSeasonality 
            ? 'Modelo avanzado con análisis estacional: detecta patrones mensuales (ej: diciembre alto, enero bajo) y los incorpora a la proyección. Usa regresión lineal sobre datos desestacionalizados + suavizado exponencial para capturar tendencias recientes. Incluye límites conservadores (piso 60%, techo 300% del valor actual).'
            : 'Modelo de proyección basado en regresión lineal y análisis de tendencias. Los datos históricos no muestran patrones estacionales significativos. Incluye suavizado exponencial y límites conservadores para prevenir proyecciones poco realistas.';
        if (window.generateChartAnalysis) {
            window.generateChartAnalysis('projections', projectionMonths, projectionCounts, {
                type: 'number',
                note: noteText
            });
        }
    }

    // Update summary text
    if (summaryText && projectionCounts.length > 0) {
        const nextMonth = projectionCounts[0];
        const next3Months = Math.round(projectionCounts.slice(0, 3).reduce((a, b) => a + b, 0) / 3);
        const next12Months = Math.round(projectionCounts.reduce((a, b) => a + b, 0) / 12);
        
        summaryText.innerHTML = `
            <div class="projection-summary">
                <h4>Resumen de Proyecciones</h4>
                <div class="projection-metrics">
                    <div class="projection-metric">
                        <span class="metric-label">Próximo mes:</span>
                        <span class="metric-value">${nextMonth.toLocaleString()} usuarios</span>
                    </div>
                    <div class="projection-metric">
                        <span class="metric-label">Promedio 3 meses:</span>
                        <span class="metric-value">${next3Months.toLocaleString()} usuarios</span>
                    </div>
                    <div class="projection-metric">
                        <span class="metric-label">Promedio 12 meses:</span>
                        <span class="metric-value">${next12Months.toLocaleString()} usuarios</span>
                    </div>
                </div>
                <p class="projection-note">
                    <strong>Metodología Avanzada:</strong> Modelo de pronóstico con descomposición estacional (similar a Triple Exponential Smoothing).
                    Incluye: (1) Análisis de patrones estacionales mensuales, (2) Regresión lineal sobre datos desestacionalizados, 
                    (3) Suavizado exponencial para tendencias recientes, (4) Momentum ajustado para corto plazo.
                    Tasa de crecimiento base: ${(avgGrowthRate * 100).toFixed(1)}% mensual. 
                    ${seasonalFactors.some(f => Math.abs(f - 1) > 0.15) ? 'Estacionalidad significativa detectada.' : 'Patrones estables sin variación estacional marcada.'}
                </p>
            </div>
        `;
    }
}

// Make functions available globally
window.initLocationUsersChart = initLocationUsersChart;
window.initLocationGMVChart = initLocationGMVChart;
window.initMonthlyProjectionChart = initMonthlyProjectionChart;
window.safeDestroyChart = safeDestroyChart;
 
// ================= Chart.js Global Defaults (centralized) =================
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Chart !== 'undefined') {
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        Chart.defaults.resizeDelay = 0;
        Chart.defaults.animation = { duration: 0 };
        Chart.defaults.plugins.tooltip.enabled = false;
        if (typeof ChartDataLabels !== 'undefined') {
            Chart.defaults.plugins.datalabels = Chart.defaults.plugins.datalabels || {};
            if (Chart.defaults.plugins.datalabels.listeners) {
                delete Chart.defaults.plugins.datalabels.listeners;
            }
        }
    }
});

// =============== Metrics Chart Builders (extracted from script.js) ===============
// Helper to build a standard title config
function buildTitle(text) {
    return {
        display: true,
        text: text,
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 },
        color: '#2d3436'
    };
}

function clearCanvas(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function createUniqueUsersChart(chartData) {
    const el = document.getElementById('uniqueUsersChart');
    if (!el) return;
    Charts.uniqueUsersChart = safeDestroyChart(Charts.uniqueUsersChart);
    clearCanvas(el);
    Charts.uniqueUsersChart = new Chart(el, {
        type: 'bar',
        data: { labels: chartData.labels, datasets: [{
            label: 'Usuarios Únicos',
            data: chartData.uniqueUsers,
            backgroundColor: 'rgba(107, 100, 219, 0.7)',
            borderColor: '#6B64DB',
            borderWidth: 2,
            borderRadius: 8,
        }]},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: buildTitle('Usuarios Únicos por Mes'),
                legend: { display: false },
                datalabels: {
                    anchor: 'end', align: 'top', offset: 5, formatter: Math.round,
                    font: { weight: 'bold', size: 11 }, padding: 6
                }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { precision: 0 } },
                x: { grid: { display: false } }
            }
        },
        plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
    });
    if (window.generateChartAnalysis) {
        window.generateChartAnalysis('uniqueUsers', chartData.labels, chartData.uniqueUsers, {
            type: 'number',
            note: 'Muestra el número total de usuarios únicos que realizaron transacciones en cada período mensual.'
        });
    }
}

function createReturningUsersChart(chartData) {
    const el = document.getElementById('returningUsersChart');
    if (!el) return;
    Charts.returningUsersChart = safeDestroyChart(Charts.returningUsersChart);
    clearCanvas(el);
    Charts.returningUsersChart = new Chart(el, {
        type: 'bar',
        data: { labels: chartData.labels, datasets: [{
            label: 'Usuarios Recurrentes',
            data: chartData.returningUsers || [],
            backgroundColor: 'rgba(255, 159, 64, 0.7)',
            borderColor: '#FF9F40',
            borderWidth: 2,
            borderRadius: 8,
        }]},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: buildTitle('Usuarios Recurrentes por Mes'),
                legend: { display: false },
                datalabels: {
                    anchor: 'end', align: 'top', offset: 5, formatter: Math.round,
                    font: { weight: 'bold', size: 11 }, padding: 6
                }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { precision: 0 } },
                x: { grid: { display: false } }
            }
        },
        plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
    });
    if (window.generateChartAnalysis) {
        window.generateChartAnalysis('returningUsers', chartData.labels, chartData.returningUsers, {
            type: 'number',
            note: 'Usuarios que han realizado más de una transacción dentro de la ventana de tiempo configurada.'
        });
    }
}

function createAvgVisitsChart(chartData) {
    const el = document.getElementById('avgVisitsChart');
    if (!el) return;
    Charts.avgVisitsChart = safeDestroyChart(Charts.avgVisitsChart);
    clearCanvas(el);
    Charts.avgVisitsChart = new Chart(el, {
        type: 'bar',
        data: { labels: chartData.labels, datasets: [{
            label: 'Visitas Promedio',
            data: chartData.avgVisits || [],
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: '#36A2EB',
            borderWidth: 2,
            borderRadius: 8,
        }]},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: buildTitle('Visitas Promedio por Usuario'),
                legend: { display: false },
                datalabels: {
                    anchor: 'end', align: 'top', offset: 5,
                    formatter: (v) => (typeof v === 'number' ? v.toFixed(1) : v),
                    font: { weight: 'bold', size: 11 }, padding: 6
                }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        },
        plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
    });
    if (window.generateChartAnalysis) {
        window.generateChartAnalysis('avgVisits', chartData.labels, chartData.avgVisits, {
            type: 'decimal', suffix: ' visitas',
            note: 'Promedio de visitas por usuario en cada período mensual basado en el historial de transacciones.'
        });
    }
}

function createTotalTransactionsChart(chartData) {
    console.log('🔍 createTotalTransactionsChart called');
    const el = document.getElementById('totalTransactionsChart');
    console.log('🔍 Canvas element:', el);
    console.log('🔍 chartData received:', chartData);
    console.log('🔍 chartData.totalTransactions:', chartData ? chartData.totalTransactions : 'chartData is null/undefined');
    
    if (!el) {
        console.error('❌ totalTransactionsChart canvas not found in DOM');
        return;
    }
    
    // Create chart even if data is empty - it will show empty state
    const transactionsData = (chartData && chartData.totalTransactions) ? chartData.totalTransactions : [];
    const labelsData = (chartData && chartData.labels) ? chartData.labels : [];
    
    console.log('✅ Creating chart with:', { labels: labelsData, data: transactionsData });
    
    Charts.totalTransactionsChart = safeDestroyChart(Charts.totalTransactionsChart);
    clearCanvas(el);
    Charts.totalTransactionsChart = new Chart(el, {
        type: 'bar',
        data: { labels: labelsData, datasets: [{
            label: 'Total Transacciones',
            data: transactionsData,
            backgroundColor: 'rgba(255, 159, 64, 0.7)',
            borderColor: '#FF9F40',
            borderWidth: 2,
            borderRadius: 8,
        }]},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: buildTitle('Total de Transacciones por Mes'),
                legend: { display: false },
                datalabels: {
                    anchor: 'end', align: 'top', offset: 5, 
                    formatter: Math.round,
                    font: { weight: 'bold', size: 11 }, padding: 6
                }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { precision: 0 } },
                x: { grid: { display: false } }
            },
            onClick: (event, elements) => {
                if (elements.length > 0 && typeof openChartModal === 'function') {
                    openChartModal('totalTransactionsChart', 'Total de Transacciones por Mes');
                }
            }
        },
        plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
    });
    
    console.log('✅ Chart created successfully, instance:', Charts.totalTransactionsChart);
    
    if (window.generateChartAnalysis) {
        window.generateChartAnalysis('totalTransactions', labelsData, transactionsData, {
            type: 'number',
            note: 'Número total de transacciones procesadas en cada período mensual. Si un usuario hace 3 compras, cuenta como 3 transacciones.'
        });
    }
}

function createReturningPercentageChart(chartData) {
    const el = document.getElementById('returningUsersPercentageChart');
    if (!el) return;
    Charts.returningUsersPercentageChart = safeDestroyChart(Charts.returningUsersPercentageChart);
    clearCanvas(el);
    Charts.returningUsersPercentageChart = new Chart(el, {
        type: 'bar',
        data: { labels: chartData.labels, datasets: [{
            label: 'Porcentaje Usuarios Recurrentes',
            data: chartData.returningUsersPercentage || [],
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: '#FF6384',
            borderWidth: 2,
            borderRadius: 8,
        }]},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: buildTitle('Porcentaje de Usuarios Recurrentes'),
                legend: { display: false },
                datalabels: {
                    anchor: 'end', align: 'top', offset: 5,
                    formatter: (v) => `${Math.round(v)}%`,
                    font: { weight: 'bold', size: 11 }, padding: 6
                }
            },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        },
        plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
    });
    if (window.generateChartAnalysis) {
        window.generateChartAnalysis('returningPercentage', chartData.labels, chartData.returningUsersPercentage, {
            type: 'percentage',
            note: 'Porcentaje de usuarios recurrentes respecto al total de usuarios únicos en cada período.'
        });
    }
}

function createTotalAmountChart(chartData) {
    const el = document.getElementById('totalAmountChart');
    if (!el) return;
    Charts.totalAmountChart = safeDestroyChart(Charts.totalAmountChart);
    clearCanvas(el);
    Charts.totalAmountChart = new Chart(el, {
        type: 'bar',
        data: { labels: chartData.labels, datasets: [{
            label: 'Monto Total',
            data: chartData.totalAmount || [],
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: '#4BC0C0',
            borderWidth: 2,
            borderRadius: 8,
        }]},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: buildTitle('Monto Total por Mes'),
                legend: { display: false },
                datalabels: {
                    anchor: 'end', align: 'top', offset: 5,
                    formatter: function (value) {
                        return new Intl.NumberFormat('en-US', {
                            style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2
                        }).format(value || 0);
                    },
                    font: { weight: 'bold', size: 11 }, padding: 6
                }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        },
        plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
    });
    if (window.generateChartAnalysis) {
        window.generateChartAnalysis('totalAmount', chartData.labels, chartData.totalAmount, {
            type: 'currency', prefix: '$',
            note: 'Monto total de transacciones procesadas en cada período mensual (GMV - Gross Merchandise Value).'
        });
    }
}

function createFirstTimeUsersChart(chartData) {
    const el = document.getElementById('firstTimeUsersChart');
    if (!el) return;
    Charts.firstTimeUsersChart = safeDestroyChart(Charts.firstTimeUsersChart);
    clearCanvas(el);
    Charts.firstTimeUsersChart = new Chart(el, {
        type: 'bar',
        data: { labels: chartData.labels, datasets: [{
            label: 'Nuevos o Reactivados',
            data: chartData.firstTimeUsers || [],
            backgroundColor: 'rgba(153, 102, 255, 0.7)',
            borderColor: '#9966FF',
            borderWidth: 2,
            borderRadius: 8,
        }]},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: buildTitle('Nuevos o Reactivados por Mes'),
                legend: { display: false },
                datalabels: {
                    anchor: 'end', align: 'top', offset: 5, formatter: Math.round,
                    font: { weight: 'bold', size: 11 }, padding: 6
                }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        },
        plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
    });
    if (window.generateChartAnalysis) {
        window.generateChartAnalysis('firstTimeUsers', chartData.labels, chartData.firstTimeUsers, {
            type: 'number',
            note: 'Usuarios que realizan su primera transacción basado en el umbral de tiempo configurado para usuarios primerizos. Usa el botón "Ver Detalle de Cálculo por Mes" para analizar qué usuarios califican en cada mes.'
        });
    }
    if (typeof generateFirstTimeUsersAnalysis === 'function') {
        generateFirstTimeUsersAnalysis(chartData.labels, chartData.firstTimeUsers);
    }
}

function createAvgSpendPerUserChart(chartData) {
    const el = document.getElementById('avgSpendPerUserChart');
    if (!el) return;
    Charts.avgSpendPerUserChart = safeDestroyChart(Charts.avgSpendPerUserChart);
    clearCanvas(el);
    Charts.avgSpendPerUserChart = new Chart(el, {
        type: 'bar',
        data: { labels: chartData.labels, datasets: [{
            label: 'Gasto Promedio por Usuario',
            data: chartData.avgSpendPerUser || [],
            backgroundColor: 'rgba(255, 206, 86, 0.7)',
            borderColor: '#FFCE56',
            borderWidth: 2,
            borderRadius: 8,
        }]},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: buildTitle('Gasto Promedio por Usuario'),
                legend: { display: false },
                datalabels: {
                    anchor: 'end', align: 'top', offset: 5,
                    formatter: function (value) {
                        return new Intl.NumberFormat('en-US', {
                            style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2
                        }).format(value || 0);
                    },
                    font: { weight: 'bold', size: 11 }, padding: 6
                }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        },
        plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
    });
    if (window.generateChartAnalysis) {
        window.generateChartAnalysis('avgSpend', chartData.labels, chartData.avgSpendPerUser, {
            type: 'currency', prefix: '$',
            note: 'Gasto promedio por usuario calculado dividiendo el GMV total entre el número de usuarios únicos por período.'
        });
    }
}

function initMetricsCharts(chartData) {
    console.log('🚀 initMetricsCharts called with chartData:', {
        labels: chartData.labels,
        totalTransactions: chartData.totalTransactions
    });
    
    try {
        console.log('📍 Step 1: Creating uniqueUsersChart');
        createUniqueUsersChart(chartData);
        console.log('📍 Step 2: Creating returningUsersChart');
        createReturningUsersChart(chartData);
        console.log('📍 Step 3: Creating avgVisitsChart');
        createAvgVisitsChart(chartData);
        console.log('📍 Step 4: Creating totalTransactionsChart');
        createTotalTransactionsChart(chartData);
        console.log('📍 Step 5: Creating returningPercentageChart');
        createReturningPercentageChart(chartData);
        console.log('📍 Step 6: Creating totalAmountChart');
        createTotalAmountChart(chartData);
        console.log('📍 Step 7: Creating firstTimeUsersChart');
        createFirstTimeUsersChart(chartData);
        console.log('📍 Step 8: Creating avgSpendPerUserChart');
        createAvgSpendPerUserChart(chartData);
        console.log('✅ All charts created successfully');
    } catch (error) {
        console.error('❌ Error in initMetricsCharts:', error);
    }
}

// Export builders
window.createUniqueUsersChart = createUniqueUsersChart;
window.createReturningUsersChart = createReturningUsersChart;
window.createAvgVisitsChart = createAvgVisitsChart;
window.createTotalTransactionsChart = createTotalTransactionsChart;
window.createReturningPercentageChart = createReturningPercentageChart;
window.createTotalAmountChart = createTotalAmountChart;
window.createFirstTimeUsersChart = createFirstTimeUsersChart;
window.createAvgSpendPerUserChart = createAvgSpendPerUserChart;
window.initMetricsCharts = initMetricsCharts;
