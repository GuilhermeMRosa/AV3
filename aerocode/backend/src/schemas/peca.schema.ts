import { z } from 'zod'

export const criarPecaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').trim(),
  tipo: z.enum(['NACIONAL', 'IMPORTADA']),
  fornecedor: z.string().min(1, 'Fornecedor é obrigatório').trim(),
  status: z.enum(['EM_PRODUCAO', 'EM_TRANSPORTE', 'PRONTA']),
  aeronaveId: z.number().int().positive('ID da aeronave é obrigatório'),
})

export const atualizarPecaSchema = criarPecaSchema.partial()

export const atualizarStatusPecaSchema = z.object({
  status: z.enum(['EM_PRODUCAO', 'EM_TRANSPORTE', 'PRONTA']),
})
