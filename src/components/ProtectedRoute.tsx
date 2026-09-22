import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { Role } from '../types/trilha'

interface ProtectedRouteProps {
  allowedRoles: Role[]
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    // Redireciona usuário não autenticado para a página de Login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verifica se o papel do usuário é permitido para esta rota
  if (!allowedRoles.includes(user.role)) {
    // Isolamento estrito entre Aluno e Professor:
    // Se for Discente tentando acessar área do Docente (/admin), redireciona para a home do Aluno (/)
    if (user.role === 'DISCENTE') {
      return <Navigate to="/" replace state={{ unauthorized: true, message: 'Acesso negado: área restrita a professores.' }} />
    }

    // Se for Docente tentando acessar a trilha do Discente (/), redireciona para o painel Docente (/admin)
    if (user.role === 'DOCENTE') {
      return <Navigate to="/admin" replace state={{ unauthorized: true, message: 'Área exclusiva para discentes. Você foi redirecionado ao Painel do Docente.' }} />
    }

    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
