'use client'
import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { storage, saveStorage } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ShopItem } from '@/types'
import { getNivel } from '@/lib/io-system'
import { PageSkeleton } from '@/components/PageSkeleton'
import {
  ShoppingBag, Lightning, Star, Fire, Shield, Crown,
  Plus, Trash, Eye, Check, User, Palette, Coins, Gift,
  Lock, ShoppingCart, Diamond,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const KEY_INVENTORY = 'io_shop_inventory'

const SHOP_ITEMS: ShopItem[] = [
  // Avatares
  { id: 'av1', cat: 'avatar', name: 'Avatar Girassol', icon: '🌻', desc: 'Avatar girassol padrão', cost: 0, nivel_min: 1, tag: 'grátis', pillar: 'Personalização', barColor: '#fbbf24', raro: false },
  { id: 'av2', cat: 'avatar', name: 'Avatar Robot', icon: '🤖', desc: 'Avatar robot', cost: 50, nivel_min: 1, tag: 'básico', pillar: 'Personalização', barColor: '#6b7280', raro: false },
  { id: 'av3', cat: 'avatar', name: 'Avatar Foguete', icon: '🚀', desc: 'Avatar foguete', cost: 100, nivel_min: 2, tag: 'médio', pillar: 'Personalização', barColor: '#ef4444', raro: false },
  { id: 'av4', cat: 'avatar', name: 'Avatar Diamante', icon: '💎', desc: 'Avatar diamante - exclusivo', cost: 300, nivel_min: 2, tag: 'avançado', pillar: 'Personalização', barColor: '#3b82f6', raro: true },
  { id: 'av5', cat: 'avatar', name: 'Avatar Coroa', icon: '👑', desc: 'Avatar coroa lendária', cost: 500, nivel_min: 3, tag: 'lendário', pillar: 'Personalização', barColor: '#eab308', raro: true },

  // Cores de Fundo
  { id: 'bg1', cat: 'bgcolor', name: 'Fundo Neon Roxo', icon: '🟣', desc: 'Fundo roxo neon', cost: 30, nivel_min: 1, tag: 'básico', pillar: 'Personalização', barColor: '#a855f7', preview: ['#a855f7'], itemColor: '#a855f7' },
  { id: 'bg2', cat: 'bgcolor', name: 'Fundo Neon Azul', icon: '🔵', desc: 'Fundo azul neon', cost: 30, nivel_min: 1, tag: 'básico', pillar: 'Personalização', barColor: '#3b82f6', preview: ['#3b82f6'], itemColor: '#3b82f6' },
  { id: 'bg3', cat: 'bgcolor', name: 'Fundo Neon Verde', icon: '🟢', desc: 'Fundo verde neon', cost: 30, nivel_min: 1, tag: 'básico', pillar: 'Personalização', barColor: '#22c55e', preview: ['#22c55e'], itemColor: '#22c55e' },

  // Utilidades
  { id: 'ut1', cat: 'utilidade', name: 'Tema Claro', icon: '☀️', desc: 'Ative o modo claro da interface', cost: 0, nivel_min: 1, tag: 'grátis', pillar: 'Customização', barColor: '#fbbf24', toggle: true },
  { id: 'ut2', cat: 'utilidade', name: 'Notificações', icon: '🔔', desc: 'Receba notificações de lembretes', cost: 50, nivel_min: 1, tag: 'básico', pillar: 'Produtividade', barColor: '#f97316' },
  { id: 'ut3', cat: 'utilidade', name: 'Backup Auto', icon: '💾', desc: 'Backup automática diário', cost: 100, nivel_min: 2, tag: 'médio', pillar: 'Segurança', barColor: '#06b6d4' },
  { id: 'ut4', cat: 'utilidade', name: 'Widget Hábito', icon: '📊', desc: 'Widget de hábitos na tela inicial', cost: 150, nivel_min: 2, tag: 'médio', pillar: 'Produtividade', barColor: '#8b5cf6' },
  { id: 'ut5', cat: 'utilidade', name: 'Relatório Semanal', icon: '📈', desc: 'Receba um relatório semanal por email', cost: 200, nivel_min: 3, tag: 'avançado', pillar: 'Produtividade', barColor: '#14b8a6', consumivel: true },

  // Temas
  { id: 'tm1', cat: 'tema', name: 'Tema Nuclear', icon: '⚛️', desc: 'Tema estilo nuclear', cost: 0, nivel_min: 1, tag: 'grátis', pillar: 'Customização', barColor: '#22c55e', preview: ['#22c55e', '#14532d', '#ffffff'] },
  { id: 'tm6', cat: 'tema', name: 'Tema Neo', icon: '💠', desc: 'Tema neo-brutalism', cost: 0, nivel_min: 1, tag: 'grátis', pillar: 'Customização', barColor: '#f97316', preview: ['#f97316', '#7c2d12', '#ffffff'], hasMode: true },
  { id: 'tm2', cat: 'tema', name: 'Tema Eclipse', icon: '🌙', desc: 'Tema escuro elegante', cost: 50, nivel_min: 1, tag: 'básico', pillar: 'Customização', barColor: '#1e293b', preview: ['#1e293b', '#0f172a', '#f59e0b'] },
  { id: 'tm3', cat: 'tema', name: 'Tema Aurora', icon: '🌌', desc: 'Tema com cores霓', cost: 150, nivel_min: 2, tag: 'médio', pillar: 'Customização', barColor: '#8b5cf6', preview: ['#8b5cf6', '#4c1d95', '#e9d5ff'] },
  { id: 'tm4', cat: 'tema', name: 'Tema Dracula', icon: '🧛', desc: 'Tema estilo Dracula', cost: 200, nivel_min: 2, tag: 'avançado', pillar: 'Customização', barColor: '#dc2626', preview: ['#dc2626', '#7f1d1d', '#fca5a5'] },
  { id: 'tm5', cat: 'tema', name: 'Tema Ouro', icon: '👑', desc: 'Tema dourado premium', cost: 400, nivel_min: 3, tag: 'elite', pillar: 'Customização', barColor: '#eab308', preview: ['#eab308', '#713f12', '#fef3c7'], raro: true },

  // Elite
  { id: 'el1', cat: 'elite', name: 'Plano Vitalício', icon: '♾️', desc: 'Acesso vitalício ao plano PRO', cost: 1000, nivel_min: 3, tag: 'lendário', pillar: 'Assinatura', barColor: '#eab308', raro: true, conquista: true },
  { id: 'el2', cat: 'elite', name: 'Mentor IA Premium', icon: '🤖', desc: 'Acesso ilimitado ao mentor IA', cost: 500, nivel_min: 3, tag: 'elite', pillar: 'IA', barColor: '#a855f7', raro: true, consumivel: true },
  { id: 'el3', cat: 'elite', name: 'Badge Conquistador', icon: '🏆', desc: 'Badge especial no perfil', cost: 300, nivel_min: 2, tag: 'avançado', pillar: 'Conquista', barColor: '#f59e0b', raro: true },
]

const TAG_STYLES: Record<string, string> = {
  'grátis': 'bg-green-100 text-green-700 border-green-500',
  'básico': 'bg-amber-100 text-amber-700 border-amber-500',
  'médio': 'bg-yellow-100 text-yellow-700 border-yellow-500',
  'avançado': 'bg-purple-100 text-purple-700 border-purple-500',
  'elite': 'bg-red-100 text-red-700 border-red-500',
  'lendário': 'bg-stone-900 text-amber-400 border-amber-400',
}

const CATEGORIES = [
  { id: 'todos', label: 'Todos', icon: ShoppingBag },
  { id: 'avatar', label: 'Avatar', icon: User },
  { id: 'bgcolor', label: 'Cores', icon: Palette },
  { id: 'utilidade', label: 'Utilidades', icon: Diamond },
  { id: 'tema', label: 'Temas', icon: Palette },
  { id: 'elite', label: 'Elite', icon: Crown },
]

export default function ShopPage() {
  const { economy, avatar, bgColor } = useAppStore()
  const [inventory, setInventory] = useState<string[]>([])
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const nivel = useMemo(() => getNivel(economy.xp_total), [economy.xp_total])

  useEffect(() => {
    setInventory(storage<string[]>(KEY_INVENTORY, []))
    setLoading(false)
  }, [])

  const filteredItems = useMemo(() => {
    return SHOP_ITEMS.filter(item => {
      const matchCat = filter === 'todos' || item.cat === filter
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [filter, search])

  function getButton(item: ShopItem) {
    const acquired = inventory.includes(item.id)
    const noLevel = economy.nivel < item.nivel_min
    const noBalance = economy.saldo_io < item.cost

    if (acquired) {
      if (item.cat === 'avatar') {
        const isApplied = avatar === item.icon
        return isApplied 
          ? { label: '✓ Ativo', className: 'bg-amber-500 text-white border-amber-500', disabled: true }
          : { label: 'Aplicar', className: 'bg-green-500 text-white border-green-500 hover:bg-green-600', disabled: false, onApply: item.icon }
      }
      if (item.cat === 'bgcolor') {
        const itemColor = item.itemColor || item.barColor
        const isApplied = bgColor === itemColor
        return isApplied
          ? { label: '✓ Ativo', className: 'bg-amber-500 text-white border-amber-500', disabled: true }
          : { label: 'Aplicar', className: 'bg-green-500 text-white border-green-500 hover:bg-green-600', disabled: false, onApplyColor: itemColor }
      }
      return { label: '✓ Adquirido', className: 'bg-stone-900 text-amber-400 border-amber-400', disabled: true }
    }
    if (noLevel) return { label: `Nível ${item.nivel_min}`, className: 'bg-muted text-muted-foreground border-border opacity-50', disabled: true }
    if (item.cost === 0) return { label: 'Grátis', className: 'bg-green-500 text-white border-green-500', disabled: false }
    if (noBalance) return { label: `${item.cost} IO`, className: 'bg-muted text-muted-foreground border-border opacity-50', disabled: true }
    return { label: `${item.cost} IO`, className: 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600', disabled: false }
  }

  function buyItem(item: ShopItem) {
    if (economy.saldo_io < item.cost || inventory.includes(item.id)) return

    const store = useAppStore.getState()
    store.economy = { ...store.economy, saldo_io: store.economy.saldo_io - item.cost }

    const newInventory = [...inventory, item.id]
    setInventory(newInventory)
    saveStorage(KEY_INVENTORY, newInventory)

    if (item.cat === 'avatar') {
      store.setAvatar(item.icon)
    }
    if (item.cat === 'bgcolor') {
      store.setBgColor(item.itemColor || item.barColor)
    }
    if (item.cat === 'tema') {
      const themeKey = item.id.replace('tm', '')
      const themeMap: Record<string, string> = { '1': 'nuclear', '6': 'neo-brutalism', '2': 'eclipse', '3': 'aurora', '4': 'dracula', '5': 'ouro' }
      const actualTheme = themeMap[item.id] || item.id
      store.setTheme(actualTheme)
    }
  }

  return loading ? <PageSkeleton /> : (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl">
      <Card className="bg-zinc-950 text-white border-zinc-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-amber-400">LOJA DE RECOMPENSAS</CardTitle>
              <p className="text-xs text-zinc-400">Troque seus IO por itens exclusivos</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-amber-500/50">
              <Lightning className="h-4 w-4 text-amber-400" />
              <span className="font-mono font-bold text-amber-400">{economy.saldo_io} IO</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-zinc-400">XP Total</p>
              <p className="font-mono font-bold text-lg">{economy.xp_total}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-400">Nível</p>
              <p className="font-mono font-bold text-lg">{nivel.nivel}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-400">Saldo IO</p>
              <p className="font-mono font-bold text-lg text-amber-400">{economy.saldo_io}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors text-sm',
              filter === cat.id
                ? 'bg-amber-500 text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            <cat.icon className="h-4 w-4" />
            {cat.label}
          </button>
        ))}
      </div>

      <Input
        placeholder="Buscar itens..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border-amber-500/50"
      />

      <div className="grid grid-cols-2 gap-3">
        {filteredItems.map(item => {
          const btn = getButton(item)
          return (
            <Card key={item.id} className="overflow-hidden">
              <div style={{ height: 4, background: item.barColor }} />
              <CardContent className="p-3">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      {item.raro && (
                        <Badge className="bg-stone-900 text-amber-400 border border-amber-400 text-[9px] px-1">
                          LENDÁRIO
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.desc}</p>
                  </div>
                </div>

                {item.preview && (
                  <div className="flex gap-1 mb-2">
                    {item.preview.map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Badge className={cn('text-[10px]', TAG_STYLES[item.tag])}>
                    {item.tag}
                  </Badge>
                  <Button
                    size="sm"
                    className={cn('text-xs', btn.className)}
                    disabled={btn.disabled}
                    onClick={() => {
                      if (btn.onApply) useAppStore.getState().setAvatar(btn.onApply)
                      else if ((btn as any).onApplyColor) useAppStore.getState().setBgColor((btn as any).onApplyColor)
                      else buyItem(item)
                    }}
                  >
                    {btn.label}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingBag className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Nenhum item encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
