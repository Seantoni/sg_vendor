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
        
        // Enable tooltips globally with external HTML rendering
        Chart.defaults.plugins.tooltip.enabled = true;
        Chart.defaults.plugins.tooltip.mode = 'index';
        Chart.defaults.plugins.tooltip.intersect = true;
        
        // Configure datalabels to not listen to events (prevents conflicts)
        if (typeof ChartDataLabels !== 'undefined') {
            Chart.defaults.plugins.datalabels = Chart.defaults.plugins.datalabels || {};
            Chart.defaults.plugins.datalabels.listeners = {};
        }
        
        console.log('✅ Chart.js defaults configured with external HTML tooltips');
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

// Get or create external tooltip element
function getOrCreateTooltip() {
    let tooltipEl = document.getElementById('chartjs-tooltip');
    
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip';
        tooltipEl.style.position = 'fixed';
        tooltipEl.style.zIndex = '2147483647';
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.opacity = '0';
        tooltipEl.style.transition = 'opacity 0.2s ease';
        document.body.appendChild(tooltipEl);
    }
    
    return tooltipEl;
}

// External tooltip handler for HTML tooltips
function externalTooltipHandler(context) {
    const {chart, tooltip} = context;
    const tooltipEl = getOrCreateTooltip();
    
    // Hide if no tooltip
    if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = '0';
        return;
    }
    
    // Set text
    if (tooltip.body) {
        const titleLines = tooltip.title || [];
        const bodyLines = tooltip.body.map(b => b.lines);
        
        let innerHtml = '<div style="background: rgba(0, 0, 0, 0.9); color: white; border-radius: 6px; padding: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); min-width: 120px;">';
        
        titleLines.forEach(title => {
            innerHtml += '<div style="font-weight: bold; margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px; font-size: 13px;">' + title + '</div>';
        });
        
        bodyLines.forEach(body => {
            const colors = tooltip.labelColors[0];
            innerHtml += '<div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; font-size: 14px;">';
            if (colors) {
                innerHtml += '<span style="width: 12px; height: 12px; background: ' + colors.backgroundColor + '; border-radius: 2px; display: inline-block;"></span>';
            }
            innerHtml += '<span>' + body + '</span></div>';
        });
        
        innerHtml += '</div>';
        tooltipEl.innerHTML = innerHtml;
    }
    
    // Position using fixed positioning relative to viewport
    const position = chart.canvas.getBoundingClientRect();
    const tooltipWidth = tooltipEl.offsetWidth || 150;
    const tooltipHeight = tooltipEl.offsetHeight || 60;
    
    // Calculate position, keeping tooltip within viewport
    let left = position.left + tooltip.caretX;
    let top = position.top + tooltip.caretY - tooltipHeight - 10; // 10px offset above point
    
    // Adjust if tooltip would go off-screen
    if (left + tooltipWidth > window.innerWidth) {
        left = window.innerWidth - tooltipWidth - 10;
    }
    if (left < 10) {
        left = 10;
    }
    if (top < 10) {
        top = position.top + tooltip.caretY + 10; // Show below if no room above
    }
    
    tooltipEl.style.opacity = '1';
    tooltipEl.style.left = left + 'px';
    tooltipEl.style.top = top + 'px';
}

// Helper function to create tooltip configuration with external HTML tooltip
function createTooltipConfig(type = 'default', borderColor = '#6B64DB') {
    return {
        enabled: true,
        position: 'nearest',
        external: externalTooltipHandler,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: borderColor,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
            label: function(context) {
                const value = context.parsed.y || context.parsed.x || 0;
                const datasetLabel = context.dataset.label || '';
                
                // Format based on chart type (check dataset label or value)
                if (datasetLabel.includes('Monto') || datasetLabel.includes('GMV') || datasetLabel.includes('Gasto')) {
                    return datasetLabel + ': ' + new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(value);
                } else if (datasetLabel.includes('Porcentaje') || datasetLabel.includes('%')) {
                    return datasetLabel + ': ' + value.toFixed(1) + '%';
                } else if (datasetLabel.includes('Visitas') || datasetLabel.includes('Promedio')) {
                    return datasetLabel + ': ' + value.toFixed(2);
                } else {
                    return datasetLabel + ': ' + Math.round(value).toLocaleString();
                }
            }
        }
    };
}

