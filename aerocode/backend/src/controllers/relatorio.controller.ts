import path from 'path'
import fs from 'fs'
import { Request, Response } from 'express'
import * as service from '../services/relatorio.service'
import { criarRelatorioSchema } from '../schemas/relatorio.schema'

export async function listar(req: Request, res: Response): Promise<void> {
  try { res.json(await service.listarRelatorios()) }
  catch (err: unknown) { res.status(500).json({ erro: err instanceof Error ? err.message : 'Erro interno' }) }
}

export async function buscar(req: Request, res: Response): Promise<void> {
  try { res.json(await service.buscarRelatorio(Number(req.params.id))) }
  catch (err: unknown) { res.status(404).json({ erro: err instanceof Error ? err.message : 'Não encontrado' }) }
}

export async function gerar(req: Request, res: Response): Promise<void> {
  const parsed = criarRelatorioSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ erro: parsed.error.issues[0].message }); return }
  try { res.status(201).json(await service.gerarRelatorio(parsed.data)) }
  catch (err: unknown) { res.status(400).json({ erro: err instanceof Error ? err.message : 'Erro ao gerar relatório' }) }
}

export async function download(req: Request, res: Response): Promise<void> {
  try {
    const relatorio = await service.buscarRelatorio(Number(req.params.id))
    const aeronave = relatorio.aeronave as { codigo: string }
    const nomeArquivo = `relatorio_${aeronave.codigo}_${relatorio.id}.txt`
    const caminho = path.join(process.cwd(), 'relatorios', nomeArquivo)

    if (!fs.existsSync(caminho)) {
      res.status(404).json({ erro: 'Arquivo não encontrado. Tente gerar o relatório novamente.' })
      return
    }

    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`)
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.sendFile(caminho)
  } catch (err: unknown) {
    res.status(404).json({ erro: err instanceof Error ? err.message : 'Não encontrado' })
  }
}
