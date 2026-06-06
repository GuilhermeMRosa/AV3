import { Router } from 'express'
import { autenticar, exigirNivel } from '../middlewares/auth.middleware'
import * as ctrl from '../controllers/funcionario.controller'

const router = Router()

router.use(autenticar)

router.get('/', ctrl.listar)
router.get('/:id', ctrl.buscar)
router.post('/', exigirNivel('ADMINISTRADOR'), ctrl.criar)
router.put('/:id', exigirNivel('ADMINISTRADOR'), ctrl.atualizar)
router.delete('/:id', exigirNivel('ADMINISTRADOR'), ctrl.deletar)

export default router
