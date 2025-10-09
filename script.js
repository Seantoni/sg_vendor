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



// Chart initialization functions moved to js/charts.js
// Keep a thin delegator for backward compatibility
function initMetricsCharts(chartData) {
    if (typeof window.createUniqueUsersChart === 'function') {
        window.createUniqueUsersChart(chartData);
        window.createReturningUsersChart(chartData);
        window.createAvgVisitsChart(chartData);
        window.createReturningPercentageChart(chartData);
        window.createTotalAmountChart(chartData);
        window.createFirstTimeUsersChart(chartData);
        window.createAvgSpendPerUserChart(chartData);
    }
}

// Daily sales chart initialization
// Delegated to js/charts-monitoring.js
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
    if (typeof detectAndDisplayAnomalies === 'function') {
        detectAndDisplayAnomalies(sortedDates, dailyData, avgTransactions, threshold);
    }
}

// Function to detect and display anomalies
// Moved to js/charts-monitoring.js
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
// Moved to js/charts-monitoring.js
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

// First-time users debug & analysis moved to js/chart-analysis.js

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
