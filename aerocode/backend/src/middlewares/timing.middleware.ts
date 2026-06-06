import { Request, Response, NextFunction } from 'express'

interface EstatisticaRota {
  count: number
  soma: number
  min: number
  max: number
}

// Armazena estatísticas de processamento em memória por rota
const stats: Record<string, EstatisticaRota> = {}

export function resetarEstatisticas() {
  for (const key of Object.keys(stats)) delete stats[key]
}

export function obterEstatisticas() {
  const resultado: Record<string, { media: number; min: number; max: number; amostras: number }> = {}
  for (const [rota, s] of Object.entries(stats)) {
    resultado[rota] = {
      media: parseFloat((s.soma / s.count).toFixed(3)),
      min: s.min,
      max: s.max,
      amostras: s.count,
    }
  }
  return resultado
}

export function timingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const inicio = process.hrtime.bigint()

  res.on('finish', () => {
    const fimNs = process.hrtime.bigint()
    const duracaoMs = parseFloat((Number(fimNs - inicio) / 1_000_000).toFixed(3))

    // Adiciona header na resposta para o cliente poder ler
    // (o autocannon ainda pode capturar se configurado, mas usamos o endpoint de stats)
    res.setHeader('X-Processing-Time', duracaoMs)

    // Acumula estatísticas por rota (método + path sem IDs numéricos)
    const rotaNormalizada = `${req.method} ${req.path.replace(/\/\d+/g, '/:id')}`
    if (!stats[rotaNormalizada]) {
      stats[rotaNormalizada] = { count: 0, soma: 0, min: Infinity, max: -Infinity }
    }
    const s = stats[rotaNormalizada]
    s.count++
    s.soma += duracaoMs
    if (duracaoMs < s.min) s.min = duracaoMs
    if (duracaoMs > s.max) s.max = duracaoMs
  })

  next()
}
