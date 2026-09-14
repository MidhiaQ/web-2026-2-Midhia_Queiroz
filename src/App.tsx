import { useState } from 'react'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Module {
  id: number
  title: string
  description: string
  duration: string
  completed: boolean
  quizQuestions: Question[]
}

const SAMPLE_MODULES: Module[] = [
  {
    id: 1,
    title: 'Módulo 1: Introdução a Cloud Computing & AWS',
    description: 'Fundamentos de computação em nuvem, modelos de serviço (IaaS, PaaS, SaaS) e regiões/zonas de disponibilidade AWS.',
    duration: '45 min',
    completed: true,
    quizQuestions: [
      {
        id: 101,
        question: 'Qual dos seguintes serviços da AWS é classificado primariamente como IaaS (Infraestrutura como Serviço)?',
        options: ['AWS Lambda', 'Amazon EC2', 'AWS Amplify', 'Amazon S3'],
        correctAnswer: 1,
        explanation: 'O Amazon EC2 fornece servidores virtuais com controle total do sistema operacional, configurando um modelo IaaS clássico.',
      },
    ],
  },
  {
    id: 2,
    title: 'Módulo 2: Arquitetura em Nuvem e Deploy com AWS Amplify',
    description: 'Conectando repositórios GitHub, automação de build CI/CD e distribuição global via CloudFront.',
    duration: '60 min',
    completed: false,
    quizQuestions: [
      {
        id: 201,
        question: 'No fluxo de CI/CD do AWS Amplify conectado ao GitHub, quando ocorre o build automático?',
        options: [
          'Apenas ao reiniciar a máquina virtual',
          'A cada novo commit ou push na branch configurada',
          'Uma vez por semana via cron job',
          'Apenas via comando manual no AWS CLI',
        ],
        correctAnswer: 1,
        explanation: 'O AWS Amplify escuta webhooks do GitHub e dispara o pipeline de build e deploy automaticamente a cada push.',
      },
    ],
  },
  {
    id: 3,
    title: 'Módulo 3: Integração com Modelos de Linguagem (LLMs)',
    description: 'Chamadas RESTful para a Google Gemini API para geração estruturada de quizzes em formato JSON.',
    duration: '90 min',
    completed: false,
    quizQuestions: [
      {
        id: 301,
        question: 'Para garantir que a LLM retorne questões prontas para o banco relacional, que formato de saída é recomendado?',
        options: ['Texto livre sem pontuação', 'Markdown com tabelas', 'JSON com esquema estrito validado', 'Arquivo binário compilado'],
        correctAnswer: 2,
        explanation: 'O uso de JSON estruturado com esquema estrito permite desserialização direta pelo backend e persistência no PostgreSQL.',
      },
    ],
  },
]

