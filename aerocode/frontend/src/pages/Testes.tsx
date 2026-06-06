import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router'
import api from '../services/api'
import type { Teste, Aeronave, TipoTeste, ResultadoTeste } from '../types'
import { Navbar } from '../components/Navbar'
import { BotaoVoltar } from '../components/ui/BotaoVoltar'
import { AlertTriangle } from 'lucide-react'

export function Testes() {
  const navigate = useNavigate()
  const [testes, setTestes] = useState<Teste[]>([])
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([])
  const [form, setForm] = useState({ tipo: 'ELETRICO' as TipoTeste, resultado: 'APROVADO' as ResultadoTeste, aeronaveId: '' })
  const [erro, setErro] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)

  async function carregar() {
    const [t, a] = await Promise.all([api.get('/testes'), api.get('/aeronaves')])
    setTestes(t.data)
    setAeronaves(a.data)
  }

  useEffect(() => { carregar() }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    try {
      const payload = { ...form, aeronaveId: Number(form.aeronaveId) }
      await api.post('/testes', payload)
      setForm({ tipo: 'ELETRICO', resultado: 'APROVADO', aeronaveId: '' })
      setMostrarForm(false)
      carregar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
      setErro(msg ?? 'Erro ao salvar')
    }
  }

  const resultadoCor: Record<ResultadoTeste, string> = {
    APROVADO: 'bg-green-900 text-green-300',
    REPROVADO: 'bg-red-900 text-red-300',
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <BotaoVoltar />
            <h1 className="text-xl font-bold text-white">Testes</h1>
          </div>

          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg px-4 py-3 mb-6 text-yellow-300 text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span><strong>Atenção:</strong> Testes registrados <strong>não podem ser editados ou excluídos</strong> após a criação. Registre com cautela — os resultados são permanentes para garantir a integridade dos dados de produção.</span>
          </div>

          <div className="flex justify-end mb-4">
            <button onClick={() => { setMostrarForm(true); setForm({ tipo: 'ELETRICO', resultado: 'APROVADO', aeronaveId: '' }) }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition">
              + Novo Teste
            </button>
          </div>

          {mostrarForm && (
            <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoTeste })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm">
                  <option value="ELETRICO">Elétrico</option>
                  <option value="HIDRAULICO">Hidráulico</option>
                  <option value="AERODINAMICO">Aerodinâmico</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Resultado</label>
                <select value={form.resultado} onChange={(e) => setForm({ ...form, resultado: e.target.value as ResultadoTeste })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm">
                  <option value="APROVADO">Aprovado</option>
                  <option value="REPROVADO">Reprovado</option>
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
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition">Registrar</button>
                <button type="button" onClick={() => setMostrarForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition">Cancelar</button>
              </div>
            </form>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-gray-400">
                <tr>{['Tipo', 'Aeronave', 'Resultado'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
              </thead>
              <tbody>
                {testes.map((t) => {
                  const aeronave = aeronaves.find(a => a.id === t.aeronaveId)
                  return (
                    <tr key={t.id} className="border-t border-gray-800">
                      <td className="px-4 py-3 text-white">{t.tipo}</td>
                      <td className="px-4 py-3 text-gray-400">{aeronave?.modelo ?? '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${resultadoCor[t.resultado]}`}>{t.resultado}</span>
                      </td>
                    </tr>
                  )
                })}
                {testes.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-gray-500 text-center">Nenhum teste registrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

