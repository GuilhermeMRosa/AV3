'use strict'

/**
 * Script de métricas de qualidade — Aerocode
 *
 * Métricas coletadas:
 *   Latência           → tempo até o 1° byte de resposta (autocannon latency.mean)
 *   Tempo de resposta  → tempo total da requisição, do cliente ao fim da resposta (autocannon latency.mean)
 *   Tempo processamento→ tempo real gasto pelo servidor para processar a requisição,
 *                        medido via middleware timing no backend e exposto em /interno/timing
 *
 * Metodologia:
 *   1. Antes de cada bateria de testes, reseta o contador do servidor (DELETE /interno/timing)
 *   2. Roda o autocannon por DURACAO_SEGUNDOS com N conexões simultâneas
 *   3. Após o teste, consulta GET /interno/timing para obter o tempo de processamento real
 *
 * PRÉ-REQUISITO: servidor rodando em localhost:3000
 * COMO RODAR:    node metricas.js
 */

const autocannon = require('autocannon')
const axios = require('axios')

const BASE_URL = 'http://localhost:3000'
const DURACAO_SEGUNDOS = 10

const ENDPOINTS = [
  {
    nome: 'GET /aeronaves',
    metodo: 'GET',
    path: '/aeronaves',
    rotaServidor: 'GET /aeronaves',
  },
  {
    nome: 'GET /etapas',
    metodo: 'GET',
    path: '/etapas',
    rotaServidor: 'GET /etapas',
  },
  {
    nome: 'GET /pecas',
    metodo: 'GET',
    path: '/pecas',
    rotaServidor: 'GET /pecas',
  },
  {
    nome: 'POST /auth/login',
    metodo: 'POST',
    path: '/auth/login',
    rotaServidor: 'POST /auth/login',
    body: JSON.stringify({ usuario: 'admin', senha: 'admin123' }),
    semToken: true,
  },
]

const USUARIOS = [1, 5, 10]

// ─── Login ───────────────────────────────────────────────────────────────────
async function obterToken() {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      usuario: 'admin',
      senha: 'admin123',
    })
    return res.data.token
  } catch {
    console.error('\n❌  Não foi possível fazer login. O servidor está rodando?\n')
    process.exit(1)
  }
}

// ─── Reset das estatísticas do servidor ──────────────────────────────────────
async function resetarTiming() {
  await axios.delete(`${BASE_URL}/interno/timing`).catch(() => {})
}

// ─── Coleta do tempo de processamento do servidor ────────────────────────────
async function coletarTempoProcessamento(rotaServidor) {
  const res = await axios.get(`${BASE_URL}/interno/timing`)
  const stats = res.data
  const entrada = stats[rotaServidor]
  if (!entrada) return null
  return {
    media: entrada.media,
    min: entrada.min,
    max: entrada.max,
    amostras: entrada.amostras,
  }
}

// ─── Executa um teste autocannon ─────────────────────────────────────────────
function executarTeste(endpoint, conexoes, token) {
  return new Promise((resolve) => {
    const headers = { 'Content-Type': 'application/json' }
    if (token && !endpoint.semToken) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const config = {
      url: `${BASE_URL}${endpoint.path}`,
      connections: conexoes,
      duration: DURACAO_SEGUNDOS,
      headers,
      method: endpoint.metodo,
    }

    if (endpoint.body) config.body = endpoint.body

    autocannon(config, (err, resultado) => {
      if (err) { resolve(null); return }
      resolve(resultado)
    })
  })
}

