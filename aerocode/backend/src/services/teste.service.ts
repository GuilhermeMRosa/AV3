import prisma from '../lib/prisma'
import { z } from 'zod'
import { criarTesteSchema, atualizarTesteSchema } from '../schemas/teste.schema'

type CriarTeste = z.infer<typeof criarTesteSchema>
type AtualizarTeste = z.infer<typeof atualizarTesteSchema>

export async function listarTestes(aeronaveId?: number, aeronaveIds?: number[]) {
  return prisma.teste.findMany({
    where: {
      ...(aeronaveId ? { aeronaveId } : {}),
      ...(aeronaveIds !== undefined ? { aeronaveId: { in: aeronaveIds } } : {}),
    },
  })
}

export async function buscarTeste(id: number) {
  const teste = await prisma.teste.findUnique({ where: { id } })
  if (!teste) throw new Error('Teste não encontrado')
  return teste
}

export async function criarTeste(dados: CriarTeste) {
  const aeronave = await prisma.aeronave.findUnique({ where: { id: dados.aeronaveId } })
  if (!aeronave) throw new Error('Aeronave não encontrada')
  return prisma.teste.create({ data: dados })
}

export async function atualizarTeste(id: number, dados: AtualizarTeste) {
  await buscarTeste(id)
  return prisma.teste.update({ where: { id }, data: dados })
}

export async function deletarTeste(id: number) {
  await buscarTeste(id)
  await prisma.teste.delete({ where: { id } })
}
