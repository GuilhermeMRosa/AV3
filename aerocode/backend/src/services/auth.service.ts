import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

export async function login(usuario: string, senha: string) {
  const funcionario = await prisma.funcionario.findUnique({ where: { usuario } })

  if (!funcionario) {
    throw new Error('Usuário ou senha inválidos')
  }

  const senhaCorreta = await bcrypt.compare(senha, funcionario.senha)

  if (!senhaCorreta) {
    throw new Error('Usuário ou senha inválidos')
  }

  const token = jwt.sign(
    { id: funcionario.id, usuario: funcionario.usuario, nivel: funcionario.nivel },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  )

  return {
    token,
    funcionario: {
      id: funcionario.id,
      nome: funcionario.nome,
      usuario: funcionario.usuario,
      nivel: funcionario.nivel,
    },
  }
}
