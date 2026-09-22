import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import type { Module, StudentStats } from './types/trilha'
import { INITIAL_MODULES, INITIAL_TRILHA } from './data/initialData'
import { Navbar } from './components/Navbar'
import { DuolingoPath } from './components/DuolingoPath'
import { ModuleStudyModal } from './components/ModuleStudyModal'
import { DocenteView } from './components/DocenteView'
import { ArchitectureFooter } from './components/ArchitectureFooter'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import { playSound } from './utils/audio'
import { RotateCcw, ShieldAlert } from 'lucide-react'

const STORAGE_KEY_MODULES = 'trilhas_lingo_modules_v2'
const STORAGE_KEY_STATS = 'trilhas_lingo_stats_v2'

function MainApp() {
  const { user } = useAuth()
  const location = useLocation()
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)

  // Initialize modules from localStorage or initial dataset
  const [modules, setModules] = useState<Module[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MODULES)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // ignore
    }
    return INITIAL_MODULES
  })

  // Initialize student stats
  const [stats, setStats] = useState<StudentStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // ignore
    }
    return {
      streak: 3,
      gems: 180,
      xp: 220,
      hearts: 5,
    }
  })

  const [activeStudyModule, setActiveStudyModule] = useState<Module | null>(null)
  const [recentUnlockedTitle, setRecentUnlockedTitle] = useState<string | null>(null)

  // Persist modules to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(modules))
    } catch {
      // ignore
    }
  }, [modules])

  // Persist stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats))
    } catch {
      // ignore
    }
  }, [stats])

  // Reset trail progress helper
  const handleResetProgress = () => {
    if (confirm('Deseja reiniciar o progresso da trilha para testar novamente desde o início?')) {
      const reset = INITIAL_MODULES.map((m, idx) => ({
        ...m,
        completed: false,
        unlocked: idx === 0, // only module 1 unlocked
        score: undefined,
      }))
      setModules(reset)
      setStats({
        streak: 1,
        gems: 100,
        xp: 0,
        hearts: 5,
      })
      playSound('click', soundEnabled)
    }
  }

  // Completion handler called when student finishes quiz with >= 70%
  const handleCompleteModule = (moduleId: number, score: number) => {
    setModules((prev) => {
      const targetIndex = prev.findIndex((m) => m.id === moduleId)
      if (targetIndex === -1) return prev

      const updated = [...prev]
      // Mark current as completed
      updated[targetIndex] = {
        ...updated[targetIndex],
        completed: true,
        score,
      }

      // Unlock next module if it exists!
      if (targetIndex + 1 < updated.length) {
        updated[targetIndex + 1] = {
          ...updated[targetIndex + 1],
          unlocked: true,
        }
        setRecentUnlockedTitle(updated[targetIndex + 1].title)
        playSound('unlock', soundEnabled)
        setTimeout(() => setRecentUnlockedTitle(null), 6000)
      }

      return updated
    })

    // Reward gamification stats
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + 50,
      gems: prev.gems + 10,
      streak: prev.streak + 1,
    }))
  }

  // Compute total completion
  const completedCount = modules.filter((m) => m.completed).length
  const totalPercent = Math.round((completedCount / modules.length) * 100)

  // Mensagem de bloqueio por tentativa de acesso cruzado
  const unauthorizedMessage = (location.state as { message?: string })?.message

  const isLoginPage = location.pathname === '/login'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans flex flex-col justify-between">
      {/* Top Global Navbar (Adapta-se ao Aluno ou Professor) */}
      {!isLoginPage && (
        <Navbar
          stats={stats}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          trailTitle={INITIAL_TRILHA.title}
        />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${isLoginPage ? '' : 'max-w-6xl mx-auto px-4 py-8 space-y-6'}`}>
        {/* Alerta de Acesso Bloqueado / Redirecionamento RBAC */}
        {!isLoginPage && unauthorizedMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-300 text-xs sm:text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-4 shadow-lg shadow-rose-950/40">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{unauthorizedMessage}</span>
          </div>
        )}

        {/* Unlocked Notification Toast */}
        {recentUnlockedTitle && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-2xl border-2 border-purple-400 flex items-center gap-3 animate-in slide-in-from-bottom-5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              🧠
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-purple-200 block">
                Novo Módulo Liberado na Trilha!
              </span>
              <p className="text-sm font-bold text-white line-clamp-1">{recentUnlockedTitle}</p>
            </div>
          </div>
        )}

        {/* Gerenciador de Rotas */}
        <Routes>
          {/* Rota Pública de Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rota do Aluno (Discente): Protegida exclusivamente para DISCENTE */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['DISCENTE']}>
                <div className="space-y-8 animate-in fade-in duration-200">
                  {/* Student Welcome Banner */}
                  <section className="relative overflow-hidden rounded-3xl border border-purple-500/25 bg-gradient-to-br from-slate-900 via-slate-900/80 to-purple-950/45 p-6 sm:p-8 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2.5 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/25">
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                            Trilha Gamificada Estilo Duolingo
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            Atividades Geradas por IA
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            Desbloqueio Sequencial
                          </span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                          Trilha: Arquitetura em Nuvem AWS & IA
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          Bem-vindo(a), <strong>{user?.name || 'Estudante'}</strong>! Clique no módulo disponível para estudar o material do professor. Responda à atividade ao final do módulo: ao atingir 70%+ de acerto, o modelo é concluído e o <strong>próximo nível é desbloqueado</strong>!
                        </p>
                      </div>

                      {/* Progress Card & Reset Button */}
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 text-right min-w-[200px]">
                          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                            <span className="text-slate-400">Progresso Geral</span>
                            <span className="text-purple-400">{totalPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-400 rounded-full transition-all duration-500"
                              style={{ width: `${totalPercent}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2 font-medium">
                            {completedCount} de {modules.length} módulos concluídos
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleResetProgress}
                          className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-900"
                          title="Reiniciar trilha para simular novamente"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reiniciar Progresso</span>
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Duolingo Winding Trail Component */}
                  <DuolingoPath
                    modules={modules}
                    onSelectModule={(mod) => setActiveStudyModule(mod)}
                    soundEnabled={soundEnabled}
                  />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Rota do Professor (Docente): Protegida exclusivamente para DOCENTE */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['DOCENTE']}>
                <DocenteView
                  modules={modules}
                  setModules={setModules}
                  soundEnabled={soundEnabled}
                  onPreviewModule={(mod) => setActiveStudyModule(mod)}
                />
              </ProtectedRoute>
            }
          />

          {/* Redirecionamento de Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Study & Quiz Interactive Modal */}
        {activeStudyModule && (
          <ModuleStudyModal
            module={activeStudyModule}
            onClose={() => setActiveStudyModule(null)}
            onCompleteModule={(moduleId, score) => {
              handleCompleteModule(moduleId, score)
              // Update local active module reference if user stays in modal
              setActiveStudyModule((prev) => (prev ? { ...prev, completed: true, score } : null))
            }}
            soundEnabled={soundEnabled}
          />
        )}
      </main>

      {/* Cloud Architecture & Academic Specs Footer */}
      {!isLoginPage && <ArchitectureFooter />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </AuthProvider>
  )
}
