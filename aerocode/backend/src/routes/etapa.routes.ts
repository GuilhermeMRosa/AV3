import { Router } from 'express'
import { autenticar, exigirNivel } from '../middlewares/auth.middleware'
import * as ctrl from '../controllers/etapa.controller'

const router = Router()

router.use(autenticar)

router.get('/', ctrl.listar)
router.get('/:id', ctrl.buscar)
router.post('/', exigirNivel('ADMINISTRADOR', 'ENGENHEIRO'), ctrl.criar)
router.put('/:id', exigirNivel('ADMINISTRADOR', 'ENGENHEIRO'), ctrl.atualizar)
router.delete('/:id', exigirNivel('ADMINISTRADOR', 'ENGENHEIRO'), ctrl.deletar)

router.post('/:id/iniciar', exigirNivel('ADMINISTRADOR', 'ENGENHEIRO', 'OPERADOR'), ctrl.iniciar)
router.post('/:id/concluir', exigirNivel('ADMINISTRADOR', 'ENGENHEIRO', 'OPERADOR'), ctrl.concluir)
router.post('/:id/funcionarios/:funcionarioId', exigirNivel('ADMINISTRADOR', 'ENGENHEIRO'), ctrl.adicionarFuncionario)
router.delete('/:id/funcionarios/:funcionarioId', exigirNivel('ADMINISTRADOR', 'ENGENHEIRO'), ctrl.removerFuncionario)

export default router
