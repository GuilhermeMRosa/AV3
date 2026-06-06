import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { criarFuncionarioSchema, atualizarFuncionarioSchema } from '../schemas/funcionario.schema'
import { z } from 'zod'

type CriarFuncionario = z.infer<typeof criarFuncionarioSchema>
type AtualizarFuncionario = z.infer<typeof atualizarFuncionarioSchema>

export async function listarFuncionarios() {
  return prisma.funcionario.findMany({
    select: { id: true, nome: true, usuario: true, telefone: true, endereco: true, nivel: true },
  })
}

export async function buscarFuncionario(id: number) {
  const funcionario = await prisma.funcionario.findUnique({
    where: { id },
    select: { id: true, nome: true, usuario: true, telefone: true, endereco: true, nivel: true },
  })
  if (!funcionario) throw new Error('Funcionário não encontrado')
  return funcionario
}

export async function criarFuncionario(dados: CriarFuncionario) {
  const existente = await prisma.funcionario.findUnique({ where: { usuario: dados.usuario } })
  if (existente) throw new Error('Usuário já está em uso')

  const telExistente = await prisma.funcionario.findFirst({ where: { telefone: dados.telefone } })
  if (telExistente) throw new Error('Este telefone já está cadastrado para outro funcionário')

  const senhaHash = await bcrypt.hash(dados.senha, 10)

  return prisma.funcionario.create({
    data: { ...dados, senha: senhaHash },
    select: { id: true, nome: true, usuario: true, telefone: true, endereco: true, nivel: true },
  })
}

export async function atualizarFuncionario(id: number, dados: AtualizarFuncionario, solicitanteId: number) {
  await buscarFuncionario(id)

  // Impede auto-rebaixamento de nível
  if (solicitanteId === id && dados.nivel) {
    const solicitante = await prisma.funcionario.findUnique({ where: { id: solicitanteId } })
    if (solicitante && dados.nivel !== solicitante.nivel) {
      throw new Error('Você não pode alterar seu próprio nível de permissão')
    }
  }

  // Garante que sempre existe ao menos um administrador
  if (dados.nivel && dados.nivel !== 'ADMINISTRADOR') {
    const alvo = await prisma.funcionario.findUnique({ where: { id } })
    if (alvo?.nivel === 'ADMINISTRADOR') {
      const totalAdmins = await prisma.funcionario.count({ where: { nivel: 'ADMINISTRADOR' } })
      if (totalAdmins <= 1) {
        throw new Error('O sistema deve ter ao menos um administrador. Crie outro antes de rebaixar este.')
      }
    }
  }

  if (dados.usuario) {
    const existente = await prisma.funcionario.findUnique({ where: { usuario: dados.usuario } })
    if (existente && existente.id !== id) throw new Error('Usuário já está em uso')
  }

  if (dados.telefone) {
    const telExistente = await prisma.funcionario.findFirst({ where: { telefone: dados.telefone } })
    if (telExistente && telExistente.id !== id) throw new Error('Este telefone já está cadastrado para outro funcionário')
  }

  const atualizado = { ...dados } as Record<string, unknown>
  if (dados.senha) {
    atualizado.senha = await bcrypt.hash(dados.senha, 10)
  }

  return prisma.funcionario.update({
    where: { id },
    data: atualizado,
    select: { id: true, nome: true, usuario: true, telefone: true, endereco: true, nivel: true },
  })
}

export async function deletarFuncionario(id: number, solicitanteId: number) {
  if (id === solicitanteId) throw new Error('Você não pode excluir sua própria conta')

  const alvo = await prisma.funcionario.findUnique({ where: { id } })
  if (!alvo) throw new Error('Funcionário não encontrado')

  if (alvo.nivel === 'ADMINISTRADOR') {
    const totalAdmins = await prisma.funcionario.count({ where: { nivel: 'ADMINISTRADOR' } })
    if (totalAdmins <= 1) {
      throw new Error('O sistema deve ter ao menos um administrador. Crie outro antes de excluir este.')
    }
  }

  await prisma.funcionario.delete({ where: { id } })
}
