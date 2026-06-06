import prisma from '../lib/prisma'
import { z } from 'zod'
import { criarPecaSchema, atualizarPecaSchema, atualizarStatusPecaSchema } from '../schemas/peca.schema'

type CriarPeca = z.infer<typeof criarPecaSchema>
type AtualizarPeca = z.infer<typeof atualizarPecaSchema>
type AtualizarStatusPeca = z.infer<typeof atualizarStatusPecaSchema>

export async function listarPecas(aeronaveId?: number, aeronaveIds?: number[]) {
  return prisma.peca.findMany({
    where: {
      ...(aeronaveId ? { aeronaveId } : {}),
      ...(aeronaveIds !== undefined ? { aeronaveId: { in: aeronaveIds } } : {}),
    },
  })
}

export async function buscarPeca(id: number) {
  const peca = await prisma.peca.findUnique({ where: { id } })
  if (!peca) throw new Error('Peça não encontrada')
  return peca
}

export async function criarPeca(dados: CriarPeca) {
  const aeronave = await prisma.aeronave.findUnique({ where: { id: dados.aeronaveId } })
  if (!aeronave) throw new Error('Aeronave não encontrada')
  return prisma.peca.create({ data: dados })
}

export async function atualizarPeca(id: number, dados: AtualizarPeca) {
  await buscarPeca(id)
  return prisma.peca.update({ where: { id }, data: dados })
}

const progressao: Record<string, number> = { EM_PRODUCAO: 0, EM_TRANSPORTE: 1, PRONTA: 2 }

export async function atualizarStatusPeca(id: number, dados: AtualizarStatusPeca) {
  const peca = await buscarPeca(id)

  if (progressao[dados.status] <= progressao[peca.status]) {
    throw new Error(`Status não pode ser revertido. Progressão permitida: EM_PRODUCAO → EM_TRANSPORTE → PRONTA`)
  }

  return prisma.peca.update({ where: { id }, data: { status: dados.status } })
}

export async function deletarPeca(id: number) {
  await buscarPeca(id)
  await prisma.peca.delete({ where: { id } })
}
