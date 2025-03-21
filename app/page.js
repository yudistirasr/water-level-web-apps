'use client'
import { useEffect, useState, useCallback } from "react";
import dynamic from 'next/dynamic';
import { BeakerIcon, ArrowTrendingUpIcon, CloudIcon, BoltIcon } from '@heroicons/react/24/outline';
import { database } from './utils/firebase';
import { ref, onValue, query, orderByChild, limitToLast, get } from 'firebase/database';
import AnalisisContent from './components/AnalisisContent';
import PengaturanContent from './components/PengaturanContent';

// Dynamically import Chart.js component
const DynamicChart = dynamic(() => import('./components/DynamicChart'), {
  ssr: false,
  loading: () => <div className="h-72 flex items-center justify-center"><p className="text-gray-500">Loading Chart...</p></div>
});

export default function Home() {
  // State for current water data
  const [waterData, setWaterData] = useState({
    height: 0,
    rate: 0,
    lastUpdate: null,
    loading: true
  });

  // State for historical data for charts
  const [historicalData, setHistoricalData] = useState({
    labels: [],
    values: [],
    loading: true
  });

  // State for weather data
  const [weatherData, setWeatherData] = useState({
    condition: 'Hujan Ringan',
    temperature: 26,
    rainfall: 15
  });

  // State for statistics
  const [stats, setStats] = useState({
    dailyAverage: 0,
    prediction3h: 0,
    maxHeight24h: 0
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState(null);

  // Function to fetch current water level data
  useEffect(() => {
    try {
      const waterLevelRef = ref(database, 'water_level');
      const unsubscribe = onValue(waterLevelRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setWaterData({
            height: data.height || 0,
            rate: data.rate || 0,
            lastUpdate: new Date().toLocaleString(),
            loading: false
          });
          
          // Update statistics based on new data
          calculateStats(data.height, data.rate);
        }
      }, (error) => {
        setError(`Error fetching realtime data: ${error.message}`);
        setWaterData(prev => ({ ...prev, loading: false }));
      });

      return () => unsubscribe();
    } catch (err) {
      setError(`Failed to connect to database: ${err.message}`);
      setWaterData(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Function to fetch historical data for the chart
  useEffect(() => {
    try {
      // Create a reference to historical data (assuming data is stored as timestamped entries)
      const historyRef = query(
        ref(database, 'water_level_history'), 
        orderByChild('timestamp'), 
        limitToLast(24) // Get last 24 entries
      );
      
      get(historyRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const entries = Object.values(data);
          
          // Sort entries by timestamp
          entries.sort((a, b) => a.timestamp - b.timestamp);
          
          // Format data for the chart
          const labels = entries.map(entry => {
            const date = new Date(entry.timestamp);
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          });
          
          const values = entries.map(entry => entry.height || 0);
          
          setHistoricalData({
            labels,
            values,
            loading: false
          });
          
        } else {
          // If no history data, create sample data based on current height
          const currentHeight = waterData.height;
          const now = new Date();
          const labels = Array(6).fill('').map((_, i) => {
            const date = new Date(now);
            date.setHours(date.getHours() - (5-i));
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          });
          
          // Generate slightly varying values for the chart based on current height
          const baseValue = currentHeight > 0 ? currentHeight : 1.5;
          const values = [
            baseValue * 0.9,
            baseValue * 0.95,
            baseValue * 1.0,
            baseValue * 1.05,
            baseValue * 1.02,
            baseValue
          ];
          
          setHistoricalData({
            labels,
            values,
            loading: false
          });
        }
      }).catch(error => {
        console.error("Error fetching historical data:", error);
        setHistoricalData(prev => ({ ...prev, loading: false }));
      });
    } catch (err) {
      console.error("Failed to fetch historical data:", err);
      setHistoricalData(prev => ({ ...prev, loading: false }));
    }
  }, [waterData.height]);

  // Calculate statistics based on current data
  const calculateStats = useCallback((height, rate) => {
    // In a real application, these would be calculated from actual historical data
    // Here we're just simulating based on current readings
    const dailyAverage = height > 0 ? height * 1.1 : 1.8;
    const prediction3h = rate > 0 ? height + (rate * 3 * 3600) : height + 0.5;
    const maxHeight24h = height > 0 ? Math.max(height * 1.2, 2.5) : 2.5;
    
    setStats({
      dailyAverage: parseFloat(dailyAverage.toFixed(1)),
      prediction3h: parseFloat(prediction3h.toFixed(1)),
      maxHeight24h: parseFloat(maxHeight24h.toFixed(1))
    });
  }, []);

  // Calculate water level percentage based on max height of 3 meters
  const waterLevel = (waterData.height / 3) * 100; // Convert to percentage
  const warningColor = waterLevel > 80 ? "from-red-500 to-red-400" : waterLevel > 60 ? "from-amber-500 to-amber-400" : "from-emerald-500 to-emerald-400";
  const lastUpdate = waterData.lastUpdate || "Loading...";

  // Refresh data manually
  const handleRefresh = () => {
    setWaterData(prev => ({ ...prev, loading: true }));
    setHistoricalData(prev => ({ ...prev, loading: true }));
    // The useEffect hooks will automatically re-fetch the data
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white text-slate-700">
      {/* Header with a fresher design */}
      <header className="sticky top-0 z-50 bg-white shadow-sm py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative w-10 h-10 mr-3 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-500 text-white overflow-hidden">
                <BeakerIcon className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-500">
                Water Level Monitor
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {waterData.loading ? (
                <span className="text-sm text-gray-500">Memuat data...</span>
              ) : (
                <span className="text-sm text-gray-500">Update: {lastUpdate}</span>
              )}
              <button 
                onClick={handleRefresh}
                disabled={waterData.loading}
                className={`px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium transition-all hover:bg-emerald-600 active:scale-95 shadow-sm ${waterData.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {waterData.loading ? 'Memuat...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Error message if present */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modern styled tabs */}
        <div className="relative p-1 bg-gray-100 rounded-xl shadow-sm max-w-3xl mx-auto">
          <div className="tab-container flex bg-gray-100 rounded-lg p-1">
            {['dashboard', 'analisis', 'pengaturan'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex-1 py-2 px-6 rounded-lg text-sm font-medium
                  transition-all duration-200 transform
                  ${activeTab === tab 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-gray-600 hover:text-emerald-700'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content Based on Tab */}
        <div className="animate-fadeIn">	
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Water Level Gauge - Modernized with brighter colors */}
                <div className="lg:col-span-5">
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                      <BeakerIcon className="w-5 h-5 mr-2 text-emerald-500" />
                      Ketinggian Air
                    </h3>
                    {waterData.loading ? (
                      <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            {/* Background circle */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(229, 231, 235, 0.8)" strokeWidth="10" />
                            
                            {/* Water level indicator */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke={`url(#gradient-${waterLevel > 80 ? 'danger' : waterLevel > 60 ? 'warning' : 'safe'})`}
                              strokeWidth="10"
                              strokeDasharray={`${waterLevel * 2.83} 283`}
                              strokeDashoffset="0"
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                            />
                            
                            {/* Define gradients */}
                            <defs>
                              <linearGradient id="gradient-danger" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f87171" />
                                <stop offset="100%" stopColor="#ef4444" />
                              </linearGradient>
                              <linearGradient id="gradient-warning" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#fcd34d" />
                                <stop offset="100%" stopColor="#f59e0b" />
                              </linearGradient>
                              <linearGradient id="gradient-safe" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6ee7b7" />
                                <stop offset="100%" stopColor="#10b981" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <div className="text-3xl font-bold text-gray-800">{waterLevel.toFixed(1)}%</div>
                            <div className="text-sm text-gray-500 mt-1">{waterData.height.toFixed(2)} meter</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Panel - Redesigned with cleaner look */}
                <div className="lg:col-span-4">
                  <div className={`
                    bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow
                    ${waterLevel > 80 ? 'border-l-4 border-l-red-500' : waterLevel > 60 ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-emerald-500'}
                  `}>
                    <h3 className="text-lg font-bold text-gray-700 mb-4">Status Peringatan</h3>
                    
                    {waterData.loading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`rounded-lg bg-gradient-to-r ${warningColor} bg-opacity-10 p-4 mb-4 text-white`}>
                          <div className="flex items-center">
                            <div className="shrink-0">
                              {waterLevel > 80 ? (
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="ml-3">
                              <p className="font-medium">
                                {waterLevel > 80 ? 'Peringatan! Ketinggian air mencapai level bahaya' : 
                                waterLevel > 60 ? 'Waspada! Ketinggian air meningkat' : 
                                'Kondisi aman. Ketinggian air normal'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mt-6">
                          <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gray-50">
                            <span className="text-sm font-medium text-gray-600">Ambang batas aman</span>
                            <span className="text-sm font-medium bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full">{'<'} 60%</span>
                          </div>
                          <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gray-50">
                            <span className="text-sm font-medium text-gray-600">Ambang batas waspada</span>
                            <span className="text-sm font-medium bg-amber-100 text-amber-800 px-3 py-0.5 rounded-full">60% - 80%</span>
                          </div>
                          <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gray-50">
                            <span className="text-sm font-medium text-gray-600">Ambang batas bahaya</span>
                            <span className="text-sm font-medium bg-red-100 text-red-800 px-3 py-0.5 rounded-full">{'>'} 80%</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Info Panel - Redesigned with cleaner look */}
                <div className="lg:col-span-3">
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-gray-700 mb-4">Informasi Tambahan</h3>
                    
                    {waterData.loading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-1 bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Cuaca</p>
                          <div className="flex items-center">
                            <CloudIcon className="w-5 h-5 mr-2 text-blue-500" />
                            <p className="font-medium text-gray-700">{weatherData.condition}</p>
                          </div>
                        </div>
                        <div className="col-span-1 bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Suhu</p>
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="font-medium text-gray-700">{weatherData.temperature}°C</p>
                          </div>
                        </div>
                        <div className="col-span-1 bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Debit Air</p>
                          <div className="flex items-center">
                            <BoltIcon className="w-5 h-5 mr-2 text-cyan-500" />
                            <p className="font-medium text-gray-700">{(waterData.height * 40).toFixed(0)} m³/s</p>
                          </div>
                        </div>
                        <div className="col-span-1 bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Perubahan</p>
                          <div className="flex items-center">
                            <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-purple-500" />
                            <p className="font-medium text-gray-700">{waterData.rate.toFixed(2)} m/s</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chart Section - Industry Standard */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-700 mb-4 flex justify-between items-center">
                  <span>Riwayat Ketinggian Air (24 Jam Terakhir)</span>
                  {historicalData.loading && (
                    <span className="text-sm font-normal text-gray-500">Memuat data...</span>
                  )}
                </h3>
                <div className="h-72">
                  {historicalData.loading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                  ) : (
                    <DynamicChart data={historicalData} />
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow flex items-center">
                  <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                    <BeakerIcon className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Rata-rata Harian</p>
                    <p className="text-xl font-bold text-gray-800">{stats.dailyAverage}m</p>
                    <span className="text-xs text-emerald-500 flex items-center">
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      {(stats.dailyAverage - waterData.height).toFixed(1)}m dari sekarang
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow flex items-center">
                  <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                    <ArrowTrendingUpIcon className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Prediksi 3 Jam</p>
                    <p className="text-xl font-bold text-gray-800">{stats.prediction3h}m</p>
                    <span className="text-xs text-amber-500 flex items-center">
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      Perkiraan +{(stats.prediction3h - waterData.height).toFixed(1)}m
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <CloudIcon className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Curah Hujan</p>
                    <p className="text-xl font-bold text-gray-800">{weatherData.rainfall}mm/h</p>
                    <span className="text-xs text-blue-500 flex items-center">
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      Meningkat ringan
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analisis' && <AnalisisContent waterData={waterData} />}

          {activeTab === 'pengaturan' && <PengaturanContent />}
        </div>
      </main>

      {/* Footer with lighter design */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Sistem Pemantauan Ketinggian Air</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Bantuan</a>
              <a href="#" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Tentang</a>
              <a href="#" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Kontak</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}