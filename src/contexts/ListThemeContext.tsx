import { createContext, useContext, useState, ReactNode } from 'react'

const LIST_TYPE_COLOR: Record<string, string> = {
  habito: '#F5EFDF',
  evento: '#9B7BFF',
  tarefa: '#6FB8FF',
  meta: '#F59E0B',
}

type ListType = keyof typeof LIST_TYPE_COLOR

interface ListThemeContextType {
  currentType: ListType | null
  setCurrentType: (type: ListType | null) => void
  currentColor: string
}

const ListThemeContext = createContext<ListThemeContextType | undefined>(undefined)

export const ListThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentType, setCurrentType] = useState<ListType | null>(null)
  const currentColor = currentType ? LIST_TYPE_COLOR[currentType] : '#F59E0B' // default amber

  return (
    <ListThemeContext.Provider value={{ currentType, setCurrentType, currentColor }}>
      {children}
    </ListThemeContext.Provider>
  )
}

export const useListTheme = () => {
  const context = useContext(ListThemeContext)
  return context || { currentType: null, setCurrentType: () => {}, currentColor: '#F59E0B' }
}