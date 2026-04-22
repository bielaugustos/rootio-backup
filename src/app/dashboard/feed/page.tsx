'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Heart, ChatCircle, ShareNetwork, Plus, X } from '@phosphor-icons/react'
import { FeedPost } from '@/types'
import { PageSkeleton } from '@/components/PageSkeleton'

const MOCK: FeedPost[] = [
  { id:'1',user_id:'u1',username:'ana.conectora',avatar:'🦅',
    content:'Completei 30 dias de meditação seguidos! O Sistema IO me manteve consistente de um jeito que nenhum outro app conseguiu.',
    tags:['Hábitos','streak 30d'],likes:47,comments:8,liked:false,created_at:'2026-04-13T08:30:00Z' },
  { id:'2',user_id:'u2',username:'carlos.visionario',avatar:'🪐',
    content:'Atingi R$ 5.000 de reserva de emergência. 4 meses de consistência com o controle de finanças do app.',
    tags:['Finanças','Meta atingida'],likes:89,comments:12,liked:true,created_at:'2026-04-13T07:00:00Z' },
  { id:'3',user_id:'u3',username:'julia.exploradora',avatar:'🌱',
    content:'Finalizei meu currículo vivo no Rootio. O agente gerou um objetivo profissional incrível para minha busca de emprego.',
    tags:['Carreira'],likes:34,comments:5,liked:false,created_at:'2026-04-12T22:00:00Z' },
]

const TAG_COLORS: Record<string,string> = {
  'Hábitos':'io-tag-amber','Finanças':'io-tag-green','Carreira':'io-tag-blue',
  'Meta atingida':'io-tag-green','streak 30d':'io-tag-red',
}

function timeAgo(iso: string): string {
  const h = Math.floor((Date.now()-new Date(iso).getTime())/3600000)
  return h<1?'agora':h<24?h+'h':Math.floor(h/24)+'d'
}

export default function FeedPage() {
  const { avatar, username } = useAppStore()
  const [posts, setPosts]   = useState<FeedPost[]>(MOCK)
  const [compose, setCompose] = useState(false)
  const [draft, setDraft]   = useState('')
  const [filter, setFilter] = useState('Tudo')
  const [loading, setLoading] = useState(true)
  const FILTERS = ['Tudo','Hábitos','Finanças','Carreira']

  useEffect(() => {
    setLoading(false)
  }, [])

  function toggleLike(id: string) {
    setPosts(ps => ps.map(p => p.id===id ? {...p,liked:!p.liked,likes:p.liked?p.likes-1:p.likes+1} : p))
  }
  function publish() {
    if(!draft.trim()) return
    setPosts(ps => [{id:String(Date.now()),user_id:'me',username,avatar,content:draft,tags:[],likes:0,comments:0,liked:false,created_at:new Date().toISOString()},...ps])
    setDraft(''); setCompose(false)
  }

  const filtered = filter==='Tudo' ? posts : posts.filter(p => p.tags.some(t => t.includes(filter)))

  return loading ? <PageSkeleton /> : (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Feed</h2>
            <p className="text-sm text-muted-foreground dark:text-white/50">Comunidade Rootio</p>
          </div>
        <Button onClick={() => setCompose(true)} className="gap-1.5">
          <Plus size={14}/> Publicar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <Button key={f} variant={filter===f?'default':'outline'} size="sm"
            onClick={() => setFilter(f)} className="rounded-full whitespace-nowrap text-foreground">
            {f}
          </Button>
        ))}
      </div>

      {/* Compose */}
      {compose && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <Card className="w-full max-w-lg animate-slide-in-up">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">Nova publicação</p>
                <Button variant="ghost" size="icon" onClick={() => setCompose(false)}><X size={16}/></Button>
              </div>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center text-base flex-shrink-0">{avatar}</div>
                <textarea className="flex-1 min-h-[100px] resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Compartilhe uma conquista ou reflexão..." value={draft} onChange={e => setDraft(e.target.value)} autoFocus />
              </div>
              <p className="text-xs text-muted-foreground">Conteúdo revisado pela comunidade Rootio.</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setCompose(false)}>Cancelar</Button>
                <Button className="flex-1" onClick={publish} disabled={!draft.trim()}>Publicar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-0">
        {filtered.map((post,i) => (
          <div key={post.id}>
            {i>0 && <Separator />}
            <div className="py-4 flex gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center text-base flex-shrink-0">{post.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">{post.username}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
                </div>
                <p className="text-sm leading-relaxed mb-2 text-foreground">{post.content}</p>
                {post.tags.length>0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.map(tag => (
                      <span key={tag} className={TAG_COLORS[tag]||'io-tag-gray'}>{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-5">
                  <button onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${post.liked?'text-amber-500 font-medium':'text-muted-foreground hover:text-foreground'}`}>
                    <Heart size={16} weight={post.liked?'fill':'regular'}/>{post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                    <ChatCircle size={16}/>{post.comments}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                    <ShareNetwork size={16}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
