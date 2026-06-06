import fs from 'fs'
import path from 'path'
import prisma from '../lib/prisma'
import { z } from 'zod'
import { criarRelatorioSchema } from '../schemas/relatorio.schema'

type CriarRelatorio = z.infer<typeof criarRelatorioSchema>

function gerarConteudoTxt(dados: {
  relatorioId: number
  nomeCliente: string
  dataEntrega: Date
  aeronave: {
    codigo: string
    modelo: string
    tipo: string
    capacidade: number
    alcance: number
    pecas: { nome: string; tipo: string; fornecedor: string; status: string }[]
    etapas: { nome: string; prazo: Date; status: string; funcionarios: { nome: string; nivel: string }[] }[]
    testes: { tipo: string; resultado: string }[]
  }
}): string {
  const linha = '='.repeat(60)
  const sublinha = '-'.repeat(60)
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR')

  let txt = ''
  txt += `${linha}\n`
  txt += `        AEROCODE — RELATÓRIO DE ENTREGA\n`
  txt += `${linha}\n\n`
  txt += `Relatório Nº:    ${dados.relatorioId}\n`
  txt += `Cliente:         ${dados.nomeCliente}\n`
  txt += `Data de Entrega: ${fmt(dados.dataEntrega)}\n`
  txt += `Emitido em:      ${fmt(new Date())}\n\n`

  txt += `${sublinha}\n`
  txt += `AERONAVE\n`
  txt += `${sublinha}\n`
  txt += `Código:          ${dados.aeronave.codigo}\n`
  txt += `Modelo:          ${dados.aeronave.modelo}\n`
  txt += `Tipo:            ${dados.aeronave.tipo}\n`
  txt += `Capacidade:      ${dados.aeronave.capacidade} passageiros\n`
  txt += `Alcance:         ${dados.aeronave.alcance} km\n\n`

  txt += `${sublinha}\n`
  txt += `ETAPAS DE PRODUÇÃO\n`
  txt += `${sublinha}\n`
  if (dados.aeronave.etapas.length === 0) {
    txt += `Nenhuma etapa registrada.\n`
  } else {
    dados.aeronave.etapas.forEach((e, i) => {
      txt += `${i + 1}. ${e.nome}\n`
      txt += `   Prazo:  ${fmt(new Date(e.prazo))}\n`
      txt += `   Status: ${e.status}\n`
      if (e.funcionarios.length > 0) {
        txt += `   Equipe: ${e.funcionarios.map(f => `${f.nome} (${f.nivel})`).join(', ')}\n`
      }
    })
  }
  txt += '\n'

  txt += `${sublinha}\n`
  txt += `PEÇAS UTILIZADAS\n`
  txt += `${sublinha}\n`
  if (dados.aeronave.pecas.length === 0) {
    txt += `Nenhuma peça registrada.\n`
  } else {
    dados.aeronave.pecas.forEach((p) => {
      txt += `• ${p.nome} | ${p.tipo} | Fornecedor: ${p.fornecedor} | Status: ${p.status}\n`
    })
  }
  txt += '\n'

  txt += `${sublinha}\n`
  txt += `RESULTADO FINAL DOS TESTES\n`
  txt += `${sublinha}\n`
  const tipos = ['ELETRICO', 'HIDRAULICO', 'AERODINAMICO']
  const ultimosPorTipo = tipos.map(tipo => {
    const doTipo = dados.aeronave.testes.filter(t => t.tipo === tipo)
    return doTipo.length > 0 ? doTipo[doTipo.length - 1] : null
  }).filter(Boolean)
  if (ultimosPorTipo.length === 0) {
    txt += `Nenhum teste registrado.\n`
  } else {
    ultimosPorTipo.forEach((t) => { txt += `• ${t!.tipo}: ${t!.resultado}\n` })
  }
  txt += '\n'

  txt += `${sublinha}\n`
  txt += `HISTÓRICO COMPLETO DE TESTES\n`
  txt += `${sublinha}\n`
  if (dados.aeronave.testes.length === 0) {
    txt += `Nenhum teste registrado.\n`
  } else {
    dados.aeronave.testes.forEach((t, i) => { txt += `${i + 1}. ${t.tipo}: ${t.resultado}\n` })
  }
  txt += '\n'

  txt += `${linha}\n`
  txt += `Documento gerado automaticamente pelo sistema Aerocode.\n`
  txt += `${linha}\n`

  return txt
}

export async function gerarRelatorio(dados: CriarRelatorio) {
  const aeronave = await prisma.aeronave.findUnique({
    where: { id: dados.aeronaveId },
    include: {
      etapas: { include: { funcionarios: true }, orderBy: { id: 'asc' } },
      testes: true,
      pecas: true,
      relatorio: true,
    },
  })

  if (!aeronave) throw new Error('Aeronave não encontrada')
  if (aeronave.relatorio) throw new Error('Já existe um relatório para esta aeronave')

  const etapasPendentes = aeronave.etapas.filter((e) => e.status !== 'CONCLUIDA')
  if (etapasPendentes.length > 0) {
    throw new Error('Todas as etapas devem estar concluídas antes de gerar o relatório')
  }

  // Verifica se o último teste de cada tipo está aprovado
  const tiposTeste = ['ELETRICO', 'HIDRAULICO', 'AERODINAMICO'] as const
  for (const tipo of tiposTeste) {
    const testesTipo = aeronave.testes.filter((t) => t.tipo === tipo)
    if (testesTipo.length === 0) continue
    const ultimo = testesTipo[testesTipo.length - 1]
    if (ultimo.resultado !== 'APROVADO') {
      throw new Error(`O último teste ${tipo} está REPROVADO. Todos os últimos testes devem estar aprovados para gerar o relatório.`)
    }
  }

  const relatorio = await prisma.relatorio.create({
    data: {
      aeronaveId: dados.aeronaveId,
      nomeCliente: dados.nomeCliente,
      dataEntrega: new Date(dados.dataEntrega),
    },
  })

  // Gera o arquivo .txt
  const conteudo = gerarConteudoTxt({
    relatorioId: relatorio.id,
    nomeCliente: relatorio.nomeCliente,
    dataEntrega: relatorio.dataEntrega,
    aeronave,
  })

  const pastaRelatorios = path.join(process.cwd(), 'relatorios')
  if (!fs.existsSync(pastaRelatorios)) fs.mkdirSync(pastaRelatorios)

  const nomeArquivo = `relatorio_${aeronave.codigo}_${relatorio.id}.txt`
  fs.writeFileSync(path.join(pastaRelatorios, nomeArquivo), conteudo, 'utf-8')

  return { ...relatorio, arquivo: nomeArquivo }
}

export async function buscarRelatorio(id: number) {
  const relatorio = await prisma.relatorio.findUnique({
    where: { id },
    include: {
      aeronave: {
        include: {
          pecas: true,
          etapas: { include: { funcionarios: true }, orderBy: { id: 'asc' } },
          testes: true,
        },
      },
    },
  })
  if (!relatorio) throw new Error('Relatório não encontrado')
  return relatorio
}

export async function listarRelatorios() {
  return prisma.relatorio.findMany({
    include: { aeronave: { select: { codigo: true, modelo: true } } },
  })
}
