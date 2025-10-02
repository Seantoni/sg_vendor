// Chart Modal Functions
// =====================

// Function to initialize chart modal functionality
function initializeChartModal() {
    const modal = document.getElementById('chartModal');
    const modalCanvas = document.getElementById('modalChart');
    const closeBtn = modal.querySelector('.close-modal');
    
    if (!modal || !modalCanvas || !closeBtn) return;
    
    // Close modal when clicking the close button
    closeBtn.addEventListener('click', closeChartModal);
    
    // Close modal when clicking outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeChartModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeChartModal();
        }
    });
    
    // Add click listeners to all charts
    addChartClickListeners();
}

// Function to add click listeners to all chart canvases
function addChartClickListeners() {
    const chartCanvases = [
        'uniqueUsersChart',
        'avgVisitsChart', 
        'returningUsersChart',
        'returningUsersPercentageChart',
        'totalAmountChart',
        'firstTimeUsersChart',
        'avgSpendPerUserChart',
        'dailySalesChart',
        'locationUsersChart',
        'locationGMVChart',
        'monthlyProjectionChart'
    ];
    
    chartCanvases.forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            canvas.style.cursor = 'pointer';
            canvas.addEventListener('click', function() {
                // Only open modal if chart instance exists
                const chartInstance = getChartInstance(canvasId);
                if (chartInstance) {
                    openChartModal(canvasId);
                } else {
                    console.log('Chart not yet initialized, skipping modal:', canvasId);
                }
            });
        }
    });
}