// Make tooltip handler available globally
window.externalTooltipHandler = externalTooltipHandler;
window.createTooltipConfig = createTooltipConfig;

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
                tooltip: createTooltipConfig('default', '#6B64DB'),
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
        
        // Add chart note
        const uniqueUsersContainer = uniqueUsersCtx.closest('.metrics-chart');
        if (uniqueUsersContainer) {
            createChartNote(uniqueUsersContainer, 'Muestra el número total de usuarios únicos que realizaron transacciones en cada período mensual.');
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
                tooltip: createTooltipConfig('default', '#6B64DB'),
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
        
        // Add chart note
        const returningUsersContainer = returningUsersCtx.closest('.metrics-chart');
        if (returningUsersContainer) {
            createChartNote(returningUsersContainer, 'Usuarios que han realizado más de una transacción dentro de la ventana de tiempo configurada.');
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
                    tooltip: createTooltipConfig('default', '#6B64DB'),
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
        
        // Add chart note
        const avgVisitsContainer = avgVisitsCtx.closest('.metrics-chart');
        if (avgVisitsContainer) {
            createChartNote(avgVisitsContainer, 'Promedio de visitas por usuario en cada período mensual basado en el historial de transacciones.');
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
                    tooltip: createTooltipConfig('default', '#6B64DB'),
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
        
        // Add chart note
        const returningUsersPercentageContainer = returningUsersPercentageCtx.closest('.metrics-chart');
        if (returningUsersPercentageContainer) {
            createChartNote(returningUsersPercentageContainer, 'Porcentaje de usuarios recurrentes respecto al total de usuarios únicos en cada período.');
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
                    tooltip: createTooltipConfig('default', '#6B64DB'),
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
        
        // Add chart note
        const totalAmountContainer = totalAmountCtx.closest('.metrics-chart');
        if (totalAmountContainer) {
            createChartNote(totalAmountContainer, 'Monto total de transacciones procesadas en cada período mensual (GMV - Gross Merchandise Value).');
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
                    tooltip: createTooltipConfig('default', '#6B64DB'),
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
        
        // Add chart note
        const firstTimeUsersContainer = firstTimeUsersCtx.closest('.metrics-chart');
        if (firstTimeUsersContainer) {
            createChartNote(firstTimeUsersContainer, 'Usuarios que realizan su primera transacción basado en el umbral de tiempo configurado para usuarios primerizos.');
        }
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
                    tooltip: createTooltipConfig('default', '#6B64DB'),
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
        
        // Add chart note
        const avgSpendContainer = avgSpendPerUserCtx.closest('.metrics-chart');
        if (avgSpendContainer) {
            createChartNote(avgSpendContainer, 'Gasto promedio por usuario calculado dividiendo el GMV total entre el número de usuarios únicos por período.');
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
    
    // Add chart note
    const dailySalesContainer = ctx.closest('.daily-sales-chart') || ctx.closest('.full-width');
    if (dailySalesContainer) {
        createChartNote(dailySalesContainer, `
            <strong>Metodología de Detección de Anomalías:</strong> Sistema automático que analiza transacciones diarias y compara contra el promedio histórico del período. 
            <br><br>
            <strong>Criterios de detección:</strong><br>
            • <span style="color: #FF9F40;">🟡 Anomalía Moderada:</span> Días con 25-50% del promedio diario (posibles problemas operativos)<br>
            • <span style="color: #FF6B6B;">🔴 Anomalía Severa:</span> Días con menos del 25% del promedio (requieren investigación inmediata)<br>
            • <span style="color: #6B64DB;">🔵 Normal:</span> Días dentro del rango esperado (>50% del promedio)<br>
            <br>
            <strong>Promedio actual:</strong> ${Math.round(avgTransactions)} transacciones/día | 
            <strong>Umbral:</strong> ${Math.round(threshold)} transacciones (50%)
        `);
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
