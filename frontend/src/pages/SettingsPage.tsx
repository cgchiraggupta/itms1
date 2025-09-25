import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Save, Bell, Shield, MapPin } from 'lucide-react'

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      defects: true
    },
    gps: {
      accuracy: 'high',
      updateInterval: 1000,
      autoTracking: true
    },
    system: {
      theme: 'light',
      language: 'en',
      autoSave: true
    }
  })

  const [activeTab, setActiveTab] = useState('notifications')

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'gps', label: 'GPS & Tracking', icon: MapPin },
    { id: 'system', label: 'System', icon: SettingsIcon },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }))
  }

  const handleSave = () => {
    console.log('Saving settings:', settings)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Settings
          </h1>
          <p className="text-gray-600">
            Configure your ITMS system preferences and security settings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.label} Settings
                </h3>
                <p className="text-gray-600">
                  Configure your {activeTab} preferences here.
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-6 flex justify-end"
            >
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage