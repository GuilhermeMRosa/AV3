import { Request, Response } from 'express'
import * as service from '../services/funcionario.service'
import { criarFuncionarioSchema, atualizarFuncionarioSchema } from '../schemas/funcionario.schema'

export async function listar(req: Request, res: Response): Promise<void> {
  try {
    res.json(await service.listarFuncionarios())
  } catch (err: unknown) {
    res.status(500).json({ erro: err instanceof Error ? err.message : 'Erro interno' })
  }
}

export async function buscar(req: Request, res: Response): Promise<void> {
  try {
    res.json(await service.buscarFuncionario(Number(req.params.id)))
  } catch (err: unknown) {
    res.status(404).json({ erro: err instanceof Error ? err.message : 'Não encontrado' })
  }
}

export async function criar(req: Request, res: Response): Promise<void> {
  const parsed = criarFuncionarioSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ erro: parsed.error.issues[0].message }); return }
  try {
    res.status(201).json(await service.criarFuncionario(parsed.data))
  } catch (err: unknown) {
    res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao criar' })
  }
}

export async function atualizar(req: Request, res: Response): Promise<void> {
  const parsed = atualizarFuncionarioSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ erro: parsed.error.issues[0].message }); return }
  try {
    res.json(await service.atualizarFuncionario(Number(req.params.id), parsed.data, req.funcionario!.id))
  } catch (err: unknown) {
    res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao atualizar' })
  }
}

export async function deletar(req: Request, res: Response): Promise<void> {
  try {
    await service.deletarFuncionario(Number(req.params.id), req.funcionario!.id)
    res.status(204).send()
  } catch (err: unknown) {
    res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao deletar' })
  }
}
