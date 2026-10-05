import React, { useState, useEffect } from 'react'
import type { User, Role } from '../types/trilha'
import { AuthContext } from './authContextDef'

const AUTH_STORAGE_KEY = 'trilhas_ia_user_session'
const GOOGLE_JWT_KEY = 'google_jwt_token' // Chave para salvar o token do Google visível no Local Storage

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Falha ao ler sessão de usuário do localStorage', e)
    }
    return null
  })

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        localStorage.removeItem(GOOGLE_JWT_KEY)
      }
    } catch (e) {
      console.error('Falha ao sincronizar sessão de usuário', e)
    }
  }, [user])

  const login = (email: string, role: Role, name?: string) => {
    const defaultName = role === 'DISCENTE' ? 'Midhia Queiroz' : 'Prof. Dr. Ricardo Santos'
    const newUser: User = {
      id: String(Date.now()),
      name: name && name.trim() ? name : defaultName,
      email,
      role,
    }
    setUser(newUser)
  }

  // NOVA FUNÇÃO: Processa o login vindo do Google Auth (Google Identity Services)
  const loginWithGoogle = (credentialResponse: any) => {
    try {
      const token = credentialResponse.credential
      if (!token) return

      // Decodifica o payload do JWT gerado pelo Google para extrair as informações
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )

      const googleData = JSON.parse(jsonPayload)

      // Cria o usuário logado com base nos dados reais da conta Google
      const newUser: User = {
        id: googleData.sub,
        name: googleData.name,
        email: googleData.email,
        role: 'DISCENTE', // Por padrão entra como Discente na trilha
      }

      // Salva o token JWT cru no Local Storage para atender ao requisito do Print de Inspeção
      localStorage.setItem(GOOGLE_JWT_KEY, token)
      setUser(newUser)
    } catch (e) {
      console.error('Erro ao processar o token do Google', e)
    }
  }

  const logout = () => {
    localStorage.removeItem(GOOGLE_JWT_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle, // Exportando para o contexto
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}