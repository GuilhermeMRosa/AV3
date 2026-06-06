import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { Modal } from '../components/ui/Modal'
import { Plane } from 'lucide-react'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mostrarAviso, setMostrarAviso] = useState(() => {
    return localStorage.getItem('aviso_inicial_dispensado') !== 'true'
  })

  function dispensarAviso() {
    localStorage.setItem('aviso_inicial_dispensado', 'true')
    setMostrarAviso(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await login(usuario, senha)
      navigate('/dashboard')
    } catch {
      setErro('Usuário ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      {mostrarAviso && (
        <Modal titulo="Primeiro acesso ao sistema" onClose={dispensarAviso} tipo="aviso">
          <p>Bem-vindo ao <strong className="text-white">Aerocode</strong>! Um usuário administrador padrão foi criado para o primeiro acesso:</p>
          <div className="bg-gray-800 rounded p-3 my-2 font-mono text-xs">
            <p>Usuário: <span className="text-yellow-400">admin</span></p>
            <p>Senha: <span className="text-yellow-400">admin123</span></p>
          </div>
          <p className="text-yellow-400 font-semibold">Altere a senha após o primeiro login.</p>
          <p>Esta conta não deve ser utilizada em produção. Crie um novo administrador e atualize as credenciais imediatamente.</p>
        </Modal>
      )}
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Plane className="w-10 h-10 text-blue-400 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-white tracking-wide">AEROCODE</h1>
            <p className="text-gray-500 text-sm mt-1">Sistema de Gestão de Produção</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg border border-gray-800 p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Usuário</label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="seu.usuario"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="••••••"
                required
              />
            </div>

            {erro && (
              <div className="bg-red-950/40 border border-red-800 rounded px-3 py-2">
                <p className="text-red-400 text-sm">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 rounded transition"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
