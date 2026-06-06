import { createContext, useState, useCallback, ReactNode } from 'react'
import api from '../services/api'
import type { Funcionario } from '../types'

interface AuthContextData {
  funcionario: Pick<Funcionario, 'id' | 'nome' | 'usuario' | 'nivel'> | null
  login: (usuario: string, senha: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [funcionario, setFuncionario] = useState(() => {
    const stored = localStorage.getItem('funcionario')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (usuario: string, senha: string) => {
    const { data } = await api.post('/auth/login', { usuario, senha })
    localStorage.setItem('token', data.token)
    localStorage.setItem('funcionario', JSON.stringify(data.funcionario))
    setFuncionario(data.funcionario)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('funcionario')
    setFuncionario(null)
  }, [])

  return (
    <AuthContext.Provider value={{ funcionario, login, logout, isAuthenticated: !!funcionario }}>
      {children}
    </AuthContext.Provider>
  )
}
