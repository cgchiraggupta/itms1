import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Menu, 
  X, 
  MapPin, 
  BarChart3, 
  FileText, 
  Settings,
  Train,
  Bell
} from 'lucide-react'

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: MapPin },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-md'}`}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}>
          <Link to="/" className="flex items-center">
            <Train size={32} className="text-blue-600 mr-3" />
            <span className="text-2xl font-bold text-blue-600 tracking-tight">ITMS</span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navigation.map((item, index) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 hover:bg-blue-50 ${
                    isActive 
                      ? 'text-blue-600 font-medium bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <Icon size={18} className="mr-2" />
                  {item.name}
                </Link>
              </motion.div>
            )
          })}
          
          {/* Notification button */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full hover:bg-gray-100 relative"
          >
            <Bell size={20} className="text-gray-600" />
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"
            ></motion.span>
          </motion.button>
        </div>

        {/* Mobile menu button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
        </motion.button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100"
        >
          <div className="container mx-auto px-4 py-2">
            {navigation.map((item, index) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <Link
                    to={item.href}
                    className={`flex items-center py-3 px-4 rounded-lg my-1 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon size={18} className="mr-3" />
                    {item.name}
                  </Link>
                </motion.div>
              )
            })}
          </div>
         </motion.div>
       )}
    </motion.nav>
  )
}

export default Navbar