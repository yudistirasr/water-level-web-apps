'use client';
import { useState, useEffect, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { database } from '../utils/firebase';
import { ref, query, orderByChild, limitToLast, get, startAt } from 'firebase/database';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import { ArrowDownIcon, ArrowUpIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function AnalisisContent({ waterData }) {
  // State for UI controls
  const [timeRange, setTimeRange] = useState('daily');
  const [dataType, setDataType] = useState('height');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState({
    historicalData: [],
    statistics: {
      averageHeight: 0,
      maxHeight: 0,
      minHeight: 0,
      rateOfChange: 0,
      standardDeviation: 0
    },
    predictions: {
      oneHour: 0,
      threeHours: 0,
      sixHours: 0
    },
    alerts: []
  });

  // Function to fetch historical data from Firebase
  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true);
      try {
        let recordLimit = 24; // Default for daily view
        
        // Determine time range based on selected option
        switch(timeRange) {
          case 'daily':
            recordLimit = 24;
            break;
          case 'weekly':
            recordLimit = 168; // 24 * 7
            break;
          case 'monthly':
            recordLimit = 720; // Approximately 30 days of hourly data
            break;
          default:
            recordLimit = 24;
        }
        
        // Query Firebase for historical data - using only orderByChild and limitToLast
        // This avoids the startAt issue when no index is defined yet
        const historyRef = query(
          ref(database, 'water_level_history'),
          orderByChild('timestamp'),
          limitToLast(recordLimit)
        );
        
        const snapshot = await get(historyRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const entries = Object.values(data);
          
          // Sort entries by timestamp
          entries.sort((a, b) => a.timestamp - b.timestamp);
          
          // Store historical data
          setAnalyticsData(prev => ({
            ...prev,
            historicalData: entries
          }));
          
          // Calculate statistics
          calculateStatistics(entries);
        } else {
          // If no history data, generate sample data
          generateSampleData();
        }
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError(`Failed to load analytics data: ${err.message}`);
        generateSampleData(); // Fallback to sample data
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistoricalData();
  }, [timeRange]);

  // Calculate statistics from historical data
  const calculateStatistics = (data) => {
    try {
      // Extract water heights
      const heights = data.map(entry => entry.height || 0);
      
      // Basic statistics
      const sum = heights.reduce((acc, val) => acc + val, 0);
      const avg = sum / heights.length;
      const max = Math.max(...heights);
      const min = Math.min(...heights);
      
      // Calculate standard deviation
      const squareDiffs = heights.map(value => {
        const diff = value - avg;
        return diff * diff;
      });
      const avgSquareDiff = squareDiffs.reduce((acc, val) => acc + val, 0) / squareDiffs.length;
      const stdDev = Math.sqrt(avgSquareDiff);
      
      // Calculate average rate of change
      let totalRateChange = 0;
      for (let i = 1; i < data.length; i++) {
        const timeDiff = (data[i].timestamp - data[i-1].timestamp) / 1000; // convert to seconds
        if (timeDiff > 0) {
          const heightDiff = data[i].height - data[i-1].height;
          totalRateChange += heightDiff / timeDiff;
        }
      }
      const avgRateChange = data.length > 1 ? totalRateChange / (data.length - 1) : 0;
      
      // Predict future water levels
      const latestHeight = heights[heights.length - 1] || waterData.height;
      const latestRate = avgRateChange || waterData.rate;
      
      const oneHourPrediction = latestHeight + (latestRate * 3600); // 1 hour in seconds
      const threeHourPrediction = latestHeight + (latestRate * 3600 * 3); // 3 hours
      const sixHourPrediction = latestHeight + (latestRate * 3600 * 6); // 6 hours
      
      // Check for potential alerts
      const alerts = [];
      if (oneHourPrediction > 2.4) {
        alerts.push({
          level: 'warning',
          message: 'Potensi ketinggian air mencapai level waspada dalam 1 jam'
        });
      }
      if (oneHourPrediction > 2.7) {
        alerts.push({
          level: 'danger',
          message: 'Potensi ketinggian air mencapai level bahaya dalam 1 jam'
        });
      }
      
      // Update analytics data
      setAnalyticsData(prev => ({
        ...prev,
        statistics: {
          averageHeight: parseFloat(avg.toFixed(2)),
          maxHeight: parseFloat(max.toFixed(2)),
          minHeight: parseFloat(min.toFixed(2)),
          rateOfChange: parseFloat(avgRateChange.toFixed(4)),
          standardDeviation: parseFloat(stdDev.toFixed(2))
        },
        predictions: {
          oneHour: parseFloat(oneHourPrediction.toFixed(2)),
          threeHours: parseFloat(threeHourPrediction.toFixed(2)),
          sixHours: parseFloat(sixHourPrediction.toFixed(2))
        },
        alerts
      }));
    } catch (err) {
      console.error("Error calculating statistics:", err);
    }
  };

  // Generate sample data when Firebase data is not available
  const generateSampleData = () => {
    const currentHeight = waterData.height || 1.5;
    const currentRate = waterData.rate || 0.001;
    
    const now = new Date();
    const historicalData = [];
    
    let timeInterval;
    let samples;
    
    switch(timeRange) {
      case 'daily':
        timeInterval = 3600 * 1000; // 1 hour in milliseconds
        samples = 24;
        break;
      case 'weekly':
        timeInterval = 6 * 3600 * 1000; // 6 hours in milliseconds
        samples = 28; // 7 days * 4 samples per day
        break;
      case 'monthly':
        timeInterval = 24 * 3600 * 1000; // 1 day in milliseconds
        samples = 30;
        break;
      default:
        timeInterval = 3600 * 1000;
        samples = 24;
    }
    
    for (let i = 0; i < samples; i++) {
      const timestamp = now.getTime() - (samples - i) * timeInterval;
      const randomVariation = (Math.random() - 0.5) * 0.2; // Random variation between -0.1 and +0.1
      const height = Math.max(0, Math.min(3, currentHeight + randomVariation));
      
      historicalData.push({
        timestamp,
        height,
        rate: currentRate + (Math.random() - 0.5) * 0.002
      });
    }
    
    setAnalyticsData(prev => ({
      ...prev,
      historicalData
    }));
    
    calculateStatistics(historicalData);
  };

  // Format data for charts
  const chartData = useMemo(() => {
    if (analyticsData.historicalData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    // Format labels based on time range
    const labels = analyticsData.historicalData.map(entry => {
      const date = new Date(entry.timestamp);
      
      switch(timeRange) {
        case 'daily':
          return format(date, 'HH:mm', { locale: id });
        case 'weekly':
          return format(date, 'EEE, HH:mm', { locale: id });
        case 'monthly':
          return format(date, 'dd MMM', { locale: id });
        default:
          return format(date, 'HH:mm', { locale: id });
      }
    });
    
    // Get data based on selected data type
    const values = analyticsData.historicalData.map(entry => {
      if (dataType === 'rate') {
        return entry.rate || 0;
      }
      return entry.height || 0;
    });
    
    // Add prediction points to the end of the chart for daily view
    let extendedLabels = [...labels];
    let extendedValues = [...values];
    let predictionDataset = null;
    
    if (timeRange === 'daily') {
      const lastTimestamp = analyticsData.historicalData[analyticsData.historicalData.length - 1]?.timestamp;
      
      if (lastTimestamp) {
        const oneHourLater = new Date(lastTimestamp + 3600 * 1000);
        const threeHoursLater = new Date(lastTimestamp + 3 * 3600 * 1000);
        const sixHoursLater = new Date(lastTimestamp + 6 * 3600 * 1000);
        
        const predictionLabels = [
          format(oneHourLater, 'HH:mm', { locale: id }),
          format(threeHoursLater, 'HH:mm', { locale: id }),
          format(sixHoursLater, 'HH:mm', { locale: id })
        ];
        
        const predictionValues = [
          analyticsData.predictions.oneHour,
          analyticsData.predictions.threeHours,
          analyticsData.predictions.sixHours
        ];
        
        predictionDataset = {
          label: 'Prediksi',
          data: Array(labels.length).fill(null).concat(predictionValues),
          borderColor: '#f59e0b',
          borderDash: [5, 5],
          pointBackgroundColor: '#fcd34d',
          pointBorderColor: '#f59e0b',
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
        };
      }
    }
    
    // Return formatted chart data
    return {
      labels: extendedLabels,
      datasets: [
        {
          label: dataType === 'height' ? 'Ketinggian Air (m)' : 'Perubahan Ketinggian (m/s)',
          data: extendedValues,
          fill: dataType === 'height',
          backgroundColor: dataType === 'height' ? 'rgba(16, 185, 129, 0.1)' : undefined,
          borderColor: '#10b981',
          tension: 0.4,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#10b981',
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        ...(predictionDataset ? [predictionDataset] : [])
      ]
    };
  }, [analyticsData.historicalData, analyticsData.predictions, timeRange, dataType]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
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
            const value = context.parsed.y;
            return dataType === 'height' 
              ? `Ketinggian: ${value.toFixed(2)}m`
              : `Laju Perubahan: ${value.toFixed(4)}m/s`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: dataType === 'height',
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
        ticks: {
          color: '#666',
          callback: (value) => dataType === 'height' ? `${value}m` : `${value.toFixed(4)}m/s`
        },
        title: {
          display: true,
          text: dataType === 'height' ? 'Ketinggian (meter)' : 'Laju Perubahan (m/s)',
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
          color: '#666',
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
    }
  };
  
  // Distribution chart for height frequency
  const distributionChartData = useMemo(() => {
    if (analyticsData.historicalData.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    // Create height ranges (0-0.5m, 0.5-1.0m, etc.)
    const ranges = [];
    for (let i = 0; i < 6; i++) {
      ranges.push({
        min: i * 0.5,
        max: (i + 1) * 0.5,
        count: 0
      });
    }
    
    // Count occurrences in each range
    analyticsData.historicalData.forEach(entry => {
      const height = entry.height || 0;
      for (let range of ranges) {
        if (height >= range.min && height < range.max) {
          range.count++;
          break;
        }
      }
    });
    
    // Format for chart
    return {
      labels: ranges.map(range => `${range.min}-${range.max}m`),
      datasets: [
        {
          label: 'Distribusi Ketinggian Air',
          data: ranges.map(range => range.count),
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: '#10b981',
          borderWidth: 1
        }
      ]
    };
  }, [analyticsData.historicalData]);

  // Generate CSV from data
  const exportToCSV = () => {
    try {
      // Create CSV content
      const headers = ["Timestamp", "Waktu", "Ketinggian (m)", "Laju Perubahan (m/s)"];
      
      const rows = analyticsData.historicalData.map(entry => {
        const date = new Date(entry.timestamp);
        return [
          entry.timestamp,
          format(date, 'yyyy-MM-dd HH:mm:ss'),
          entry.height || 0,
          entry.rate || 0
        ];
      });
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `water-level-data-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      setError("Gagal mengekspor data.");
    }
  };

  // Render the component
  return (
    <div className="space-y-6">
      {/* Error message with instructions */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              {error.includes("indexOn") && (
                <p className="text-sm text-red-700 mt-1">
                  Tambahkan <code className="bg-red-50 px-1">&quot;.indexOn&quot;: &quot;timestamp&quot;</code> pada Firebase Database Rules untuk path <code className="bg-red-50 px-1">&quot;/water_level_history&quot;</code>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header Panel with Statistics */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 border-b border-emerald-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-emerald-800">Statistik Ketinggian Air</h3>
              <p className="text-sm text-emerald-600">Analisis data tingkat lanjut</p>
            </div>
            <button 
              onClick={exportToCSV} 
              className="flex items-center px-3 py-1.5 bg-white text-emerald-600 border border-emerald-200 rounded-lg text-sm hover:bg-emerald-50 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
              Export Data
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="p-4 h-48 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 p-4">
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg p-4 shadow-sm border border-emerald-100">
              <p className="text-sm font-medium text-emerald-700 mb-1">Rata-rata</p>
              <p className="text-2xl font-bold text-emerald-900">{analyticsData.statistics.averageHeight} m</p>
              <div className="mt-2 text-xs text-emerald-600 flex items-center">
                <span className="flex items-center">
                  {analyticsData.statistics.averageHeight > waterData.height ? (
                    <ArrowDownIcon className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowUpIcon className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(analyticsData.statistics.averageHeight - waterData.height).toFixed(2)}m dari sekarang
                </span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg p-4 shadow-sm border border-emerald-100">
              <p className="text-sm font-medium text-emerald-700 mb-1">Maksimum</p>
              <p className="text-2xl font-bold text-emerald-900">{analyticsData.statistics.maxHeight} m</p>
              <p className="mt-2 text-xs text-emerald-600">Tertinggi dalam periode</p>
            </div>
            
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg p-4 shadow-sm border border-emerald-100">
              <p className="text-sm font-medium text-emerald-700 mb-1">Minimum</p>
              <p className="text-2xl font-bold text-emerald-900">{analyticsData.statistics.minHeight} m</p>
              <p className="mt-2 text-xs text-emerald-600">Terendah dalam periode</p>
            </div>
            
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg p-4 shadow-sm border border-emerald-100">
              <p className="text-sm font-medium text-emerald-700 mb-1">Laju Perubahan</p>
              <p className="text-2xl font-bold text-emerald-900">{analyticsData.statistics.rateOfChange} m/s</p>
              <p className="mt-2 text-xs text-emerald-600">Rata-rata perubahan</p>
            </div>
            
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg p-4 shadow-sm border border-emerald-100">
              <p className="text-sm font-medium text-emerald-700 mb-1">Standar Deviasi</p>
              <p className="text-2xl font-bold text-emerald-900">{analyticsData.statistics.standardDeviation} m</p>
              <p className="mt-2 text-xs text-emerald-600">Variasi ketinggian</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Alerts Panel */}
      {analyticsData.alerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-red-50 p-4 border-b border-amber-100">
            <h3 className="text-lg font-bold text-amber-800">Peringatan Analisis</h3>
          </div>
          
          <div className="p-4 space-y-2">
            {analyticsData.alerts.map((alert, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${
                  alert.level === 'danger' ? 'bg-red-50 border-l-4 border-l-red-500' : 'bg-amber-50 border-l-4 border-l-amber-500'
                }`}
              >
                <p className={`text-sm ${alert.level === 'danger' ? 'text-red-700' : 'text-amber-700'}`}>
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Chart Panel */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 border-b border-emerald-100">
          <h3 className="text-lg font-bold text-emerald-800">Grafik Analisis</h3>
          
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setTimeRange('daily')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                  timeRange === 'daily' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-gray-600 hover:text-emerald-700'
                }`}
              >
                Harian
              </button>
              <button 
                onClick={() => setTimeRange('weekly')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                  timeRange === 'weekly' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-gray-600 hover:text-emerald-700'
                }`}
              >
                Mingguan
              </button>
              <button 
                onClick={() => setTimeRange('monthly')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                  timeRange === 'monthly' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-gray-600 hover:text-emerald-700'
                }`}
              >
                Bulanan
              </button>
            </div>
            
            <div className="bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setDataType('height')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                  dataType === 'height' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-gray-600 hover:text-emerald-700'
                }`}
              >
                Ketinggian
              </button>
              <button 
                onClick={() => setDataType('rate')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                  dataType === 'rate' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-gray-600 hover:text-emerald-700'
                }`}
              >
                Laju Perubahan
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="h-72 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <div className="h-72">
              <Line options={chartOptions} data={chartData} />
            </div>
          )}
        </div>
      </div>
      
      {/* Distribution Chart */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 border-b border-emerald-100">
          <h3 className="text-lg font-bold text-emerald-800">Distribusi Ketinggian Air</h3>
          <p className="text-sm text-emerald-600">Frekuensi ketinggian dalam rentang periode</p>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="h-72 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <div className="h-72">
              <Bar 
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      ...chartOptions.scales.y,
                      title: {
                        display: true,
                        text: 'Frekuensi',
                        color: '#6B7280',
                      }
                    }
                  }
                }} 
                data={distributionChartData} 
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Predictions Panel */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 border-b border-emerald-100">
          <h3 className="text-lg font-bold text-emerald-800">Prediksi Ketinggian Air</h3>
          <p className="text-sm text-emerald-600">Berdasarkan data historis dan laju perubahan</p>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`
              border border-dashed rounded-lg p-4 text-center 
              ${analyticsData.predictions.oneHour > 2.7 ? 'bg-red-50 border-red-200' : 
                analyticsData.predictions.oneHour > 2.4 ? 'bg-amber-50 border-amber-200' : 
                'bg-emerald-50 border-emerald-200'}
            `}>
              <p className="text-sm font-medium text-gray-700 mb-1">1 Jam</p>
              <p className={`text-xl font-bold ${
                analyticsData.predictions.oneHour > 2.7 ? 'text-red-700' :
                analyticsData.predictions.oneHour > 2.4 ? 'text-amber-700' :
                'text-emerald-700'
              }`}>
                {analyticsData.predictions.oneHour} m
              </p>
              <div className="mt-1 text-xs text-gray-600 flex items-center justify-center">
                {analyticsData.predictions.oneHour > waterData.height ? (
                  <ArrowUpIcon className="w-3 h-3 mr-1 text-red-500" />
                ) : (
                  <ArrowDownIcon className="w-3 h-3 mr-1 text-emerald-500" />
                )}
                {Math.abs(analyticsData.predictions.oneHour - waterData.height).toFixed(2)}m dari sekarang
              </div>
            </div>
            
            <div className={`
              border border-dashed rounded-lg p-4 text-center 
              ${analyticsData.predictions.threeHours > 2.7 ? 'bg-red-50 border-red-200' : 
                analyticsData.predictions.threeHours > 2.4 ? 'bg-amber-50 border-amber-200' : 
                'bg-emerald-50 border-emerald-200'}
            `}>
              <p className="text-sm font-medium text-gray-700 mb-1">3 Jam</p>
              <p className={`text-xl font-bold ${
                analyticsData.predictions.threeHours > 2.7 ? 'text-red-700' :
                analyticsData.predictions.threeHours > 2.4 ? 'text-amber-700' :
                'text-emerald-700'
              }`}>
                {analyticsData.predictions.threeHours} m
              </p>
              <div className="mt-1 text-xs text-gray-600 flex items-center justify-center">
                {analyticsData.predictions.threeHours > waterData.height ? (
                  <ArrowUpIcon className="w-3 h-3 mr-1 text-red-500" />
                ) : (
                  <ArrowDownIcon className="w-3 h-3 mr-1 text-emerald-500" />
                )}
                {Math.abs(analyticsData.predictions.threeHours - waterData.height).toFixed(2)}m dari sekarang
              </div>
            </div>
            
            <div className={`
              border border-dashed rounded-lg p-4 text-center 
              ${analyticsData.predictions.sixHours > 2.7 ? 'bg-red-50 border-red-200' : 
                analyticsData.predictions.sixHours > 2.4 ? 'bg-amber-50 border-amber-200' : 
                'bg-emerald-50 border-emerald-200'}
            `}>
              <p className="text-sm font-medium text-gray-700 mb-1">6 Jam</p>
              <p className={`text-xl font-bold ${
                analyticsData.predictions.sixHours > 2.7 ? 'text-red-700' :
                analyticsData.predictions.sixHours > 2.4 ? 'text-amber-700' :
                'text-emerald-700'
              }`}>
                {analyticsData.predictions.sixHours} m
              </p>
              <div className="mt-1 text-xs text-gray-600 flex items-center justify-center">
                {analyticsData.predictions.sixHours > waterData.height ? (
                  <ArrowUpIcon className="w-3 h-3 mr-1 text-red-500" />
                ) : (
                  <ArrowDownIcon className="w-3 h-3 mr-1 text-emerald-500" />
                )}
                {Math.abs(analyticsData.predictions.sixHours - waterData.height).toFixed(2)}m dari sekarang
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-sm text-gray-700 mb-2">Catatan Tentang Prediksi</h5>
            <p className="text-sm text-gray-600">
              Prediksi ketinggian air didasarkan pada analisis tren historis dan laju perubahan saat ini. 
              Akurasi prediksi dapat dipengaruhi oleh perubahan cuaca mendadak atau faktor eksternal lainnya.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
