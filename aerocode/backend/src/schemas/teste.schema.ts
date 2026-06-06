import { z } from 'zod'

export const criarTesteSchema = z.object({
  tipo: z.enum(['ELETRICO', 'HIDRAULICO', 'AERODINAMICO']),
  resultado: z.enum(['APROVADO', 'REPROVADO']),
  aeronaveId: z.number().int().positive('ID da aeronave é obrigatório'),
})

export const atualizarTesteSchema = criarTesteSchema.partial()
