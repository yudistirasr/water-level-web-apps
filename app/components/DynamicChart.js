'use client'
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const DynamicChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current?.getContext('2d');
    
    if (ctx) {
      // Destroy existing chart instance
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
      gradient.addColorStop(1, 'rgba(56, 189, 248, 0.1)');

      // Create new chart instance
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Ketinggian Air (m)',
            data: data.values,
            fill: true,
            backgroundColor: gradient,
            borderColor: 'rgb(56, 189, 248)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(56, 189, 248)',
            tension: 0.4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: 'rgb(229, 231, 235)'
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
        }
      });
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]); // Re-run when data changes

  return <canvas ref={chartRef} />;
};

export default DynamicChart;
