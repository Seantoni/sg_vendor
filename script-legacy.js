// Legacy Chart Functions - Remaining Unique Code
// ===============================================
// This file contains chart initialization functions that haven't been moved to other modules yet

// Register Chart.js plugins and configure defaults when available
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Chart !== 'undefined') {
        // Register plugins
        if (typeof ChartDataLabels !== 'undefined') {
            Chart.register(ChartDataLabels);
        }
        
        // Set global defaults to prevent height growth
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        Chart.defaults.resizeDelay = 0;
        
        // Disable animations that might cause sizing issues
        Chart.defaults.animation = {
            duration: 0
        };
    }
});

// Chart initialization functions (TODO: Move these to js/charts.js)
function initMetricsCharts(chartData) {
    // Initialize unique users chart
    const uniqueUsersCtx = document.getElementById('uniqueUsersChart');
    if (uniqueUsersCtx) {
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
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
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
    }

    // Initialize returning users chart
    const returningUsersCtx = document.getElementById('returningUsersChart');
    if (returningUsersCtx) {
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
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
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
    }

    // Initialize other charts...
    // TODO: Complete implementation of all chart types
}

// Daily sales chart initialization
function initDailySalesChart(data) {
    const ctx = document.getElementById('dailySalesChart');
    if (!ctx) return;

    // Destroy existing chart
    Charts.dailySalesChart = safeDestroyChart(Charts.dailySalesChart);

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
