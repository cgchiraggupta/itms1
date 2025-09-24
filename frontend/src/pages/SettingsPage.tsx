import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('system')
  const [systemSettings, setSystemSettings] = useState({
    sampleRate: 1000,
    cameraTriggerInterval: 100,
    dataRetentionDays: 30,
    vibrationThreshold: 2.0,
    speedThreshold: 200,
    gaugeTolerance: 0.02
  })

  const [userSettings, setUserSettings] = useState({
    username: 'admin',
    email: 'admin@itms.com',
    notifications: {
      email: true,
      sms: true,
      push: false
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }, 1000)
  }

  const tabs = [
    { id: 'system', name: 'System', icon: Settings },
    { id: 'user', name: 'User', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'data', name: 'Data', icon: Database }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Configure system parameters and user preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="card p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>
          </motion.div>

          {/* Settings Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="card p-6">
              {/* System Settings */}
              {activeTab === 'system' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">System Settings</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sample Rate (Hz)
                        </label>
                        <input
                          type="number"
                          value={systemSettings.sampleRate}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            sampleRate: parseInt(e.target.value)
                          }))}
                          className="form-input"
                          min="100"
                          max="10000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Camera Trigger Interval
                        </label>
                        <input
                          type="number"
                          value={systemSettings.cameraTriggerInterval}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            cameraTriggerInterval: parseInt(e.target.value)
                          }))}
                          className="form-input"
                          min="1"
                          max="1000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data Retention (days)
                        </label>
                        <input
                          type="number"
                          value={systemSettings.dataRetentionDays}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            dataRetentionDays: parseInt(e.target.value)
                          }))}
                          className="form-input"
                          min="1"
                          max="365"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vibration Threshold (g)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={systemSettings.vibrationThreshold}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            vibrationThreshold: parseFloat(e.target.value)
                          }))}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Speed Threshold (km/h)
                        </label>
                        <input
                          type="number"
                          value={systemSettings.speedThreshold}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            speedThreshold: parseInt(e.target.value)
                          }))}
                          className="form-input"
                          step="10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gauge Tolerance (m)
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={systemSettings.gaugeTolerance}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            gaugeTolerance: parseFloat(e.target.value)
                          }))}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* User Settings */}
              {activeTab === 'user' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">User Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={userSettings.username}
                        onChange={(e) => setUserSettings(prev => ({
                          ...prev,
                          username: e.target.value
                        }))}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={userSettings.email}
                        onChange={(e) => setUserSettings(prev => ({
                          ...prev,
                          email: e.target.value
                        }))}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <select className="form-input">
                        <option value="admin">Administrator</option>
                        <option value="operator">Operator</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Alert Types</h4>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={userSettings.notifications.email}
                            onChange={(e) => setUserSettings(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                email: e.target.checked
                              }
                            }))}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Email Alerts</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={userSettings.notifications.sms}
                            onChange={(e) => setUserSettings(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                sms: e.target.checked
                              }
                            }))}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">SMS Alerts</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={userSettings.notifications.push}
                            onChange={(e) => setUserSettings(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                push: e.target.checked
                              }
                            }))}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Push Notifications</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Alert Thresholds</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Critical Defects
                          </label>
                          <input type="number" className="form-input" defaultValue="1" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            High Vibration
                          </label>
                          <input type="number" step="0.1" className="form-input" defaultValue="2.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input type="password" className="form-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input type="password" className="form-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input type="password" className="form-input" />
                    </div>
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Enable 2FA</p>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                        <button className="btn btn-secondary btn-sm">Enable</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data */}
              {activeTab === 'data' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Management</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Data Cleanup</h4>
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Cleanup Recommended</p>
                            <p className="text-sm text-yellow-700 mt-1">
                              You have 2.3 GB of old data that can be archived or deleted.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Backup Settings</h4>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600" defaultChecked />
                          <span className="ml-2 text-sm text-gray-700">Automatic daily backups</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600" />
                          <span className="ml-2 text-sm text-gray-700">Cloud backup</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Data Export</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="btn btn-secondary">Export All Data</button>
                        <button className="btn btn-secondary">Export Defects</button>
                        <button className="btn btn-secondary">Export Measurements</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {saveStatus === 'success' && (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600">Settings saved successfully</span>
                      </>
                    )}
                    {saveStatus === 'error' && (
                      <>
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <span className="text-sm text-red-600">Failed to save settings</span>
                      </>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button className="btn btn-secondary">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="btn btn-primary"
                    >
                      {isSaving ? (
                        <>
                          <div className="loading-spinner w-4 h-4 mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Settings
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
