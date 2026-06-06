import { useState, useEffect, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import api from '../services/api'
import type { Aeronave, TipoAeronave } from '../types'
import { Navbar } from '../components/Navbar'
import { BotaoVoltar } from '../components/ui/BotaoVoltar'
import { useAuth } from '../hooks/useAuth'

export function Aeronaves() {
  const navigate = useNavigate()
  const { funcionario } = useAuth()
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([])
  const [form, setForm] = useState({ codigo: '', modelo: '', tipo: 'COMERCIAL' as TipoAeronave, capacidade: '', alcance: '' })
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [erro, setErro] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const podeEditar = funcionario?.nivel !== 'OPERADOR'

  async function carregar() {
    const { data } = await api.get('/aeronaves')
    setAeronaves(data)
  }

  useEffect(() => { carregar() }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    try {
      const payload = { ...form, capacidade: Number(form.capacidade), alcance: Number(form.alcance) }
      if (editandoId) await api.put(`/aeronaves/${editandoId}`, payload)
      else await api.post('/aeronaves', payload)
      setForm({ codigo: '', modelo: '', tipo: 'COMERCIAL', capacidade: '', alcance: '' })
      setEditandoId(null)
      setMostrarForm(false)
      carregar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
      setErro(msg ?? 'Erro ao salvar')
    }
  }

  function editar(a: Aeronave) {
    setForm({ codigo: a.codigo, modelo: a.modelo, tipo: a.tipo, capacidade: String(a.capacidade), alcance: String(a.alcance) })
    setEditandoId(a.id)
    setMostrarForm(true)
  }

  async function deletar(id: number) {
    if (!confirm('Confirmar exclusão?')) return
    try { await api.delete(`/aeronaves/${id}`); carregar() }
    catch (err: unknown) {
      const msg = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
      alert(msg ?? 'Erro ao excluir')
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <BotaoVoltar /><h1 className="text-xl font-bold text-white">Aeronaves</h1>
            {podeEditar && (
              <button onClick={() => { setMostrarForm(true); setEditandoId(null); setForm({ codigo: '', modelo: '', tipo: 'COMERCIAL', capacidade: '', alcance: '' }) }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition">
                + Nova Aeronave
              </button>
            )}
          </div>

          {mostrarForm && podeEditar && (
            <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Código', key: 'codigo', type: 'text' },
                { label: 'Modelo', key: 'modelo', type: 'text' },
                { label: 'Capacidade (passageiros)', key: 'capacidade', type: 'number' },
                { label: 'Alcance (km)', key: 'alcance', type: 'number' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-sm text-gray-400 block mb-1">{label}</label>
                  <input type={type} value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    required />
                </div>
              ))}
              <div>
                <label className="text-sm text-gray-400 block mb-1">Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoAeronave })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  <option value="COMERCIAL">Comercial</option>
                  <option value="MILITAR">Militar</option>
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

          <div className="grid gap-4">
            {aeronaves.map((a) => (
              <div key={a.id} className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-semibold">{a.modelo}</span>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{a.codigo}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${a.tipo === 'COMERCIAL' ? 'bg-blue-900 text-blue-300' : 'bg-red-900 text-red-300'}`}>{a.tipo}</span>
                  </div>
                  <p className="text-gray-500 text-sm">Capacidade: {a.capacidade} · Alcance: {a.alcance} km</p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/aeronaves/${a.id}`} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm transition">
                    Ver Detalhes
                  </Link>
                  {podeEditar && <>
                    <button onClick={() => editar(a)} className="text-blue-400 hover:text-blue-300 text-sm">Editar</button>
                    <button onClick={() => deletar(a.id)} className="text-red-400 hover:text-red-300 text-sm">Excluir</button>
                  </>}
                </div>
              </div>
            ))}
            {aeronaves.length === 0 && <p className="text-gray-500 text-sm">Nenhuma aeronave cadastrada.</p>}
          </div>
        </div>
      </div>
    </>
  )
}



