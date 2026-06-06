import { Router } from 'express'
import { autenticar, exigirNivel } from '../middlewares/auth.middleware'
import * as ctrl from '../controllers/relatorio.controller'

const router = Router()

router.use(autenticar)

router.get('/', ctrl.listar)
router.get('/:id', ctrl.buscar)
router.get('/:id/download', ctrl.download)
router.post('/', exigirNivel('ADMINISTRADOR', 'ENGENHEIRO'), ctrl.gerar)

export default router
