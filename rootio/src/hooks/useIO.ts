'use client'
import { useAppStore } from '@/store/useAppStore'
import { saveStorage, storage, todayISO } from '@/lib/utils'
import { IO_RULES } from '@/lib/io-system'
import { toast } from 'sonner'
import { Lightning } from '@phosphor-icons/react'

const KEY_HISTORY = 'io_io_history'

export interface IOEvent {
  id: number
  tipo: keyof typeof IO_RULES
  descricao: string
  valor: number
  data: string
  hora: string
}

export function useIO() {
  const { earnIO } = useAppStore()

  function registrar(tipo: keyof typeof IO_RULES, descricao: string) {
    const now = new Date()
    const valor = IO_RULES[tipo] ?? 0

    earnIO(tipo)

    const history = storage<IOEvent[]>(KEY_HISTORY, [])
    const event: IOEvent = {
      id: Date.now(),
      tipo,
      descricao,
      valor,
      data: now.toISOString().split('T')[0],
      hora: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }
    saveStorage(KEY_HISTORY, [event, ...history].slice(0, 200))

    if (valor > 0) {
      toast(`+${valor} IO`, {
        description: descricao,
        duration: 2000,
      })
    }

    return valor
  }

  return { registrar }
}