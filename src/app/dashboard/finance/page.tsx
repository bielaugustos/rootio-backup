'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { saveStorage, storage, formatBRL, todayISO } from '@/lib/utils'
import { Transaction, FinancialGoal } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  ArrowUp, ArrowDown, Trash, Plus, CaretLeft, CaretRight, PiggyBank, Target, PencilSimple, ArrowCounterClockwise, TrashSimple,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const KEY = {
  transactions: 'io_fin_transactions',
  goals: 'io_fin_goals',
  emergency: 'io_fin_emergency',
}

const CATS_IN = ['Salário', 'Freelance', 'Investimento', 'Outros']
const CATS_OUT = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros']

export default function FinancePage() {
  const { isLoggedIn, userId } = useAppStore()
  
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [emergency, setEmergency] = useState({ current: 0, target: 5000 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setTransactions(storage<Transaction[]>(KEY.transactions, []))
    setGoals(storage<FinancialGoal[]>(KEY.goals, []))
    setEmergency(storage(KEY.emergency, { current: 0, target: 5000 }))
    setLoaded(true)
  }, [])
  
  const [showForm, setShowForm] = useState(false)
  const [txType, setTxType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [cat, setCat] = useState('')
  const [txDate, setTxDate] = useState(todayISO())
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [goalDeadline, setGoalDeadline] = useState('')
  const [activeTab, setActiveTab] = useState('chat')
  const [showEmergencyForm, setShowEmergencyForm] = useState(false)
  const [emergencyTarget, setEmergencyTarget] = useState('')
  const [emergencyAport, setEmergencyAport] = useState('')
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null)
  const [lastAport, setLastAport] = useState<number | null>(null)
  const [emergencySet, setEmergencySet] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem(KEY.emergency)
    return stored ? true : false
  })

  // AI Chat state
  const [chatInput, setChatInput] = useState('')
  const [chatMsgs, setChatMsgs] = useState<{t:'u'|'a';text?:string;d?:any;id:number}[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [showCmdMenu, setShowCmdMenu] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const cmdMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMsgs, chatLoading])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cmdMenuRef.current && !cmdMenuRef.current.contains(e.target as Node)) {
        setShowCmdMenu(false)
      }
    }
    if (showCmdMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCmdMenu])

  function handleChatKeyDown(e: React.KeyboardEvent) {
    if (e.key === '/') {
      e.preventDefault()
      setShowCmdMenu(true)
    } else if (e.key === 'Escape') {
      setShowCmdMenu(false)
    } else if (e.key === 'Enter' && !showCmdMenu) {
      e.preventDefault()
      sendChat()
    }
  }

  function selectCommand(cmd: string) {
    setChatInput(cmd)
    setShowCmdMenu(false)
  }

  function parseFinance(text: string): { resposta: string; transacao: { tipo: 'receita'|'despesa'|null; valor: number|null; categoria: string|null }; acoes: string[]|null; insight: string|null; saldo?: number; acao?: 'adicionar'|'editar'|'excluir'|null } {
    const lower = text.toLowerCase()

    // Detectar ação
    let acao: 'adicionar'|'editar'|'excluir'|null = null
    if (lower.includes('adicionar') || lower.includes('adicione') || lower.includes('adicionei') || lower.includes('registrar') || lower.includes('criar') || lower.includes('incluir') || lower.includes('paguei') || lower.includes('recebi') || lower.includes('ganhei') || lower.includes('gastei')) {
      acao = 'adicionar'
    } else if (lower.includes('excluir') || lower.includes('delete') || lower.includes('remover') || lower.includes('deletar')) {
      acao = 'excluir'
    }

    // Detectar tipo
    let tipo: 'receita'|'despesa'|null = null
    if (lower.includes('recebi') || lower.includes('ganhei') || lower.includes('receita')) tipo = 'receita'
    if (lower.includes('gastei') || lower.includes('paguei') || lower.includes('despesa') || lower.includes('gasto')) tipo = 'despesa'

    // Detectar tab/funcionalidade
    let target: 'financas'|'reserva'|'metas'|'emergencia' = 'financas'
    if (lower.includes('reserva') || lower.includes('emergência') || lower.includes('piggy')) target = 'reserva'
    if (lower.includes('meta') || lower.includes('objetivo') || lower.includes('poupança')) target = 'metas'

    // Extrair valor - suporta R$ 1.200,50 ou R$ 1200,50 ou R$ 1200.50 ou R$ 1200
    const valorMatch = text.replace(/[R$]/g, '').match(/[\d.,]+$/)
    let valor: number | null = null
    if (valorMatch) {
      let cleanVal = valorMatch[0].trim()
      // Brazilian format: 5.000 = 5000, 5.000,50 = 5000.50
      // Check if there's a comma (decimal separator in BR)
      if (cleanVal.includes(',')) {
        const parts = cleanVal.split(',')
        // Only one comma - treat as decimal separator
        // But first check if the part after comma has exactly 3 digits (thousands)
        const afterComma = parts[parts.length - 1]
        if (afterComma.length === 3 && parts.length === 2) {
          // Could be 1.200,500 or just 1.200,500 (unlikely to have 3 decimal places)
          // Assume 3 digits after comma is thousands if there's a dot earlier
          if (cleanVal.includes('.')) {
            cleanVal = cleanVal.replace(/\./g, '').replace(',', '.')
          } else {
            cleanVal = cleanVal.replace(',', '.')
          }
        } else {
          // Normal case: comma is decimal
          cleanVal = cleanVal.replace(/\./g, '').replace(',', '.')
        }
      } else if (cleanVal.includes('.')) {
        // No comma - check if dot is thousands separator
        // In BR format, if all dots separate exactly 3 digits, it's thousands
        const parts = cleanVal.split('.')
        if (parts.length > 1 && parts.every(p => p.length === 3)) {
          cleanVal = cleanVal.replace(/\./g, '')
        }
      }
      valor = parseFloat(cleanVal)
    }

    // Categorias
    const cats: Record<string, string[]> = {
      'Alimentação': ['mercado', 'comida', 'restaurante', 'lanchonete', 'ifood'],
      'Transporte': ['uber', 'ônibus', 'gasolina', 'combustível', 'taxi'],
      'Moradia': ['aluguel', 'casa', 'luz', 'água', 'condomínio'],
      'Saúde': ['farmácia', 'médico', 'consulta', 'hospital'],
      'Lazer': ['cinema', 'jogo', 'Netflix', 'spotify'],
      'Educação': ['curso', 'livro', 'escola', 'faculdade'],
      'Freelance': ['freela', 'freelance', 'projeto'],
      'Salário': ['salário', 'salario', 'vencimento'],
    }

    let categoria: string|null = null
    for (const [cat, keys] of Object.entries(cats)) {
      if (keys.some(k => lower.includes(k))) {
        categoria = cat
        break
      }
    }

    // Gerar resposta
    let resposta = ''
    if (acao === 'adicionar') {
      if (target === 'financas' && valor) {
        resposta = tipo === 'receita' 
          ? `Entendi! Vou adicionar uma entrada de ${formatBRL(valor)}${categoria ? ` na categoria ${categoria}` : ''}.`
          : `Entendi! Vou adicionar uma saída de ${formatBRL(valor)}${categoria ? ` na categoria ${categoria}` : ''}.`
      } else if (target === 'reserva' && valor) {
        resposta = `Entendi! Vou adicionar R$ ${valor} na reserva de emergência.`
      } else if (target === 'metas') {
        resposta = `Entendi! Preciso de mais detalhes. Diga o nome da meta e o valor.`
      } else {
        resposta = 'Entendi! Diga o valor e o tipo (receita ou despesa).'
      }
    } else if (acao === 'excluir') {
      resposta = `Entendi! Vou excluir${valor ? ` a transação de ${formatBRL(valor)}` : ' a última transação'}.`
    } else if (tipo) {
      resposta = `Entendi! Registrei uma ${tipo === 'receita' ? 'entrada' : 'saída'} de ${valor ? formatBRL(valor) : ''}.`
    } else {
      resposta = 'Não entendi bem. Tente usar comandos como "adicione R$ 100 de salário" ou "excluir última despesa".'
    }

    return {
      resposta,
      transacao: { tipo, valor, categoria },
      acoes: tipo === 'despesa' ? ['Revise gastos similares', 'Defina um limite mensal'] : tipo === 'receita' ? ['Considere investir parte', 'Atualize o planejamento'] : null,
      insight: valor ? (tipo === 'despesa' ? 'Cuidado com pequenos gastos recorrentes.' : 'Ótimo! Aumentar receitas é essencial.') : null,
      acao,
    }
  }

  function sendChat() {
    const text = chatInput.trim()
    if (!text || chatLoading) return

    setChatMsgs(p => [...p, { t: 'u', text, id: Date.now() }])
    setChatInput('')
    setChatLoading(true)

    setTimeout(() => {
      const parsed = parseFinance(text)

      // Executar ação se detectada
      if (parsed.acao === 'adicionar' && parsed.transacao.valor) {
        if (parsed.transacao.tipo) {
          // Adicionar transação
          const nova: Transaction = {
            id: Date.now(),
            type: parsed.transacao.tipo === 'receita' ? 'income' : 'expense',
            amount: parsed.transacao.valor,
            description: parsed.transacao.categoria || (parsed.transacao.tipo === 'receita' ? 'Receita' : 'Despesa'),
            category: parsed.transacao.categoria || 'Outros',
            date: todayISO(),
          }
          const lista = [nova, ...transactions]
          setTransactions(lista)
          saveStorage(KEY.transactions, lista)
        } else if (text.toLowerCase().includes('reserva') || text.toLowerCase().includes('emergência')) {
          // Adicionar à reserva
          const novo = { ...emergency, current: emergency.current + parsed.transacao.valor }
          setEmergency(novo)
          saveStorage(KEY.emergency, novo)
        }
      } else if (parsed.acao === 'excluir') {
        // Excluir última transação
        if (transactions.length > 0) {
          const lista = transactions.slice(1)
          setTransactions(lista)
          saveStorage(KEY.transactions, lista)
        }
      }

      let ns = balance
      if (parsed.transacao?.valor && parsed.transacao.tipo) {
        if (parsed.transacao.tipo === 'receita') {
          ns += parsed.transacao.valor
        } else {
          ns -= parsed.transacao.valor
        }
      }

      parsed.saldo = ns
      const parsedWithSaldo = parsed as typeof parsed & { saldo: number }
      setChatMsgs(p => [...p, { t: 'a', d: parsedWithSaldo, id: Date.now() + 1 }])
      setChatLoading(false)
    }, 800)
  }

  const chatSuggestions = [
    'Recebi 3000 de salário',
    'Gastei 85 no mercado',
    'Paguei 1200 de aluguel',
    'Adicionei 500 na reserva',
    'Ganhei 800 de freelance',
    'Paguei 150 de luz',
    'Excluir última transação',
  ]

  const currentMonth = useMemo(() => {
    return currentDate.toISOString().slice(0, 7)
  }, [currentDate])

  const monthLabel = useMemo(() => {
    return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }, [currentDate])

  const txMes = useMemo(() => {
    return transactions.filter(t => t.date?.startsWith(currentMonth))
  }, [transactions, currentMonth])

  const income = txMes.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const expense = txMes.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const balance = income - expense

  function prevMonth() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  function addTransaction() {
    const val = parseFloat(amount.replace(',', '.'))
    if (!val || !desc) return
    const novo: Transaction = {
      id: Date.now(),
      type: txType,
      amount: val,
      description: desc,
      category: cat || 'Outros',
      date: txDate,
    }
    const lista = [novo, ...transactions]
    setTransactions(lista)
    saveStorage(KEY.transactions, lista)
    
    setAmount('')
    setDesc('')
    setCat('')
    setTxDate(todayISO())
    setShowForm(false)
  }

  function deleteTransaction(id: number) {
    const lista = transactions.filter(t => t.id !== id)
    setTransactions(lista)
    saveStorage(KEY.transactions, lista)
  }

  function addGoal() {
    if (!goalName || !goalTarget) return
    const novo: FinancialGoal = {
      id: Date.now(),
      name: goalName,
      target: parseFloat(goalTarget),
      saved: 0,
      deadline: goalDeadline || undefined,
      aportes: [],
    }
    const lista = [novo, ...goals]
    setGoals(lista)
    saveStorage(KEY.goals, lista)
    
    setGoalName('')
    setGoalTarget('')
    setGoalDeadline('')
    setShowGoalForm(false)
  }

  function deleteGoal(id: number) {
    const lista = goals.filter(g => g.id !== id)
    setGoals(lista)
    saveStorage(KEY.goals, lista)
  }

  function openEditGoal(g: FinancialGoal) {
    setEditingGoal(g)
    setGoalName(g.name)
    setGoalTarget(String(g.target))
    setGoalDeadline(g.deadline || '')
    setShowGoalForm(true)
  }

  function saveGoal() {
    if (!goalName || !goalTarget) return
    
    if (editingGoal) {
      const lista = goals.map(g => 
        g.id === editingGoal.id 
          ? { ...g, name: goalName, target: parseFloat(goalTarget), deadline: goalDeadline || undefined }
          : g
      )
      setGoals(lista)
      saveStorage(KEY.goals, lista)
    } else {
      addGoal()
    }
    
    setGoalName('')
    setGoalTarget('')
    setGoalDeadline('')
    setEditingGoal(null)
    setShowGoalForm(false)
  }

  function saveEmergencyTarget() {
    const target = parseFloat(emergencyTarget.replace(',', '.'))
    if (!target || target <= 0) return
    const novo = { ...emergency, target }
    setEmergency(novo)
    saveStorage(KEY.emergency, novo)
    setEmergencySet(true)
    setEmergencyTarget('')
    setShowEmergencyForm(false)
  }

  function addEmergencyAport() {
    const aport = parseFloat(emergencyAport.replace(',', '.'))
    if (!aport || aport <= 0) return
    const novo = { ...emergency, current: emergency.current + aport }
    setEmergency(novo)
    saveStorage(KEY.emergency, novo)
    setLastAport(aport)
    setEmergencyAport('')
  }

  function undoEmergencyAport() {
    if (lastAport === null) return
    const novo = { ...emergency, current: Math.max(0, emergency.current - lastAport) }
    setEmergency(novo)
    saveStorage(KEY.emergency, novo)
    setLastAport(null)
  }

  function deleteEmergency() {
    const novo = { current: 0, target: 5000 }
    setEmergency(novo)
    saveStorage(KEY.emergency, novo)
    setEmergencySet(false)
    setLastAport(null)
  }

  const suggestedTargets = [3000, 5000, 10000, 15000, 20000]

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl">
      {/* Header com mês */}
      <div className="flex items-center justify-between mx-3">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <CaretLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-bold capitalize">{monthLabel}</h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <CaretRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Abas */}
      <div className="flex rounded-lg bg-muted p-1 mx-3">
        {[
          { id: 'chat', label: 'Assistente' },
          { id: 'fin', label: 'Finanças' },
          { id: 'reserva', label: 'Reserva' },
          { id: 'metas', label: 'Metas' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all',
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ABA 1: FINANÇAS */}
      {activeTab === 'fin' && (
        <div className="space-y-4">
          {/* Saldo do mês */}
          <Card className="mx-3 mt-3">
            <CardContent className="p-6 text-center space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saldo do mês</p>
                <p className={cn('text-4xl font-bold font-mono', balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                  {formatBRL(balance)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => { setTxType('income'); setShowForm(true) }}
                  variant="outline" className="gap-2 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950">
                  <ArrowUp size={14} /> Entrada
                </Button>
                <Button onClick={() => { setTxType('expense'); setShowForm(true) }}
                  variant="outline" className="gap-2 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950">
                  <ArrowDown size={14} /> Saída
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resumo entradas/saídas */}
          <div className="grid grid-cols-2 gap-3 mx-3">
            <Card className="border-green-100 bg-green-50 dark:border-green-900 dark:bg-green-950">
              <CardContent className="p-4">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Entradas</p>
                <p className="text-xl font-bold font-mono text-green-700 dark:text-green-300">{formatBRL(income)}</p>
              </CardContent>
            </Card>
            <Card className="border-red-100 bg-red-50 dark:border-red-900 dark:bg-red-950">
              <CardContent className="p-4">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Saídas</p>
                <p className="text-xl font-bold font-mono text-red-700 dark:text-red-300">{formatBRL(expense)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Formulário de transação */}
          {showForm && (
            <Card className="mx-3 mt-3 animate-in slide-in-from-top-2 duration-300">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {(['income', 'expense'] as const).map(t => (
                    <Button
                      key={t}
                      variant={txType === t ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTxType(t)}
                      className={txType === t && t === 'income' ? 'bg-green-600 hover:bg-green-700' :
                                 txType === t && t === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                      {t === 'income' ? '+ Receita' : '− Despesa'}
                    </Button>
                  ))}
                </div>
                <div className="space-y-1">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Descrição</Label>
                  <Input
                    placeholder="Ex: Mercado, Salário..."
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Categoria</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={cat}
                    onChange={e => setCat(e.target.value)}
                  >
                    <option value="">Selecionar...</option>
                    {(txType === 'income' ? CATS_IN : CATS_OUT).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={txDate}
                    onChange={e => setTxDate(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addTransaction} className="flex-1">Salvar</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Movimentações */}
          <Card className="mx-3 mt-3">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Movimentações</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => { setTxType('expense'); setShowForm(true) }}>
                  <Plus size={12} /> Nova
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {txMes.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <p className="text-muted-foreground text-sm">Nenhuma movimentação este mês</p>
                  <Button onClick={() => { setTxType('expense'); setShowForm(true) }} size="sm">
                    Registrar primeira transação
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {txMes.slice(0, 10).map(t => (
                    <div key={t.id} className="flex items-center gap-3 p-4">
                      <div className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                        t.type === 'income' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                      )}>
                        {t.type === 'income' ? (
                          <ArrowUp size={15} className="text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowDown size={15} className="text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{t.description}</p>
                        <p className="text-xs text-muted-foreground">{t.category} · {t.date}</p>
                      </div>
                      <p className={cn(
                        'font-semibold font-mono text-sm flex-shrink-0',
                        t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      )}>
                        {t.type === 'income' ? '+' : '-'}{formatBRL(t.amount)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteTransaction(t.id)}
                      >
                        <Trash size={13} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ABA 2: CHAT IA */}
      {activeTab === 'chat' && (
        <div className="space-y-4 mx-3 mt-3">
          <Card className="h-[calc(100vh-280px)] flex flex-col">
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMsgs.map(m => (
                  <div key={m.id}>
                    {m.t === 'u' ? (
                      <div className="flex justify-end">
                        <div className="bg-foreground text-background rounded-2xl rounded-br-sm px-4 py-2 text-sm max-w-[80%]">
                          {m.text}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-card border rounded-2xl rounded-bl-sm px-4 py-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                            </div>
                            <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</span>
                          </div>
                          <p className="text-sm">{m.d?.resposta}</p>
                        </div>
                        {m.d?.transacao?.valor > 0 && (
                          <div className="bg-card border-l-2 border-l-green-500 dark:border-l-green-400 rounded-r-lg p-3">
                            <p className="text-xs text-muted-foreground uppercase mb-1">Saldo do mês</p>
                            <p className="text-2xl font-bold font-mono">{formatBRL(m.d?.saldo)}</p>
                            <span className={`inline-block text-xs px-2 py-1 rounded-full mt-2 ${m.d?.transacao?.tipo === 'receita' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {m.d?.transacao?.tipo === 'receita' ? '+' : '-'}{formatBRL(m.d?.transacao?.valor)} {m.d?.transacao?.categoria}
                            </span>
                          </div>
                        )}
                        {m.d?.acoes?.length > 0 && (
                          <div className="bg-card border rounded-lg p-3">
                            <p className="text-xs text-muted-foreground uppercase mb-2">Ações recomendadas</p>
                            {m.d.acoes.map((a: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                  <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                </div>
                                {a}
                              </div>
                            ))}
                          </div>
                        )}
                        {m.d?.insight && (
                          <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-3 flex gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            <span className="text-xs text-amber-800 dark:text-amber-200">{m.d.insight}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && chatMsgs.length > 0 && (
                  <div className="flex justify-center py-2 min-h-[40px] items-center">
                    <span className="text-amber-500 text-2xl animate-pulse">...</span>
                  </div>
                )}
                {chatLoading && chatMsgs.length === 0 && (
                  <div className="flex justify-center py-8 min-h-[60px] items-center">
                    <span className="text-amber-500 text-2xl animate-pulse">...</span>
                  </div>
                )}
                {!chatLoading && chatMsgs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-muted-foreground">Seu assistente financeiro</p>
                    <p className="text-xs text-muted-foreground mt-1">Digite uma mensagem ou use / para comandos</p>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              {/* Chat input */}
              <div className="p-3 border-t bg-card space-y-3">
                {/* Guia de comandos */}
                <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-2">
                  <p className="font-semibold text-muted-foreground">📚 Guia de Comandos</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div><span className="text-primary font-medium">Receitas:</span> "Recebi 3000", "Ganhei 500 de freelance"</div>
                    <div><span className="text-red-500 font-medium">Despesas:</span> "Gastei 50", "Paguei 200 de mercado"</div>
                    <div><span className="text-amber-500 font-medium">Reserva:</span> "Adicionei 100 na reserva"</div>
                    <div><span className="text-muted-foreground font-medium">Excluir:</span> "Excluir última transação"</div>
                  </div>
                </div>
                <div className="flex gap-2 relative">
                  <Input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    placeholder="Digite / para ver comandos..."
                    disabled={chatLoading}
                    className="flex-1"
                  />
                  {/* Command menu dropdown */}
                  {showCmdMenu && (
                    <div ref={cmdMenuRef} className="absolute bottom-full mb-2 left-0 right-0 bg-card border rounded-lg shadow-lg p-2 space-y-1 z-10 max-h-64 overflow-y-auto">
                      <p className="text-xs text-muted-foreground px-2 py-1">Selecione um comando:</p>
                      {chatSuggestions.map((cmd, i) => (
                        <button key={i} onClick={() => selectCommand(cmd)}
                          className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-accent transition-colors">
                          {cmd}
                        </button>
                      ))}
                    </div>
                  )}
                  <Button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} size="icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </Button>
                  {chatMsgs.length > 0 && (
                    <Button variant="ghost" size="icon" onClick={() => setChatMsgs([])} title="Limpar chat">
                      <TrashSimple size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ABA 3: RESERVA */}
      {activeTab === 'reserva' && (
        <div className="space-y-4">
          <Card className="mx-3 mt-3">
            <CardContent className="p-6 text-center space-y-4">
              {!emergencySet ? (
                <>
                  <div className="flex justify-center">
                    <PiggyBank className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reserva de Emergência</p>
                    <p className="text-3xl font-bold font-mono text-muted-foreground">R$ 0,00</p>
                    <p className="text-sm text-muted-foreground mt-1">Meta: R$ 5.000,00</p>
                  </div>
                  <Progress value={0} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    0% alcançado
                  </p>
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => {
                      setEmergencySet(true)
                      setShowEmergencyForm(true)
                    }}
                  >
                    <Plus size={14} /> Criar Reserva de Emergência
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Reserve 3-6 meses de despesas essenciais para emergências
                  </p>
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <PiggyBank className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reserva de Emergência</p>
                    <p className="text-3xl font-bold font-mono">{formatBRL(emergency.current)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Meta: {formatBRL(emergency.target)}</p>
                  </div>
                  <Progress value={emergency.target > 0 ? (emergency.current / emergency.target) * 100 : 0} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {emergency.target > 0 ? Math.round((emergency.current / emergency.target) * 100) : 0}% alcançado
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2" 
                      onClick={() => setShowEmergencyForm(true)}
                    >
                      Editar meta
                    </Button>
                    <Button 
                      className="flex-1 gap-2" 
                      onClick={() => setEmergencyAport('0')}
                    >
                      <Plus size={14} /> Aportar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive"
                      onClick={deleteEmergency}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                  {lastAport !== null && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full gap-2 text-muted-foreground"
                      onClick={undoEmergencyAport}
                    >
                      <ArrowCounterClockwise size={14} /> Desfazer último aporte ({formatBRL(lastAport)})
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Formulário de emergencial */}
          {showEmergencyForm && (
            <Card className="mx-3 mt-3">
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <Label>Meta da Reserva (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={emergencyTarget}
                    onChange={e => setEmergencyTarget(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Sugestões</Label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTargets.map(val => (
                      <Button
                        key={val}
                        variant="outline"
                        size="sm"
                        onClick={() => setEmergencyTarget(String(val))}
                        className="text-xs"
                      >
                        {formatBRL(val)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveEmergencyTarget} className="flex-1">Salvar</Button>
                  <Button variant="outline" onClick={() => setShowEmergencyForm(false)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulário de aporte */}
          {emergencyAport !== '' && (
            <Card className="mx-3 mt-3">
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <Label>Valor do Aporte (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={emergencyAport}
                    onChange={e => setEmergencyAport(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addEmergencyAport} className="flex-1">Confirmar Aporte</Button>
                  <Button variant="outline" onClick={() => setEmergencyAport('')}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ABA 3: METAS */}
      {activeTab === 'metas' && (
        <div className="space-y-4">
          {showGoalForm && (
            <Card className="mx-3 mt-3">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    {editingGoal ? 'Editar meta' : 'Nova meta'}
                  </Label>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                    setShowGoalForm(false)
                    setEditingGoal(null)
                    setGoalName('')
                    setGoalTarget('')
                    setGoalDeadline('')
                  }}>
                    <Trash size={14} />
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label>Nome da meta</Label>
                  <Input
                    placeholder="Ex: Viagem para Disney"
                    value={goalName}
                    onChange={e => setGoalName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Valor meta (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={goalTarget}
                    onChange={e => setGoalTarget(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Prazo (opcional)</Label>
                  <Input
                    type="date"
                    value={goalDeadline}
                    onChange={e => setGoalDeadline(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveGoal} className="flex-1">Salvar</Button>
                  <Button variant="outline" onClick={() => {
                    setShowGoalForm(false)
                    setEditingGoal(null)
                    setGoalName('')
                    setGoalTarget('')
                    setGoalDeadline('')
                  }}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {goals.length === 0 ? (
            <Card className="mx-3 mt-3 flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mb-2">Nenhuma meta ainda</CardTitle>
              <CardDescription className="mb-4">
                Defina objetivos financeiros
              </CardDescription>
              <Button onClick={() => setShowGoalForm(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Nova meta
              </Button>
            </Card>
          ) : (
            <div className="space-y-3 mx-3">
              {goals.map(g => (
                <Card key={g.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{g.name}</p>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditGoal(g)}>
                          <PencilSimple size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteGoal(g.id)}>
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                    <Progress value={(g.saved / g.target) * 100} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <p className="font-mono">
                        {formatBRL(g.saved)} / {formatBRL(g.target)}
                      </p>
                      {g.deadline && (
                        <p>{new Date(g.deadline).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={() => setShowGoalForm(true)} className="w-full gap-2">
                <Plus className="h-4 w-4" /> Nova meta
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
