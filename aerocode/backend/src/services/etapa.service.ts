import prisma from '../lib/prisma'
import { z } from 'zod'
import { criarEtapaSchema, atualizarEtapaSchema } from '../schemas/etapa.schema'

type CriarEtapa = z.infer<typeof criarEtapaSchema>
type AtualizarEtapa = z.infer<typeof atualizarEtapaSchema>

export async function listarEtapas(aeronaveId?: number, aeronaveIds?: number[]) {
  return prisma.etapa.findMany({
    where: {
      ...(aeronaveId ? { aeronaveId } : {}),
      ...(aeronaveIds !== undefined ? { aeronaveId: { in: aeronaveIds } } : {}),
    },
    orderBy: { id: 'asc' },
    include: { funcionarios: { select: { id: true, nome: true, nivel: true } } },
  })
}

export async function buscarEtapa(id: number, aeronaveIds?: number[]) {
  const etapa = await prisma.etapa.findUnique({
    where: { id },
    include: { funcionarios: { select: { id: true, nome: true, nivel: true } } },
  })
  if (!etapa) throw new Error('Etapa não encontrada')
  if (aeronaveIds !== undefined && !aeronaveIds.includes(etapa.aeronaveId)) {
    throw new Error('Etapa não encontrada ou acesso não autorizado')
  }
  return etapa
}

export async function criarEtapa(dados: CriarEtapa) {
  const aeronave = await prisma.aeronave.findUnique({ where: { id: dados.aeronaveId } })
  if (!aeronave) throw new Error('Aeronave não encontrada')

  const prazo = new Date(dados.prazo)
  if (prazo <= new Date()) throw new Error('O prazo da etapa deve ser uma data futura')

  const nomeExistente = await prisma.etapa.findFirst({
    where: { aeronaveId: dados.aeronaveId, nome: dados.nome },
  })
  if (nomeExistente) throw new Error('Já existe uma etapa com esse nome para esta aeronave')

  return prisma.etapa.create({
    data: { ...dados, prazo, status: 'PENDENTE' },
    include: { funcionarios: true },
  })
}

export async function atualizarEtapa(id: number, dados: AtualizarEtapa) {
  const etapaAtual = await buscarEtapa(id)

  if (dados.prazo) {
    const prazo = new Date(dados.prazo)
    if (prazo <= new Date()) throw new Error('O prazo da etapa deve ser uma data futura')
  }

  if (dados.nome && dados.nome !== etapaAtual.nome) {
    const nomeExistente = await prisma.etapa.findFirst({
      where: { aeronaveId: etapaAtual.aeronaveId, nome: { equals: dados.nome, mode: 'insensitive' }, id: { not: id } },
    })
    if (nomeExistente) throw new Error('Já existe uma etapa com esse nome para esta aeronave')
  }

  const atualizado = { ...dados } as Record<string, unknown>
  if (dados.prazo) atualizado.prazo = new Date(dados.prazo)
  return prisma.etapa.update({ where: { id }, data: atualizado, include: { funcionarios: true } })
}

export async function iniciarEtapa(id: number) {
  const etapa = await buscarEtapa(id)

  if (etapa.status !== 'PENDENTE') throw new Error('Apenas etapas pendentes podem ser iniciadas')

  // Verifica se é a primeira etapa da aeronave ou se a anterior está concluída
  const etapasAnteriores = await prisma.etapa.findMany({
    where: { aeronaveId: etapa.aeronaveId, id: { lt: id } },
    orderBy: { id: 'asc' },
  })

  if (etapasAnteriores.length > 0) {
    const ultima = etapasAnteriores[etapasAnteriores.length - 1]
    if (ultima.status !== 'CONCLUIDA') {
      throw new Error('A etapa anterior ainda não foi concluída. As etapas devem ser executadas em ordem de criação.')
    }
  }

  return prisma.etapa.update({ where: { id }, data: { status: 'ANDAMENTO' }, include: { funcionarios: true } })
}

export async function concluirEtapa(id: number) {
  const etapa = await buscarEtapa(id)
  if (etapa.status !== 'ANDAMENTO') throw new Error('Apenas etapas em andamento podem ser concluídas')
  return prisma.etapa.update({ where: { id }, data: { status: 'CONCLUIDA' }, include: { funcionarios: true } })
}

export async function adicionarFuncionario(etapaId: number, funcionarioId: number) {
  const etapa = await buscarEtapa(etapaId)

  const jaAssociado = etapa.funcionarios.some((f) => f.id === funcionarioId)
  if (jaAssociado) throw new Error('Funcionário já está associado a esta etapa')

  const funcionario = await prisma.funcionario.findUnique({ where: { id: funcionarioId } })
  if (!funcionario) throw new Error('Funcionário não encontrado')

  return prisma.etapa.update({
    where: { id: etapaId },
    data: { funcionarios: { connect: { id: funcionarioId } } },
    include: { funcionarios: { select: { id: true, nome: true, nivel: true } } },
  })
}

export async function removerFuncionario(etapaId: number, funcionarioId: number) {
  await buscarEtapa(etapaId)
  return prisma.etapa.update({
    where: { id: etapaId },
    data: { funcionarios: { disconnect: { id: funcionarioId } } },
    include: { funcionarios: { select: { id: true, nome: true, nivel: true } } },
  })
}

export async function deletarEtapa(id: number) {
  await buscarEtapa(id)
  await prisma.etapa.delete({ where: { id } })
}
