import React from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { ArrowDown, Play, Eye, Wrench, MapPin, Activity, Shield } from 'lucide-react'

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with Railway Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-orange-600">
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Animated Railway Track Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-0 w-full h-1 bg-white transform -skew-y-1"></div>
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white transform skew-y-1"></div>
          <div className="absolute top-3/4 left-0 w-full h-1 bg-white transform -skew-y-1"></div>
        </div>
      </div>
      
      {/* Animated Overlay Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 left-10 w-2 h-2 bg-orange-400 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-3 h-3 bg-blue-400 rounded-full"
          animate={{ 
            y: [-10, 10, -10],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-32 left-20 w-2 h-2 bg-orange-400 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            <span className="drop-shadow-2xl">Indigenous Contactless</span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-2xl">
              Track Monitoring
            </span>
          </h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Smart, Contactless, Real-Time Railway Track Monitoring System
            <br />
            <span className="text-orange-300 font-semibold">Built for Indian Railways</span>
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <Eye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              View Prototype
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-blue-900 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Try Demo
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-blue-900 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <Wrench className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Explore Features
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Feature Highlights */}
        <motion.div 
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Real-time GPS</h3>
            <p className="text-white/80 text-sm">Precise location tracking with centimeter accuracy</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Live Monitoring</h3>
            <p className="text-white/80 text-sm">Continuous track condition assessment</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Safety First</h3>
            <p className="text-white/80 text-sm">Proactive defect detection and alerts</p>
          </div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-6 h-6 text-white/70" />
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
