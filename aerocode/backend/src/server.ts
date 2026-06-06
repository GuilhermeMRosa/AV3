import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { timingMiddleware, obterEstatisticas, resetarEstatisticas } from './middlewares/timing.middleware'
import authRoutes from './routes/auth.routes'
import funcionarioRoutes from './routes/funcionario.routes'
import aeronaveRoutes from './routes/aeronave.routes'
import pecaRoutes from './routes/peca.routes'
import etapaRoutes from './routes/etapa.routes'
import testeRoutes from './routes/teste.routes'
import relatorioRoutes from './routes/relatorio.routes'

const app = express()

app.use(cors())
app.use(express.json())
app.use(timingMiddleware)

app.use('/auth', authRoutes)
app.use('/funcionarios', funcionarioRoutes)
app.use('/aeronaves', aeronaveRoutes)
app.use('/pecas', pecaRoutes)
app.use('/etapas', etapaRoutes)
app.use('/testes', testeRoutes)
app.use('/relatorios', relatorioRoutes)

// Endpoint interno para o script de métricas coletar os dados de timing do servidor
app.get('/interno/timing', (_req, res) => {
  res.json(obterEstatisticas())
})
app.delete('/interno/timing', (_req, res) => {
  resetarEstatisticas()
  res.status(204).send()
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
