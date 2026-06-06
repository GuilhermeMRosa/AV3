import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import api from '../services/api'
import type { Relatorio, Teste } from '../types'
import { Navbar } from '../components/Navbar'
import { BotaoVoltar } from '../components/ui/BotaoVoltar'

export function RelatorioDetalhe() {
  const { id } = useParams()
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null)
  const [baixando, setBaixando] = useState(false)

  useEffect(() => {
    api.get(`/relatorios/${id}`).then(({ data }) => setRelatorio(data))
  }, [id])

  async function handleDownload() {
    setBaixando(true)
    try {
      const response = await api.get(`/relatorios/${id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `relatorio_${relatorio?.aeronave?.codigo ?? id}_${id}.txt`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } finally {
      setBaixando(false)
    }
  }

  if (!relatorio) return <><Navbar /><div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">Carregando...</div></>

  const aeronave = relatorio.aeronave!
  const tipos = ['ELETRICO', 'HIDRAULICO', 'AERODINAMICO'] as const
  const ultimosPorTipo = tipos.map(tipo => {
    const doTipo = (aeronave.testes ?? []).filter((t: Teste) => t.tipo === tipo)
    return doTipo.length > 0 ? doTipo[doTipo.length - 1] : null
  }).filter(Boolean) as Teste[]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-4xl mx-auto">
          <BotaoVoltar para="/relatorios" />
          <div className="mt-4 mb-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-white">Relatório de Entrega</h1>
                <p className="text-gray-500 text-sm mt-1">Gerado para {relatorio.nomeCliente}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Data de Entrega</p>
                  <p className="text-white font-semibold">{new Date(relatorio.dataEntrega).toLocaleDateString('pt-BR')}</p>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={baixando}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded transition flex items-center gap-2"
                >
                  {baixando ? 'Baixando...' : '⬇ Baixar .txt'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Aeronave */}
            <section className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <h2 className="text-white font-semibold mb-3">Aeronave</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ['Modelo', aeronave.modelo],
                  ['Código', aeronave.codigo],
                  ['Tipo', aeronave.tipo],
                  ['Capacidade', `${aeronave.capacidade} passageiros`],
                  ['Alcance', `${aeronave.alcance} km`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span className="text-gray-500">{k}: </span>
                    <span className="text-white">{v}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Etapas */}
            <section className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <h2 className="text-white font-semibold mb-3">Etapas Realizadas</h2>
              <div className="space-y-2">
                {aeronave.etapas?.map((e, i) => (
                  <div key={e.id} className="flex justify-between items-center bg-gray-800 rounded p-3">
                    <span className="text-white text-sm">{i + 1}. {e.nome}</span>
                    <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded">{e.status}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Peças */}
            <section className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <h2 className="text-white font-semibold mb-3">Peças Utilizadas</h2>
              <div className="grid grid-cols-2 gap-2">
                {aeronave.pecas?.map((p) => (
                  <div key={p.id} className="bg-gray-800 rounded p-3">
                    <p className="text-white text-sm">{p.nome}</p>
                    <p className="text-gray-500 text-xs">{p.tipo} · {p.fornecedor}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Resultado Final */}
            <section className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <h2 className="text-white font-semibold mb-1">Resultado Final dos Testes</h2>
              <p className="text-gray-500 text-xs mb-3">Último teste registrado de cada tipo</p>
              <div className="space-y-2">
                {ultimosPorTipo.length === 0
                  ? <p className="text-gray-500 text-sm">Nenhum teste registrado.</p>
                  : ultimosPorTipo.map((t) => (
                    <div key={t.tipo} className="flex justify-between items-center bg-gray-800 rounded p-3">
                      <span className="text-white text-sm font-medium">{t.tipo}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${t.resultado === 'APROVADO' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {t.resultado}
                      </span>
                    </div>
                  ))
                }
              </div>
            </section>

            {/* Histórico */}
            <section className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <h2 className="text-white font-semibold mb-1">Histórico Completo de Testes</h2>
              <p className="text-gray-500 text-xs mb-3">Todos os testes realizados em ordem de registro</p>
              <div className="space-y-2">
                {(aeronave.testes ?? []).length === 0
                  ? <p className="text-gray-500 text-sm">Nenhum teste registrado.</p>
                  : (aeronave.testes ?? []).map((t: Teste, i: number) => (
                    <div key={t.id} className="flex justify-between items-center bg-gray-800 rounded p-3">
                      <span className="text-gray-400 text-sm">{i + 1}. {t.tipo}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${t.resultado === 'APROVADO' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {t.resultado}
                      </span>
                    </div>
                  ))
                }
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
