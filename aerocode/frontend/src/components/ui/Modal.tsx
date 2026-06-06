import { ReactNode } from 'react'

interface ModalProps {
  titulo: string
  children: ReactNode
  onClose?: () => void
  tipo?: 'info' | 'aviso' | 'perigo'
}

export function Modal({ titulo, children, onClose, tipo = 'info' }: ModalProps) {
  const cores = {
    info: 'border-blue-500',
    aviso: 'border-yellow-500',
    perigo: 'border-red-500',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className={`bg-gray-900 border-t-4 ${cores[tipo]} rounded-lg shadow-xl w-full max-w-md p-6`}>
        <h2 className="text-lg font-bold text-white mb-4">{titulo}</h2>
        <div className="text-gray-300 text-sm space-y-2">{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
          >
            Entendi
          </button>
        )}
      </div>
    </div>
  )
}
