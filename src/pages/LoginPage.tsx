import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { Role } from '../types/trilha'
import { Brain, Lock, Mail, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react'

interface FormErrors {
  email?: string
  password?: string
  role?: string
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, user } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('DISCENTE')
  const [errors, setErrors] = useState<FormErrors>({})

  // Mensagem passada via state caso tenha sido redirecionado por falta de autenticação ou acesso negado
  const stateMessage = (location.state as { message?: string })?.message

  // Se já estiver autenticado, redireciona diretamente para a área correta
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'DISCENTE') {
        navigate('/', { replace: true })
      } else {
        navigate('/admin', { replace: true })
      }
    }
  }, [isAuthenticated, user, navigate])

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    // Validação de E-mail
    if (!email.trim()) {
      newErrors.email = 'O campo de e-mail é obrigatório.'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Por favor, informe um endereço de e-mail válido (ex: usuario@faculdade.edu.br).'
      }
    }

    // Validação de Senha
    if (!password) {
      newErrors.password = 'A senha é obrigatória.'
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve conter no mínimo 6 caracteres.'
    }

    // Validação de Perfil
    if (!role) {
      newErrors.role = 'Selecione o perfil de acesso (Aluno ou Professor).'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const userName = role === 'DISCENTE' ? 'Midhia Queiroz' : 'Prof. Dr. Ricardo Santos'
    login(email.trim(), role, userName)

    // Redireciona conforme o papel do usuário
    if (role === 'DISCENTE') {
      navigate('/', { replace: true })
    } else {
      navigate('/admin', { replace: true })
    }
  }

  // Preenchimento rápido para demonstração/testes
  const handleQuickFill = (targetRole: Role) => {
    setRole(targetRole)
    if (targetRole === 'DISCENTE') {
      setEmail('aluno@faculdade.edu.br')
      setPassword('123456')
    } else {
      setEmail('professor@faculdade.edu.br')
      setPassword('123456')
    }
    setErrors({})
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-500 shadow-xl shadow-purple-500/25 border-b-2 border-purple-800 mb-2">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Trilha<span className="text-purple-400">Lingo</span>
          </h1>
          <p className="text-sm text-slate-400">
            Acesso ao Sistema de Trilhas e Quizzes Educacionais com IA
          </p>
        </div>

        {/* Security / Notice alert */}
        {stateMessage && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
            <span>{stateMessage}</span>
          </div>
        )}

        {/* Card Form */}
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-xl p-7 shadow-2xl shadow-purple-950/20 space-y-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Seletor de Perfil (Role) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Perfil de Acesso
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRole('DISCENTE')
                    if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }))
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    role === 'DISCENTE'
                      ? 'border-purple-500 bg-purple-500/15 text-white ring-2 ring-purple-500/30 font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xl">🎓</span>
                  <div>
                    <span className="text-xs font-black block">Aluno</span>
                    <span className="text-[10px] text-slate-400">Visão Discente</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole('DOCENTE')
                    if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }))
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    role === 'DOCENTE'
                      ? 'border-indigo-500 bg-indigo-500/15 text-white ring-2 ring-indigo-500/30 font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xl">👨‍🏫</span>
                  <div>
                    <span className="text-xs font-black block">Professor</span>
                    <span className="text-[10px] text-slate-400">Visão Docente</span>
                  </div>
                </button>
              </div>
              {errors.role && (
                <p className="text-xs text-red-400 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.role}
                </p>
              )}
            </div>

            {/* Campo E-mail */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                E-mail Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: undefined }))
                    }
                  }}
                  onBlur={() => validate()}
                  placeholder="exemplo@faculdade.edu.br"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-950/90 text-white placeholder-slate-500 transition-all border outline-none ${
                    errors.email
                      ? 'border-red-500 bg-red-500/10 focus:ring-2 focus:ring-red-500/40 text-red-100 placeholder-red-300/50'
                      : 'border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 font-semibold flex items-center gap-1.5 mt-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }))
                    }
                  }}
                  onBlur={() => validate()}
                  placeholder="Mínimo de 6 caracteres"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-950/90 text-white placeholder-slate-500 transition-all border outline-none ${
                    errors.password
                      ? 'border-red-500 bg-red-500/10 focus:ring-2 focus:ring-red-500/40 text-red-100 placeholder-red-300/50'
                      : 'border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 font-semibold flex items-center gap-1.5 mt-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-sm text-white shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer border-b-2 border-purple-900 active:translate-y-0.5"
            >
              <span>Entrar no Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Atalhos Rápidos para Teste de Avaliação */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Preenchimento Rápido para Avaliação
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('DISCENTE')}
                className="py-2 px-2.5 rounded-xl bg-slate-950 border border-purple-500/30 hover:border-purple-500 text-purple-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>🎓 Como Aluno</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('DOCENTE')}
                className="py-2 px-2.5 rounded-xl bg-slate-950 border border-indigo-500/30 hover:border-indigo-500 text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>👨‍🏫 Como Professor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Controle de Acesso Baseado em Papéis (RBAC) com Proteção de Rotas</span>
        </div>
      </div>
    </div>
  )
}
