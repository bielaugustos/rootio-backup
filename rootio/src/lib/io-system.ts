// ─── Sistema IO — Economia de Gamificação ──────────────────────────────

export const IO_RULES = {
  input_registro:     10,
  conclusao:          10,
  ciclo_completo:     50,
  combo_streak:       20,
  max_io_por_dia:    200,
  max_inputs_por_dia: 10,
} as const

export const NIVEIS = [
  {
    nivel: 1,
    titulo: 'Pessoa Exploradora',
    xp_min: 0,
    xp_max: 500,
    cor: '#888780',
    desbloqueios: ['Registro básico', 'Loja básica', 'Temas iniciais'],
  },
  {
    nivel: 2,
    titulo: 'Pessoa Conectora',
    xp_min: 501,
    xp_max: 1500,
    cor: '#f59e0b',
    desbloqueios: ['Widgets de estatísticas', 'Automação de inputs', 'Temas intermediários'],
  },
  {
    nivel: 3,
    titulo: 'Pessoa Visionária',
    xp_min: 1501,
    xp_max: Infinity,
    cor: '#F0C020',
    desbloqueios: ['Previsão de tendências', 'Temas dinâmicos', 'Exportação avançada'],
  },
]

export interface UserEconomy {
  xp_total:    number
  saldo_io:    number
  nivel:       number
  titulo:      string
  streak:      number
  io_hoje:     number
  inputs_hoje: number
  data_hoje:   string
}

export const ECONOMY_DEFAULT: UserEconomy = {
  xp_total:    0,
  saldo_io:    0,
  nivel:       1,
  titulo:      'Pessoa Exploradora',
  streak:      0,
  io_hoje:     0,
  inputs_hoje: 0,
  data_hoje:   new Date().toISOString().split('T')[0],
}

export function getNivel(xp: number) {
  return NIVEIS.find(n => xp >= n.xp_min && xp <= n.xp_max) ?? NIVEIS[0]
}

export function getProgresso(xp: number): number {
  const n = getNivel(xp)
  if (n.nivel === 3) return 100
  const range = n.xp_max - n.xp_min
  return Math.min(100, Math.round(((xp - n.xp_min) / range) * 100))
}

export function ganharIO(
  economy: UserEconomy,
  tipo: keyof typeof IO_RULES,
): { economy: UserEconomy; ganhou: number; subiuNivel: boolean } {
  const hoje = new Date().toISOString().split('T')[0]
  let eco = { ...economy }

  // Reset diário
  if (eco.data_hoje !== hoje) {
    eco = { ...eco, io_hoje: 0, inputs_hoje: 0, data_hoje: hoje }
  }

  // Verificar limites
  if (eco.io_hoje >= IO_RULES.max_io_por_dia) return { economy: eco, ganhou: 0, subiuNivel: false }
  if (tipo === 'input_registro' && eco.inputs_hoje >= IO_RULES.max_inputs_por_dia)
    return { economy: eco, ganhou: 0, subiuNivel: false }

  const valor = IO_RULES[tipo] ?? 0
  const nivelAntes = eco.nivel

  eco.xp_total  += valor
  eco.saldo_io  += valor
  eco.io_hoje   += valor
  if (tipo === 'input_registro') eco.inputs_hoje++

  const novoNivel = getNivel(eco.xp_total)
  eco.nivel = novoNivel.nivel
  eco.titulo = novoNivel.titulo

  return {
    economy: eco,
    ganhou: valor,
    subiuNivel: novoNivel.nivel > nivelAntes,
  }
}
