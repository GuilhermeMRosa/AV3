import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const existente = await prisma.funcionario.findUnique({ where: { usuario: 'admin' } })

  if (!existente) {
    const senhaHash = await bcrypt.hash('admin123', 10)
    await prisma.funcionario.create({
      data: {
        nome: 'Administrador',
        telefone: '(00) 00000-0000',
        endereco: 'A definir',
        usuario: 'admin',
        senha: senhaHash,
        nivel: 'ADMINISTRADOR',
      },
    })
    console.log('Usuário admin criado com sucesso.')
  } else {
    console.log('Usuário admin já existe, seed ignorado.')
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
