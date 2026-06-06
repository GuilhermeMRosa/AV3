import { z } from 'zod'

export const criarRelatorioSchema = z.object({
  aeronaveId: z.number().int().positive('ID da aeronave é obrigatório'),
  nomeCliente: z.string().min(1, 'Nome do cliente é obrigatório').trim(),
  dataEntrega: z.string().datetime({ message: 'Data de entrega deve ser uma data válida' }),
})
