'use client'
import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { saveStorage, storage, todayISO } from '@/lib/utils'
import { JournalEntry } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { PageSkeleton } from '@/components/PageSkeleton'
import {
  Plus, Trash, Lock, BookOpen, Sparkle, PaperPlaneRight,
  Smiley, SmileyMeh, SmileySad, Star,
  X,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const KEY = {
  entries: 'io_journal',
  pin: 'io_journal_pin',
}

const PROMPTS = [
  "O que gratidão significa para você hoje?",
  "Qual foi o momento mais desafiador da sua semana?",
  "O que você aprendeu sobre si mesmo recentemente?",
  "Se pudesse mudar algo no seu dia de hoje, o que seria?",
  "Qual é seu objetivo principal para esta semana?",
  "O que te faz sentir vivo/a?",
  "Descreva um momento que te trouxe paz recentemente.",
  "O que você faria se soubesse que não pode falhar?",
  "Qual é uma qualidade que você admira em si mesmo?",
  "O que te mantém acordado à noite?",
  "Qual é a melhor decisão que você já tomou?",
  "O que você gostaria de contar para seu eu do futuro?",
  "Se pudesse dar um conselho para si mesmo, qual seria?",
  "O que te faz sorrir quando ninguém vê?",
  "Qual é algo que você tem evitado fazer?",
  "O que significa sucesso para você?",
  "Descreva seu dia perfeito.",
  "O que você está procrastinando agora?",
  "Qual é uma pequeno vitória que você teve hoje?",
  "O que você gostaria de entender melhor sobre si mesmo?",
]

const MOODS = [
  { icon: SmileySad, label: 'triste', color: 'text-red-500' },
  { icon: SmileyMeh, label: 'neutro', color: 'text-yellow-500' },
  { icon: Smiley, label: 'ok', color: 'text-orange-500' },
  { icon: Star, label: 'feliz', color: 'text-green-500' },
  { icon: Star, label: 'ótimo', color: 'text-emerald-500', special: true },
]

function hashPin(pin: string): string {
  return pin.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0).toString()
}

function getPinStored(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(KEY.pin) ?? ''
}

