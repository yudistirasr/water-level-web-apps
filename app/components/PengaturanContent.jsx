'use client';
import { useState } from 'react';

export default function PengaturanContent() {
  const [activeTab, setActiveTab] = useState('general');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState("30"); // Added state for refresh interval
  const [themeOption, setThemeOption] = useState("light"); // Added state for theme option
  const [location, setLocation] = useState("Sungai Ciliwung, Jakarta"); // Added state for location
  const [thresholds, setThresholds] = useState({
    safe: 60,
    warning: 80,
    danger: 90
  });
  const [userProfile, setUserProfile] = useState({
    name: 'Admin Water Level',
    email: 'admin@waterlevel.com',
    phone: '+6281234567890'
  });

  const handleThresholdChange = (type, value) => {
    setThresholds(prev => ({
      ...prev,
      [type]: parseInt(value)
    }));
  };

  const handleProfileChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4">
        <h3 className="text-lg font-bold text-emerald-800">Pengaturan Sistem</h3>
        <p className="text-sm text-emerald-600">Konfigurasi parameter sistem pemantauan</p>
      </div>

      {/* Tabs Navigation */}
      <div className="relative p-2 bg-gray-100 border-b border-gray-200">
        <div className="tab-container flex gap-1 bg-gray-100 p-1 rounded-lg max-w-md mx-auto">
          {['general', 'notifications', 'thresholds', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === tab 
                  ? 'bg-white text-emerald-700 shadow-sm' 
                  : 'text-gray-600 hover:text-emerald-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Tema Sistem</label>
              <div className="flex gap-3 flex-wrap">
                <div className="flex items-center">
                  <input 
                    id="theme-light" 
                    name="theme" 
                    type="radio"
                    value="light"
                    checked={themeOption === "light"}
                    onChange={(e) => setThemeOption(e.target.value)}
                    className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="theme-light" className="ml-2 block text-sm text-gray-700">Light</label>
                </div>
                <div className="flex items-center">
                  <input 
                    id="theme-dark" 
                    name="theme" 
                    type="radio"
                    value="dark"
                    checked={themeOption === "dark"}
                    onChange={(e) => setThemeOption(e.target.value)}
                    className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="theme-dark" className="ml-2 block text-sm text-gray-700">Dark</label>
                </div>
                <div className="flex items-center">
                  <input 
                    id="theme-system" 
                    name="theme" 
                    type="radio"
                    value="system"
                    checked={themeOption === "system"}
                    onChange={(e) => setThemeOption(e.target.value)}
                    className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="theme-system" className="ml-2 block text-sm text-gray-700">System</label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Interval Penyegaran Data</label>
              <select 
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 text-sm"
              >
                <option value="5">Setiap 5 detik</option>
                <option value="10">Setiap 10 detik</option>
                <option value="30">Setiap 30 detik</option>
                <option value="60">Setiap 1 menit</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Lokasi Pemantauan</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 text-sm"
              />
            </div>

            <button className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors">
              Simpan Pengaturan
            </button>
          </div>
        )}
        
        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Aktifkan Notifikasi</h4>
                <p className="text-xs text-gray-500">Terima peringatan saat level air berubah signifikan</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notificationsEnabled} 
                  onChange={() => setNotificationsEnabled(!notificationsEnabled)} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Email Notifikasi</h4>
                <p className="text-xs text-gray-500">Kirim peringatan via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={emailNotifications} 
                  onChange={() => setEmailNotifications(!emailNotifications)} 
                  className="sr-only peer"
                  disabled={!notificationsEnabled}
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 ${!notificationsEnabled && 'opacity-50'}`}></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h4 className="text-sm font-medium text-gray-700">SMS Notifikasi</h4>
                <p className="text-xs text-gray-500">Kirim peringatan via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={smsNotifications} 
                  onChange={() => setSmsNotifications(!smsNotifications)} 
                  className="sr-only peer"
                  disabled={!notificationsEnabled}
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 ${!notificationsEnabled && 'opacity-50'}`}></div>
              </label>
            </div>
            
            <button className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors">
              Simpan Pengaturan
            </button>
          </div>
        )}
        
        {/* Thresholds Settings */}
        {activeTab === 'thresholds' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">Sesuaikan ambang batas untuk peringatan level air</p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ambang Aman (%) - {thresholds.safe}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={thresholds.safe} 
                  onChange={(e) => handleThresholdChange('safe', e.target.value)}
                  className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ambang Waspada (%) - {thresholds.warning}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={thresholds.warning} 
                  onChange={(e) => handleThresholdChange('warning', e.target.value)}
                  className="w-full h-2 bg-yellow-100 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ambang Bahaya (%) - {thresholds.danger}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={thresholds.danger} 
                  onChange={(e) => handleThresholdChange('danger', e.target.value)}
                  className="w-full h-2 bg-red-100 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
              <h5 className="font-medium text-sm text-emerald-700 mb-2">Konfigurasi Saat Ini</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 mr-2"></span>
                  <span className="text-gray-700">Aman: 0% - {thresholds.safe}%</span>
                </li>
                <li className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                  <span className="text-gray-700">Waspada: {thresholds.safe}% - {thresholds.danger}%</span>
                </li>
                <li className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                  <span className="text-gray-700">Bahaya:  {thresholds.danger}</span>
                </li>
              </ul>
            </div>
            
            <button className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors">
              Simpan Pengaturan
            </button>
          </div>
        )}
        
        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-xl font-bold border-2 border-emerald-200">
                {userProfile.name.split(' ').map(word => word[0]).join('')}
              </div>
              <div>
                <h4 className="font-medium">{userProfile.name}</h4>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input 
                  type="text" 
                  value={userProfile.name} 
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={userProfile.email} 
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                <input 
                  type="tel" 
                  value={userProfile.phone} 
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 text-sm"
                />
              </div>
            </div>
            
            <button className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors">
              Simpan Profil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
