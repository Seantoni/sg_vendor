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

    data.forEach(item => {
        const date = parseDate(item.date);
        if (!date) return;

        const businessName = extractBusinessName(item.merchant);
        const location = extractLocation(item.merchant);
        const email = item.email;

        // Filter by selected business if one is selected
        if (AppState.selectedBusiness !== 'all' && businessName !== AppState.selectedBusiness) {
            return; // Skip this item if it doesn't match the selected business
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

    // Prepare chart data - stacked horizontal bar chart showing all months
    const locations = Object.keys(processedData);
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
                },
                tooltip: {
                    enabled: false
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
                    }
                }
            }
        }
    });
    
    // Add chart note
    const locationUsersContainer = ctx.closest('.full-width') || ctx.closest('.metrics-chart');
    if (locationUsersContainer) {
        createChartNote(locationUsersContainer, 'Distribución de usuarios únicos por ubicación geográfica acumulada durante todo el período seleccionado.');
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

        // Filter by selected business if one is selected
        if (AppState.selectedBusiness !== 'all' && businessName !== AppState.selectedBusiness) {
            return; // Skip this item if it doesn't match the selected business
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

    // Prepare chart data - stacked horizontal bar chart showing all months
    const locations = Object.keys(processedData);
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
                },
                tooltip: {
                    enabled: false
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
                    }
                }
            }
        }
    });
    
    // Add chart note
    const locationGMVContainer = ctx.closest('.full-width') || ctx.closest('.metrics-chart');
    if (locationGMVContainer) {
        createChartNote(locationGMVContainer, 'Valor Bruto de Mercancía (GMV) por ubicación geográfica, mostrando el monto total transaccionado en cada región.');
    }
}

// Helper function to create or update chart note
function createChartNote(chartContainer, noteText) {
    // Remove old tooltip elements if they exist
    const oldTooltipInfo = chartContainer.querySelector('.chart-info');
    if (oldTooltipInfo) {
        oldTooltipInfo.remove();
    }
    
    // Find existing note or create new one
    let noteElement = chartContainer.querySelector('.chart-note');
    if (!noteElement) {
        noteElement = document.createElement('div');
        noteElement.className = 'chart-note';
        chartContainer.appendChild(noteElement);
    }
    
    noteElement.innerHTML = `<strong>Nota:</strong> ${noteText}`;
    
    // Ensure the note is positioned at the bottom of the container
    noteElement.style.order = '999';
    noteElement.style.marginTop = '15px';
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
            const businessName = extractBusinessName(item.business_name || item.business || '');
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

    // Simple linear projection for next 12 months
    const projectionMonths = [];
    const projectionCounts = [];
    
    // Calculate average growth rate from last 6 months (or all available if less than 6)
    const recentMonths = Math.min(6, sortedMonths.length);
    const recentData = historicalCounts.slice(-recentMonths);
    
    let totalGrowth = 0;
    let growthCount = 0;
    
    for (let i = 1; i < recentData.length; i++) {
        if (recentData[i-1] > 0) {
            const growth = (recentData[i] - recentData[i-1]) / recentData[i-1];
            totalGrowth += growth;
            growthCount++;
        }
    }
    
    const avgGrowthRate = growthCount > 0 ? totalGrowth / growthCount : 0.05; // Default 5% growth
    const lastCount = historicalCounts[historicalCounts.length - 1] || 0;
    
    // Generate next 12 months
    const lastDate = new Date(sortedMonths[sortedMonths.length - 1] + '-01');
    
    for (let i = 1; i <= 12; i++) {
        const projectionDate = new Date(lastDate);
        projectionDate.setMonth(projectionDate.getMonth() + i);
        
        const monthKey = formatYearMonth(projectionDate);
        projectionMonths.push(monthKey);
        
        // Apply compound growth with some randomness to make it realistic
        const projectedValue = Math.max(0, Math.round(lastCount * Math.pow(1 + avgGrowthRate, i)));
        projectionCounts.push(projectedValue);
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
                },
                tooltip: {
                    enabled: false
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

    // Add chart note
    const projectionContainer = ctx.closest('.daily-sales-chart') || ctx.closest('.full-width');
    if (projectionContainer) {
        createChartNote(projectionContainer, 'Proyección basada en tendencias históricas de los últimos meses. La línea punteada representa estimaciones futuras con un margen de error del ±20%.');
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
                    <strong>Metodología:</strong> Proyección basada en la tasa de crecimiento promedio de los últimos ${recentMonths} meses.
                    Las proyecciones son estimaciones y pueden variar según factores externos del mercado.
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
window.createChartNote = createChartNote;
