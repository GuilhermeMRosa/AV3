import { Router } from 'express'
import { autenticar, exigirNivel } from '../middlewares/auth.middleware'
import * as ctrl from '../controllers/aeronave.controller'

const router = Router()

router.use(autenticar)

router.get('/', ctrl.listar)
router.get('/:id', ctrl.buscar)
router.post('/', exigirNivel('ADMINISTRADOR', 'ENGENHEIRO'), ctrl.criar)
router.put('/:id', exigirNivel('ADMINISTRADOR', 'ENGENHEIRO'), ctrl.atualizar)
router.delete('/:id', exigirNivel('ADMINISTRADOR'), ctrl.deletar)

export default router
