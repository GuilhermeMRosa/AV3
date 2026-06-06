import { useState } from 'react'
import { Modal } from './ui/Modal'
import { useAuth } from '../hooks/useAuth'

export function AdminAviso() {
  const { funcionario } = useAuth()
  const [dispensado, setDispensado] = useState(() => {
    return localStorage.getItem('admin_aviso_dispensado') === 'true'
  })

  if (!funcionario || funcionario.usuario !== 'admin' || dispensado) return null

  function dispensar() {
    localStorage.setItem('admin_aviso_dispensado', 'true')
    setDispensado(true)
  }

  return (
    <Modal titulo="Conta de Administrador Padrão" onClose={dispensar} tipo="aviso">
      <p>Você está acessando com a conta de administrador padrão do sistema.</p>
      <div className="bg-gray-800 rounded p-3 my-2 font-mono text-xs">
        <p>Usuário: <span className="text-yellow-400">admin</span></p>
        <p>Senha: <span className="text-yellow-400">admin123</span></p>
      </div>
      <p className="text-yellow-400 font-semibold">
        É de extrema importância que você altere a senha desta conta imediatamente.
      </p>
      <p>
        Esta conta não deve ser utilizada em ambiente de produção. Crie um novo administrador e atualize as credenciais.
      </p>
    </Modal>
  )
}
