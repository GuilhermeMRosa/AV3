import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { RotaProtegida } from './components/RotaProtegida'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Funcionarios } from './pages/Funcionarios'
import { Aeronaves } from './pages/Aeronaves'
import { AeronaveDetalhe } from './pages/AeronaveDetalhe'
import { Pecas } from './pages/Pecas'
import { Etapas } from './pages/Etapas'
import { EtapaDetalhe } from './pages/EtapaDetalhe'
import { Testes } from './pages/Testes'
import { Relatorios } from './pages/Relatorios'
import { RelatorioDetalhe } from './pages/RelatorioDetalhe'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<RotaProtegida><Dashboard /></RotaProtegida>} />
          <Route path="/aeronaves" element={<RotaProtegida><Aeronaves /></RotaProtegida>} />
          <Route path="/aeronaves/:id" element={<RotaProtegida><AeronaveDetalhe /></RotaProtegida>} />
          <Route path="/pecas" element={<RotaProtegida><Pecas /></RotaProtegida>} />
          <Route path="/etapas" element={<RotaProtegida><Etapas /></RotaProtegida>} />
          <Route path="/etapas/:id" element={<RotaProtegida><EtapaDetalhe /></RotaProtegida>} />
          <Route path="/testes" element={<RotaProtegida><Testes /></RotaProtegida>} />
          <Route path="/relatorios" element={<RotaProtegida><Relatorios /></RotaProtegida>} />
          <Route path="/relatorios/:id" element={<RotaProtegida><RelatorioDetalhe /></RotaProtegida>} />
          <Route path="/funcionarios" element={<RotaProtegida niveis={['ADMINISTRADOR']}><Funcionarios /></RotaProtegida>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
