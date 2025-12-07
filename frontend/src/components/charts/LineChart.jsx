import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({
  data,
  labels,
  title = 'Line Chart',
  color = '#3B82F6',
  backgroundColor = 'rgba(59, 130, 246, 0.08)',
  yAxisLabel = 'Value',
  xAxisLabel = 'Time',
  showLegend = true,
  tension = 0.45,
  fill = true,
  height = 300
}) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: color,
        backgroundColor,
        borderWidth: 2,
        fill,
        tension,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: color,
        pointBorderWidth: 2,
        hitRadius: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 400,
      easing: 'easeOutCubic'
    },
    plugins: {
      title: {
        display: !!title,
        text: title,
        align: 'start',
        color: '#111827',
        font: {
          size: 16,
          weight: '600'
        },
        padding: {
          top: 4,
          bottom: 16
        }
      },
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 16,
          color: '#4B5563',
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#E5E7EB',
        bodyColor: '#F9FAFB',
        borderColor: color,
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        caretSize: 6,
        cornerRadius: 6,
        callbacks: {
          label: ctx => {
            const v = ctx.parsed.y;
            if (v == null || Number.isNaN(v)) return '';
            return `${title}: ${v.toFixed(2)}`;
          }
        }
      }
    },
    layout: {
      padding: {
        left: 4,
        right: 10,
        top: 4,
        bottom: 4
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: !!xAxisLabel,
          text: xAxisLabel,
          font: {
            size: 11,
            weight: 'bold'
          },
          color: '#6B7280'
        },
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          color: '#9CA3AF',
          font: {
            size: 10
          }
        }
      },
      y: {
        display: true,
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          font: {
            size: 11,
            weight: 'bold'
          },
          color: '#6B7280'
        },
        beginAtZero: false,
        grid: {
          color: 'rgba(148, 163, 184, 0.15)',
          drawBorder: false,
          tickLength: 0
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 10
          },
          maxTicksLimit: 6
        }
      }
    },
    interaction: {
      mode: 'index',
      axis: 'x',
      intersect: false
    },
    elements: {
      line: {
        tension
      },
      point: {
        radius: 0
      }
    },
    // helps with smooth real-time updates
    normalized: true
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
