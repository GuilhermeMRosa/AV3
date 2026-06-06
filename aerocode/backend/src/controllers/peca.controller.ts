import { Request, Response } from 'express'
import * as service from '../services/peca.service'
import { criarPecaSchema, atualizarPecaSchema, atualizarStatusPecaSchema } from '../schemas/peca.schema'
import { aeronaveIdsDoOperador } from '../lib/operadorFiltro'

export async function listar(req: Request, res: Response): Promise<void> {
  const aeronaveId = req.query.aeronaveId ? Number(req.query.aeronaveId) : undefined
  try {
    const filtro = await aeronaveIdsDoOperador(req.funcionario!.id, req.funcionario!.nivel)
    res.json(await service.listarPecas(aeronaveId, filtro))
  }
  catch (err: unknown) { res.status(500).json({ erro: err instanceof Error ? err.message : 'Erro interno' }) }
}

export async function buscar(req: Request, res: Response): Promise<void> {
  try { res.json(await service.buscarPeca(Number(req.params.id))) }
  catch (err: unknown) { res.status(404).json({ erro: err instanceof Error ? err.message : 'Não encontrado' }) }
}

export async function criar(req: Request, res: Response): Promise<void> {
  const parsed = criarPecaSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ erro: parsed.error.issues[0].message }); return }
  try { res.status(201).json(await service.criarPeca(parsed.data)) }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao criar' }) }
}

export async function atualizar(req: Request, res: Response): Promise<void> {
  const parsed = atualizarPecaSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ erro: parsed.error.issues[0].message }); return }
  try { res.json(await service.atualizarPeca(Number(req.params.id), parsed.data)) }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao atualizar' }) }
}

export async function atualizarStatus(req: Request, res: Response): Promise<void> {
  const parsed = atualizarStatusPecaSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ erro: parsed.error.issues[0].message }); return }
  try { res.json(await service.atualizarStatusPeca(Number(req.params.id), parsed.data)) }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao atualizar status' }) }
}

export async function deletar(req: Request, res: Response): Promise<void> {
  try { await service.deletarPeca(Number(req.params.id)); res.status(204).send() }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao deletar' }) }
}
