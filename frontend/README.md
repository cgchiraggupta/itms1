# ITMS Frontend - Integrated Track Monitoring System

A modern, mobile-responsive React application for railway track monitoring with real-time GPS tracking, AI-powered analysis, and comprehensive safety features.

## 🚀 Features

- **Real-time GPS Tracking** - Precise location tracking with centimeter accuracy
- **Interactive Maps** - Advanced coordinate finder with satellite and street views
- **Live Monitoring** - Continuous track condition assessment
- **AI-Powered Analysis** - Automatic defect detection and analysis
- **Mobile Responsive** - Optimized for all device sizes
- **Modern UI/UX** - Beautiful animations and professional design
- **Real-time Data** - WebSocket integration for live updates

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Leaflet** - Interactive maps
- **Recharts** - Data visualization
- **Lucide React** - Beautiful icons

## 📱 Mobile Compatibility

- Fully responsive design
- Touch-friendly interface
- Optimized for mobile performance
- Progressive Web App ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

The project includes `vercel.json` configuration for optimal deployment.

### Other Platforms

The build output in `dist/` can be deployed to any static hosting service:
- Netlify
- GitHub Pages
- AWS S3
- Firebase Hosting

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation component
│   ├── Footer.tsx      # Footer component
│   ├── HeroSection.tsx # Landing page hero
│   ├── EnhancedGPSMap.tsx # Interactive map
│   └── LoadingSpinner.tsx # Loading component
├── pages/              # Page components
│   ├── LandingPage.tsx # Home page
│   ├── DashboardPage.tsx # Main dashboard
│   ├── AnalyticsPage.tsx # Analytics & charts
│   ├── ReportsPage.tsx # Reports & documentation
│   └── SettingsPage.tsx # System settings
├── App.tsx             # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

## 🎨 Design System

- **Colors**: Blue primary theme with railway-inspired colors
- **Typography**: Clean, readable fonts
- **Spacing**: Consistent spacing scale
- **Components**: Reusable, accessible components
- **Animations**: Smooth, purposeful animations

## 📊 Performance

- **Bundle Size**: Optimized with code splitting
- **Loading**: Fast initial load with lazy loading
- **Mobile**: Optimized for mobile performance
- **SEO**: Meta tags and semantic HTML

## 🔧 Configuration

### Environment Variables

Create a `.env` file for environment-specific settings:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

### Build Configuration

The project uses Vite for building. Configuration can be customized in `vite.config.js`.

## 📱 Mobile Features

- **Responsive Navigation** - Collapsible mobile menu
- **Touch Gestures** - Swipe and touch interactions
- **Mobile Maps** - Optimized map controls for mobile
- **Fast Loading** - Optimized for mobile networks
- **PWA Ready** - Can be installed as a mobile app

## 🚂 Railway Integration

- **GPS Tracking** - Real-time location monitoring
- **Defect Detection** - AI-powered track analysis
- **Safety Alerts** - Immediate notification system
- **Data Export** - Comprehensive reporting
- **Multi-language** - Support for regional languages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the ITMS (Integrated Track Monitoring System) for Indian Railways.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for Indian Railways**
