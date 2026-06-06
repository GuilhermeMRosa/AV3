import { z } from 'zod'

export const criarAeronaveSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório').trim(),
  modelo: z.string().min(1, 'Modelo é obrigatório').trim(),
  tipo: z.enum(['COMERCIAL', 'MILITAR']),
  capacidade: z.number().positive('Capacidade deve ser positiva'),
  alcance: z.number().positive('Alcance deve ser positivo'),
})

export const atualizarAeronaveSchema = criarAeronaveSchema.partial()
