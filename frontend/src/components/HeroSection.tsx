import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  MapPin, 
  Activity, 
  Shield, 
  Camera, 
  Zap, 
  Target,
  ArrowRight,
  Play,
  Eye
} from 'lucide-react'

const HeroSection: React.FC = () => {
  const features = [
    { icon: MapPin, text: 'Real-time GPS Tracking' },
    { icon: Activity, text: 'Live Monitoring' },
    { icon: Shield, text: 'Safety First' },
    { icon: Camera, text: 'AI-Powered Vision' },
    { icon: Zap, text: 'High-Speed Processing' },
    { icon: Target, text: 'Precision Measurement' }
  ]

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-blue-800/10"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Advanced{' '}
              <span className="text-yellow-400">Track Monitoring</span>{' '}
              System
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              Indigenous contactless railway track monitoring with real-time GPS tracking, 
              AI-powered analysis, and comprehensive safety features.
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{feature.text}</span>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                View Dashboard
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/analytics"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg border border-white/30 hover:border-white/50 transition-all duration-300 group backdrop-blur-sm"
              >
                <Eye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                View Analytics
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Content - Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 gap-6"
          >
            {[
              { label: 'Track Monitored', value: '2,500+ km', color: 'bg-yellow-500' },
              { label: 'Defects Detected', value: '15,000+', color: 'bg-red-500' },
              { label: 'Accuracy Rate', value: '99.8%', color: 'bg-green-500' },
              { label: 'Response Time', value: '< 100ms', color: 'bg-blue-500' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20"
              >
                <div className={`w-12 h-12 ${stat.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{stat.value}</span>
                </div>
                <p className="text-blue-100 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 right-20 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl hidden lg:block"
      />
      
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-20 left-20 w-16 h-16 bg-white/20 rounded-full blur-xl hidden lg:block"
      />
    </section>
  )
}

export default HeroSection