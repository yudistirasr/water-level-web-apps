'use client'
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
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function DynamicChart({ data }) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 3, // Set max to 3 meters
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: 'rgba(203, 213, 225, 0.8)',
          callback: (value) => `${value}m`
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(203, 213, 225, 0.8)'
        }
      }
    }
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        fill: true,
        data: data.values,
        borderColor: 'rgb(56, 189, 248)',
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: 'rgb(56, 189, 248)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div className="w-full h-full rounded-xl backdrop-blur-sm bg-slate-900/20 p-4">
      <Line options={options} data={chartData} />
    </div>
  );
}