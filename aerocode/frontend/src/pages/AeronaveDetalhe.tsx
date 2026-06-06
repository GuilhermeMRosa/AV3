import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import api from '../services/api'
import type { Aeronave } from '../types'
import { Navbar } from '../components/Navbar'
import { BotaoVoltar } from '../components/ui/BotaoVoltar'

const statusEtapaCor: Record<string, string> = {
  PENDENTE: 'bg-gray-700 text-gray-300',
  ANDAMENTO: 'bg-yellow-900 text-yellow-300',
  CONCLUIDA: 'bg-green-900 text-green-300',
}

const statusPecaCor: Record<string, string> = {
  EM_PRODUCAO: 'bg-yellow-900 text-yellow-300',
  EM_TRANSPORTE: 'bg-blue-900 text-blue-300',
  PRONTA: 'bg-green-900 text-green-300',
}

const resultadoCor: Record<string, string> = {
  APROVADO: 'bg-green-900 text-green-300',
  REPROVADO: 'bg-red-900 text-red-300',
}

export function AeronaveDetalhe() {
  const { id } = useParams()
  const [aeronave, setAeronave] = useState<Aeronave | null>(null)

  useEffect(() => {
    api.get(`/aeronaves/${id}`).then(({ data }) => setAeronave(data))
  }, [id])

  if (!aeronave) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">Carregando...</div>
    </>
  )

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link to="/aeronaves" className="text-gray-500 hover:text-gray-300 text-sm">← Voltar</Link>
            <div className="flex items-center gap-3 mt-2">
              <h1 className="text-2xl font-bold text-white">{aeronave.modelo}</h1>
              <span className="text-sm bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{aeronave.codigo}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${aeronave.tipo === 'COMERCIAL' ? 'bg-blue-900 text-blue-300' : 'bg-red-900 text-red-300'}`}>{aeronave.tipo}</span>
            </div>
            <p className="text-gray-500 text-sm mt-1">Capacidade: {aeronave.capacidade} · Alcance: {aeronave.alcance} km</p>
          </div>

          <div className="grid gap-6">
            {/* Etapas */}
            <section className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white font-semibold">Etapas de Produção</h2>
                <p className="text-gray-500 text-xs">Ordem: por data de criação</p>
              </div>
              {aeronave.etapas?.length === 0 && <p className="text-gray-500 text-sm">Nenhuma etapa cadastrada.</p>}
              <div className="space-y-3">
                {aeronave.etapas?.map((e, i) => (
                  <div key={e.id} className="flex items-center justify-between bg-gray-800 rounded p-3">
                    <div>
                      <p className="text-white text-sm font-medium">{i + 1}. {e.nome}</p>
                      <p className="text-gray-500 text-xs mt-0.5">Prazo: {new Date(e.prazo).toLocaleDateString('pt-BR')} · {e.funcionarios.length} funcionário(s)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${statusEtapaCor[e.status]}`}>{e.status}</span>
                      <Link to={`/etapas/${e.id}`} className="text-blue-400 hover:text-blue-300 text-xs">Gerenciar</Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Peças */}
            <section className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <h2 className="text-white font-semibold mb-4">Peças</h2>
              {aeronave.pecas?.length === 0 && <p className="text-gray-500 text-sm">Nenhuma peça cadastrada.</p>}
              <div className="grid grid-cols-2 gap-2">
                {aeronave.pecas?.map((p) => (
                  <div key={p.id} className="bg-gray-800 rounded p-3 flex justify-between items-center">
                    <div>
                      <p className="text-white text-sm">{p.nome}</p>
                      <p className="text-gray-500 text-xs">{p.tipo} · {p.fornecedor}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${statusPecaCor[p.status]}`}>{p.status.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Testes */}
            <section className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <h2 className="text-white font-semibold mb-4">Testes</h2>
              {aeronave.testes?.length === 0 && <p className="text-gray-500 text-sm">Nenhum teste registrado.</p>}
              <div className="space-y-2">
                {aeronave.testes?.map((t) => (
                  <div key={t.id} className="bg-gray-800 rounded p-3 flex justify-between items-center">
                    <span className="text-white text-sm">{t.tipo}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${resultadoCor[t.resultado]}`}>{t.resultado}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Relatório */}
            {aeronave.relatorio && (
              <section className="bg-gray-900 border border-green-800 rounded-lg p-5">
                <h2 className="text-white font-semibold mb-2">Relatório Final</h2>
                <p className="text-gray-400 text-sm">Cliente: {aeronave.relatorio.nomeCliente}</p>
                <p className="text-gray-400 text-sm">Entrega: {new Date(aeronave.relatorio.dataEntrega).toLocaleDateString('pt-BR')}</p>
                <Link to={`/relatorios/${aeronave.relatorio.id}`} className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
                  Ver relatório completo →
                </Link>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