// Function to open chart in modal
function openChartModal(sourceChartId) {
    const modal = document.getElementById('chartModal');
    const modalCanvas = document.getElementById('modalChart');
    
    if (!modal || !modalCanvas) {
        console.error('Modal or canvas element not found');
        return;
    }
    
    // Get the source chart instance
    const sourceChart = getChartInstance(sourceChartId);
    if (!sourceChart) {
        console.warn('Source chart not found:', sourceChartId);
        return;
    }
    
    // Validate chart has data
    if (!sourceChart.data || !sourceChart.data.labels || sourceChart.data.labels.length === 0) {
        console.warn('Source chart has no data:', sourceChartId);
        alert('Este gráfico no tiene datos para mostrar.');
        return;
    }
    
    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Destroy existing modal chart
    if (Charts.modalChart) {
        Charts.modalChart = safeDestroyChart(Charts.modalChart);
    }
    
    // Clear modal canvas
    const context = modalCanvas.getContext('2d');
    if (context) {
        context.clearRect(0, 0, modalCanvas.width, modalCanvas.height);
    }
    
    // Clone the source chart data (simple shallow copy is enough for data)
    const modalConfig = {
        type: sourceChart.config.type,
        data: {
            labels: [...sourceChart.data.labels],
            datasets: sourceChart.data.datasets.map(dataset => ({
                label: dataset.label,
                data: [...dataset.data],
                backgroundColor: dataset.backgroundColor,
                borderColor: dataset.borderColor,
                borderWidth: dataset.borderWidth,
                borderRadius: dataset.borderRadius,
                fill: dataset.fill,
                borderDash: dataset.borderDash
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: getChartTitle(sourceChartId),
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: 20,
                    color: '#2d3436'
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    enabled: true
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
        }
    };
    
    // Restore datalabels formatter functions
    // JSON.stringify loses function references, so we need to restore them based on chart type
    if (sourceChartId === 'totalAmountChart' || 
        sourceChartId === 'avgSpendPerUserChart' || 
        sourceChartId === 'locationGMVChart' ||
        sourceChartId === 'firstTimeUsersChart') {
        // Currency charts - format as dollars without decimals
        modalConfig.options.plugins.datalabels = {
            anchor: 'end',
            align: 'top',
            offset: 5,
            formatter: function (value) {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(value || 0);
            },
            font: { weight: 'bold', size: 14 },
            padding: 8
        };
    } else if (sourceChartId === 'returningUsersPercentageChart') {
        // Percentage chart
        modalConfig.options.plugins.datalabels = {
            anchor: 'end',
            align: 'top',
            offset: 5,
            formatter: function (value) {
                return value ? value.toFixed(1) + '%' : '0%';
            },
            font: { weight: 'bold', size: 14 },
            padding: 8
        };
    } else if (sourceChartId === 'avgVisitsChart') {
        // Average visits - show decimals
        modalConfig.options.plugins.datalabels = {
            anchor: 'end',
            align: 'top',
            offset: 5,
            formatter: function (value) {
                return value ? value.toFixed(2) : '0';
            },
            font: { weight: 'bold', size: 14 },
            padding: 8
        };
    } else {
        // Default number formatting for other charts
        modalConfig.options.plugins.datalabels = {
            anchor: 'end',
            align: 'top',
            offset: 5,
            formatter: function (value) {
                return value ? Math.round(value).toLocaleString() : '0';
            },
            font: { weight: 'bold', size: 14 },
            padding: 8
        };
    }
    
    // Create modal chart with proper plugin registration
    modalConfig.plugins = typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : [];
    
    try {
        Charts.modalChart = new Chart(modalCanvas, modalConfig);
    } catch (error) {
        console.error('Error creating modal chart:', error);
        console.error('Modal config:', modalConfig);
        alert('Error al abrir el gráfico en el modal. Por favor, intenta de nuevo.');
        closeChartModal();
    }
}

// Function to close chart modal
function closeChartModal() {
    const modal = document.getElementById('chartModal');
    
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Destroy modal chart
        if (Charts.modalChart) {
            Charts.modalChart = safeDestroyChart(Charts.modalChart);
        }
    }
}

// Function to get chart instance by canvas ID
function getChartInstance(canvasId) {
    const chartMap = {
        'uniqueUsersChart': Charts.uniqueUsersChart,
        'avgVisitsChart': Charts.avgVisitsChart,
        'returningUsersChart': Charts.returningUsersChart,
        'returningUsersPercentageChart': Charts.returningUsersPercentageChart,
        'totalAmountChart': Charts.totalAmountChart,
        'firstTimeUsersChart': Charts.firstTimeUsersChart,
        'avgSpendPerUserChart': Charts.avgSpendPerUserChart,
        'dailySalesChart': Charts.dailySalesChart,
        'locationUsersChart': Charts.locationUsersChart,
        'locationGMVChart': Charts.locationGMVChart,
        'monthlyProjectionChart': Charts.monthlyProjectionChart
    };
    
    const chart = chartMap[canvasId];
    
    // Add safety check to prevent errors with uninitialized charts
    if (!chart) {
        console.warn(`Chart instance not found for: ${canvasId}`);
        return null;
    }
    
    return chart;
}

// Function to get chart title by canvas ID
function getChartTitle(canvasId) {
    const titles = {
        'uniqueUsersChart': 'Usuarios Únicos por Mes',
        'avgVisitsChart': 'Visitas Promedio por Usuario',
        'returningUsersChart': 'Usuarios Recurrentes',
        'returningUsersPercentageChart': 'Porcentaje de Usuarios Recurrentes',
        'totalAmountChart': 'Monto Total de Transacciones',
        'firstTimeUsersChart': 'Nuevos o Reactivados',
        'avgSpendPerUserChart': 'Gasto Promedio por Usuario',
        'dailySalesChart': 'Monitoreo de Transacciones Diarias',
        'locationUsersChart': 'Usuarios Únicos por Ubicación',
        'locationGMVChart': 'GMV por Ubicación',
        'monthlyProjectionChart': 'Proyección Mensual de Usuarios'
    };
    
    return titles[canvasId] || 'Chart View';
}

// Initialize modal when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for other scripts to load first
    setTimeout(() => {
        initializeChartModal();
    }, 200);
});

// Make functions available globally
window.openChartModal = openChartModal;
window.closeChartModal = closeChartModal;
window.initializeChartModal = initializeChartModal;
