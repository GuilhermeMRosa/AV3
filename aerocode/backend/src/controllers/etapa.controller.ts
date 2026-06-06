import { Request, Response } from 'express'
import * as service from '../services/etapa.service'
import { criarEtapaSchema, atualizarEtapaSchema } from '../schemas/etapa.schema'
import { aeronaveIdsDoOperador } from '../lib/operadorFiltro'

export async function listar(req: Request, res: Response): Promise<void> {
  const aeronaveId = req.query.aeronaveId ? Number(req.query.aeronaveId) : undefined
  try {
    const filtro = await aeronaveIdsDoOperador(req.funcionario!.id, req.funcionario!.nivel)
    res.json(await service.listarEtapas(aeronaveId, filtro))
  }
  catch (err: unknown) { res.status(500).json({ erro: err instanceof Error ? err.message : 'Erro interno' }) }
}

export async function buscar(req: Request, res: Response): Promise<void> {
  try {
    const filtro = await aeronaveIdsDoOperador(req.funcionario!.id, req.funcionario!.nivel)
    res.json(await service.buscarEtapa(Number(req.params.id), filtro))
  }
  catch (err: unknown) { res.status(404).json({ erro: err instanceof Error ? err.message : 'Não encontrado' }) }
}

export async function criar(req: Request, res: Response): Promise<void> {
  const parsed = criarEtapaSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ erro: parsed.error.issues[0].message }); return }
  try { res.status(201).json(await service.criarEtapa(parsed.data)) }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao criar' }) }
}

export async function atualizar(req: Request, res: Response): Promise<void> {
  const parsed = atualizarEtapaSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ erro: parsed.error.issues[0].message }); return }
  try { res.json(await service.atualizarEtapa(Number(req.params.id), parsed.data)) }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao atualizar' }) }
}

export async function iniciar(req: Request, res: Response): Promise<void> {
  try { res.json(await service.iniciarEtapa(Number(req.params.id))) }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao iniciar etapa' }) }
}

export async function concluir(req: Request, res: Response): Promise<void> {
  try { res.json(await service.concluirEtapa(Number(req.params.id))) }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao concluir etapa' }) }
}

export async function adicionarFuncionario(req: Request, res: Response): Promise<void> {
  try { res.json(await service.adicionarFuncionario(Number(req.params.id), Number(req.params.funcionarioId))) }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao adicionar funcionário' }) }
}

export async function removerFuncionario(req: Request, res: Response): Promise<void> {
  try { res.json(await service.removerFuncionario(Number(req.params.id), Number(req.params.funcionarioId))) }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao remover funcionário' }) }
}

export async function deletar(req: Request, res: Response): Promise<void> {
  try { await service.deletarEtapa(Number(req.params.id)); res.status(204).send() }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao deletar' }) }
}
