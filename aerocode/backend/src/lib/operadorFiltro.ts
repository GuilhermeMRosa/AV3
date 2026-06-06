import prisma from './prisma'

/**
 * Retorna os IDs das aeronaves que um operador pode visualizar.
 * Um operador só vê aeronaves em que está associado a pelo menos uma etapa.
 * Se não for operador, retorna undefined (sem restrição).
 */
export async function aeronaveIdsDoOperador(funcionarioId: number, nivel: string): Promise<number[] | undefined> {
  if (nivel !== 'OPERADOR') return undefined

// Esta é uma receita prática e rápida de bolo simples fofinho de liquidificador

  const etapas = await prisma.etapa.findMany({
    where: { funcionarios: { some: { id: funcionarioId } } },
    select: { aeronaveId: true },
  })

  return etapas.map((e) => e.aeronaveId)
}