export default function App() {
  const [role, setRole] = useState<'DISCENTE' | 'DOCENTE'>('DISCENTE')
  const [modules, setModules] = useState<Module[]>(SAMPLE_MODULES)
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false)
  
  // Docente state (geração IA simulada)
  const [iaPrompt, setIaPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationSuccess, setGenerationSuccess] = useState(false)

  const activeModule = modules.find((m) => m.id === selectedModuleId) || modules[0]
  const completedCount = modules.filter((m) => m.completed).length
  const progressPercent = Math.round((completedCount / modules.length) * 100)

  const toggleModuleCompletion = (id: number) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    )
  }

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (submittedQuiz) return
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }))
  }

  const handleQuizSubmit = () => {
    setSubmittedQuiz(true)
  }

  const handleResetQuiz = () => {
    setSelectedAnswers({})
    setSubmittedQuiz(false)
  }

  const handleGenerateTrilha = (e: React.FormEvent) => {
    e.preventDefault()
    if (!iaPrompt.trim()) return

    setIsGenerating(true)
    setTimeout(() => {
      const newModule: Module = {
        id: Date.now(),
        title: `Módulo ${modules.length + 1}: ${iaPrompt}`,
        description: `Conteúdo gerado via Inteligência Artificial para a disciplina: ${iaPrompt}. Inclui tópicos essenciais e lista de exercícios.`,
        duration: '50 min',
        completed: false,
        quizQuestions: [
          {
            id: Date.now() + 1,
            question: `Questão gerada por IA sobre "${iaPrompt}": Qual o conceito principal abordado?`,
            options: [
              'Princípio fundamental e aplicação prática no ecossistema web moderno',
              'Teoria obsoleta sem compatibilidade com microsserviços',
              'Apenas parametrização estática sem lógica de negócios',
              'Nenhuma das alternativas anteriores',
            ],
            correctAnswer: 0,
            explanation: 'Resposta gerada automaticamente pelo prompt com validação pedagógica do docente.',
          },
        ],
      }

      setModules((prev) => [...prev, newModule])
      setIsGenerating(false)
      setGenerationSuccess(true)
      setIaPrompt('')
      setTimeout(() => setGenerationSuccess(false), 4000)
    }, 1200)
  }

  // Quiz score calculation
  const totalQuestions = activeModule.quizQuestions.length
  let correctCount = 0
  activeModule.quizQuestions.forEach((q) => {
    if (selectedAnswers[q.id] === q.correctAnswer) {
      correctCount++
    }
  })
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const isApproved = scorePercent >= 70

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              ⚡
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Trilhas IA
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                Plataforma Web 2026
              </span>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setRole('DISCENTE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                role === 'DISCENTE'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🎓 Discente (Aluno)
            </button>
            <button
              type="button"
              onClick={() => setRole('DOCENTE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                role === 'DOCENTE'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👨‍🏫 Docente (Admin)
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Project Header Banner */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/70 to-indigo-950/40 p-6 sm:p-8">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Tailwind CSS v4.x Configurado
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                React 19 + TypeScript + Vite
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                AWS Amplify + GitHub Ready
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Sistema de Trilhas de Estudo com Quiz Gerado por IA
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Plataforma educacional para geração autônoma de roteiros pedagógicos e quizzes instantâneos de múltipla escolha via Inteligência Artificial, com controle de acesso baseado em papéis (RBAC).
            </p>
          </div>
        </section>

        {/* Dynamic Section based on Role */}
        {role === 'DOCENTE' ? (
          /* DOCENTE VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Card de Criação com IA */}
              <div className="rounded-2xl border border-purple-500/30 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    ✨
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Gerar Trilha de Estudos com IA (LLM)</h2>
                    <p className="text-xs text-slate-400">Solicite ao modelo (ex: Gemini API) a criação de tópicos e quizzes em JSON estruturado.</p>
                  </div>
                </div>

                <form onSubmit={handleGenerateTrilha} className="space-y-4">
                  <div>
                    <label htmlFor="prompt-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Assunto ou Módulo da Disciplina
                    </label>
                    <input
                      id="prompt-input"
                      type="text"
                      value={iaPrompt}
                      onChange={(e) => setIaPrompt(e.target.value)}
                      placeholder="Ex: Arquitetura Serverless na AWS, Docker e Containers, PostgreSQL..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Resposta estrita no formato JSON para persistência no AWS RDS PostgreSQL.
                    </span>
                    <button
                      type="submit"
                      disabled={isGenerating || !iaPrompt.trim()}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-md shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Gerando com IA...
                        </>
                      ) : (
                        'Gerar Roteiro e Quiz'
                      )}
                    </button>
                  </div>
                </form>

                {generationSuccess && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    ✅ Novo módulo e quiz gerados com sucesso e adicionados à trilha!
                  </div>
                )}
              </div>

              {/* Lista de Trilhas gerenciadas */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="text-base font-bold text-white mb-3">Módulos Publicados na Trilha</h3>
                <div className="space-y-3">
                  {modules.map((m, idx) => (
                    <div key={m.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-purple-400">#{idx + 1}</span>
                          <span className="font-semibold text-sm text-slate-200">{m.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{m.description}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
                        {m.quizQuestions.length} questões
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Painel lateral Docente */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="text-sm font-bold text-white mb-4">Métricas da Turma</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Total de Alunos Matriculados</span>
                    <p className="text-2xl font-bold text-indigo-400 mt-1">42</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Taxa Média de Acerto nos Quizzes</span>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">83.4%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Alunos Aprovados (≥ 70%)</span>
                    <p className="text-2xl font-bold text-purple-400 mt-1">38 / 42</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* DISCENTE VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda: Lista de Módulos da Trilha */}
            <div className="space-y-6">
              {/* Barra de Progresso Geral */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300">Meu Progresso na Trilha</span>
                  <span className="font-bold text-indigo-400">{progressPercent}% Concluído</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {completedCount} de {modules.length} módulos concluídos
                </p>
              </div>

              {/* Lista Interativa de Módulos */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
                  Módulos de Estudo
                </h3>
                {modules.map((module, idx) => {
                  const isSelected = module.id === activeModule.id
                  return (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => {
                        setSelectedModuleId(module.id)
                        handleResetQuiz()
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/50 border-indigo-600/70 text-white shadow-md'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-mono font-medium text-indigo-400">
                          0{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleModuleCompletion(module.id)
                          }}
                          className={`text-xs px-2 py-0.5 rounded-md border transition-colors ${
                            module.completed
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'
                              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {module.completed ? '✓ Concluído' : 'Pendente'}
                        </button>
                      </div>
                      <h4 className="font-semibold text-sm mt-1.5">{module.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {module.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Coluna Direita: Conteúdo do Módulo e Quiz */}
            <div className="lg:col-span-2 space-y-6">
              {/* Detalhes do Módulo Ativo */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    ⏱ Estimado: {activeModule.duration}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleModuleCompletion(activeModule.id)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      activeModule.completed
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {activeModule.completed ? 'Desmarcar Conclusão' : 'Marcar como Concluído'}
                  </button>
                </div>

                <h2 className="text-xl font-bold text-white mb-2">{activeModule.title}</h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {activeModule.description}
                </p>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Materiais complementares (Vídeos, Slides, Documentação AWS)</span>
                  <span className="text-indigo-400 hover:underline cursor-pointer">Acessar Recursos →</span>
                </div>
              </div>

              {/* Quiz Interativo Gerado por IA */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Quiz de Fixação com Validação Instantânea</h3>
                    <p className="text-xs text-slate-400">
                      Critério de aprovação no módulo: nota mínima de 70%.
                    </p>
                  </div>
                  {submittedQuiz && (
                    <div
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                        isApproved
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-950 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {isApproved ? `Aprovado (${scorePercent}%)` : `Tentar Novamente (${scorePercent}%)`}
                    </div>
                  )}
                </div>

                {activeModule.quizQuestions.map((q) => {
                  const userAnswer = selectedAnswers[q.id]
                  return (
                    <div key={q.id} className="space-y-3">
                      <p className="text-sm font-medium text-slate-200">
                        {q.question}
                      </p>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx
                          let optionStyle = 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/40'

                          if (submittedQuiz) {
                            if (optIdx === q.correctAnswer) {
                              optionStyle = 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                            } else if (isSelected && isSelected !== (optIdx === q.correctAnswer)) {
                              optionStyle = 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                            }
                          } else if (isSelected) {
                            optionStyle = 'bg-indigo-950/60 border-indigo-500 text-indigo-100 ring-1 ring-indigo-500'
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center gap-3 cursor-pointer ${optionStyle}`}
                            >
                              <span className="w-6 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center font-mono text-xs text-slate-300 shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          )
                        })}
                      </div>

                      {submittedQuiz && (
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                          <span className="font-semibold text-indigo-400">Feedback do Gabarito: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  )
                })}

                <div className="flex items-center justify-end gap-3 pt-2">
                  {submittedQuiz ? (
                    <button
                      type="button"
                      onClick={handleResetQuiz}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                    >
                      Refazer Quiz
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(selectedAnswers).length < activeModule.quizQuestions.length}
                      className="px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                    >
                      Submeter Respostas
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AWS Architecture & Deploy Status Bar */}
        <footer className="border-t border-slate-800/80 pt-8 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="text-xs text-slate-400">Hospedagem Frontend</span>
              <p className="text-sm font-bold text-slate-200 mt-1">AWS Amplify / S3 + CloudFront</p>
              <span className="text-[11px] text-emerald-400">CI/CD GitHub Automático</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="text-xs text-slate-400">Servidor Backend</span>
              <p className="text-sm font-bold text-slate-200 mt-1">AWS EC2 (RESTful API)</p>
              <span className="text-[11px] text-indigo-400">Node.js / Python JWT RBAC</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="text-xs text-slate-400">Banco Relacional</span>
              <p className="text-sm font-bold text-slate-200 mt-1">AWS RDS PostgreSQL</p>
              <span className="text-[11px] text-amber-400">Usuários, Trilhas & Quizzes</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="text-xs text-slate-400">Inteligência Artificial</span>
              <p className="text-sm font-bold text-slate-200 mt-1">Google Gemini API</p>
              <span className="text-[11px] text-purple-400">Prompts & Saídas JSON</span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Repositório: <a href="https://github.com/MidhiaQ/web-2026-2-Midhia_Queiroz.git" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">MidhiaQ/web-2026-2-Midhia_Queiroz</a> • Usuário: MidhiaQ
          </p>
        </footer>
      </main>
    </div>
  )
}
