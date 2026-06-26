import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Background from './components/Background'
import Cursor from './components/Cursor'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Validate from './pages/Validate'
import Report from './pages/Report'
import DNA from './pages/DNA'
import Network from './pages/Network'
import Investors from './pages/Investors'
import TimelinePage from './pages/Timeline'
import LaunchKit from './pages/LaunchKit'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/validate" element={<Validate />} />
        <Route path="/report/:id" element={<Report />} />
        <Route path="/dna" element={<DNA />} />
        <Route path="/network" element={<Network />} />
        <Route path="/investors/:reportId" element={<Investors />} />
        <Route path="/timeline/:reportId" element={<TimelinePage />} />
        <Route path="/launchkit/:reportId" element={<LaunchKit />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <>
      <Background />
      <Cursor />
      <Navbar />
      <AnimatedRoutes />
    </>
  )
}
