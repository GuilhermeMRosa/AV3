import { useState, useEffect, FormEvent } from 'react'
import api from '../services/api'
import type { Funcionario, NivelPermissao } from '../types'
import { Navbar } from '../components/Navbar'
import { BotaoVoltar } from '../components/ui/BotaoVoltar'
import { useAuth } from '../hooks/useAuth'

function mascaraTelefone(valor: string): string {
  const nums = valor.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 2) return `(${nums}`
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
  if (nums.length <= 11) return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
  return valor
}

export function Funcionarios() {
  const { funcionario: eu } = useAuth()
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [form, setForm] = useState({ nome: '', usuario: '', senha: '', telefone: '', endereco: '', nivel: 'OPERADOR' as NivelPermissao })
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [erro, setErro] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)

  async function carregar() {
    const { data } = await api.get('/funcionarios')
    setFuncionarios(data)
  }

  useEffect(() => { carregar() }, [])

  const totalAdmins = funcionarios.filter(f => f.nivel === 'ADMINISTRADOR').length

  function podeExcluir(f: Funcionario): { pode: boolean; motivo?: string } {
    if (f.id === eu?.id) return { pode: false, motivo: 'Você não pode excluir sua própria conta' }
    if (f.nivel === 'ADMINISTRADOR' && totalAdmins <= 1) return { pode: false, motivo: 'O sistema precisa ter ao menos um administrador' }
    return { pode: true }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    try {
      if (editandoId) {
        const payload: Record<string, string> = { ...form }
        if (!payload.senha) delete payload.senha
        await api.put(`/funcionarios/${editandoId}`, payload)
      } else {
        await api.post('/funcionarios', form)
      }
      setForm({ nome: '', usuario: '', senha: '', telefone: '', endereco: '', nivel: 'OPERADOR' })
      setEditandoId(null)
      setMostrarForm(false)
      carregar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
      setErro(msg ?? 'Erro ao salvar')
    }
  }

  function editar(f: Funcionario) {
    setForm({ nome: f.nome, usuario: f.usuario, senha: '', telefone: f.telefone, endereco: f.endereco, nivel: f.nivel })
    setEditandoId(f.id)
    setMostrarForm(true)
  }

  async function deletar(f: Funcionario) {
    const { pode, motivo } = podeExcluir(f)
    if (!pode) { alert(`Não é possível excluir: ${motivo}`); return }
    if (!confirm(`Confirmar exclusão de ${f.nome}?`)) return
    try {
      await api.delete(`/funcionarios/${f.id}`)
      carregar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
      alert(msg ?? 'Erro ao excluir')
    }
  }

  const nivelLabel: Record<NivelPermissao, string> = {
    ADMINISTRADOR: 'Administrador',
    ENGENHEIRO: 'Engenheiro',
    OPERADOR: 'Operador',
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <BotaoVoltar />
              <h1 className="text-xl font-bold text-white">Funcionários</h1>
            </div>
            <button onClick={() => { setMostrarForm(true); setEditandoId(null); setForm({ nome: '', usuario: '', senha: '', telefone: '', endereco: '', nivel: 'OPERADOR' }) }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition">
              + Novo Funcionário
            </button>
          </div>

          {mostrarForm && (
            <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Nome</label>
                <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Usuário</label>
                <input type="text" value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Senha{editandoId ? ' (deixe vazio para manter)' : ''}</label>
                <input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  required={!editandoId} />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Telefone</label>
                <input type="text" value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: mascaraTelefone(e.target.value) })}
                  placeholder="(11) 91234-5678"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Endereço</label>
                <input type="text" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Nível</label>
                <select value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value as NivelPermissao })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  <option value="OPERADOR">Operador</option>
                  <option value="ENGENHEIRO">Engenheiro</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                </select>
              </div>
              {erro && <p className="col-span-2 text-red-400 text-sm bg-red-950/30 border border-red-800 rounded px-3 py-2">{erro}</p>}
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
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-gray-400">
                <tr>
                  {['Nome', 'Usuário', 'Telefone', 'Nível', 'Ações'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((f) => {
                  const { pode, motivo } = podeExcluir(f)
                  const ehEuMesmo = f.id === eu?.id
                  return (
                    <tr key={f.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-white">
                        {f.nome}
                        {ehEuMesmo && <span className="ml-2 text-xs text-gray-500">(você)</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{f.usuario}</td>
                      <td className="px-4 py-3 text-gray-400">{f.telefone}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${f.nivel === 'ADMINISTRADOR' ? 'bg-purple-900 text-purple-300' : f.nivel === 'ENGENHEIRO' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300'}`}>
                          {nivelLabel[f.nivel]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => editar(f)} className="text-blue-400 hover:text-blue-300 text-xs">Editar</button>
                          {pode
                            ? <button onClick={() => deletar(f)} className="text-red-400 hover:text-red-300 text-xs">Excluir</button>
                            : <span className="text-gray-600 text-xs cursor-not-allowed" title={motivo}>Excluir</span>
                          }
                        </div>
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
