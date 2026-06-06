export type NivelPermissao = 'ADMINISTRADOR' | 'ENGENHEIRO' | 'OPERADOR'
export type TipoAeronave = 'COMERCIAL' | 'MILITAR'
export type TipoPeca = 'NACIONAL' | 'IMPORTADA'
export type StatusPeca = 'EM_PRODUCAO' | 'EM_TRANSPORTE' | 'PRONTA'
export type StatusEtapa = 'PENDENTE' | 'ANDAMENTO' | 'CONCLUIDA'
export type TipoTeste = 'ELETRICO' | 'HIDRAULICO' | 'AERODINAMICO'
export type ResultadoTeste = 'APROVADO' | 'REPROVADO'

export interface Funcionario {
  id: number
  nome: string
  usuario: string
  telefone: string
  endereco: string
  nivel: NivelPermissao
}

export interface Aeronave {
  id: number
  codigo: string
  modelo: string
  tipo: TipoAeronave
  capacidade: number
  alcance: number
  pecas?: Peca[]
  etapas?: Etapa[]
  testes?: Teste[]
  relatorio?: Relatorio | null
}

export interface Peca {
  id: number
  nome: string
  tipo: TipoPeca
  fornecedor: string
  status: StatusPeca
  aeronaveId: number
}

export interface Etapa {
  id: number
  nome: string
  prazo: string
  status: StatusEtapa
  aeronaveId: number
  funcionarios: Pick<Funcionario, 'id' | 'nome' | 'nivel'>[]
}

export interface Teste {
  id: number
  tipo: TipoTeste
  resultado: ResultadoTeste
  aeronaveId: number
}

export interface Relatorio {
  id: number
  aeronaveId: number
  nomeCliente: string
  dataEntrega: string
  aeronave?: Aeronave
}

export interface AuthResponse {
  token: string
  funcionario: Pick<Funcionario, 'id' | 'nome' | 'usuario' | 'nivel'>
}
