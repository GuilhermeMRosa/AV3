import { useState, useEffect, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import api from '../services/api'
import type { Etapa, Aeronave } from '../types'
import { Navbar } from '../components/Navbar'
import { BotaoVoltar } from '../components/ui/BotaoVoltar'
import { useAuth } from '../hooks/useAuth'
import { Info } from 'lucide-react'

const statusCor: Record<string, string> = {
  PENDENTE: 'bg-gray-700 text-gray-300',
  ANDAMENTO: 'bg-yellow-900 text-yellow-300',
  CONCLUIDA: 'bg-green-900 text-green-300',
}

export function Etapas() {
  const navigate = useNavigate()
  const { funcionario } = useAuth()
  const [etapas, setEtapas] = useState<Etapa[]>([])
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([])
  const [form, setForm] = useState({ nome: '', prazo: '', aeronaveId: '' })
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [erro, setErro] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const podeEditar = funcionario?.nivel !== 'OPERADOR'

  async function carregar() {
    const [etapasData, aeronavesData] = await Promise.all([api.get('/etapas'), api.get('/aeronaves')])
    setEtapas(etapasData.data)
    setAeronaves(aeronavesData.data)
  }

  useEffect(() => { carregar() }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    try {
      const payload = { ...form, prazo: new Date(form.prazo).toISOString(), aeronaveId: Number(form.aeronaveId) }
      if (editandoId) await api.put(`/etapas/${editandoId}`, payload)
      else await api.post('/etapas', payload)
      setForm({ nome: '', prazo: '', aeronaveId: '' })
      setEditandoId(null)
      setMostrarForm(false)
      carregar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
      setErro(msg ?? 'Erro ao salvar')
    }
  }

  async function mudarStatus(id: number, acao: 'iniciar' | 'concluir') {
    try {
      await api.post(`/etapas/${id}/${acao}`)
      carregar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
      alert(msg ?? 'Erro')
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <BotaoVoltar /><h1 className="text-xl font-bold text-white">Etapas</h1>
            {podeEditar && (
              <button onClick={() => { setMostrarForm(true); setEditandoId(null); setForm({ nome: '', prazo: '', aeronaveId: '' }) }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition">
                + Nova Etapa
              </button>
            )}
          </div>

          {mostrarForm && podeEditar && (
            <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Nome</label>
                <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Prazo</label>
                <input type="datetime-local" value={form.prazo}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setForm({ ...form, prazo: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400 block mb-1">Aeronave</label>
                <select value={form.aeronaveId} onChange={(e) => setForm({ ...form, aeronaveId: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required>
                  <option value="">Selecione...</option>
                  {aeronaves.map(a => <option key={a.id} value={a.id}>{a.modelo} ({a.codigo})</option>)}
                </select>
              </div>
              {erro && <p className="col-span-2 text-red-400 text-sm">{erro}</p>}
              <div className="col-span-2 flex gap-2">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition">
                  {editandoId ? 'Salvar' : 'Criar'}
                </button>
                <button type="button" onClick={() => setMostrarForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-800 text-gray-400 text-xs flex items-center gap-2">
              <Info className="w-3.5 h-3.5 shrink-0" />
              As etapas são executadas na ordem de criação. Uma etapa só pode ser iniciada após a anterior ser concluída.
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 text-gray-400">
                <tr>{['Nome', 'Aeronave', 'Prazo', 'Status', 'Ações'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
              </thead>
              <tbody>
                {etapas.map((e) => {
                  const aeronave = aeronaves.find(a => a.id === e.aeronaveId)
                  return (
                    <tr key={e.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-white">{e.nome}</td>
                      <td className="px-4 py-3 text-gray-400">{aeronave?.modelo ?? '-'}</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(e.prazo).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${statusCor[e.status]}`}>{e.status}</span></td>
                      <td className="px-4 py-3 flex gap-2">
                        {e.status === 'PENDENTE' && (
                          <button onClick={() => mudarStatus(e.id, 'iniciar')} className="text-yellow-400 hover:text-yellow-300 text-xs">Iniciar</button>
                        )}
                        {e.status === 'ANDAMENTO' && (
                          <button onClick={() => mudarStatus(e.id, 'concluir')} className="text-green-400 hover:text-green-300 text-xs">Concluir</button>
                        )}
                        <Link to={`/etapas/${e.id}`} className="text-blue-400 hover:text-blue-300 text-xs">Gerenciar</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}



