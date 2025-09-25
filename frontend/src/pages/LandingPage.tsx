import React from 'react'
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
  Eye,
  CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: MapPin,
      title: "Real-time GPS Tracking",
      description: "Precise location tracking with centimeter accuracy using advanced GPS technology"
    },
    {
      icon: Activity,
      title: "Live Monitoring",
      description: "Continuous track condition assessment with real-time data streaming"
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Advanced safety protocols with immediate alert systems for critical issues"
    },
    {
      icon: Camera,
      title: "AI-Powered Vision",
      description: "Computer vision algorithms for automated defect detection and analysis"
    },
    {
      icon: Zap,
      title: "High-Speed Processing",
      description: "Real-time data processing with sub-second response times"
    },
    {
      icon: Target,
      title: "Precision Measurement",
      description: "Accurate gauge measurement and track geometry analysis"
    }
  ]

  const stats = [
    { label: "Track Monitored", value: "2,500+ km", icon: MapPin },
    { label: "Defects Detected", value: "15,000+", icon: Shield },
    { label: "Accuracy Rate", value: "99.8%", icon: Target },
    { label: "Response Time", value: "< 100ms", icon: Zap }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">ITMS</h1>
          </div>
          <div className="hidden md:flex space-x-6">
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Dashboard</Link>
            <Link to="/analytics" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Analytics</Link>
            <Link to="/reports" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Reports</Link>
            <Link to="/settings" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Settings</Link>
          </div>
          <div className="md:hidden">
            <Link to="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
        {/* Animated blur circles */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-400 opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-indigo-500 opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-500 opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight"
          >
            Intelligent Train Monitoring System
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl max-w-3xl mx-auto mb-10 text-blue-100"
          >
            Indigenous contactless railway track monitoring with real-time GPS tracking, 
            AI-powered analysis, and comprehensive safety features.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-12"
          >
            <Link to="/dashboard" className="px-6 py-3 bg-white text-blue-700 rounded-lg font-medium hover:bg-gray-100 transition-all hover:scale-105 flex items-center justify-center shadow-lg backdrop-blur-sm bg-opacity-90">
              <Play size={20} className="mr-2" />
              View Dashboard
              <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link to="/analytics" className="px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-950 transition-all hover:scale-105 flex items-center justify-center shadow-lg backdrop-blur-sm bg-opacity-80">
              <Eye size={20} className="mr-2" />
              View Analytics
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Advanced Monitoring Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Our system provides comprehensive monitoring capabilities with cutting-edge technology</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="text-blue-600" size={28} />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Ready to experience advanced train monitoring?</h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-8">Get started with our intelligent monitoring system today and enhance railway safety</p>
          <Link to="/dashboard" className="inline-flex items-center px-6 py-3 bg-white text-blue-700 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg">
            Get Started
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>
      <section className="p-6 bg-white">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="test-title">
              Advanced Track Monitoring Technology
            </h2>
            <p className="test-text" style={{ fontSize: '1.125rem', maxWidth: '768px', margin: '0 auto' }}>
              Our indigenous contactless track monitoring system combines cutting-edge sensors, 
              AI-powered analysis, and real-time data processing to ensure railway safety and efficiency.
            </p>
          </div>

          <div className="grid grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="test-card text-center">
                <div className="flex justify-center mb-4">
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    backgroundColor: '#3b82f6', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <feature.icon size={32} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="test-text">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="p-6" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="test-title">System Performance</h2>
            <p className="test-text" style={{ fontSize: '1.125rem' }}>
              Real-time statistics showcasing our system's reliability and performance
            </p>
          </div>

          <div className="grid grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="test-card text-center">
                <div className="flex justify-center mb-4">
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: '#10b981', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <stat.icon size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="p-6 bg-white">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="test-title">Interactive Track Map</h2>
            <p className="test-text" style={{ fontSize: '1.125rem' }}>
              Real-time GPS tracking and defect visualization on our interactive map interface
            </p>
          </div>
          
          <div className="test-card" style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="text-center">
              <MapPin size={64} style={{ color: '#3b82f6', margin: '0 auto 16px' }} />
              <h3 className="text-xl font-semibold mb-4">Interactive Map Coming Soon</h3>
              <p className="test-text">Real-time GPS tracking and defect visualization will be available here.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-6" style={{ backgroundColor: '#1f2937', color: 'white' }}>
        <div className="container text-center">
          <p>&copy; 2024 ITMS - Integrated Track Monitoring System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage