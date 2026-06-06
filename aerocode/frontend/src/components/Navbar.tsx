import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { Plane, LogOut } from 'lucide-react'

export function Navbar() {
  const { funcionario, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const nivelLabel: Record<string, string> = {
    ADMINISTRADOR: 'Administrador',
    ENGENHEIRO: 'Engenheiro',
    OPERADOR: 'Operador',
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/dashboard" className="flex items-center gap-2 text-blue-400 font-bold text-lg tracking-wide">
          <Plane className="w-5 h-5" />
          AEROCODE
        </Link>
        <div className="flex gap-4 text-sm text-gray-400">
          <Link to="/aeronaves" className="hover:text-white transition">Aeronaves</Link>
          {(funcionario?.nivel === 'ADMINISTRADOR' || funcionario?.nivel === 'ENGENHEIRO') && (
            <>
              <Link to="/pecas" className="hover:text-white transition">Peças</Link>
              <Link to="/etapas" className="hover:text-white transition">Etapas</Link>
              <Link to="/testes" className="hover:text-white transition">Testes</Link>
              <Link to="/relatorios" className="hover:text-white transition">Relatórios</Link>
            </>
          )}
          {funcionario?.nivel === 'ADMINISTRADOR' && (
            <Link to="/funcionarios" className="hover:text-white transition">Funcionários</Link>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-400">
          {funcionario?.nome} · <span className="text-blue-400">{nivelLabel[funcionario?.nivel ?? 'OPERADOR']}</span>
        </span>
        <button
          onClick={handleLogout}
          title="Sair"
          className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </button>
      </div>
    </nav>
  )
}
