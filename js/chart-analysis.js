/**
 * Chart Analysis and Debug Module
 * Provides analysis generation and debug modal functionality for all charts
 */

// Store chart data globally for debug access
window.chartDebugData = {};

/**
 * Generate analysis for any chart based on context
 * @param {string} chartId - The chart identifier
 * @param {Array} labels - Month labels
 * @param {Array} data - Chart data values
 * @param {Object} context - Additional context (e.g., previousData, type)
 */
function generateChartAnalysis(chartId, labels, data, context = {}) {
    const analysisPanel = document.getElementById(`${chartId}Analysis`);
    if (!analysisPanel || !data || data.length === 0) return;

    // Store data for debug modal
    window.chartDebugData[chartId] = { labels, data, context };

    const { type = 'number', prefix = '', suffix = '', previousData, note } = context;

    // Calculate statistics
    const total = data.reduce((sum, val) => sum + val, 0);
    const avg = total / data.length;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const maxIndex = data.indexOf(max);
    const minIndex = data.indexOf(min);

    // Calculate trend
    const firstHalf = data.slice(0, Math.ceil(data.length / 2));
    const secondHalf = data.slice(Math.ceil(data.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    const trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    const isGrowing = trendPercentage > 0;

    // Format value based on type
    const formatValue = (val) => {
        if (type === 'currency') {
            return `${prefix}${Math.round(val).toLocaleString()}${suffix}`;
        } else if (type === 'percentage') {
            return `${val.toFixed(1)}%`;
        } else if (type === 'decimal') {
            return val.toFixed(1);
        } else {
            return Math.round(val).toLocaleString();
        }
    };

    // Determine insights based on chart type
    let insights = [];
    
    if (isGrowing) {
        insights.push({
            icon: 'fa-arrow-trend-up',
            color: '#00b894',
            text: `Tendencia positiva del ${Math.abs(trendPercentage).toFixed(1)}%`
        });
    } else {
        insights.push({
            icon: 'fa-arrow-trend-down',
            color: '#d63031',
            text: `Tendencia negativa del ${Math.abs(trendPercentage).toFixed(1)}%`
        });
    }

    insights.push({
        icon: 'fa-chart-line',
        color: '#6B64DB',
        text: `Promedio: ${formatValue(avg)}`
    });

    insights.push({
        icon: 'fa-trophy',
        color: '#fdcb6e',
        text: `Mejor mes: ${labels[maxIndex]} (${formatValue(max)})`
    });

    if (min > 0) {
        insights.push({
            icon: 'fa-exclamation-triangle',
            color: '#636e72',
            text: `Mes más bajo: ${labels[minIndex]} (${formatValue(min)})`
        });
    }

    // Build HTML
    let html = `
        <div class="analysis-compact">
            <div class="analysis-compact-header">
                <i class="fas fa-lightbulb"></i>
                <span>Análisis Rápido</span>
            </div>
            ${note ? `
            <div style="margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid #e8eaed; color:#5f6368; font-size:12px; line-height:1.5;">
                ${note}
            </div>` : ''}
            <ul class="analysis-bullets">
                ${insights.map(insight => `
                    <li>
                        <i class="fas ${insight.icon}" style="color: ${insight.color};"></i>
                        <span>${insight.text}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;

    // Add monthly breakdown
    html += `
        <div class="analysis-compact">
            <div class="monthly-breakdown">
                <div class="monthly-breakdown-header">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Desglose Mensual</span>
                </div>
                <div class="monthly-grid">
                    ${labels.map((label, index) => {
                        const value = data[index];
                        const isMax = index === maxIndex;
                        const isMin = index === minIndex && min > 0;
                        
                        // Determine icon class based on value
                        let iconClass = 'icon-medium';
                        if (isMax) iconClass = 'icon-high';
                        else if (isMin) iconClass = 'icon-low';
                        
                        return `
                            <div class="monthly-item">
                                <i class="fas fa-circle ${iconClass}"></i>
                                <span><strong>${label}:</strong> ${formatValue(value)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    analysisPanel.innerHTML = html;
}

// ================= First-Time Users Debug & Analysis (migrated from script.js) =================

function openMonthSelector() {
    const modal = document.getElementById('monthSelectorModal');
    const grid = document.getElementById('monthSelectorGrid');
    if (!modal || !grid) return;

    const availableMonths = Object.keys(window.firstTimeUsersDebugData || {}).sort();
    if (availableMonths.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: #636e72;">No hay datos disponibles. Por favor, selecciona un negocio y período primero.</p>';
    } else {
        grid.innerHTML = availableMonths.map(monthKey => {
            const monthDate = new Date(monthKey + '-01');
            const monthName = monthDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
            const count = (window.firstTimeUsersDebugData[monthKey] || []).filter(u => u.qualifies).length;
            const total = (window.firstTimeUsersDebugData[monthKey] || []).length;
            return `
                <button class="month-selector-btn" onclick="selectMonthForDebug('${monthKey}')">
                    <div class="month-name">${monthName}</div>
                    <div class="month-stats">${count} de ${total} usuarios</div>
                </button>
            `;
        }).join('');
    }
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
    setTimeout(() => showDebugModal(monthKey), 300);
}

function showDebugModal(monthKey) {
    const modal = document.getElementById('debugModal');
    const debugData = (window.firstTimeUsersDebugData && window.firstTimeUsersDebugData[monthKey]) || [];
    if (!modal) return;

    const title = document.getElementById('debugModalTitle');
    const subtitle = document.getElementById('debugModalSubtitle');
    if (title) title.textContent = `Nuevos o Reactivados - ${monthKey}`;
    if (subtitle) subtitle.textContent = 'Análisis detallado de usuarios que califican en este mes';

    const qualified = debugData.filter(d => d.qualifies).length;
    const total = debugData.length;

    const debugTotalUsers = document.getElementById('debugTotalUsers');
    const debugThreshold = document.getElementById('debugThreshold');
    const debugBusiness = document.getElementById('debugBusiness');
    if (debugTotalUsers) debugTotalUsers.textContent = `${qualified} de ${total}`;
    if (debugThreshold) debugThreshold.textContent = `${AppState.firstTimeUsersThreshold || 0} días`;
    if (debugBusiness) debugBusiness.textContent = AppState.selectedBusiness || 'Todos';

    const tableBody = document.getElementById('debugTableBody');
    if (tableBody) {
        if (debugData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #636e72;">No hay datos para este mes</td></tr>';
        } else {
            tableBody.innerHTML = debugData.map(user => {
                const rowClass = user.qualifies ? 'debug-row-success' : 'debug-row-excluded';
                const fullUserCode = (window.emailToUserCode && window.emailToUserCode.get(user.email)) || 'Usuario #?';
                const userNumber = fullUserCode.replace('Usuario #', '');
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

function generateFirstTimeUsersAnalysis(labels, firstTimeData) {
    const analysisPanel = document.getElementById('firstTimeUsersAnalysis');
    if (!analysisPanel || !firstTimeData || firstTimeData.length === 0) return;

    const uniqueUsersData = Charts.uniqueUsersChart ? Charts.uniqueUsersChart.data.datasets[0].data : [];
    const total = firstTimeData.reduce((sum, val) => sum + val, 0);
    const avg = total / firstTimeData.length;
    const max = Math.max(...firstTimeData);
    const maxMonth = labels[firstTimeData.indexOf(max)];

    let trendIcon = 'fa-minus';
    let trendClass = 'neutral';
    let trendText = 'estable';
    if (firstTimeData.length >= 4) {
        const recent = firstTimeData.slice(-2).reduce((a, b) => a + b, 0) / 2;
        const older = firstTimeData.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
        if (recent > older * 1.15) { trendIcon = 'fa-arrow-trend-up'; trendClass = 'positive'; trendText = 'creciente'; }
        else if (recent < older * 0.85) { trendIcon = 'fa-arrow-trend-down'; trendClass = 'negative'; trendText = 'decreciente'; }
    }

    const percentages = firstTimeData.map((newUsers, idx) => {
        const totalUsers = uniqueUsersData[idx] || 0;
        return totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0;
    });
    const avgPercentage = percentages.reduce((a, b) => a + b, 0) / percentages.length;
    const maxPercentage = Math.max(...percentages);
    const maxPercentageMonth = labels[percentages.indexOf(maxPercentage)];
    const maxPercentageUsers = firstTimeData[percentages.indexOf(maxPercentage)];
    const maxPercentageTotalUsers = uniqueUsersData[percentages.indexOf(maxPercentage)];

    let bullets = [];
    if (total === 0) bullets.push(`<i class="fas fa-times-circle"></i> Sin usuarios nuevos/reactivados detectados con umbral de ${AppState.firstTimeUsersThreshold || 0} días`);
    else bullets.push(`<i class="fas fa-users"></i> Promedio: <strong>${Math.round(avg)} usuarios/mes</strong> (${avgPercentage.toFixed(0)}% del total)`);
    bullets.push(`<i class="fas ${trendIcon}"></i> Tendencia: <strong class="trend-${trendClass}">${trendText}</strong>`);
    if (max > 0 && maxPercentageTotalUsers > 0) bullets.push(`<i class="fas fa-trophy"></i> Mejor mes: <strong>${maxMonth}</strong> con ${maxPercentageUsers} usuarios (<strong>${maxPercentage.toFixed(0)}%</strong> de ${maxPercentageTotalUsers} usuarios únicos)`);

    let monthlyBreakdown = '';
    if (firstTimeData.length > 0 && firstTimeData.length <= 12) {
        const monthlyItems = labels.map((month, idx) => {
            const newUsers = firstTimeData[idx];
            const totalUsers = uniqueUsersData[idx] || 0;
            const percentage = totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0;
            const monthName = new Date(month + '-01').toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
            let icon = 'fa-circle';
            if (percentage >= 20) icon = 'fa-arrow-trend-up';
            else if (percentage >= 10) icon = 'fa-arrow-up';
            else if (percentage >= 5) icon = 'fa-arrow-right';
            else if (percentage > 0) icon = 'fa-arrow-down';
            return `
                <div class="monthly-item">
                    <div class="month-title"><i class="fas ${icon}"></i> ${monthName}</div>
                    <div class="month-value">${newUsers} (${percentage.toFixed(0)}%)</div>
                </div>
            `;
        }).join('');
        monthlyBreakdown = `
            <div class="analysis-compact">
                <div class="monthly-breakdown">
                    <div class="monthly-breakdown-header">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Desglose Mensual</span>
                    </div>
                    <div class="monthly-grid">${monthlyItems}</div>
                </div>
            </div>
        `;
    }

    analysisPanel.innerHTML = `
        <div class="analysis-compact">
            <div class="analysis-compact-header"><i class="fas fa-lightbulb"></i><span>Análisis Rápido</span></div>
            <ul class="analysis-bullets">${bullets.map(b => `<li>${b}</li>`).join('')}</ul>
        </div>
        ${monthlyBreakdown}
    `;
}

// Expose globally for existing handlers
window.openMonthSelector = openMonthSelector;
window.closeMonthSelector = closeMonthSelector;
window.selectMonthForDebug = selectMonthForDebug;
window.showDebugModal = showDebugModal;
window.closeDebugModal = closeDebugModal;
window.generateFirstTimeUsersAnalysis = generateFirstTimeUsersAnalysis;

// Setup button listener when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const debugButton = document.getElementById('openDebugSelector');
    if (debugButton) debugButton.addEventListener('click', openMonthSelector);
});

/**
 * Open debug modal for a specific chart
 * @param {string} chartId - The chart identifier
 */
function openChartDebugModal(chartId) {
    const debugData = window.chartDebugData[chartId];
    
    if (!debugData) {
        alert('No hay datos de depuración disponibles para este gráfico.');
        return;
    }

    // Open month selector
    const modal = document.getElementById('chartDebugModal');
    const grid = document.getElementById('chartDebugMonthGrid');
    const titleEl = document.getElementById('chartDebugModalTitle');
    
    if (!modal || !grid || !titleEl) return;

    // Set title
    const chartTitles = {
        'uniqueUsers': 'Usuarios Únicos',
        'avgVisits': 'Visitas Promedio',
        'returningUsers': 'Usuarios Recurrentes',
        'returningPercentage': 'Porcentaje de Retención',
        'totalAmount': 'Monto Total',
        'avgSpend': 'Gasto Promedio'
    };
    
    titleEl.textContent = `Análisis Detallado - ${chartTitles[chartId] || 'Gráfico'}`;

    // Create month buttons
    grid.innerHTML = debugData.labels.map((monthKey, index) => {
        const monthDate = new Date(monthKey + '-01');
        const monthName = monthDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
        const value = debugData.data[index];
        
        let formattedValue = value;
        if (debugData.context.type === 'currency') {
            formattedValue = `$${Math.round(value).toLocaleString()}`;
        } else if (debugData.context.type === 'percentage') {
            formattedValue = `${value.toFixed(1)}%`;
        } else if (debugData.context.type === 'decimal') {
            formattedValue = value.toFixed(1);
        } else {
            formattedValue = Math.round(value).toLocaleString();
        }
        
        return `
            <button class="month-selector-btn" onclick="showChartMonthDetails('${chartId}', ${index})">
                <div class="month-name">${monthName}</div>
                <div class="month-stats">${formattedValue}</div>
            </button>
        `;
    }).join('');

    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Show detailed breakdown for a specific month
 */
function showChartMonthDetails(chartId, monthIndex) {
    const debugData = window.chartDebugData[chartId];
    const monthKey = debugData.labels[monthIndex];
    const value = debugData.data[monthIndex];

    // Close month selector
    closeChartDebugModal();

    // Show detail modal
    setTimeout(() => {
        // Format value based on type
        let formattedValue = value;
        if (debugData.context.type === 'currency') {
            formattedValue = `$${Math.round(value).toLocaleString()}`;
        } else if (debugData.context.type === 'percentage') {
            formattedValue = `${value.toFixed(1)}%`;
        } else if (debugData.context.type === 'decimal') {
            formattedValue = value.toFixed(1);
        } else {
            formattedValue = Math.round(value).toLocaleString();
        }

        // Get raw data for this month if available
        console.log('🔍 Attempting to get raw data for:', { chartId, monthKey });
        const rawData = getRawMonthData(chartId, monthKey);
        console.log('📊 Raw data result:', rawData);
        
        // Build detailed breakdown
        let detailsContent = '';
        
        console.log('🔍 Checking rawData conditions:', {
            rawData: !!rawData,
            hasUsers: rawData ? !!rawData.users : false,
            usersLength: rawData ? rawData.users?.length : 0,
            rawDataStructure: rawData ? Object.keys(rawData) : 'no data'
        });
        
        // TEMPORARY: Show user data if we have any rawData, regardless of structure
        if (rawData && (rawData.users || rawData.totalTransactions > 0)) {
            console.log('✅ Showing user table with data:', rawData);
            // Show user list if available
            const users = rawData.users || [];
            const avgTransactionsPerUser = users.length > 0 ? (rawData.totalTransactions / users.length).toFixed(1) : '0';
            const avgAmountPerUser = users.length > 0 ? (rawData.totalAmount / users.length).toFixed(0) : '0';
            
            detailsContent = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px; padding: 0 16px;">
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: 600; color: #6B64DB;">${users.length}</div>
                        <div style="font-size: 12px; color: #636e72; margin-top: 4px;">Usuarios Únicos</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: 600; color: #6B64DB;">${rawData.totalTransactions}</div>
                        <div style="font-size: 12px; color: #636e72; margin-top: 4px;">Transacciones</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: 600; color: #6B64DB;">${avgTransactionsPerUser}</div>
                        <div style="font-size: 12px; color: #636e72; margin-top: 4px;">Promedio Tx/Usuario</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: 600; color: #6B64DB;">$${Math.round(avgAmountPerUser).toLocaleString()}</div>
                        <div style="font-size: 12px; color: #636e72; margin-top: 4px;">Gasto Promedio</div>
                    </div>
                </div>
                <div class="debug-table-container" style="max-height: 400px; overflow-y: auto; padding: 0 16px;">
                    <table class="debug-table">
                        <thead>
                            <tr>
                                <th>ID Usuario</th>
                                <th>Transacciones</th>
                                <th>Monto Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.slice(0, 50).map(user => `
                                <tr>
                                    <td class="user-id-cell"><strong>#${user.id}</strong></td>
                                    <td style="text-align: center;">${user.transactions || 1}</td>
                                    <td style="text-align: right; font-weight: 600;">$${Math.round(user.amount || 0).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                            ${users.length > 50 ? `
                                <tr>
                                    <td colspan="3" style="text-align: center; padding: 12px; color: #636e72;">
                                        <i class="fas fa-ellipsis-h"></i>
                                        Mostrando 50 de ${users.length} usuarios
                                    </td>
                                </tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            console.log('❌ Not showing user table. Raw data:', rawData);
            // Show summary stats
            detailsContent = `
                <div style="padding: 30px; text-align: center;">
                    <div style="font-size: 48px; color: #6B64DB; margin-bottom: 16px;">
                        ${formattedValue}
                    </div>
                    <div style="color: #636e72; margin-bottom: 24px;">
                        Valor para ${monthKey}
                    </div>
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: left;">
                        <div style="margin-bottom: 12px;">
                            <i class="fas fa-info-circle" style="color: #6B64DB;"></i>
                            <strong style="margin-left: 8px;">Información del Período</strong>
                        </div>
                        <ul style="margin: 0; padding-left: 24px; color: #636e72;">
                            <li style="margin-bottom: 8px;">Mes: ${monthKey}</li>
                            <li style="margin-bottom: 8px;">Valor: ${formattedValue}</li>
                            ${debugData.context.type === 'currency' ? `
                                <li style="margin-bottom: 8px;">Tipo: Montos monetarios</li>
                            ` : ''}
                            ${debugData.context.type === 'percentage' ? `
                                <li style="margin-bottom: 8px;">Tipo: Porcentaje</li>
                            ` : ''}
                            ${debugData.context.type === 'number' ? `
                                <li style="margin-bottom: 8px;">Tipo: Contador de usuarios</li>
                            ` : ''}
                        </ul>
                    </div>
                    <div style="margin-top: 20px; padding: 16px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                        <i class="fas fa-lightbulb" style="color: #ffc107;"></i>
                        <span style="margin-left: 8px; color: #856404;">
                            Para ver el detalle completo de usuarios, use el filtro de fecha para seleccionar solo este mes.
                        </span>
                    </div>
                </div>
            `;
        }
        
        const detailsHtml = `
            <div class="modal-content debug-modal-content" style="max-width: 700px;">
                <span class="close-modal" onclick="closeMonthDetailsModal()">&times;</span>
                <div class="debug-modal-header">
                    <h2>Detalle de ${monthKey}</h2>
                    <p>Información detallada para este período</p>
                </div>
                <div class="debug-modal-body">
                    <div class="debug-stats">
                        <div class="debug-stat">
                            <span class="stat-label">Valor del Mes:</span>
                            <span class="stat-value">${formattedValue}</span>
                        </div>
                    </div>
                    ${detailsContent}
                </div>
            </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.id = 'monthDetailsModal';
        tempDiv.className = 'modal';
        tempDiv.innerHTML = detailsHtml.trim();
        document.body.appendChild(tempDiv);
        
        setTimeout(() => tempDiv.classList.remove('hidden'), 10);
    }, 300);
}

/**
 * Get raw transaction data for a specific month
 */
function getRawMonthData(chartId, monthKey) {
    console.log('🔍 getRawMonthData called with:', { chartId, monthKey });
    
    // Access global AppState data
    if (!window.AppState || !window.AppState.transactionData) {
        console.warn('❌ No transaction data available in AppState');
        console.log('AppState:', window.AppState);
        return null;
    }

    // Prefer the same filtered dataset used by charts; fallback to all transactions
    const allTransactions = (window.filteredTransactionData && window.filteredTransactionData.length > 0)
        ? window.filteredTransactionData
        : window.AppState.transactionData;
    console.log(`📊 Total transactions available: ${allTransactions.length}`);
    
    // Filter by selected business and location if needed
    let filteredTransactions = allTransactions;
    
    if (window.AppState.selectedBusiness && window.AppState.selectedBusiness !== 'all') {
        const businessFiltered = filteredTransactions.filter(t => 
            (typeof extractBusinessName === 'function'
                ? extractBusinessName(t.merchant)
                : t.merchant) === window.AppState.selectedBusiness
        );
        console.log(`🏢 Filtered by business "${window.AppState.selectedBusiness}": ${businessFiltered.length} transactions`);
        filteredTransactions = businessFiltered;
    }
    
    if (window.AppState.selectedLocation && window.AppState.selectedLocation !== 'all') {
        const locationFiltered = filteredTransactions.filter(t => 
            extractLocation(t.merchant) === window.AppState.selectedLocation
        );
        console.log(`📍 Filtered by location "${window.AppState.selectedLocation}": ${locationFiltered.length} transactions`);
        filteredTransactions = locationFiltered;
    }

    // Filter by month
    const transactions = filteredTransactions.filter(t => {
        const d = (t.date instanceof Date) ? t.date : new Date(t.date);
        if (!d || isNaN(d.getTime())) {
            console.warn('Invalid date in transaction:', t);
            return false;
        }
        const txMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const matches = txMonthKey === monthKey;
        return matches;
    });

    console.log(`📅 Transactions for month ${monthKey}: ${transactions.length}`);

    if (transactions.length === 0) {
        console.warn(`❌ No transactions found for month ${monthKey}`);
        console.log('Available months in data:', 
            [...new Set(filteredTransactions.map(t => {
                const date = t.date;
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }))]
        );
        return null;
    }

    // Group by user
    const userMap = new Map();
    transactions.forEach(t => {
        const email = t.email;
        const userCode = window.emailToUserCode && window.emailToUserCode.get(email);
        const userId = userCode ? userCode.replace('Usuario #', '') : '?';
        
        if (!userMap.has(email)) {
            userMap.set(email, {
                id: userId,
                email: email,
                transactions: 0,
                amount: 0
            });
        }
        
        const user = userMap.get(email);
        user.transactions += 1;
        user.amount += parseFloat(t.amount) || 0;
    });

    const result = {
        users: Array.from(userMap.values()).sort((a, b) => b.amount - a.amount),
        totalTransactions: transactions.length,
        totalAmount: transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
    };
    
    console.log('✅ Final result:', result);
    return result;
}

/**
 * Helper to extract location from merchant name
 */
function extractLocation(merchant) {
    if (!merchant) return 'Unknown';
    const parts = merchant.split(' - ');
    return parts.length > 1 ? parts[1].trim() : merchant;
}

/**
 * Close chart debug modal
 */
function closeChartDebugModal() {
    const modal = document.getElementById('chartDebugModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

/**
 * Close month details modal
 */
function closeMonthDetailsModal() {
    const modal = document.getElementById('monthDetailsModal');
    if (modal) {
        modal.remove();
    }
}

// Make functions globally available
window.generateChartAnalysis = generateChartAnalysis;
window.openChartDebugModal = openChartDebugModal;
window.showChartMonthDetails = showChartMonthDetails;
window.closeChartDebugModal = closeChartDebugModal;
window.closeMonthDetailsModal = closeMonthDetailsModal;

// Initialize debug button listeners
document.addEventListener('DOMContentLoaded', function() {
    // Map button IDs to chart IDs
    const debugButtons = {
        'debugUniqueUsers': 'uniqueUsers',
        'debugAvgVisits': 'avgVisits',
        'debugReturningUsers': 'returningUsers',
        'debugReturningPercentage': 'returningPercentage',
        'debugTotalAmount': 'totalAmount',
        'debugAvgSpend': 'avgSpend'
    };

    Object.keys(debugButtons).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                openChartDebugModal(debugButtons[buttonId]);
            });
        }
    });
});

