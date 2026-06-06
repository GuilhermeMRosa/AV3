import prisma from '../lib/prisma'
import { z } from 'zod'
import { criarAeronaveSchema, atualizarAeronaveSchema } from '../schemas/aeronave.schema'

type CriarAeronave = z.infer<typeof criarAeronaveSchema>
type AtualizarAeronave = z.infer<typeof atualizarAeronaveSchema>

export async function listarAeronaves(aeronaveIds?: number[]) {
  return prisma.aeronave.findMany({
    where: aeronaveIds !== undefined ? { id: { in: aeronaveIds } } : undefined,
    include: { pecas: true, etapas: { include: { funcionarios: true } }, testes: true, relatorio: true },
  })
}

export async function buscarAeronave(id: number, aeronaveIds?: number[]) {
  if (aeronaveIds !== undefined && !aeronaveIds.includes(id)) {
    throw new Error('Aeronave não encontrada ou acesso não autorizado')
  }
  const aeronave = await prisma.aeronave.findUnique({
    where: { id },
    include: { pecas: true, etapas: { include: { funcionarios: true }, orderBy: { id: 'asc' } }, testes: true, relatorio: true },
  })
  if (!aeronave) throw new Error('Aeronave não encontrada')
  return aeronave
}

export async function criarAeronave(dados: CriarAeronave) {
  const existente = await prisma.aeronave.findUnique({ where: { codigo: dados.codigo } })
  if (existente) throw new Error('Já existe uma aeronave com esse código')
  return prisma.aeronave.create({ data: dados })
}

export async function atualizarAeronave(id: number, dados: AtualizarAeronave) {
  await buscarAeronave(id)
  if (dados.codigo) {
    const existente = await prisma.aeronave.findUnique({ where: { codigo: dados.codigo } })
    if (existente && existente.id !== id) throw new Error('Já existe uma aeronave com esse código')
  }
  return prisma.aeronave.update({ where: { id }, data: dados })
}

export async function deletarAeronave(id: number) {
  await buscarAeronave(id)
  await prisma.aeronave.delete({ where: { id } })
}
