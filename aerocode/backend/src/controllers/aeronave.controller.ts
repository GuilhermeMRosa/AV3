import { Request, Response } from 'express'
import * as service from '../services/aeronave.service'
import { criarAeronaveSchema, atualizarAeronaveSchema } from '../schemas/aeronave.schema'
import { aeronaveIdsDoOperador } from '../lib/operadorFiltro'

export async function listar(req: Request, res: Response): Promise<void> {
  try {
    const filtro = await aeronaveIdsDoOperador(req.funcionario!.id, req.funcionario!.nivel)
    res.json(await service.listarAeronaves(filtro))
  }
  catch (err: unknown) { res.status(500).json({ erro: err instanceof Error ? err.message : 'Erro interno' }) }
}

export async function buscar(req: Request, res: Response): Promise<void> {
  try {
    const filtro = await aeronaveIdsDoOperador(req.funcionario!.id, req.funcionario!.nivel)
    res.json(await service.buscarAeronave(Number(req.params.id), filtro))
  }
  catch (err: unknown) { res.status(404).json({ erro: err instanceof Error ? err.message : 'Não encontrado' }) }
}

export async function criar(req: Request, res: Response): Promise<void> {
  const parsed = criarAeronaveSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ erro: parsed.error.issues[0].message }); return }
  try { res.status(201).json(await service.criarAeronave(parsed.data)) }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao criar' }) }
}

export async function atualizar(req: Request, res: Response): Promise<void> {
  const parsed = atualizarAeronaveSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ erro: parsed.error.issues[0].message }); return }
  try { res.json(await service.atualizarAeronave(Number(req.params.id), parsed.data)) }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao atualizar' }) }
}

export async function deletar(req: Request, res: Response): Promise<void> {
  try { await service.deletarAeronave(Number(req.params.id)); res.status(204).send() }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao deletar' }) }
}
