import { Request, Response } from 'express'
import * as service from '../services/teste.service'
import { criarTesteSchema, atualizarTesteSchema } from '../schemas/teste.schema'
import { aeronaveIdsDoOperador } from '../lib/operadorFiltro'

export async function listar(req: Request, res: Response): Promise<void> {
  const aeronaveId = req.query.aeronaveId ? Number(req.query.aeronaveId) : undefined
  try {
    const filtro = await aeronaveIdsDoOperador(req.funcionario!.id, req.funcionario!.nivel)
    res.json(await service.listarTestes(aeronaveId, filtro))
  }
  catch (err: unknown) { res.status(500).json({ erro: err instanceof Error ? err.message : 'Erro interno' }) }
}

export async function buscar(req: Request, res: Response): Promise<void> {
  try { res.json(await service.buscarTeste(Number(req.params.id))) }
  catch (err: unknown) { res.status(404).json({ erro: err instanceof Error ? err.message : 'Não encontrado' }) }
}

export async function criar(req: Request, res: Response): Promise<void> {
  const parsed = criarTesteSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ erro: parsed.error.issues[0].message }); return }
  try { res.status(201).json(await service.criarTeste(parsed.data)) }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao criar' }) }
}

export async function atualizar(req: Request, res: Response): Promise<void> {
  const parsed = atualizarTesteSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ erro: parsed.error.issues[0].message }); return }
  try { res.json(await service.atualizarTeste(Number(req.params.id), parsed.data)) }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao atualizar' }) }
}

export async function deletar(req: Request, res: Response): Promise<void> {
  try { await service.deletarTeste(Number(req.params.id)); res.status(204).send() }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao deletar' }) }
}
