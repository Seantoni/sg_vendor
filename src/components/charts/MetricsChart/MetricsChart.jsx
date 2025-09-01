import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components
ChartJS.register(...registerables, ChartDataLabels);

const ChartContainer = styled.div`
  position: relative;
  overflow: visible;
  display: flex;
  flex-direction: column;
  margin-bottom: 40px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ChartCanvas = styled.div`
  height: 400px;
  max-height: 400px;
  min-height: 400px;
  position: relative;
  cursor: pointer;
`;

const ChartNote = styled.div`
  margin-top: 10px;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-left: 4px solid #6B64DB;
  border-radius: 0 8px 8px 0;
  font-size: 13px;
  line-height: 1.5;
  color: #5a6c7d;
  font-style: italic;
  position: relative;
  z-index: 1;
  max-width: 100%;
  word-wrap: break-word;
`;

const NoteLabel = styled.strong`
  color: #2d3436;
  font-weight: 600;
  font-style: normal;
`;

// Default chart options
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: false // Disabled as per current design
    },
    datalabels: {
      anchor: 'end',
      align: 'top',
      offset: 5,
      formatter: (value) => Math.round(value),
      font: {
        weight: 'bold',
        size: 11
      },
      padding: 6,
      display: function(context) {
        return context.parsed && context.parsed.y > 0;
      }
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
};

function MetricsChart({ 
  data, 
  title, 
  noteText, 
  color = '#6B64DB', 
  backgroundColor = 'rgba(107, 100, 219, 0.7)',
  onChartClick,
  chartType = 'bar',
  customOptions = {}
}) {
  const chartRef = useRef(null);

  // Merge custom options with defaults
  const chartOptions = {
    ...defaultOptions,
    ...customOptions,
    plugins: {
      ...defaultOptions.plugins,
      ...customOptions.plugins,
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        },
        color: '#2d3436'
      }
    }
  };

  const chartData = {
    labels: data?.labels || [],
    datasets: [{
      label: title,
      data: data?.values || [],
      backgroundColor,
      borderColor: color,
      borderWidth: 2,
      borderRadius: 8
    }]
  };

  const handleChartClick = () => {
    if (onChartClick && chartRef.current) {
      onChartClick(chartRef.current);
    }
  };

  return (
    <ChartContainer>
      <ChartCanvas onClick={handleChartClick}>
        <Bar 
          ref={chartRef}
          data={chartData} 
          options={chartOptions}
          plugins={[ChartDataLabels]}
        />
      </ChartCanvas>
      {noteText && (
        <ChartNote>
          <NoteLabel>Nota:</NoteLabel> {noteText}
        </ChartNote>
      )}
    </ChartContainer>
  );
}

export default MetricsChart;
