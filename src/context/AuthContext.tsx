import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error: any }>
  logout: () => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Verificar sessão existente ao montar o componente
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro ao obter sessão:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Erro inesperado ao obter sessão:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Evento de autenticação:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Limpar subscription ao desmontar
    return () => subscription.unsubscribe()
  }, [])

  // Função de login
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Erro no login:', error)
        return { error }
      }

      console.log('Login realizado com sucesso:', data.user?.email)
      return { error: null }
    } catch (error) {
      console.error('Erro inesperado no login:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Função de logout
  const logout = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Erro no logout:', error)
      } else {
        console.log('Logout realizado com sucesso')
        setUser(null)
        setSession(null)
      }
    } catch (error) {
      console.error('Erro inesperado no logout:', error)
    } finally {
      setLoading(false)
    }
  }

  // Função de registro
  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        console.error('Erro no registro:', error)
        return { error }
      }

      console.log('Registro realizado com sucesso:', data.user?.email)
      return { error: null }
    } catch (error) {
      console.error('Erro inesperado no registro:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    login,
    logout,
    signUp,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
