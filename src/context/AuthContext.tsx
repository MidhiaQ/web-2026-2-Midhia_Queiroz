import React, { useState, useEffect } from 'react'
import type { User, Role } from '../types/trilha'
import { AuthContext } from './authContextDef'

const AUTH_STORAGE_KEY = 'trilhas_ia_user_session'

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

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
