import { z } from 'zod'

export const criarEtapaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').trim(),
  prazo: z.string().datetime({ message: 'Prazo deve ser uma data válida' }),
  aeronaveId: z.number().int().positive('ID da aeronave é obrigatório'),
})

export const atualizarEtapaSchema = criarEtapaSchema.partial()
