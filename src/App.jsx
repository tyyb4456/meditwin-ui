import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './LandingPage'
import Dashboard from './components/pages/Dashboard'
import MicroservicesAgents from './components/pages/MicroservicesAgents'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/microservices" element={<MicroservicesAgents />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App