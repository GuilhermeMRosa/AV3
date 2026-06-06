import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface TokenPayload {
  id: number
  usuario: string
  nivel: 'ADMINISTRADOR' | 'ENGENHEIRO' | 'OPERADOR'
}

declare global {
  namespace Express {
    interface Request {
      funcionario?: TokenPayload
    }
  }
}

export function autenticar(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ erro: 'Token não fornecido' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
    req.funcionario = payload
    next()
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado' })
  }
}

export function exigirNivel(...niveis: Array<'ADMINISTRADOR' | 'ENGENHEIRO' | 'OPERADOR'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.funcionario || !niveis.includes(req.funcionario.nivel)) {
      res.status(403).json({ erro: 'Acesso negado: permissão insuficiente' })
      return
    }
    next()
  }
}
