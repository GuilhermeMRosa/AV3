import { Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import type { NivelPermissao } from '../types'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  niveis?: NivelPermissao[]
}

export function RotaProtegida({ children, niveis }: Props) {
  const { isAuthenticated, funcionario } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (niveis && funcionario && !niveis.includes(funcionario.nivel)) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-4xl mb-4">🚫</p>
          <p className="text-lg font-semibold">Acesso negado</p>
          <p className="text-sm mt-2">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
