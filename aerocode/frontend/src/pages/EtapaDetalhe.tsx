import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import api from '../services/api'
import type { Etapa, Funcionario } from '../types'
import { Navbar } from '../components/Navbar'
import { BotaoVoltar } from '../components/ui/BotaoVoltar'
import { useAuth } from '../hooks/useAuth'

export function EtapaDetalhe() {
  const { id } = useParams()
  const { funcionario: me } = useAuth()
  const [etapa, setEtapa] = useState<Etapa | null>(null)
  const [todos, setTodos] = useState<Funcionario[]>([])
  const [selecionado, setSelecionado] = useState('')
  const [erro, setErro] = useState('')
  const podeEditar = me?.nivel !== 'OPERADOR'

  async function carregar() {
    const [etapaData, funcData] = await Promise.all([api.get(`/etapas/${id}`), api.get('/funcionarios')])
    setEtapa(etapaData.data)
    setTodos(funcData.data)
  }

  useEffect(() => { carregar() }, [id])

  async function adicionar() {
    if (!selecionado) return
    try {
      await api.post(`/etapas/${id}/funcionarios/${selecionado}`)
      setSelecionado('')
      carregar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
      setErro(msg ?? 'Erro')
    }
  }

  async function remover(funcId: number) {
    await api.delete(`/etapas/${id}/funcionarios/${funcId}`)
    carregar()
  }

  async function mudarStatus(acao: 'iniciar' | 'concluir') {
    try {
      await api.post(`/etapas/${id}/${acao}`)
      carregar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
      alert(msg ?? 'Erro')
    }
  }

  if (!etapa) return <><Navbar /><div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">Carregando...</div></>

  const associados = etapa.funcionarios.map(f => f.id)
  const disponiveis = todos.filter(f => !associados.includes(f.id))

  const statusCor: Record<string, string> = {
    PENDENTE: 'bg-gray-700 text-gray-300',
    ANDAMENTO: 'bg-yellow-900 text-yellow-300',
    CONCLUIDA: 'bg-green-900 text-green-300',
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-3xl mx-auto">
          <Link to="/etapas" className="text-gray-500 hover:text-gray-300 text-sm">← Voltar</Link>
          <div className="flex items-center gap-3 mt-2 mb-6">
            <h1 className="text-xl font-bold text-white">{etapa.nome}</h1>
            <span className={`text-xs px-2 py-0.5 rounded ${statusCor[etapa.status]}`}>{etapa.status}</span>
          </div>

          <p className="text-gray-500 text-sm mb-4">Prazo: {new Date(etapa.prazo).toLocaleDateString('pt-BR')}</p>

          <div className="flex gap-3 mb-6">
            {etapa.status === 'PENDENTE' && (
              <button onClick={() => mudarStatus('iniciar')} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm transition">
                Iniciar Etapa
              </button>
            )}
            {etapa.status === 'ANDAMENTO' && (
              <button onClick={() => mudarStatus('concluir')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition">
                Concluir Etapa
              </button>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h2 className="text-white font-semibold mb-4">Funcionários da Etapa</h2>

            {podeEditar && (
              <div className="flex gap-2 mb-4">
                <select value={selecionado} onChange={(e) => setSelecionado(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  <option value="">Selecione um funcionário...</option>
                  {disponiveis.map(f => <option key={f.id} value={f.id}>{f.nome} ({f.nivel})</option>)}
                </select>
                <button onClick={adicionar} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition">
                  Adicionar
                </button>
              </div>
            )}
            {erro && <p className="text-red-400 text-sm mb-3">{erro}</p>}

            {etapa.funcionarios.length === 0 && <p className="text-gray-500 text-sm">Nenhum funcionário associado.</p>}
            <div className="space-y-2">
              {etapa.funcionarios.map(f => (
                <div key={f.id} className="flex justify-between items-center bg-gray-800 rounded p-3">
                  <div>
                    <p className="text-white text-sm">{f.nome}</p>
                    <p className="text-gray-500 text-xs">{f.nivel}</p>
                  </div>
                  {podeEditar && (
                    <button onClick={() => remover(f.id)} className="text-red-400 hover:text-red-300 text-xs">Remover</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