// ─── Exibe resultados formatados ─────────────────────────────────────────────
function exibirResultados(todos) {
  const linha    = '═'.repeat(80)
  const sublinha = '─'.repeat(80)

  console.log(`\n${linha}`)
  console.log('  RELATÓRIO DE MÉTRICAS DE QUALIDADE — AEROCODE')
  console.log(`  Duração por bateria: ${DURACAO_SEGUNDOS}s | Unidade: milissegundos (ms)`)
  console.log(linha)

  // Agrupa por endpoint
  const porEndpoint = {}
  for (const r of todos) {
    if (!porEndpoint[r.endpoint]) porEndpoint[r.endpoint] = []
    porEndpoint[r.endpoint].push(r)
  }

  for (const [nome, resultados] of Object.entries(porEndpoint)) {
    console.log(`\n  Endpoint: ${nome}`)
    console.log(sublinha)
    console.log(
      '  Usuários │ Latência (ms) │ Tempo Resposta (ms) │ Tempo Processamento (ms) │ Req/s'
    )
    console.log(sublinha)
    for (const r of resultados) {
      const u   = String(r.usuarios).padEnd(8)
      const lat = String(r.latenciaMedia).padEnd(13)
      const tr  = String(r.tempoRespostaMedia).padEnd(19)
      const tp  = r.tempoProcessamento !== null
        ? String(r.tempoProcessamento).padEnd(24)
        : 'N/D'.padEnd(24)
      const rps = String(r.reqPorSeg)
      console.log(`  ${u} │ ${lat} │ ${tr} │ ${tp} │ ${rps}`)
    }
  }

  // ─── Bloco para copiar para o relatório ──────────────────────────────────
  console.log(`\n${linha}`)
  console.log('  RESUMO PARA GRÁFICO')
  console.log(`  Copie estes valores para montar os gráficos do relatório de qualidade`)
  console.log(sublinha)
  console.log('  Endpoint | Usuários | Latência (ms) | Tempo Resposta (ms) | Tempo Processamento (ms)')
  console.log(sublinha)
  for (const [nome, resultados] of Object.entries(porEndpoint)) {
    for (const r of resultados) {
      const tp = r.tempoProcessamento !== null ? r.tempoProcessamento : 'N/D'
      console.log(
        `  ${nome.padEnd(22)} | ${String(r.usuarios).padEnd(8)} | ${String(r.latenciaMedia).padEnd(13)} | ${String(r.tempoRespostaMedia).padEnd(19)} | ${tp}`
      )
    }
  }

  // ─── Definições das métricas ─────────────────────────────────────────────
  console.log(`\n${linha}`)
  console.log('  DEFINIÇÃO DAS MÉTRICAS E METODOLOGIA DE COLETA')
  console.log(sublinha)
  console.log('  Latência')
  console.log('    Tempo desde o envio da requisição pelo cliente até o recebimento')
  console.log('    do primeiro byte de resposta. Coletado pelo autocannon (latency.mean).')
  console.log()
  console.log('  Tempo de Resposta')
  console.log('    Tempo total desde o envio da requisição até o recebimento completo')
  console.log('    da resposta. Em HTTP/1.1 sem streaming, equivale à latência média.')
  console.log('    Coletado pelo autocannon (latency.mean).')
  console.log()
  console.log('  Tempo de Processamento')
  console.log('    Tempo real gasto pelo servidor para processar cada requisição,')
  console.log('    medido por um middleware de timing no backend Express.')
  console.log('    O middleware registra o instante de chegada da requisição com')
  console.log('    process.hrtime.bigint() e calcula a diferença no evento "finish"')
  console.log('    da resposta. Esse valor é acumulado em memória e exposto via')
  console.log('    GET /interno/timing, consultado pelo script após cada bateria.')
  console.log()
  console.log('  Ferramenta de carga: autocannon v8 (https://github.com/mcollina/autocannon)')
  console.log(linha)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\nConectando ao servidor...')
  const token = await obterToken()
  console.log('Login realizado com sucesso.')
  console.log(`\nIniciando testes (${DURACAO_SEGUNDOS}s por bateria × ${USUARIOS.length} cargas × ${ENDPOINTS.length} endpoints)...\n`)

  const resultados = []

  for (const endpoint of ENDPOINTS) {
    for (const usuarios of USUARIOS) {
      process.stdout.write(
        `  [${endpoint.nome}] ${usuarios} usuário(s)... `
      )

      // 1. Reseta o timer do servidor
      await resetarTiming()

      // 2. Executa carga
      const resultado = await executarTeste(endpoint, usuarios, token)
      if (!resultado) { console.log('ERRO'); continue }

      // 3. Coleta tempo de processamento real do servidor
      const tp = await coletarTempoProcessamento(endpoint.rotaServidor)

      const latenciaMedia      = parseFloat(resultado.latency.mean.toFixed(2))
      const tempoRespostaMedia = parseFloat(resultado.latency.mean.toFixed(2))
      const tempoProcessamento = tp ? tp.media : null

      console.log(
        `OK | lat=${latenciaMedia}ms | proc=${tempoProcessamento !== null ? tempoProcessamento + 'ms' : 'N/D'}`
      )

      resultados.push({
        endpoint:            endpoint.nome,
        usuarios,
        latenciaMedia,
        tempoRespostaMedia,
        tempoProcessamento,
        reqPorSeg:           parseFloat(resultado.requests.mean.toFixed(2)),
        totalRequisicoes:    resultado.requests.total,
        erros:               resultado.errors,
      })
    }
  }

  exibirResultados(resultados)
}

main()
