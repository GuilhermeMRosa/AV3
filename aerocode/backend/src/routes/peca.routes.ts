import { Router } from 'express'
import { autenticar, exigirNivel } from '../middlewares/auth.middleware'
import * as ctrl from '../controllers/peca.controller'

const router = Router()

router.use(autenticar)

router.get('/', ctrl.listar)
router.get('/:id', ctrl.buscar)
router.post('/', exigirNivel('ADMINISTRADOR', 'ENGENHEIRO'), ctrl.criar)
router.put('/:id', exigirNivel('ADMINISTRADOR', 'ENGENHEIRO'), ctrl.atualizar)
router.patch('/:id/status', exigirNivel('ADMINISTRADOR', 'ENGENHEIRO', 'OPERADOR'), ctrl.atualizarStatus)
router.delete('/:id', exigirNivel('ADMINISTRADOR', 'ENGENHEIRO'), ctrl.deletar)

export default router
