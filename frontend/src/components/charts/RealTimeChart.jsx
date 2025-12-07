import React, { useEffect, useRef } from 'react';
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

const RealTimeChart = ({ 
  data, 
  label, 
  color = '#3B82F6', 
  yAxisLabel = 'Value',
  tension = 0.45
}) => {
  const chartRef = useRef(null);

  const chartData = {
    labels: data.map((item, idx) => {
      if (idx % 5 === 0) {
        const time = new Date(item.timestamp);
        return time.toLocaleTimeString();
      }
      return '';
    }),
    datasets: [
      {
        label: label,
        data: data.map(item => item.value || item.weight || item.power || item.flow_rate),
        borderColor: color,
        backgroundColor: `${color}15`,
        borderWidth: 2.5,
        fill: true,
        tension: tension,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: color,
        pointBorderWidth: 2,
        hitRadius: 10
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300,
      easing: 'easeOutCubic'
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'start',
        labels: {
          usePointStyle: true,
          padding: 16,
          color: '#4B5563',
          font: {
            size: 12,
            weight: '500'
          },
          boxWidth: 8,
          boxHeight: 8
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
        padding: 12,
        displayColors: false,
        caretSize: 6,
        cornerRadius: 6,
        titleFont: {
          size: 12,
          weight: 'bold'
        },
        bodyFont: {
          size: 11
        },
        callbacks: {
          label: ctx => {
            const v = ctx.parsed.y;
            if (v == null || Number.isNaN(v)) return '';
            return `${label}: ${v.toFixed(2)}`;
          },
          title: ctx => {
            if (ctx.length === 0) return '';
            const dataPoint = data[ctx[0].dataIndex];
            if (!dataPoint || !dataPoint.timestamp) return '';
            const time = new Date(dataPoint.timestamp);
            return time.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          }
        }
      }
    },
    layout: {
      padding: {
        left: 4,
        right: 12,
        top: 4,
        bottom: 4
      }
    },
    scales: {
      x: {
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
        },
        border: {
          display: false
        }
      },
      y: {
        beginAtZero: false,
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          color: '#6B7280',
          font: {
            size: 11,
            weight: 'bold'
          },
          padding: {
            bottom: 8
          }
        },
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
          maxTicksLimit: 6,
          callback: function(value) {
            return value.toFixed(1);
          }
        },
        border: {
          display: false
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
        tension: tension
      },
      point: {
        radius: 0
      }
    },
    normalized: true
  };

  useEffect(() => {
    // Optional: Force chart update on data change for smoother animations
    if (chartRef.current) {
      chartRef.current.update('none');
    }
  }, [data]);

  return (
    <div className="w-full h-64 md:h-80">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default RealTimeChart;
