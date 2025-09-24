import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Download, 
  Mail, 
  Train, 
  Gauge, 
  Camera, 
  Zap,
  Shield,
  BarChart3,
  FileText,
  Settings,
  CheckCircle,
  Star
} from 'lucide-react'

const HomePage: React.FC = () => {
  const subsystems = [
    {
      icon: Gauge,
      title: 'Track Geometry',
      description: 'Laser-based measurement of track alignment, gauge, and vertical profile',
      features: ['Lateral alignment', 'Vertical profile', 'Gauge measurement', 'Twist detection']
    },
    {
      icon: Camera,
      title: 'Rail Profile',
      description: 'High-resolution laser scanning for rail wear and profile analysis',
      features: ['Rail wear measurement', 'Profile analysis', 'Defect detection', 'Quality assessment']
    },
    {
      icon: Zap,
      title: 'Accelerometers',
      description: 'Axle box accelerometers for dynamic track condition monitoring',
      features: ['Vibration analysis', 'Impact detection', 'Ride quality', 'Dynamic forces']
    },
    {
      icon: Shield,
      title: 'SOD/MMD Scanning',
      description: 'LIDAR-based scanning for overhead structures and clearances',
      features: ['Clearance measurement', 'Structure monitoring', 'Obstruction detection', 'Safety compliance']
    },
    {
      icon: Camera,
      title: 'Condition Video',
      description: 'Front-facing camera with AI-powered defect recognition',
      features: ['Real-time monitoring', 'AI defect detection', 'Image analysis', 'Evidence capture']
    },
    {
      icon: BarChart3,
      title: 'Rear Video',
      description: 'Rear-facing camera for comprehensive track documentation',
      features: ['Documentation', 'Post-inspection review', 'Quality assurance', 'Historical records']
    }
  ]

  const features = [
    {
      icon: CheckCircle,
      title: 'EN 13848-2 Compliant',
      description: 'Meets international railway standards for track geometry measurement'
    },
    {
      icon: Star,
      title: 'High-Speed Operation',
      description: 'Designed for operation at speeds up to 200 km/h'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Live data processing and immediate defect detection'
    },
    {
      icon: Settings,
      title: 'Modular Design',
      description: 'Scalable from prototype to production-grade systems'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Integrated Track
              <br />
              <span className="text-yellow-300">Monitoring System</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto"
            >
              Advanced railway track inspection and monitoring system with real-time data acquisition, 
              AI-powered defect detection, and comprehensive analytics.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/dashboard" className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100">
                <BarChart3 className="h-5 w-5 mr-2" />
                View Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              
              <button className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600">
                <Download className="h-5 w-5 mr-2" />
                Download Proposal
              </button>
              
              <button className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600">
                <Mail className="h-5 w-5 mr-2" />
                Contact Us
              </button>
            </motion.div>
          </motion.div>
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
          className="absolute top-20 left-10 hidden lg:block"
        >
          <Train className="h-16 w-16 text-yellow-300 opacity-20" />
        </motion.div>
        
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
          className="absolute bottom-20 right-10 hidden lg:block"
        >
          <Gauge className="h-12 w-12 text-yellow-300 opacity-20" />
        </motion.div>
      </section>

      {/* What is ITMS Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              What is ITMS?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The Integrated Track Monitoring System (ITMS) is a comprehensive railway inspection 
              solution that combines multiple sensor technologies to provide real-time track condition 
              assessment and predictive maintenance capabilities.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center p-6"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Subsystems Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              ITMS Subsystems
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Six specialized subsystems working together to provide comprehensive track monitoring
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {subsystems.map((subsystem, index) => {
              const Icon = subsystem.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="card hover:shadow-medium transition-shadow duration-300"
                >
                  <div className="card-body">
                    <div className="flex items-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mr-4">
                        <Icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {subsystem.title}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {subsystem.description}
                    </p>
                    
                    <ul className="space-y-2">
                      {subsystem.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-500">
                          <CheckCircle className="h-4 w-4 text-success-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Specifications Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              System Specifications
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              High-performance specifications designed for railway applications
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { label: 'Sampling Rate', value: '200 Hz', description: 'High-frequency data acquisition' },
              { label: 'Positional Accuracy', value: '±1mm', description: 'Precise track geometry measurement' },
              { label: 'Train Speed', value: '200 km/h', description: 'High-speed operation capability' },
              { label: 'Standards Compliance', value: 'EN 13848-2', description: 'International railway standards' }
            ].map((spec, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center p-6 bg-gray-50 rounded-lg"
              >
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {spec.value}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {spec.label}
                </div>
                <div className="text-sm text-gray-600">
                  {spec.description}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Track Monitoring?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Get started with ITMS today and experience the future of railway track inspection
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard" className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100">
                <BarChart3 className="h-5 w-5 mr-2" />
                Explore Dashboard
              </Link>
              <button className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600">
                <FileText className="h-5 w-5 mr-2" />
                Download Whitepaper
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
