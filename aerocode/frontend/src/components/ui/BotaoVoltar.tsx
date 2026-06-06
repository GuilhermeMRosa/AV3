import { useNavigate } from 'react-router'

interface Props {
  para?: string
}

export function BotaoVoltar({ para }: Props) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => para ? navigate(para) : navigate(-1)}
      className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition group"
    >
      <svg
        className="w-4 h-4 transition group-hover:-translate-x-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Voltar
    </button>
  )
}
