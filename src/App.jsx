import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './LandingPage'
import Dashboard from './pages/Dashboard'
import MicroservicesAgents from './pages/MicroservicesAgents'
import PatientContextPage from './pages/PatientContextPage'
import DiagnosisAgent from "./pages/DiagnosisAgent"

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/microservices" element={<MicroservicesAgents />} />
      <Route path="/dashboard/microservices/patient-context" element={<PatientContextPage />} />
      <Route path="/dashboard/microservices/diagnosis-agent" element={<DiagnosisAgent />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App