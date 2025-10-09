// Monitoring charts: daily sales and anomalies
// Extracted from script.js to reduce file size and improve modularity

function initDailySalesChart(data) {
    const ctx = document.getElementById('dailySalesChart');
    if (!ctx) return;

    if (Charts.dailySalesChart) {
        Charts.dailySalesChart = safeDestroyChart(Charts.dailySalesChart);
    }

    const canvas = ctx;
    if (canvas) {
        const context = canvas.getContext('2d');
        if (context) context.clearRect(0, 0, canvas.width, canvas.height);
    }

    const dailyData = {};
    data.forEach(item => {
        const date = parseDate(item.date);
        if (!date) return;
        const dateKey = date.toISOString().split('T')[0];
        if (!dailyData[dateKey]) dailyData[dateKey] = { transactions: 0, amount: 0 };
        dailyData[dateKey].transactions++;
        dailyData[dateKey].amount += parseFloat(item.amount) || 0;
    });

    const sortedDates = Object.keys(dailyData).sort();
    const transactions = sortedDates.map(date => dailyData[date].transactions);
    const avgTransactions = transactions.reduce((sum, val) => sum + val, 0) / (transactions.length || 1);
    const threshold = avgTransactions * 0.5;

    Charts.dailySalesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates.map(date => new Date(date).toLocaleDateString()),
            datasets: [{
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
                    formatter: (value) => value,
                    color: (context) => context.dataset.pointBackgroundColor[context.dataIndex],
                    font: { weight: 'bold', size: 10 }
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Monitoreo de Transacciones Diarias',
                    font: { size: 16, weight: 'bold' },
                    padding: { bottom: 20 },
                    color: '#2d3436'
                },
                legend: { display: true, position: 'top' },
                datalabels: {
                    display: true,
                    align: 'top',
                    anchor: 'end',
                    offset: 5,
                    formatter: (value) => value,
                    color: (context) => context.dataset.pointBackgroundColor[context.dataIndex],
                    font: { weight: 'bold', size: 10 }
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
        window.generateChartAnalysis('dailySales', sortedDates.map(date => new Date(date).toLocaleDateString()), transactions, {
            type: 'number',
            note: `<strong>Metodología de Detección de Anomalías:</strong> Sistema que analiza transacciones diarias y compara contra el promedio histórico del período.`
        });
    }

    detectAndDisplayAnomalies(sortedDates, dailyData, avgTransactions, threshold);
}

function detectAndDisplayAnomalies(sortedDates, dailyData, avgTransactions, threshold) {
    const anomalies = [];
    sortedDates.forEach(dateKey => {
        const dayData = dailyData[dateKey];
        if (dayData.transactions < threshold) {
            const percentOfAverage = (dayData.transactions / (avgTransactions || 1)) * 100;
            anomalies.push({
                date: dateKey,
                transactions: dayData.transactions,
                amount: dayData.amount,
                percentOfAverage,
                severity: percentOfAverage < 25 ? 'severe' : 'moderate'
            });
        }
    });

    anomalies.sort((a, b) => a.percentOfAverage - b.percentOfAverage);

    const anomalyTableBody = document.getElementById('anomalyTableBody');
    const anomalyList = document.getElementById('anomalyList');

    if (anomalies.length === 0) {
        if (anomalyTableBody) anomalyTableBody.innerHTML = '<tr><td colspan="4" class="no-anomalies">✅ No se detectaron anomalías significativas en el período seleccionado.</td></tr>';
        if (anomalyList) anomalyList.innerHTML = '<div class="no-anomalies">✅ Todas las transacciones diarias están dentro de los rangos esperados.</div>';
    } else {
        if (anomalyTableBody) {
            anomalyTableBody.innerHTML = anomalies.map(anomaly => {
                const date = new Date(anomaly.date);
                const formattedDate = date.toLocaleDateString('es-MX', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                const rowClass = anomaly.severity === 'severe' ? 'severe-anomaly' : '';
                return `
                    <tr class="${rowClass}">
                        <td>${formattedDate}</td>
                        <td class="anomaly-transactions">${anomaly.transactions}</td>
                        <td class="anomaly-percentage">${anomaly.percentOfAverage.toFixed(1)}%</td>
                        <td>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(anomaly.amount)}</td>
                    </tr>
                `;
            }).join('');
        }

        if (anomalyList) {
            const severeAnomalies = anomalies.filter(a => a.severity === 'severe');
            anomalyList.innerHTML = severeAnomalies.length > 0
                ? `<div class="high-frequency-alert"><p><strong>⚠️ Alerta:</strong> Se detectaron ${severeAnomalies.length} día(s) con caídas severas.</p></div>`
                : '';
        }

        const anomalySummaryText = document.getElementById('anomalySummaryText');
        if (anomalySummaryText) {
            const severeCount = anomalies.filter(a => a.severity === 'severe').length;
            const moderateCount = anomalies.length - severeCount;
            anomalySummaryText.innerHTML = `
                <p class="anomaly-description">
                    Se detectaron <strong>${anomalies.length} anomalías</strong> (${severeCount} severas, ${moderateCount} moderadas).
                    Promedio diario: <strong>${Math.round(avgTransactions)} transacciones</strong>.
                </p>
            `;
        }
    }

    const copyButton = document.getElementById('copyAnomalyReport');
    if (copyButton) copyButton.onclick = () => copyAnomalyReportToClipboard(anomalies, avgTransactions);
}

function copyAnomalyReportToClipboard(anomalies, avgTransactions) {
    let reportText = '📊 REPORTE DE ANOMALÍAS - SimpleGo Analytics\n' + '═'.repeat(60) + '\n\n';
    reportText += `Promedio diario de transacciones: ${Math.round(avgTransactions)}\n`;
    reportText += `Umbral de detección: ${Math.round(avgTransactions * 0.5)} transacciones (50%)\n`;
    reportText += `Total de anomalías detectadas: ${anomalies.length}\n\n`;
    if (anomalies.length > 0) {
        reportText += 'DETALLE DE ANOMALÍAS:\n' + '─'.repeat(60) + '\n\n';
        anomalies.forEach((anomaly, index) => {
            const date = new Date(anomaly.date);
            const formattedDate = date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const severity = anomaly.severity === 'severe' ? '🔴 SEVERA' : '🟡 MODERADA';
            reportText += `${index + 1}. ${formattedDate} ${severity}\n`;
            reportText += `   Transacciones: ${anomaly.transactions}\n`;
            reportText += `   Porcentaje del promedio: ${anomaly.percentOfAverage.toFixed(1)}%\n`;
            reportText += `   Monto total: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(anomaly.amount)}\n\n`;
        });
    } else {
        reportText += '✅ No se detectaron anomalías en el período analizado.\n';
    }
    reportText += '\n' + '═'.repeat(60) + '\n';
    reportText += `Generado: ${new Date().toLocaleString('es-MX')}\n`;
    navigator.clipboard.writeText(reportText).then(() => {
        const message = document.createElement('div');
        message.className = 'copy-message';
        message.textContent = '✅ Reporte copiado al portapapeles';
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 2000);
    }).catch(err => {
        console.error('Error copying to clipboard:', err);
        alert('No se pudo copiar el reporte. Por favor, intenta de nuevo.');
    });
}

// Export
window.initDailySalesChart = initDailySalesChart;


