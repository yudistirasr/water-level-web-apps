'use client'
import { useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  zoomPlugin,
  annotationPlugin
);

export default function DynamicChart({ data }) {
  const chartRef = useRef(null);

  // Get min and max values for better chart scaling
  const values = data.values || [];
  const minValue = Math.max(0, Math.min(...values) * 0.8);
  const maxValue = Math.max(...values) * 1.2;
  
  // Calculate warning threshold at 80% of 3 meters (2.4m)
  const warningLevel = 2.4;
  
  // Calculate critical threshold at 90% of 3 meters (2.7m)
  const criticalLevel = 2.7;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        cornerRadius: 8,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `Ketinggian: ${context.parsed.y.toFixed(2)}m`;
          }
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        }
      },
      annotation: {
        annotations: {
          warningLine: {
            type: 'line',
            yMin: warningLevel,
            yMax: warningLevel,
            borderColor: 'rgba(245, 158, 11, 0.5)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              display: true,
              content: 'Batas Waspada (2.4m)',
              position: 'start',
              backgroundColor: 'rgba(245, 158, 11, 0.8)',
              color: 'white',
              font: {
                size: 11
              }
            }
          },
          criticalLine: {
            type: 'line',
            yMin: criticalLevel,
            yMax: criticalLevel,
            borderColor: 'rgba(239, 68, 68, 0.5)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              display: true,
              content: 'Batas Bahaya (2.7m)',
              position: 'start',
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              color: 'white',
              font: {
                size: 11
              }
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: minValue,
        max: 3, // Max height is 3 meters
        grid: {
          color: 'rgba(229, 231, 235, 0.6)',
        },
        ticks: {
          color: 'rgba(107, 114, 128, 0.8)',
          callback: (value) => `${value}m`
        },
        title: {
          display: true,
          text: 'Ketinggian (meter)',
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'normal'
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(107, 114, 128, 0.8)',
          maxRotation: 45,
          minRotation: 45
        },
        title: {
          display: true,
          text: 'Waktu',
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'normal'
          }
        }
      }
    },
    elements: {
      point: {
        radius: function(context) {
          // Enlarge the point when hovering
          const index = context.dataIndex;
          const value = context.dataset.data[index];
          return context.active ? 6 : 4;
        }
      },
      line: {
        tension: 0.4
      }
    },
    transitions: {
      zoom: {
        animation: {
          duration: 1000,
          easing: 'easeOutCubic'
        }
      }
    }
  };

  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        fill: true,
        data: data.values || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        pointBackgroundColor: function(context) {
          const value = context.dataset.data[context.dataIndex];
          if (value >= criticalLevel) return '#ef4444'; // Red for critical
          if (value >= warningLevel) return '#f59e0b'; // Amber for warning
          return '#ffffff'; // White for normal
        },
        pointBorderColor: function(context) {
          const value = context.dataset.data[context.dataIndex];
          if (value >= criticalLevel) return '#ef4444'; // Red for critical
          if (value >= warningLevel) return '#f59e0b'; // Amber for warning
          return '#10b981'; // Green for normal
        },
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Reset zoom when data changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  }, [data]);

  return (
    <div className="relative w-full h-full rounded-xl bg-white p-4">
      <Line ref={chartRef} options={options} data={chartData} />
      <div className="absolute top-2 right-2 flex gap-2">
        <button 
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md"
          onClick={() => chartRef.current?.resetZoom()}
        >
          Reset Zoom
        </button>
      </div>
      <div className="mt-3 text-xs text-gray-500 flex items-center justify-center">
        <span>Scroll/Pinch untuk zoom, klik dan geser untuk pan</span>
      </div>
    </div>
  );
}