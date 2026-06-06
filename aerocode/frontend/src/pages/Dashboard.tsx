import { useAuth } from '../hooks/useAuth'
import { AdminAviso } from '../components/AdminAviso'
import { Link, useNavigate } from 'react-router'
import { Plane, Wrench, ClipboardList, FlaskConical, FileText, Users, LogOut } from 'lucide-react'

export function Dashboard() {
  const { funcionario, logout } = useAuth()
  const navigate = useNavigate()

  const nivelLabel: Record<string, string> = {
    ADMINISTRADOR: 'Administrador',
    ENGENHEIRO: 'Engenheiro',
    OPERADOR: 'Operador',
  }

  const nivelCor: Record<string, string> = {
    ADMINISTRADOR: 'bg-purple-900 text-purple-300',
    ENGENHEIRO: 'bg-blue-900 text-blue-300',
    OPERADOR: 'bg-gray-700 text-gray-300',
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const cards = [
    { titulo: 'Aeronaves', descricao: 'Gerencie as aeronaves em produção', link: '/aeronaves', icone: Plane, sempre: true },
    { titulo: 'Peças', descricao: 'Controle de peças e status de produção', link: '/pecas', icone: Wrench, sempre: false },
    { titulo: 'Etapas', descricao: 'Fluxo de produção por etapas', link: '/etapas', icone: ClipboardList, sempre: false },
    { titulo: 'Testes', descricao: 'Registro de testes realizados', link: '/testes', icone: FlaskConical, sempre: false },
    { titulo: 'Relatórios', descricao: 'Relatórios de entrega final', link: '/relatorios', icone: FileText, sempre: false },
    { titulo: 'Funcionários', descricao: 'Gestão de usuários do sistema', link: '/funcionarios', icone: Users, admin: true },
  ]

  const nivel = funcionario?.nivel ?? 'OPERADOR'

  return (
    <>
      <AdminAviso />

      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plane className="text-blue-400 w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">AEROCODE</h1>
                <p className="text-gray-500 text-xs mt-0.5">Sistema de Gestão de Produção de Aeronaves</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-semibold text-sm">{funcionario?.nome}</p>
                <span className={`text-xs px-2 py-0.5 rounded mt-0.5 inline-block ${nivelCor[nivel]}`}>
                  {nivelLabel[nivel]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sair"
                className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-2 rounded transition text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Bem-vindo, {funcionario?.nome?.split(' ')[0]}</h2>
            <p className="text-gray-500 text-sm mt-1">Selecione um módulo para continuar</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => {
              if (card.admin && nivel !== 'ADMINISTRADOR') return null
              if (!card.sempre && nivel === 'OPERADOR' && !['Etapas', 'Testes'].includes(card.titulo)) return null
              const Icone = card.icone
              return (
                <Link
                  key={card.link}
                  to={card.link}
                  className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-lg p-5 transition group"
                >
                  <Icone className="w-6 h-6 text-blue-400 mb-3" />
                  <h2 className="text-white font-semibold group-hover:text-blue-400 transition">{card.titulo}</h2>
                  <p className="text-gray-500 text-sm mt-1">{card.descricao}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
