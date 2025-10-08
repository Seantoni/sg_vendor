// Legacy Chart Functions - Remaining Unique Code
// ===============================================
// This file contains chart initialization functions that haven't been moved to other modules yet


// Register Chart.js plugins and configure defaults when available
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Chart !== 'undefined') {
        // Set global defaults to prevent height growth
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        Chart.defaults.resizeDelay = 0;
        
        // Disable animations that might cause sizing issues
        Chart.defaults.animation = {
            duration: 0
        };
        
                        // Disable tooltips globally
        Chart.defaults.plugins.tooltip.enabled = false;
        
        // Configure datalabels – keep defaults; do NOT override listeners
        if (typeof ChartDataLabels !== 'undefined') {
            Chart.defaults.plugins.datalabels = Chart.defaults.plugins.datalabels || {};
            // Ensure no custom listeners are set (avoids plugin calling undefined handlers)
            if (Chart.defaults.plugins.datalabels.listeners) {
                delete Chart.defaults.plugins.datalabels.listeners;
            }
        }
        
        console.log('✅ Chart.js defaults configured - tooltips disabled');
    }
});

// Helper function to create standard chart title configuration
function createChartTitle(titleText) {
    return {
        display: true,
        text: titleText,
        font: {
            size: 16,
            weight: 'bold'
        },
        padding: {
            bottom: 20
        },
        color: '#2d3436'
    };
}



