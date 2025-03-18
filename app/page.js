'use client'
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';

// Import only compatible libraries
import { IoWaterOutline } from 'react-icons/io5';

// Dynamically import Chart.js component
const DynamicChart = dynamic(() => import('./components/DynamicChart'), {
  ssr: false,
  loading: () => <p>Loading Chart...</p>
});

export default function Home() {
  // Sample data - in a real app, this would come from an API
  const waterLevel = 65; // percentage
  const warningColor = waterLevel > 80 ? "from-red-500 to-red-600" : waterLevel > 60 ? "from-yellow-400 to-amber-500" : "from-green-400 to-emerald-500";
  const lastUpdate = "12 Jun 2023, 14:30";
  const location = "Sungai Cilliwung, Jakarta";

  const [activeTab, setActiveTab] = useState('dashboard');

  // Simplified chart data structure
  const chartData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    values: [3.2, 3.5, 4.2, 6.5, 5.8, 4.7]
  };

  // Animation classes instead of framer-motion
  const fadeIn = "animate-fadeIn";
  const slideDown = "animate-slideDown";
  const scaleUp = "animate-scaleUp";

  // Client-side only hooks
  const ClientSideContent = () => {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
      setIsHydrated(true);
    }, []);

    if (!isHydrated) {
      return null;
    }

    return (
      <style jsx global>{`
        @keyframes blur-animation {
          to {
            filter: blur(10px);
            transform: scale(1.03);
          }
        }

        .glow-card::before {
          content: "";
          position: absolute;
          top: -2px;
          left: -2px;
          width: calc(100% + 4px);
          height: calc(100% + 4px);
          background: radial-gradient(circle at 0 0, rgba(66, 153, 225, 0.5), transparent),
                      radial-gradient(circle at 100% 0, rgba(49, 130, 206, 0.5), transparent),
                      radial-gradient(circle at 0 100%, rgba(49, 151, 149, 0.5), transparent),
                      radial-gradient(circle at 100% 100%, rgba(72, 187, 120, 0.5), transparent);
          z-index: -1;
          border-radius: inherit;
          filter: blur(8px);
          animation: blur-animation 3s ease-in-out alternate infinite;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 8px 32px rgba(31, 38, 135, 0.15),
            0 4px 8px rgba(0, 0, 0, 0.07);
        }

        .gradient-text {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          -webkit-text-fill-color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          font-weight: 700;
        }

        .card-hover {
          transition: all 0.3s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .alert-pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-gray-100">
      <ClientSideContent />
      
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/4 -left-24 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>
      
      {/* Header with enhanced design */}
      <header className={`sticky top-0 z-50 bg-slate-900/80 shadow-lg py-4 ${slideDown}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative w-10 h-10 mr-3 glow-card rounded-lg flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 gradient-bg overflow-hidden">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold gradient-text">Water Level Monitor</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">Update: {lastUpdate}</span>
              <button className="relative overflow-hidden px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium transition-all hover:shadow-lg hover:from-blue-600 hover:to-blue-700 active:scale-95">
                <span className="relative z-10">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Enhanced tabs */}
        <nav className="flex space-x-3 p-1.5 bg-slate-800/50 rounded-xl backdrop-blur-md shadow-lg">
          {['dashboard', 'analisis', 'pengaturan'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex-1 py-3 px-6 rounded-lg text-sm font-medium
                transition-all duration-200 transform
                ${activeTab === tab 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        {/* Dynamic Content Based on Tab */}
        <div className={fadeIn}>	
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Main metrics grid with better spacing */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Larger Water Level Gauge */}
                <div className="lg:col-span-5 card-hover">
                  <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700">
                    <h3 className="text-2xl font-bold text-blue-100 mb-6 flex items-center">
                      <IoWaterOutline className="w-8 h-8 mr-3 text-blue-400" />
                      Ketinggian Air
                    </h3>
                    <div className="flex flex-col items-center">
                      <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          {/* Dark background circle */}
                          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="10" />
                          
                          {/* Water level background glow */}
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={`url(#gradient-${waterLevel > 80 ? 'danger' : waterLevel > 60 ? 'warning' : 'safe'})`}
                            strokeWidth="12"
                            strokeDasharray={`${waterLevel * 2.83} 283`}
                            strokeDashoffset="0"
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                            style={{ filter: 'blur(3px)' }}
                          />
                          
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
                              <stop offset="0%" stopColor="#FF416C" />
                              <stop offset="100%" stopColor="#FF4B2B" />
                            </linearGradient>
                            <linearGradient id="gradient-warning" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#F9D423" />
                              <stop offset="100%" stopColor="#FF4E50" />
                            </linearGradient>
                            <linearGradient id="gradient-safe" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#00F260" />
                              <stop offset="100%" stopColor="#0575E6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <div className="text-3xl font-bold">{waterLevel}%</div>
                          <div className="text-xs text-gray-400 mt-2">{(waterLevel * 0.1).toFixed(1)} meter</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Alert Panel */}
                <div className="lg:col-span-4 card-hover">
                  <div className={`
                    bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700
                    ${waterLevel > 80 ? 'alert-pulse' : ''}
                  `}>
                    <h3 className="text-lg font-medium mb-4 gradient-text">Status Peringatan</h3>
                    <div className={`rounded-md bg-gradient-to-r ${warningColor} bg-opacity-20 p-4 mb-4`}>
                      <div className="flex">
                        <div className="flex-shrink-0">
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
                          <p className="text-sm font-medium">
                            {waterLevel > 80 ? 'Peringatan! Ketinggian air mencapai level bahaya' : 
                            waterLevel > 60 ? 'Waspada! Ketinggian air meningkat' : 
                            'Kondisi aman. Ketinggian air normal'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-white/5">
                        <span className="text-sm">Ambang batas aman</span>
                        <span className="text-sm font-medium bg-gray-800/70 px-3 py-0.5 rounded-full border border-white/10">{'<'} 60%</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-white/5">
                        <span className="text-sm">Ambang batas waspada</span>
                        <span className="text-sm font-medium bg-gray-800/70 px-3 py-0.5 rounded-full border border-white/10">60% - 80%</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-white/5">
                        <span className="text-sm">Ambang batas bahaya</span>
                        <span className="text-sm font-medium bg-gray-800/70 px-3 py-0.5 rounded-full border border-white/10">{'>'} 80%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Redesigned Info Panel */}
                <div className="lg:col-span-3 card-hover">
                  <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700">
                    <h3 className="text-lg font-medium mb-4 gradient-text">Informasi Tambahan</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-1 bg-gray-800/30 backdrop-blur-sm border border-white/5 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Cuaca</p>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                          </svg>
                          <p className="font-medium">Hujan Ringan</p>
                        </div>
                      </div>
                      <div className="col-span-1 bg-gray-800/30 backdrop-blur-sm border border-white/5 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Suhu</p>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-red-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="font-medium">26°C</p>
                        </div>
                      </div>
                      <div className="col-span-1 bg-gray-800/30 backdrop-blur-sm border border-white/5 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Debit Air</p>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <p className="font-medium">120 m³/s</p>
                        </div>
                      </div>
                      <div className="col-span-1 bg-gray-800/30 backdrop-blur-sm border border-white/5 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Kecepatan Air</p>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          <p className="font-medium">2.3 m/s</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Chart Section */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700 card-hover">
                <h3 className="text-lg font-medium text-gray-100 mb-4">
                  Riwayat Ketinggian Air (24 Jam Terakhir)
                </h3>
                <div className="h-72">
                  <DynamicChart data={chartData} />
                </div>
              </div>

              {/* Quick Stats with Native Animations */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 
                  transition-transform duration-200 hover:scale-102 ${scaleUp}`}>
                  <div className="flex items-center space-x-2">
                    <IoWaterOutline className="text-blue-500 text-xl" />
                    <h3 className="text-gray-600 text-sm">Rata-rata Harian</h3>
                  </div>
                  <p className="text-2xl font-semibold mt-2">4.8m</p>
                  <span className="text-green-500 text-sm">↑ 0.3m</span>
                </div>
                {/* Add similar stats cards */}
              </div>
            </div>
          )}

          {activeTab === 'analisis' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Analisis Data</h2>
              {/* Add analysis content */}
            </div>
          )}

          {activeTab === 'pengaturan' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Pengaturan</h2>
              {/* Add settings content */}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">© 2023 Sistem Pemantauan Ketinggian Air</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Bantuan</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Tentang</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Kontak</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