export default function MentorPage() {
  const { plan } = useAppStore()
  const [entries, setEntries] = useState<JournalEntry[]>(() => storage(KEY.entries, []))
  const [activeTab, setActiveTab] = useState<'diario' | 'mentor'>('diario')
  const [loading, setLoading] = useState(true)
  
  const [isLocked, setIsLocked] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinMode, setPinMode] = useState<'none' | 'setup' | 'verify' | 'change'>('none')
  const [newPin, setNewPin] = useState('')
  
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [entryText, setEntryText] = useState('')
  const [entryMood, setEntryMood] = useState(2)
  const [entryTags, setEntryTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [currentPrompt, setCurrentPrompt] = useState('')
  
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null)
  
  const [apiKey, setApiKey] = useState('')
  const [showApiForm, setShowApiForm] = useState(false)
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const hasPin = useMemo(() => getPinStored() !== '', [])

  useEffect(() => {
    const today = new Date().getDate()
    setCurrentPrompt(PROMPTS[today % PROMPTS.length])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (hasPin && !verifyPin(pinInput)) {
      setIsLocked(true)
    } else {
      setIsLocked(false)
    }
  }, [pinInput])

  function verifyPin(pin: string): boolean {
    return hashPin(pin) === getPinStored()
  }

  function handleSavePin() {
    if (newPin.length !== 4) return
    localStorage.setItem(KEY.pin, hashPin(newPin))
    setPinMode('none')
    setNewPin('')
  }

  function handleRemovePin() {
    localStorage.removeItem(KEY.pin)
    setPinMode('none')
  }

  function addEntry() {
    if (!entryText.trim()) return
    const novo: JournalEntry = {
      id: Date.now(),
      text: entryText,
      mood: MOODS[entryMood].label as 'sad' | 'neutral' | 'good' | 'great',
      tags: entryTags,
      date: todayISO(),
      createdAt: new Date().toISOString(),
    }
    const lista = [novo, ...entries]
    setEntries(lista)
    saveStorage(KEY.entries, lista)
    setEntryText('')
    setEntryTags([])
    setEntryMood(2)
    setShowEntryForm(false)
  }

  function deleteEntry(id: number) {
    const lista = entries.filter(e => e.id !== id)
    setEntries(lista)
    saveStorage(KEY.entries, lista)
  }

  function addTag() {
    if (tagInput.trim() && !entryTags.includes(tagInput.trim())) {
      setEntryTags([...entryTags, tagInput.trim()])
      setTagInput('')
    }
  }

  function removeTag(tag: string) {
    setEntryTags(entryTags.filter(t => t !== tag))
  }

  async function sendChatMessage() {
    if (!chatInput.trim() || !apiKey) return
    
    const userMessage = chatInput.trim()
    setChatMessages(m => [...m, { role: 'user', content: userMessage }])
    setChatInput('')
    setIsLoading(true)
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Você é um mentor de vida helpful e empático. Responda de forma concisa e inspiradora.' },
            ...chatMessages,
            { role: 'user', content: userMessage },
          ],
          max_tokens: 500,
        }),
      })
      
      const data = await response.json()
      if (data.choices?.[0]?.message) {
        setChatMessages(m => [...m, { role: 'assistant', content: data.choices[0].message.content }])
      }
    } catch (e: unknown) {
      setChatMessages(m => [...m, { role: 'assistant', content: 'Desculpe, ocorreu um erro. Verifique sua chave de API.' }])
    }
    
    setIsLoading(false)
  }

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [entries])

  return loading ? <PageSkeleton /> : (
    <div className="p-4 md:p-6 pb-20 space-y-4 max-w-2xl mx-auto">
      {/* Abas */}
      <div className="flex rounded-lg bg-muted p-1 mx-3">
        <button
          onClick={() => setActiveTab('diario')}
          className={cn(
            'flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2',
            activeTab === 'diario' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Diário
        </button>
        <button
          onClick={() => setActiveTab('mentor')}
          className={cn(
            'flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2',
            activeTab === 'mentor' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
          )}
        >
          <Sparkle className="h-4 w-4" />
          Mentor IA
        </button>
      </div>

      {/* ABA 1: DIÁRIO */}
      {activeTab === 'diario' && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mx-3">
            <div className="flex items-center mr-6">
              <h1 className="text-xl font-bold text-foreground">Diário de Reflexão</h1>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPinMode(hasPin ? 'verify' : 'setup')}>
                <Lock className="h-4 w-4 text-foreground" />
              </Button>
            </div>
            <Button onClick={() => setShowEntryForm(true)} className="gap-2 bg-amber-600 hover:bg-amber-700">
              <Plus className="h-4 w-4" /> Nova entrada
            </Button>
          </div>

          {/* PIN Setup/Verify Modal */}
          {pinMode !== 'none' && (
            <Card className="mx-3 mt-3">
              <CardContent className="p-4 space-y-3">
                {pinMode === 'setup' && (
                  <>
                    <Label>Crie um PIN de 4 dígitos</Label>
                    <Input
                      type="password"
                      maxLength={4}
                      value={newPin}
                      onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="0000"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSavePin} className="flex-1" disabled={newPin.length !== 4}>Salvar</Button>
                      <Button variant="outline" onClick={() => setPinMode('none')}>Cancelar</Button>
                    </div>
                  </>
                )}
                {pinMode === 'verify' && (
                  <>
                    <Label>Digite seu PIN</Label>
                    <Input
                      type="password"
                      maxLength={4}
                      value={pinInput}
                      onChange={e => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="0000"
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => { setPinMode('change') }} variant="outline" className="flex-1">Alterar</Button>
                      <Button onClick={handleRemovePin} variant="destructive" className="flex-1">Remover PIN</Button>
                    </div>
                    <Button variant="ghost" onClick={() => setPinMode('none')} className="w-full">Cancelar</Button>
                  </>
                )}
                {pinMode === 'change' && (
                  <>
                    <Label>Novo PIN de 4 dígitos</Label>
                    <Input
                      type="password"
                      maxLength={4}
                      value={newPin}
                      onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="0000"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSavePin} className="flex-1" disabled={newPin.length !== 4}>Salvar</Button>
                      <Button variant="outline" onClick={() => setPinMode('none')}>Cancelar</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Locked State */}
          {isLocked && pinMode === 'none' && (
            <Card className="mx-3 mt-3">
              <CardContent className="p-8 text-center">
                <Lock className="h-12 w-12 mx-auto text-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Diário protegido</p>
                <Button onClick={() => setPinMode('verify')}>Desbloquear</Button>
              </CardContent>
            </Card>
          )}

          {/* Entry Form */}
          {showEntryForm && !isLocked && (
            <Card className="mx-3 mt-3">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Nova entrada</Label>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowEntryForm(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Prompt do dia:</p>
                  <p className="font-medium text-sm mt-1">{currentPrompt}</p>
                </div>

                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Escreva sua reflexão..."
                  value={entryText}
                  onChange={e => setEntryText(e.target.value)}
                />

                <div className="space-y-2">
                  <Label>Como você está se sentindo?</Label>
                  <div className="flex justify-between">
                    {MOODS.map((mood, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEntryMood(idx)}
                        className={cn(
                          'p-2 rounded-lg transition-all',
                          entryMood === idx ? 'bg-primary/20 scale-110' : 'hover:bg-muted'
                        )}
                      >
                        <mood.icon className={cn('h-6 w-6', mood.color)} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar tag..."
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button onClick={addTag} variant="outline">+</Button>
                  </div>
                  {entryTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entryTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button onClick={() => removeTag(tag)}><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={addEntry} className="w-full">Salvar</Button>
              </CardContent>
            </Card>
          )}

          {/* Entries List */}
          {!isLocked && (
            <div className="space-y-2 mx-3">
              {sortedEntries.length === 0 ? (
                <Card className="mx-3 mt-3">
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium mb-1">Seu diário está vazio</p>
                    <p className="text-sm text-muted-foreground mb-4">Registre sua primeira reflexão do dia</p>
                    <Button onClick={() => setShowEntryForm(true)}>Começar</Button>
                  </CardContent>
                </Card>
              ) : (
                sortedEntries.map(entry => {
                  const moodIdx = MOODS.findIndex(m => m.label === entry.mood)
                  const mood = MOODS[moodIdx >= 0 ? moodIdx : 2]
                  return (
                    <Card key={entry.id}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <mood.icon className={cn('h-5 w-5', mood.color)} />
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleDateString('pt-BR', { 
                                day: '2-digit', month: '2-digit', year: 'numeric' 
                              })}
                            </span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteEntry(entry.id)}>
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <p className={cn(
                          'text-sm mt-2',
                          expandedEntry === entry.id ? '' : 'line-clamp-3'
                        )}>
                          {entry.text}
                        </p>
                        
                        {entry.text.length > 100 && (
                          <button 
                            type="button"
                            onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                            className="text-xs text-muted-foreground mt-1"
                          >
                            {expandedEntry === entry.id ? 'Ver menos' : 'Ver mais'}
                          </button>
                        )}
                        
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          )}
        </>
      )}

      {/* ABA 2: MENTOR IA */}
      {activeTab === 'mentor' && (
        <div className="space-y-4">
          {plan !== 'pro' ? (
            <Card className="mx-3 mt-3 border-amber-500">
              <CardContent className="p-6 text-center">
                <Sparkle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                <p className="font-bold text-lg mb-2">Mentor IA</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Este recurso está disponível apenas para o plano Pro.
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Benefícios Pro: Mentor IA ilimitado, insights personalizados, sync entre dispositivos.
                </p>
                <Button asChild className="bg-amber-500 hover:bg-amber-600">
                  <Link href="/dashboard/profile">
                    Ver Planos Pro
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : !apiKey && !showApiForm ? (
            <Card className="mx-3 mt-3 nb-card-dark">
              <CardContent className="p-6 text-center">
                <Sparkle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                <p className="font-bold text-lg mb-2">Mentor IA</p>
                <p className="text-sm text-white/50 mb-4">
                  Configure sua chave da API para ativar o Mentor IA personalizado
                </p>
                <Button onClick={() => setShowApiForm(true)} className="nb-btn nb-btn-amber">
                  Configurar API
                </Button>
              </CardContent>
            </Card>
          ) : showApiForm ? (
            <Card className="mx-3 mt-3">
              <CardContent className="p-4 space-y-3">
                <Label>Sua chave da API OpenAI</Label>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={() => setShowApiForm(false)} className="flex-1">Salvar</Button>
                  <Button variant="outline" onClick={() => setShowApiForm(false)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="mx-3 mt-3 nb-card-dark">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-bold text-white dark:text-white">Mentor IA</p>
                    <Button variant="ghost" size="sm" onClick={() => setShowApiForm(true)}>
                      Alterar API
                    </Button>
                  </div>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                    {chatMessages.length === 0 ? (
                      <p className="text-sm text-white/50 text-center py-4">
                        Olá! Sou seu mentor virtual. Como posso ajudar hoje?
                      </p>
                    ) : (
                      chatMessages.map((msg, idx) => (
                        <div key={idx} className={cn(
                          'p-3 rounded-lg text-sm',
                          msg.role === 'user' ? 'bg-stone-700 ml-8' : 'bg-stone-800 mr-8'
                        )}>
                          {msg.content}
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="text-sm text-white/50 text-center py-2">
                        Pensando...
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                      disabled={isLoading}
                    />
                    <Button onClick={sendChatMessage} disabled={isLoading || !chatInput.trim()}>
                      <PaperPlaneRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  )
}