// Chart initialization functions (TODO: Move these to js/charts.js)
function initMetricsCharts(chartData) {
    // Destroy existing charts first
    if (Charts.uniqueUsersChart) {
        Charts.uniqueUsersChart = safeDestroyChart(Charts.uniqueUsersChart);
    }
    if (Charts.returningUsersChart) {
        Charts.returningUsersChart = safeDestroyChart(Charts.returningUsersChart);
    }
    
    // Initialize unique users chart
    const uniqueUsersCtx = document.getElementById('uniqueUsersChart');
    if (uniqueUsersCtx) {
        // Clear the canvas to prevent reuse issues
        const context = uniqueUsersCtx.getContext('2d');
        if (context) {
            context.clearRect(0, 0, uniqueUsersCtx.width, uniqueUsersCtx.height);
        }
        
                Charts.uniqueUsersChart = new Chart(uniqueUsersCtx, {
        type: 'bar',
        data: {
                labels: chartData.labels,
            datasets: [{
                    label: 'Usuarios Únicos',
                    data: chartData.uniqueUsers,
                backgroundColor: 'rgba(107, 100, 219, 0.7)',
                borderColor: '#6B64DB',
                    borderWidth: 2,
                    borderRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                    title: createChartTitle('Usuarios Únicos por Mes'),
                legend: {
                    display: false
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    offset: 5,
                    formatter: Math.round,
                    font: {
                        weight: 'bold',
                        size: 11
                    },
                    padding: 6
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            precision: 0
                        }
                    },
                    x: {
                        grid: {
                            display: false
                    }
                }
            }
        },
            plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
        });
        
        // Add analysis including former chart note
        if (window.generateChartAnalysis) {
            window.generateChartAnalysis('uniqueUsers', chartData.labels, chartData.uniqueUsers, {
                type: 'number',
                note: 'Muestra el número total de usuarios únicos que realizaron transacciones en cada período mensual.'
            });
        }
    }

    // Initialize returning users chart
    const returningUsersCtx = document.getElementById('returningUsersChart');
    if (returningUsersCtx) {
        // Clear the canvas to prevent reuse issues
        const context = returningUsersCtx.getContext('2d');
        if (context) {
            context.clearRect(0, 0, returningUsersCtx.width, returningUsersCtx.height);
        }
        
        Charts.returningUsersChart = new Chart(returningUsersCtx, {
        type: 'bar',
        data: {
                labels: chartData.labels,
            datasets: [{
                    label: 'Usuarios Recurrentes',
                    data: chartData.returningUsers || [],
                    backgroundColor: 'rgba(255, 159, 64, 0.7)',
                    borderColor: '#FF9F40',
                    borderWidth: 2,
                    borderRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                                    title: createChartTitle('Usuarios Recurrentes por Mes'),
                legend: {
                    display: false
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    offset: 5,
                    formatter: Math.round,
                    font: {
                        weight: 'bold',
                        size: 11
                    },
                    padding: 6
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            precision: 0
                        }
                    },
                    x: {
                        grid: {
                            display: false
                    }
                }
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

    // Initialize average visits chart
    const avgVisitsCtx = document.getElementById('avgVisitsChart');
    if (avgVisitsCtx) {
        if (Charts.avgVisitsChart) {
            Charts.avgVisitsChart = safeDestroyChart(Charts.avgVisitsChart);
        }
        const context = avgVisitsCtx.getContext('2d');
        if (context) {
            context.clearRect(0, 0, avgVisitsCtx.width, avgVisitsCtx.height);
        }
        
        Charts.avgVisitsChart = new Chart(avgVisitsCtx, {
        type: 'bar',
        data: {
                labels: chartData.labels,
            datasets: [{
                    label: 'Visitas Promedio',
                    data: chartData.avgVisits || [],
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: '#36A2EB',
                    borderWidth: 2,
                    borderRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                    title: createChartTitle('Visitas Promedio por Usuario'),
                    legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    offset: 5,
                        formatter: (value) => value.toFixed(1),
                        font: { weight: 'bold', size: 11 },
                    padding: 6
                }
            },
            scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                    x: { grid: { display: false } }
                }
            },
            plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
        });
        
        if (window.generateChartAnalysis) {
            window.generateChartAnalysis('avgVisits', chartData.labels, chartData.avgVisits, {
                type: 'decimal',
                suffix: ' visitas',
                note: 'Promedio de visitas por usuario en cada período mensual basado en el historial de transacciones.'
            });
        }
    }

    // Initialize returning users percentage chart
    const returningUsersPercentageCtx = document.getElementById('returningUsersPercentageChart');
    if (returningUsersPercentageCtx) {
        if (Charts.returningUsersPercentageChart) {
            Charts.returningUsersPercentageChart = safeDestroyChart(Charts.returningUsersPercentageChart);
        }
        const context = returningUsersPercentageCtx.getContext('2d');
        if (context) {
            context.clearRect(0, 0, returningUsersPercentageCtx.width, returningUsersPercentageCtx.height);
        }
        
        Charts.returningUsersPercentageChart = new Chart(returningUsersPercentageCtx, {
        type: 'bar',
        data: {
                labels: chartData.labels,
            datasets: [{
                    label: 'Porcentaje Usuarios Recurrentes',
                    data: chartData.returningUsersPercentage || [],
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: '#FF6384',
                    borderWidth: 2,
                    borderRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                    title: createChartTitle('Porcentaje de Usuarios Recurrentes'),
                    legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    offset: 5,
                        formatter: (value) => `${Math.round(value)}%`,
                        font: { weight: 'bold', size: 11 },
                    padding: 6
                }
            },
            scales: {
                    y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
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

    // Initialize total amount chart
    const totalAmountCtx = document.getElementById('totalAmountChart');
    if (totalAmountCtx) {
        if (Charts.totalAmountChart) {
            Charts.totalAmountChart = safeDestroyChart(Charts.totalAmountChart);
        }
        const context = totalAmountCtx.getContext('2d');
        if (context) {
            context.clearRect(0, 0, totalAmountCtx.width, totalAmountCtx.height);
        }
        
        Charts.totalAmountChart = new Chart(totalAmountCtx, {
        type: 'bar',
        data: {
                labels: chartData.labels,
            datasets: [{
                    label: 'Monto Total',
                    data: chartData.totalAmount || [],
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: '#4BC0C0',
                    borderWidth: 2,
                    borderRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: createChartTitle('Monto Total por Mes'),
                    legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    offset: 5,
                        formatter: function (value) {
                            return new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(value || 0);
                        },
                        font: { weight: 'bold', size: 11 },
                    padding: 6
                }
            },
            scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                    x: { grid: { display: false } }
                }
            },
            plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
        });
        
        if (window.generateChartAnalysis) {
            window.generateChartAnalysis('totalAmount', chartData.labels, chartData.totalAmount, {
                type: 'currency',
                prefix: '$',
                note: 'Monto total de transacciones procesadas en cada período mensual (GMV - Gross Merchandise Value).'
            });
        }
    }

    // Initialize first time users chart
    const firstTimeUsersCtx = document.getElementById('firstTimeUsersChart');
    if (firstTimeUsersCtx) {
        if (Charts.firstTimeUsersChart) {
            Charts.firstTimeUsersChart = safeDestroyChart(Charts.firstTimeUsersChart);
        }
        const context = firstTimeUsersCtx.getContext('2d');
        if (context) {
            context.clearRect(0, 0, firstTimeUsersCtx.width, firstTimeUsersCtx.height);
        }
        
        Charts.firstTimeUsersChart = new Chart(firstTimeUsersCtx, {
        type: 'bar',
        data: {
                labels: chartData.labels,
            datasets: [{
                    label: 'Nuevos o Reactivados',
                    data: chartData.firstTimeUsers || [],
                    backgroundColor: 'rgba(153, 102, 255, 0.7)',
                    borderColor: '#9966FF',
                    borderWidth: 2,
                    borderRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: createChartTitle('Nuevos o Reactivados por Mes'),
                    legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    offset: 5,
                    formatter: Math.round,
                        font: { weight: 'bold', size: 11 },
                    padding: 6
                }
            },
            scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                    x: { grid: { display: false } }
                }
            },
            plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
        });
        
        // Generate and display analysis with note
        if (window.generateChartAnalysis) {
            window.generateChartAnalysis('firstTimeUsers', chartData.labels, chartData.firstTimeUsers, {
                type: 'number',
                note: 'Usuarios que realizan su primera transacción basado en el umbral de tiempo configurado para usuarios primerizos. Usa el botón "Ver Detalle de Cálculo por Mes" para analizar qué usuarios califican en cada mes.'
            });
        }
        generateFirstTimeUsersAnalysis(chartData.labels, chartData.firstTimeUsers);
    }

    // Initialize average spend per user chart
    const avgSpendPerUserCtx = document.getElementById('avgSpendPerUserChart');
    if (avgSpendPerUserCtx) {
        if (Charts.avgSpendPerUserChart) {
            Charts.avgSpendPerUserChart = safeDestroyChart(Charts.avgSpendPerUserChart);
        }
        const context = avgSpendPerUserCtx.getContext('2d');
        if (context) {
            context.clearRect(0, 0, avgSpendPerUserCtx.width, avgSpendPerUserCtx.height);
        }
        
        Charts.avgSpendPerUserChart = new Chart(avgSpendPerUserCtx, {
        type: 'bar',
        data: {
                labels: chartData.labels,
            datasets: [{
                label: 'Gasto Promedio por Usuario',
                    data: chartData.avgSpendPerUser || [],
                    backgroundColor: 'rgba(255, 206, 86, 0.7)',
                    borderColor: '#FFCE56',
                    borderWidth: 2,
                    borderRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: createChartTitle('Gasto Promedio por Usuario'),
                    legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    offset: 5,
                    formatter: function (value) {
                        return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }).format(value || 0);
                    },
                        font: { weight: 'bold', size: 11 },
                    padding: 6
                }
            },
            scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                    x: { grid: { display: false } }
                }
            },
            plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
        });
        
        if (window.generateChartAnalysis) {
            window.generateChartAnalysis('avgSpend', chartData.labels, chartData.avgSpendPerUser, {
                type: 'currency',
                prefix: '$',
                note: 'Gasto promedio por usuario calculado dividiendo el GMV total entre el número de usuarios únicos por período.'
            });
        }
    }
}

// Daily sales chart initialization
function initDailySalesChart(data) {
    const ctx = document.getElementById('dailySalesChart');
    if (!ctx) return;

    // Destroy existing chart properly
    if (Charts.dailySalesChart) {
        Charts.dailySalesChart = safeDestroyChart(Charts.dailySalesChart);
    }
    
    // Clear the canvas to prevent reuse issues
    const canvas = ctx;
    if (canvas) {
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // Process data for daily sales
    const dailyData = {};
    data.forEach(item => {
        const date = parseDate(item.date);
        if (!date) return;
        
        const dateKey = date.toISOString().split('T')[0];
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
                transactions: 0,
                amount: 0
            };
        }
        dailyData[dateKey].transactions++;
        dailyData[dateKey].amount += parseFloat(item.amount) || 0;
    });

    // Convert to arrays for chart
    const sortedDates = Object.keys(dailyData).sort();
    const transactions = sortedDates.map(date => dailyData[date].transactions);

    // Calculate average and threshold for anomaly detection
    const avgTransactions = transactions.reduce((sum, val) => sum + val, 0) / transactions.length;
    const threshold = avgTransactions * 0.5; // 50% threshold

    Charts.dailySalesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates.map(date => new Date(date).toLocaleDateString()),
            datasets: [
                {
                    label: 'Transacciones Diarias',
                    data: transactions,
                    borderColor: '#6B64DB',
                    backgroundColor: 'rgba(107, 100, 219, 0.1)',
                    tension: 0.4,
                    pointBackgroundColor: transactions.map(val => val < threshold ? '#FF6B6B' : '#6B64DB'),
                    pointBorderColor: transactions.map(val => val < threshold ? '#FF6B6B' : '#6B64DB'),
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    datalabels: {
                        display: true,
                        align: 'top',
                        anchor: 'end',
                        offset: 5,
                        formatter: function(value, context) {
                            return value;
                        },
                        color: function(context) {
                            return context.dataset.pointBackgroundColor[context.dataIndex];
                        },
                        font: {
                            weight: 'bold',
                            size: 10
                        }
                    }
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Monitoreo de Transacciones Diarias',
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
                    display: true,
                    align: 'top',
                    anchor: 'end',
                    offset: 5,
                    formatter: function(value, context) {
                        return value;
                    },
                    color: function(context) {
                        return context.dataset.pointBackgroundColor[context.dataIndex];
                    },
                    font: {
                        weight: 'bold',
                        size: 10
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        },
        plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
    });
    
    // Generate analysis with note
    if (window.generateChartAnalysis) {
        window.generateChartAnalysis('dailySales', sortedDates.map(date => new Date(date).toLocaleDateString()), transactions, {
            type: 'number',
            note: `<strong>Metodología de Detección de Anomalías:</strong> Sistema automático que analiza transacciones diarias y compara contra el promedio histórico del período. 
            <br><br>
            <strong>Criterios de detección:</strong><br>
            • <span style="color: #FF9F40;">🟡 Anomalía Moderada:</span> Días con 25-50% del promedio diario (posibles problemas operativos)<br>
            • <span style="color: #FF6B6B;">🔴 Anomalía Severa:</span> Días con menos del 25% del promedio (requieren investigación inmediata)<br>
            • <span style="color: #6B64DB;">🔵 Normal:</span> Días dentro del rango esperado (>50% del promedio)<br>
            <br>
            <strong>Promedio actual:</strong> ${Math.round(avgTransactions)} transacciones/día | 
            <strong>Umbral:</strong> ${Math.round(threshold)} transacciones (50%)`
        });
    }
    
    // Detect and display anomalies
    detectAndDisplayAnomalies(sortedDates, dailyData, avgTransactions, threshold);
}

// Function to detect and display anomalies
function detectAndDisplayAnomalies(sortedDates, dailyData, avgTransactions, threshold) {
    const anomalies = [];
    
    // Find all dates with transactions below threshold
    sortedDates.forEach(dateKey => {
        const dayData = dailyData[dateKey];
        if (dayData.transactions < threshold) {
            const percentOfAverage = (dayData.transactions / avgTransactions) * 100;
            anomalies.push({
                date: dateKey,
                transactions: dayData.transactions,
                amount: dayData.amount,
                percentOfAverage: percentOfAverage,
                severity: percentOfAverage < 25 ? 'severe' : 'moderate'
            });
        }
    });
    
    // Sort anomalies by severity (lowest percentage first)
    anomalies.sort((a, b) => a.percentOfAverage - b.percentOfAverage);
    
    console.log(`🚨 Anomalies detected: ${anomalies.length} days below 50% threshold`);
    
    // Update anomaly table
    const anomalyTableBody = document.getElementById('anomalyTableBody');
    const anomalyList = document.getElementById('anomalyList');
    
    if (anomalies.length === 0) {
        // No anomalies found
        if (anomalyTableBody) {
            anomalyTableBody.innerHTML = '<tr><td colspan="4" class="no-anomalies">✅ No se detectaron anomalías significativas en el período seleccionado.</td></tr>';
        }
        if (anomalyList) {
            anomalyList.innerHTML = '<div class="no-anomalies">✅ Todas las transacciones diarias están dentro de los rangos esperados.</div>';
        }
    } else {
        // Populate anomaly table
        if (anomalyTableBody) {
            anomalyTableBody.innerHTML = anomalies.map(anomaly => {
                const date = new Date(anomaly.date);
                const formattedDate = date.toLocaleDateString('es-MX', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
                const rowClass = anomaly.severity === 'severe' ? 'severe-anomaly' : '';
                
                return `
                    <tr class="${rowClass}">
                        <td>${formattedDate}</td>
                        <td class="anomaly-transactions">${anomaly.transactions}</td>
                        <td class="anomaly-percentage">${anomaly.percentOfAverage.toFixed(1)}%</td>
                        <td>${new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }).format(anomaly.amount)}</td>
                    </tr>
                `;
            }).join('');
        }
        
        // Populate anomaly list (detailed view)
        if (anomalyList) {
            const severeAnomalies = anomalies.filter(a => a.severity === 'severe');
            
            if (severeAnomalies.length > 0) {
                anomalyList.innerHTML = `
                    <div class="high-frequency-alert">
                        <p><strong>⚠️ Alerta:</strong> Se detectaron ${severeAnomalies.length} día(s) con caídas severas (menos del 25% del promedio).</p>
                    </div>
                `;
            } else {
                anomalyList.innerHTML = '';
            }
        }
        
        // Update summary text
        const anomalySummaryText = document.getElementById('anomalySummaryText');
        if (anomalySummaryText) {
            const severeCount = anomalies.filter(a => a.severity === 'severe').length;
            const moderateCount = anomalies.length - severeCount;
            
            anomalySummaryText.innerHTML = `
                <p class="anomaly-description">
                    Se detectaron <strong>${anomalies.length} anomalías</strong> en el período analizado 
                    (${severeCount} severas, ${moderateCount} moderadas). 
                    Promedio diario: <strong>${Math.round(avgTransactions)} transacciones</strong>.
                </p>
            `;
        }
    }
    
    // Setup copy button
    const copyButton = document.getElementById('copyAnomalyReport');
    if (copyButton) {
        copyButton.onclick = function() {
            copyAnomalyReportToClipboard(anomalies, avgTransactions);
        };
    }
}

// Function to copy anomaly report to clipboard
function copyAnomalyReportToClipboard(anomalies, avgTransactions) {
    let reportText = '📊 REPORTE DE ANOMALÍAS - SimpleGo Analytics\n';
    reportText += '═'.repeat(60) + '\n\n';
    reportText += `Promedio diario de transacciones: ${Math.round(avgTransactions)}\n`;
    reportText += `Umbral de detección: ${Math.round(avgTransactions * 0.5)} transacciones (50%)\n`;
    reportText += `Total de anomalías detectadas: ${anomalies.length}\n\n`;
    
    if (anomalies.length > 0) {
        reportText += 'DETALLE DE ANOMALÍAS:\n';
        reportText += '─'.repeat(60) + '\n\n';
        
        anomalies.forEach((anomaly, index) => {
            const date = new Date(anomaly.date);
            const formattedDate = date.toLocaleDateString('es-MX', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const severity = anomaly.severity === 'severe' ? '🔴 SEVERA' : '🟡 MODERADA';
            
            reportText += `${index + 1}. ${formattedDate} ${severity}\n`;
            reportText += `   Transacciones: ${anomaly.transactions}\n`;
            reportText += `   Porcentaje del promedio: ${anomaly.percentOfAverage.toFixed(1)}%\n`;
            reportText += `   Monto total: ${new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(anomaly.amount)}\n\n`;
        });
    } else {
        reportText += '✅ No se detectaron anomalías en el período analizado.\n';
    }
    
    reportText += '\n' + '═'.repeat(60) + '\n';
    reportText += `Generado: ${new Date().toLocaleString('es-MX')}\n`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(reportText).then(() => {
        // Show success message
        const message = document.createElement('div');
        message.className = 'copy-message';
        message.textContent = '✅ Reporte copiado al portapapeles';
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 2000);
    }).catch(err => {
        console.error('Error copying to clipboard:', err);
        alert('No se pudo copiar el reporte. Por favor, intenta de nuevo.');
    });
}

// Month selector functions
function openMonthSelector() {
    const modal = document.getElementById('monthSelectorModal');
    const grid = document.getElementById('monthSelectorGrid');
    
    if (!modal || !grid) return;
    
    // Get available months from debug data
    const availableMonths = Object.keys(window.firstTimeUsersDebugData || {}).sort();
    
    if (availableMonths.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: #636e72;">No hay datos disponibles. Por favor, selecciona un negocio y período primero.</p>';
    } else {
        // Create month buttons
        grid.innerHTML = availableMonths.map(monthKey => {
            const monthDate = new Date(monthKey + '-01');
            const monthName = monthDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
            const count = window.firstTimeUsersDebugData[monthKey].filter(u => u.qualifies).length;
            const total = window.firstTimeUsersDebugData[monthKey].length;
            
            return `
                <button class="month-selector-btn" onclick="selectMonthForDebug('${monthKey}')">
                    <div class="month-name">${monthName}</div>
                    <div class="month-stats">${count} de ${total} usuarios</div>
                </button>
            `;
        }).join('');
    }
    
    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeMonthSelector() {
    const modal = document.getElementById('monthSelectorModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function selectMonthForDebug(monthKey) {
    closeMonthSelector();
    setTimeout(() => {
        showDebugModal(monthKey);
    }, 300);
}

// Debug modal functions for "Nuevos o Reactivados" chart
function showDebugModal(monthKey) {
    const modal = document.getElementById('debugModal');
    const debugData = window.firstTimeUsersDebugData[monthKey] || [];
    
    if (!modal) return;
    
    // Update title
    const title = document.getElementById('debugModalTitle');
    const subtitle = document.getElementById('debugModalSubtitle');
    if (title) title.textContent = `Nuevos o Reactivados - ${monthKey}`;
    if (subtitle) subtitle.textContent = `Análisis detallado de usuarios que califican en este mes`;
    
    // Update stats
    const qualified = debugData.filter(d => d.qualifies).length;
    const total = debugData.length;
    
    const debugTotalUsers = document.getElementById('debugTotalUsers');
    const debugThreshold = document.getElementById('debugThreshold');
    const debugBusiness = document.getElementById('debugBusiness');
    
    if (debugTotalUsers) debugTotalUsers.textContent = `${qualified} de ${total}`;
    if (debugThreshold) debugThreshold.textContent = `${AppState.firstTimeUsersThreshold || 0} días`;
    if (debugBusiness) debugBusiness.textContent = AppState.selectedBusiness || 'Todos';
    
    // Populate table with privacy-friendly user codes
    const tableBody = document.getElementById('debugTableBody');
    if (tableBody) {
        if (debugData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #636e72;">No hay datos para este mes</td></tr>';
        } else {
            tableBody.innerHTML = debugData.map(user => {
                const rowClass = user.qualifies ? 'debug-row-success' : 'debug-row-excluded';
                // Get privacy-friendly user code and extract just the number
                const fullUserCode = window.emailToUserCode && window.emailToUserCode.get(user.email) || 'Usuario #?';
                const userNumber = fullUserCode.replace('Usuario #', ''); // Just show the number
                return `
                    <tr class="${rowClass}">
                        <td class="user-id-cell"><strong>#${userNumber}</strong></td>
                        <td>${user.globalFirst.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td>${user.daysSinceProgramEntry} días</td>
                        <td>${user.transactionDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td>${user.reason}</td>
                    </tr>
                `;
            }).join('');
        }
    }
    
    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeDebugModal() {
    const modal = document.getElementById('debugModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Make functions globally available
window.openMonthSelector = openMonthSelector;
window.closeMonthSelector = closeMonthSelector;
window.selectMonthForDebug = selectMonthForDebug;
window.showDebugModal = showDebugModal;
window.closeDebugModal = closeDebugModal;

// Initialize debug button listener
document.addEventListener('DOMContentLoaded', function() {
    const debugButton = document.getElementById('openDebugSelector');
    if (debugButton) {
        debugButton.addEventListener('click', openMonthSelector);
    }
});

// Function to generate analysis for First Time Users chart
function generateFirstTimeUsersAnalysis(labels, firstTimeData) {
    const analysisPanel = document.getElementById('firstTimeUsersAnalysis');
    if (!analysisPanel || !firstTimeData || firstTimeData.length === 0) return;
    
    // Get unique users data from the chart for comparison
    const uniqueUsersData = Charts.uniqueUsersChart ? 
        Charts.uniqueUsersChart.data.datasets[0].data : [];
    
    const total = firstTimeData.reduce((sum, val) => sum + val, 0);
    const avg = total / firstTimeData.length;
    const max = Math.max(...firstTimeData);
    const maxMonth = labels[firstTimeData.indexOf(max)];
    
    // Calculate trend (last 2 vs first 2 months)
    let trendIcon = 'fa-minus';
    let trendClass = 'neutral';
    let trendText = 'estable';
    
    if (firstTimeData.length >= 4) {
        const recent = firstTimeData.slice(-2).reduce((a, b) => a + b, 0) / 2;
        const older = firstTimeData.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
        if (recent > older * 1.15) {
            trendIcon = 'fa-arrow-trend-up';
            trendClass = 'positive';
            trendText = 'creciente';
        } else if (recent < older * 0.85) {
            trendIcon = 'fa-arrow-trend-down';
            trendClass = 'negative';
            trendText = 'decreciente';
        }
    }
    
    // Calculate percentage of total users for each month
    const percentages = firstTimeData.map((newUsers, idx) => {
        const totalUsers = uniqueUsersData[idx] || 0;
        return totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0;
    });
    
    const avgPercentage = percentages.reduce((a, b) => a + b, 0) / percentages.length;
    const maxPercentage = Math.max(...percentages);
    const maxPercentageMonth = labels[percentages.indexOf(maxPercentage)];
    const maxPercentageUsers = firstTimeData[percentages.indexOf(maxPercentage)];
    const maxPercentageTotalUsers = uniqueUsersData[percentages.indexOf(maxPercentage)];
    
    // Generate compact bullet points
    let bullets = [];
    
    // Performance bullet
    if (total === 0) {
        bullets.push(`<i class="fas fa-times-circle"></i> Sin usuarios nuevos/reactivados detectados con umbral de ${AppState.firstTimeUsersThreshold || 0} días`);
    } else {
        bullets.push(`<i class="fas fa-users"></i> Promedio: <strong>${Math.round(avg)} usuarios/mes</strong> (${avgPercentage.toFixed(0)}% del total)`);
    }
    
    // Trend bullet
    bullets.push(`<i class="fas ${trendIcon}"></i> Tendencia: <strong class="trend-${trendClass}">${trendText}</strong>`);
    
    // Best month bullet with comparison
    if (max > 0 && maxPercentageTotalUsers > 0) {
        bullets.push(`<i class="fas fa-trophy"></i> Mejor mes: <strong>${maxMonth}</strong> con ${maxPercentageUsers} usuarios (<strong>${maxPercentage.toFixed(0)}%</strong> de ${maxPercentageTotalUsers} usuarios únicos)`);
    }
    
    // Generate monthly breakdown
    let monthlyBreakdown = '';
    if (firstTimeData.length > 0 && firstTimeData.length <= 12) {
        const monthlyItems = labels.map((month, idx) => {
            const newUsers = firstTimeData[idx];
            const totalUsers = uniqueUsersData[idx] || 0;
            const percentage = totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0;
            const monthName = new Date(month + '-01').toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
            
            // Determine icon based on percentage
            let icon = 'fa-circle';
            let iconClass = '';
            if (percentage >= 50) {
                icon = 'fa-circle-check';
                iconClass = 'icon-high';
            } else if (percentage >= 25) {
                icon = 'fa-circle';
                iconClass = 'icon-medium';
            } else if (newUsers > 0) {
                icon = 'fa-circle';
                iconClass = 'icon-low';
            } else {
                icon = 'fa-circle-xmark';
                iconClass = 'icon-none';
            }
            
            return `<span class="monthly-item"><i class="fas ${icon} ${iconClass}"></i> <strong>${monthName}:</strong> ${newUsers} (${percentage.toFixed(0)}% de ${totalUsers})</span>`;
        }).join('');
        
        monthlyBreakdown = `
            <div class="monthly-breakdown">
                <div class="monthly-breakdown-header">
                    <i class="fas fa-calendar-days"></i>
                    <span>Desglose Mensual</span>
                </div>
                <div class="monthly-grid">
                    ${monthlyItems}
                </div>
            </div>
        `;
    }
    
    // Generate HTML
    analysisPanel.innerHTML = `
        <div class="analysis-compact">
            <div class="analysis-compact-header">
                <i class="fas fa-chart-line"></i>
                <span>Análisis Rápido</span>
            </div>
            <ul class="analysis-bullets">
                ${bullets.map(bullet => `<li>${bullet}</li>`).join('')}
            </ul>
            ${monthlyBreakdown}
        </div>
    `;
}

// Make function globally available
window.generateFirstTimeUsersAnalysis = generateFirstTimeUsersAnalysis;

// Mobile handlers initialization
function initializeMobileHandlers() {
    const dashboard = document.querySelector('.dashboard') || document.querySelector('.main-content');
    const modal = document.getElementById('filterModal');
    
    if (!dashboard || !modal) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    dashboard.addEventListener('touchstart', function(e) {
        startY = e.touches[0].clientY;
        isDragging = false;
    }, { passive: true });

    dashboard.addEventListener('touchmove', function(e) {
        if (!modal.classList.contains('hidden')) return;
        
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        
        if (Math.abs(deltaY) > 10) {
            isDragging = true;
            
            if (deltaY < -50) {
                // Swipe up to show modal
                if (window.showModal && typeof window.showModal === 'function') {
                    window.showModal();
                }
            }
        }
    }, { passive: true });

    dashboard.addEventListener('touchend', function() {
        isDragging = false;
    });
}

// Make functions available globally
window.initMetricsCharts = initMetricsCharts;
window.initDailySalesChart = initDailySalesChart;
window.initializeMobileHandlers = initializeMobileHandlers;
