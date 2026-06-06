import { Request, Response } from 'express'
import { login } from '../services/auth.service'
import { loginSchema } from '../schemas/funcionario.schema'

export async function loginController(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ erro: parsed.error.issues[0].message })
    return
  }

  try {
    const resultado = await login(parsed.data.usuario, parsed.data.senha)
    res.json(resultado)
  } catch (err: unknown) {
    res.status(401).json({ erro: err instanceof Error ? err.message : 'Erro no login' })
  }
}
