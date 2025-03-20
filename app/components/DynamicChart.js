'use client'
import { useEffect, useRef } from 'react';
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
import { Line } from 'react-chartjs-2';

// Register Chart.js components
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

const DynamicChart = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgb(229, 231, 235)',
          font: {
            family: '"Inter", sans-serif'
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgb(229, 231, 235)'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgb(229, 231, 235)'
        }
      }
    }
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Ketinggian Air (m)',
        data: data.values,
        fill: true,
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        borderColor: 'rgb(56, 189, 248)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(56, 189, 248)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="relative h-full w-full">
      <Line options={options} data={chartData} />
    </div>
  );
};

export default DynamicChart;
