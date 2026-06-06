import { Router } from 'express'
import { autenticar, exigirNivel } from '../middlewares/auth.middleware'
import * as ctrl from '../controllers/teste.controller'

const router = Router()

router.use(autenticar)

router.get('/', ctrl.listar)
router.get('/:id', ctrl.buscar)
router.post('/', exigirNivel('ADMINISTRADOR', 'ENGENHEIRO', 'OPERADOR'), ctrl.criar)
// Edição e exclusão de testes são intencionalmente bloqueadas para evitar manipulação de resultados

export default router
