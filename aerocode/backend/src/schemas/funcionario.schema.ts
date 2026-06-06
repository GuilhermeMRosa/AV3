import { z } from 'zod'

const naoApenasEspacos = (val: string) => val.trim().length > 0

export const criarFuncionarioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').refine(naoApenasEspacos, 'Nome não pode ser apenas espaços'),
  telefone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone deve seguir o formato (11) 91234-5678'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  usuario: z.string().min(1, 'Usuário é obrigatório').refine(naoApenasEspacos, 'Usuário não pode ser apenas espaços'),
  senha: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .refine(naoApenasEspacos, 'Senha não pode ser apenas espaços'),
  nivel: z.enum(['ADMINISTRADOR', 'ENGENHEIRO', 'OPERADOR']),
})

export const atualizarFuncionarioSchema = criarFuncionarioSchema.partial().extend({
  senha: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .refine(naoApenasEspacos, 'Senha não pode ser apenas espaços')
    .optional(),
})

export const loginSchema = z.object({
  usuario: z.string().min(1, 'Usuário é obrigatório'),
  senha: z.string().min(1, 'Senha é obrigatória'),
})
