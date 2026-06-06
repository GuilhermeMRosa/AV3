import { useNavigate } from 'react-router'
import { useState, useEffect, FormEvent } from 'react'
import api from '../services/api'
import type { Peca, Aeronave, TipoPeca, StatusPeca } from '../types'
import { Navbar } from '../components/Navbar'
import { BotaoVoltar } from '../components/ui/BotaoVoltar'
import { useAuth } from '../hooks/useAuth'

const statusCor: Record<StatusPeca, string> = {
  EM_PRODUCAO: 'bg-yellow-900 text-yellow-300',
  EM_TRANSPORTE: 'bg-blue-900 text-blue-300',
  PRONTA: 'bg-green-900 text-green-300',
}

export function Pecas() {
  const navigate = useNavigate()
  const { funcionario } = useAuth()
  const [pecas, setPecas] = useState<Peca[]>([])
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([])
  const [form, setForm] = useState({ nome: '', tipo: 'NACIONAL' as TipoPeca, fornecedor: '', status: 'EM_PRODUCAO' as StatusPeca, aeronaveId: '' })
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [erro, setErro] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const podeEditar = funcionario?.nivel !== 'OPERADOR'

  async function carregar() {
    const [p, a] = await Promise.all([api.get('/pecas'), api.get('/aeronaves')])
    setPecas(p.data)
    setAeronaves(a.data)
  }

  useEffect(() => { carregar() }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    try {
      const payload = { ...form, aeronaveId: Number(form.aeronaveId) }
      if (editandoId) await api.put(`/pecas/${editandoId}`, payload)
      else await api.post('/pecas', payload)
      setForm({ nome: '', tipo: 'NACIONAL', fornecedor: '', status: 'EM_PRODUCAO', aeronaveId: '' })
      setEditandoId(null)
      setMostrarForm(false)
      carregar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
      setErro(msg ?? 'Erro ao salvar')
    }
  }

  async function atualizarStatus(id: number, status: StatusPeca) {
    await api.patch(`/pecas/${id}/status`, { status })
    carregar()
  }

  async function deletar(id: number) {
    if (!confirm('Confirmar exclusão?')) return
    await api.delete(`/pecas/${id}`)
    carregar()
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <BotaoVoltar /><h1 className="text-xl font-bold text-white">Peças</h1>
            {podeEditar && (
              <button onClick={() => { setMostrarForm(true); setEditandoId(null) }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition">
                + Nova Peça
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
                <label className="text-sm text-gray-400 block mb-1">Fornecedor</label>
                <input type="text" value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoPeca })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm">
                  <option value="NACIONAL">Nacional</option>
                  <option value="IMPORTADA">Importada</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StatusPeca })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm">
                  <option value="EM_PRODUCAO">Em Produção</option>
                  <option value="EM_TRANSPORTE">Em Transporte</option>
                  <option value="PRONTA">Pronta</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400 block mb-1">Aeronave</label>
                <select value={form.aeronaveId} onChange={(e) => setForm({ ...form, aeronaveId: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm" required>
                  <option value="">Selecione...</option>
                  {aeronaves.map(a => <option key={a.id} value={a.id}>{a.modelo} ({a.codigo})</option>)}
                </select>
              </div>
              {erro && <p className="col-span-2 text-red-400 text-sm">{erro}</p>}
              <div className="col-span-2 flex gap-2">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition">{editandoId ? 'Salvar' : 'Criar'}</button>
                <button type="button" onClick={() => setMostrarForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition">Cancelar</button>
              </div>
            </form>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-gray-400">
                <tr>{['Nome', 'Tipo', 'Fornecedor', 'Aeronave', 'Status', 'Ações'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
              </thead>
              <tbody>
                {pecas.map((p) => {
                  const aeronave = aeronaves.find(a => a.id === p.aeronaveId)
                  return (
                    <tr key={p.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-white">{p.nome}</td>
                      <td className="px-4 py-3 text-gray-400">{p.tipo}</td>
                      <td className="px-4 py-3 text-gray-400">{p.fornecedor}</td>
                      <td className="px-4 py-3 text-gray-400">{aeronave?.modelo ?? '-'}</td>
                      <td className="px-4 py-3">
                        {p.status === 'PRONTA' ? (
                          <span className="text-xs px-2 py-0.5 rounded bg-green-900 text-green-300">PRONTA</span>
                        ) : (
                          <select value={p.status} onChange={(e) => atualizarStatus(p.id, e.target.value as StatusPeca)}
                            className={`text-xs px-2 py-0.5 rounded border-0 ${statusCor[p.status]} bg-transparent cursor-pointer`}>
                            {p.status === 'EM_PRODUCAO' && <option value="EM_PRODUCAO">EM PRODUÇÃO</option>}
                            {p.status === 'EM_PRODUCAO' && <option value="EM_TRANSPORTE">→ EM TRANSPORTE</option>}
                            {p.status === 'EM_TRANSPORTE' && <option value="EM_TRANSPORTE">EM TRANSPORTE</option>}
                            {p.status === 'EM_TRANSPORTE' && <option value="PRONTA">→ PRONTA</option>}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        {podeEditar && <>
                          <button onClick={() => { setForm({ nome: p.nome, tipo: p.tipo, fornecedor: p.fornecedor, status: p.status, aeronaveId: String(p.aeronaveId) }); setEditandoId(p.id); setMostrarForm(true) }}
                            className="text-blue-400 hover:text-blue-300 text-xs">Editar</button>
                          <button onClick={() => deletar(p.id)} className="text-red-400 hover:text-red-300 text-xs">Excluir</button>
                        </>}
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



