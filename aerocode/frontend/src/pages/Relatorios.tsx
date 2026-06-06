import { useState, useEffect, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import api from '../services/api'
import type { Relatorio, Aeronave } from '../types'
import { Navbar } from '../components/Navbar'
import { BotaoVoltar } from '../components/ui/BotaoVoltar'
import { useAuth } from '../hooks/useAuth'

export function Relatorios() {
  const navigate = useNavigate()
  const { funcionario } = useAuth()
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([])
  const [form, setForm] = useState({ aeronaveId: '', nomeCliente: '', dataEntrega: '' })
  const [erro, setErro] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const podeGerar = funcionario?.nivel !== 'OPERADOR'

  async function carregar() {
    const [r, a] = await Promise.all([api.get('/relatorios'), api.get('/aeronaves')])
    setRelatorios(r.data)
    setAeronaves(a.data)
  }

  useEffect(() => { carregar() }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    try {
      await api.post('/relatorios', { ...form, aeronaveId: Number(form.aeronaveId), dataEntrega: new Date(form.dataEntrega).toISOString() })
      setForm({ aeronaveId: '', nomeCliente: '', dataEntrega: '' })
      setMostrarForm(false)
      carregar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
      setErro(msg ?? 'Erro ao gerar')
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <BotaoVoltar /><h1 className="text-xl font-bold text-white">Relatórios de Entrega</h1>
            {podeGerar && (
              <button onClick={() => setMostrarForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition">
                + Gerar Relatório
              </button>
            )}
          </div>

          {mostrarForm && podeGerar && (
            <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-gray-400 block mb-1">Aeronave</label>
                <select value={form.aeronaveId} onChange={(e) => setForm({ ...form, aeronaveId: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm" required>
                  <option value="">Selecione...</option>
                  {aeronaves.filter(a => !a.relatorio).map(a => <option key={a.id} value={a.id}>{a.modelo} ({a.codigo})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Nome do Cliente</label>
                <input type="text" value={form.nomeCliente} onChange={(e) => setForm({ ...form, nomeCliente: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Data de Entrega</label>
                <input type="datetime-local" value={form.dataEntrega} onChange={(e) => setForm({ ...form, dataEntrega: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm" required />
              </div>
              {erro && <p className="col-span-2 text-red-400 text-sm">{erro}</p>}
              <div className="col-span-2 flex gap-2">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition">Gerar</button>
                <button type="button" onClick={() => setMostrarForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition">Cancelar</button>
              </div>
            </form>
          )}

          <div className="grid gap-4">
            {relatorios.map((r) => (
              <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex justify-between items-center">
                <div>
                  <p className="text-white font-semibold">{r.aeronave?.modelo ?? '-'} — {r.nomeCliente}</p>
                  <p className="text-gray-500 text-sm mt-1">Entrega: {new Date(r.dataEntrega).toLocaleDateString('pt-BR')}</p>
                </div>
                <Link to={`/relatorios/${r.id}`} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm transition">
                  Ver Relatório
                </Link>
              </div>
            ))}
            {relatorios.length === 0 && <p className="text-gray-500 text-sm">Nenhum relatório gerado.</p>}
          </div>
        </div>
      </div>
    </>
  )
}



