import React from 'react'
import { motion } from 'framer-motion'
import HeroSection from '../components/HeroSection'
import EnhancedGPSMap from '../components/EnhancedGPSMap'
import { 
  MapPin, 
  Activity, 
  Shield, 
  Camera,
  Zap,
  Target,
  CheckCircle,
  ArrowRight,
  Play,
  Eye
} from 'lucide-react'

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: MapPin,
      title: "Real-time GPS Tracking",
      description: "Precise location tracking with centimeter accuracy using advanced GPS technology",
      color: "blue"
    },
    {
      icon: Activity,
      title: "Live Monitoring",
      description: "Continuous track condition assessment with real-time data streaming",
      color: "green"
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Proactive defect detection and alerts to ensure railway safety",
      color: "red"
    },
    {
      icon: Camera,
      title: "AI-Powered Vision",
      description: "Advanced computer vision for automatic defect detection and analysis",
      color: "purple"
    },
    {
      icon: Zap,
      title: "High-Speed Processing",
      description: "Real-time data processing and analysis for immediate insights",
      color: "yellow"
    },
    {
      icon: Target,
      title: "Precision Measurement",
      description: "Accurate gauge measurement and track geometry analysis",
      color: "orange"
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
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Advanced <span className="text-blue-600">Track Monitoring</span> Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our indigenous contactless track monitoring system combines cutting-edge sensors, 
              AI-powered analysis, and real-time data processing to ensure railway safety and efficiency.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
                >
                  <div className={`w-16 h-16 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Proven Results
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Our system has been successfully deployed across multiple railway networks, 
              delivering exceptional performance and reliability.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-blue-100 text-lg">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Interactive <span className="text-blue-600">Demo</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience our advanced track monitoring system with real-time GPS tracking, 
              satellite imagery, and coordinate finding capabilities.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <EnhancedGPSMap
              gpsData={{
                latitude: 28.6139,
                longitude: 77.2090,
                altitude: 216.0,
                accuracy: 3.0,
                speed: 45.5,
                heading: 120.0,
                timestamp: new Date().toISOString(),
                chainage: 1250.5
              }}
              defects={[
                {
                  location: 1200,
                  defect_type: "gauge_anomaly",
                  severity: 2,
                  gps_lat: 28.6140,
                  gps_lng: 77.2091
                },
                {
                  location: 1300,
                  defect_type: "rail_wear",
                  severity: 3,
                  gps_lat: 28.6142,
                  gps_lng: 77.2093
                }
              ]}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center group">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Try Live Demo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center group">
                <Eye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                View Dashboard
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-yellow-500">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Railway Safety?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join the future of railway track monitoring with our advanced, 
              indigenous contactless system designed for Indian Railways.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-white hover:bg-gray-100 text-orange-600 px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center group">
                <CheckCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center group">
                <Eye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Learn More
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
