import React, { useState, useRef } from 'react'
import type { Module } from '../types/trilha'
import { TEACHER_PROMPT_TEMPLATES } from '../data/initialData'
import { extractTextFromPdf, type ExtractedPdfData } from '../utils/pdfExtractor'
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Trash2,
  CheckCircle2,
  Users,
  Layers,
  FileText,
  Eye,
  Upload,
  FileType,
  X,
  FileCheck,
  AlertCircle,
} from 'lucide-react'
import { playSound } from '../utils/audio'

interface DocenteViewProps {
  modules: Module[]
  setModules: React.Dispatch<React.SetStateAction<Module[]>>
  soundEnabled: boolean
  onPreviewModule: (module: Module) => void
}

export const DocenteView: React.FC<DocenteViewProps> = ({
  modules,
  setModules,
  soundEnabled,
  onPreviewModule,
}) => {
  const [inputMode, setInputMode] = useState<'PDF' | 'TEXT'>('PDF')
  const [subjectTitle, setSubjectTitle] = useState('')
  const [materialText, setMaterialText] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('Unidade 3: Microsserviços e DevOps')
  const [questionCount, setQuestionCount] = useState(3)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // PDF Upload States
  const [uploadedPdf, setUploadedPdf] = useState<ExtractedPdfData | null>(null)
  const [isExtractingPdf, setIsExtractingPdf] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle actual file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setPdfError('Por favor, selecione um arquivo válido no formato PDF (.pdf).')
      return
    }

    setPdfError(null)
    setIsExtractingPdf(true)
    playSound('click', soundEnabled)

    try {
      const data = await extractTextFromPdf(file)
      setUploadedPdf(data)
      setMaterialText(data.extractedText)

      // Auto-suggest subject title from filename
      const cleanName = file.name
        .replace(/\.pdf$/i, '')
        .replace(/[_-]+/g, ' ')
        .replace(/^(slide|aula|livro|capitulo)\s*/i, '')
      if (!subjectTitle) {
        setSubjectTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1))
      }
      playSound('correct', soundEnabled)
    } catch (err) {
      console.error(err)
      setPdfError('Não foi possível ler o PDF. Tente outro arquivo ou cole o texto na aba de texto.')
      playSound('wrong', soundEnabled)
    } finally {
      setIsExtractingPdf(false)
    }
  }

  // Handle pre-made sample PDF simulation
  const handleLoadSamplePdf = (type: 'slides' | 'book') => {
    playSound('click', soundEnabled)
    setPdfError(null)
    setIsExtractingPdf(true)

    setTimeout(() => {
      if (type === 'slides') {
        const sample: ExtractedPdfData = {
          fileName: 'Slides_Aula_05_Redes_AWS_VPC_e_SecurityGroups.pdf',
          fileSizeFormatted: '3.4 MB',
          pageCount: 18,
          extractedText: `--- Slide 1: Introdução a Redes Virtuais na AWS ---
Amazon VPC (Virtual Private Cloud) permite provisionar uma seção logicamente isolada da nuvem AWS.
Conceito: sua própria rede virtual com controle total sobre faixas de endereço IP (CIDR), sub-redes e tabelas de roteamento.

--- Slide 2: Subnets Públicas vs Subnets Privadas ---
Subnet Pública: Possui rota direta para a Internet via Internet Gateway (IGW). Usada para Load Balancers e Bastion Hosts.
Subnet Privada: Não possui rota direta para a Internet. Usada para Bancos de Dados RDS e servidores de aplicação para máxima segurança.

--- Slide 3: Camadas de Segurança (Security Groups vs NACLs) ---
1. Security Groups (Grupos de Segurança):
• Atuam no nível da instância/servidor virtual.
• São Stateful: o tráfego de retorno é liberado automaticamente sem necessidade de regra de saída explícita.
• Apenas regras de PERMITIR (Allow).

2. Network ACLs (NACLs):
• Atuam no nível da sub-rede como um firewall de borda.
• São Stateless: regras de entrada e saída devem ser configuradas separadamente.
• Suportam regras de PERMITIR (Allow) e NEGAR (Deny).

--- Slide 4: NAT Gateway para Subnets Privadas ---
Instâncias privadas precisam de atualizações do SO sem expor portas à Internet pública.
O NAT Gateway na subnet pública traduz o tráfego de saída das instâncias privadas mantendo o isolamento contra ataques externos.`,
        }
        setUploadedPdf(sample)
        setMaterialText(sample.extractedText)
        setSubjectTitle('Redes Virtuais AWS VPC, Subnets e Segurança')
      } else {
        const sample: ExtractedPdfData = {
          fileName: 'Capitulo_4_Sistemas_Distribuidos_Mensageria_SQS.pdf',
          fileSizeFormatted: '6.1 MB',
          pageCount: 32,
          extractedText: `--- Capítulo 4: Desacoplamento com Filas Assíncronas ---
Em arquiteturas de microsserviços escaláveis, componentes síncronos HTTP podem gerar gargalos em picos de demanda.
O Amazon SQS (Simple Queue Service) oferece filas totalmente gerenciadas para transmissão de mensagens distribuídas.

--- Seção 4.2: Filas Padrão (Standard) vs Filas FIFO ---
1. Filas Padrão (Standard Queue):
• Vazão quase ilimitada de mensagens por segundo.
• Entrega no modelo "ao menos uma vez" (at-least-once delivery).
• Ordem das mensagens é de melhor esforço (best-effort ordering).

2. Filas FIFO (First-In, First-Out):
• Garante ordenação estrita das mensagens exatamente na sequência em que foram enviadas.
• Entrega "exatamente uma vez" (exactly-once processing) sem mensagens duplicadas.
• Ideal para processamento financeiro e transações bancárias.

--- Seção 4.3: Padrão Dead Letter Queue (DLQ) ---
Mensagens que falham repetidamente após um número configurado de tentativas (maxReceiveCount) são direcionadas para uma Dead Letter Queue para análise de erros sem bloquear o fluxo da fila principal.`,
        }
        setUploadedPdf(sample)
        setMaterialText(sample.extractedText)
        setSubjectTitle('Mensageria e Filas Desacopladas com Amazon SQS')
      }

      setIsExtractingPdf(false)
      playSound('correct', soundEnabled)
    }, 800)
  }

  // Handle template prefill for text tab
  const handleApplyTemplate = (template: typeof TEACHER_PROMPT_TEMPLATES[0]) => {
    setSubjectTitle(template.title)
    setMaterialText(template.material)
  }

  // Handle AI generation of modules and activities
  const handleGenerateWithAI = (e: React.FormEvent) => {
    e.preventDefault()
    if (!materialText.trim() && !subjectTitle.trim()) return

    setIsGenerating(true)
    playSound('click', soundEnabled)

    const steps = [
      uploadedPdf
        ? `Lendo ${uploadedPdf.pageCount} páginas do arquivo "${uploadedPdf.fileName}"...`
        : 'Analisando material didático inserido pelo professor...',
      'IA estruturando módulos e roteiros de estudo a partir dos tópicos do PDF...',
      'Sintetizando conceitos teóricos, esquemas e dicas pedagógicas...',
      'Criando atividades e quizzes de múltipla escolha com gabarito explicativo...',
    ]

    setGenerationStep(steps[0])
    setTimeout(() => setGenerationStep(steps[1]), 800)
    setTimeout(() => setGenerationStep(steps[2]), 1600)
    setTimeout(() => setGenerationStep(steps[3]), 2400)

    setTimeout(() => {
      const newModuleId = Date.now()
      const newOrder = modules.length + 1

      // Auto-extract lines for study topics
      const lines = materialText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 5 && !l.startsWith('---'))

      const sampleTitle = subjectTitle || (uploadedPdf ? uploadedPdf.fileName.replace(/\.pdf$/i, '') : 'Novo Módulo Especializado')

      const newModule: Module = {
        id: newModuleId,
        order: newOrder,
        unitNumber: 3,
        unitTitle: selectedUnit,
        title: `${sampleTitle}`,
        shortTitle: sampleTitle.split(':')[0].substring(0, 24),
        description: uploadedPdf
          ? `Módulo gerado por IA a partir do PDF/Slide "${uploadedPdf.fileName}" (${uploadedPdf.pageCount} páginas).`
          : `Módulo gerado autonomamente via IA a partir do material didático fornecido pelo docente.`,
        duration: uploadedPdf ? `${Math.min(uploadedPdf.pageCount * 3, 60)} min` : '45 min',
        icon: 'sparkles',
        completed: false,
        unlocked: false,
        studySummary:
          materialText.length > 60
            ? materialText.substring(0, 220).replace(/--- Slide \d+: /g, '') + '...'
            : `Estudo focado em ${sampleTitle} com base no material fornecido pelo professor.`,
        studyTopics: [
          {
            title: `1. Conceitos Fundamentais de ${sampleTitle}`,
            content:
              lines.length > 0
                ? lines.slice(0, 3).join('\n• ')
                : `Fundamentos essenciais, arquitetura de sistemas e modelos de execução recomendados.`,
            keyTakeaway: `Revise os pontos centrais apresentados nas lâminas de aula antes de realizar a atividade!`,
            codeSnippet: `// Configuração extraída do material de aula:
service: "${sampleTitle.toLowerCase().replace(/\s+/g, '-')}"
deployment: "AWS Global"
isolation: "Subnets & SecurityGroups"`,
          },
          {
            title: `2. Diretrizes Técnicas e Boas Práticas`,
            content:
              lines.length > 3
                ? lines.slice(3, 6).join('\n• ')
                : `Padrões de projeto, alta tolerância a falhas e estratégias de monitoramento.`,
            keyTakeaway: `Em segurança na nuvem, o isolamento em camadas e redundância são essenciais para evitar pontos únicos de falha.`,
          },
        ],
        resources: [
          ...(uploadedPdf
            ? [
                {
                  label: `Slide/Apostila do Professor: ${uploadedPdf.fileName} (${uploadedPdf.fileSizeFormatted})`,
                  url: '#',
                  type: 'doc' as const,
                },
              ]
            : []),
          {
            label: `Documentação Oficial: ${sampleTitle}`,
            url: 'https://aws.amazon.com/pt/documentation/',
            type: 'doc' as const,
          },
        ],
        quizQuestions: Array.from({ length: questionCount }).map((_, qIdx) => {
          if (uploadedPdf && uploadedPdf.fileName.includes('VPC')) {
            const vpcQuestions = [
              {
                q: 'Qual é a diferença fundamental entre Security Groups e Network ACLs (NACLs) na AWS VPC?',
                options: [
                  'Security Groups são Stateful (no nível de instância); NACLs são Stateless (no nível de sub-rede)',
                  'Security Groups atuam apenas em servidores Windows; NACLs apenas em Linux',
                  'NACLs nunca podem ter regras de negação (Deny)',
                  'Não há diferença, são nomes sinônimos para o mesmo componente',
                ],
                c: 0,
                exp: 'Security Groups são stateful: se o tráfego de entrada for permitido, a resposta sai automaticamente. As NACLs são stateless e avaliam cada pacote nas bordas da sub-rede.',
              },
              {
                q: 'Para que serve um NAT Gateway posicionado em uma Subnet Pública?',
                options: [
                  'Permitir que instâncias em subnets privadas acessem a Internet para atualizações sem receber conexões externas não solicitadas',
                  'Substituir o banco de dados relacional RDS por uma planilha compartilhada',
                  'Expor a porta de banco de dados diretamente na Internet pública sem senha',
                  'Diminuir a velocidade de processamento das instâncias filhas',
                ],
                c: 0,
                exp: 'O NAT Gateway realiza Network Address Translation para garantir que servidores em subnets privadas naveguem para fora mantendo blindagem total contra a Internet externa.',
              },
              {
                q: 'Onde instâncias de bancos de dados sensíveis (como AWS RDS PostgreSQL) devem ser posicionadas por segurança?',
                options: [
                  'Em Subnets Privadas sem rota direta para o Internet Gateway (IGW)',
                  'Em redes públicas sem nenhum grupo de segurança configurado',
                  'Diretamente na área de trabalho do professor',
                  'Em um bucket S3 público sem criptografia',
                ],
                c: 0,
                exp: 'Bancos relacionais corporativos devem ficar estritamente em subnets privadas, acessíveis apenas pela camada de aplicação backend autorizada.',
              },
            ]
            const picked = vpcQuestions[qIdx % vpcQuestions.length]
            return {
              id: newModuleId + qIdx + 10,
              question: picked.q,
              options: picked.options,
              correctAnswer: picked.c,
              explanation: picked.exp,
            }
          }

          return {
            id: newModuleId + qIdx + 10,
            question: `[Questão extraída do PDF #${qIdx + 1}] Com base no material de "${sampleTitle}", qual afirmativa representa a prática pedagógica correta?`,
            options: [
              `Implementação estruturada seguindo o princípio de menor privilégio e desacoplamento`,
              `Configuração manual repetitiva sem documentação em repositório versionado`,
              `Hospedagem de credenciais sensíveis em texto plano no código do frontend`,
              `Execução em instância única sem redundância em zonas de disponibilidade`,
            ],
            correctAnswer: 0,
            explanation: `Alternativa A correta. Em ambientes escaláveis, a automação e segurança com isolamento em camadas são premissas indispensáveis extraídas das lâminas de aula.`,
          }
        }),
      }

      setModules((prev) => [...prev, newModule])
      setIsGenerating(false)
      setGenerationStep('')
      setSuccessMessage(`Novo módulo "${newModule.title}" gerado com sucesso a partir do material enviado!`)
      playSound('correct', soundEnabled)

      // Clear input fields
      setSubjectTitle('')
      setMaterialText('')
      setUploadedPdf(null)

      setTimeout(() => setSuccessMessage(''), 6000)
    }, 3200)
  }

  // Handle delete module
  const handleDeleteModule = (id: number) => {
    if (modules.length <= 1) {
      alert('A trilha precisa conter pelo menos 1 módulo.')
      return
    }
    setModules((prev) => prev.filter((m) => m.id !== id))
    playSound('click', soundEnabled)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Teacher Hub Hero Banner */}
      <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-950 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-base">
                👨‍🏫
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-purple-400">
                Painel do Docente • Administrador de Conteúdo
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Gerador Inteligente via PDF, Slides & IA
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Envie o <strong>PDF com os slides ou livro da aula</strong>. A Inteligência Artificial analisa o conteúdo, cria a trilha por tópicos didáticos e gera atividades de fixação com gabarito explicado para os alunos.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-purple-950/60 p-4 rounded-2xl border border-purple-500/30 shrink-0">
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase text-purple-300 block">Total de Módulos</span>
              <span className="text-2xl font-black text-white">{modules.length} Módulos</span>
            </div>
            <Layers className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: PDF & Material Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Inserir Material Didático da Aula
                </h2>
              </div>

              {/* Toggle Input Mode: PDF vs Texto */}
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setInputMode('PDF')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    inputMode === 'PDF'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileType className="w-3.5 h-3.5" />
                  <span>Enviar PDF / Slides</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('TEXT')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    inputMode === 'TEXT'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Texto Livre / Ementa</span>
                </button>
              </div>
            </div>

            {/* TAB 1: PDF UPLOAD ZONE */}
            {inputMode === 'PDF' && (
              <div className="space-y-4">
                {/* Upload Box */}
                {!uploadedPdf ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-2 border-dashed border-purple-500/40 hover:border-purple-500 rounded-3xl p-8 text-center bg-slate-950/50 hover:bg-purple-950/15 transition-all cursor-pointer space-y-3"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {isExtractingPdf ? (
                        <div className="w-7 h-7 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-7 h-7" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white">
                        {isExtractingPdf
                          ? 'Processando e extraindo texto do PDF...'
                          : 'Clique para selecionar o PDF ou arraste aqui'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Suporta arquivos de slides da aula, apostilas, artigos ou capítulos de livros (.pdf)
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-[11px] font-semibold border border-purple-500/20">
                      <span>IA pronta para leitura e estruturação pedagógica</span>
                    </div>
                  </div>
                ) : (
                  /* Uploaded PDF Card */
                  <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/30 border border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white line-clamp-1">
                            {uploadedPdf.fileName}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Extraído com Sucesso
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Tamanho: {uploadedPdf.fileSizeFormatted} • {uploadedPdf.pageCount} páginas/slides lidos
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedPdf(null)
                          setMaterialText('')
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Trocar Arquivo
                      </button>
                    </div>
                  </div>
                )}

                {/* PDF Error Display */}
                {pdfError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pdfError}</span>
                  </div>
                )}

                {/* Quick PDF Sample Simulators */}
                <div className="pt-1">
                  <span className="text-xs font-bold text-slate-400 block mb-2">
                    Ou teste com PDFs de Exemplo do Sistema:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleLoadSamplePdf('slides')}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-950/20 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-white group-hover:text-purple-300">
                        <FileType className="w-4 h-4 text-purple-400" />
                        <span>Slides: Redes AWS VPC & Subnets</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        18 slides com topologia de rede, Security Groups e NAT Gateway.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLoadSamplePdf('book')}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-950/20 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-white group-hover:text-purple-300">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <span>Livro: Mensageria e Filas SQS</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        32 páginas sobre desacoplamento, filas FIFO e Dead Letter Queue.
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TEXT TEMPLATES (if in text mode) */}
            {inputMode === 'TEXT' && (
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-2">
                  Carregar Ementas Rápidas para Testar:
                </span>
                <div className="flex flex-wrap gap-2">
                  {TEACHER_PROMPT_TEMPLATES.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-purple-900/40 text-slate-300 hover:text-purple-200 border border-slate-700/80 hover:border-purple-500/40 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-purple-400" />
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Form Fields */}
            <form onSubmit={handleGenerateWithAI} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="subject-title"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Título da Trilha / Módulo
                  </label>
                  <input
                    id="subject-title"
                    type="text"
                    value={subjectTitle}
                    onChange={(e) => setSubjectTitle(e.target.value)}
                    placeholder="Ex: Redes Virtuais AWS VPC & Subnets"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label
                    htmlFor="unit-select"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Unidade da Trilha
                  </label>
                  <select
                    id="unit-select"
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm font-medium"
                  >
                    <option value="Unidade 1: Fundamentos da Nuvem">Unidade 1: Fundamentos da Nuvem</option>
                    <option value="Unidade 2: Inteligência Artificial & Microsserviços">
                      Unidade 2: Inteligência Artificial & Microsserviços
                    </option>
                    <option value="Unidade 3: Infraestrutura Avançada & DevOps">
                      Unidade 3: Infraestrutura Avançada & DevOps
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="material-text"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-300"
                  >
                    {uploadedPdf
                      ? `Texto Extraído do PDF (${uploadedPdf.fileName}):`
                      : 'Conteúdo do Material Didático:'}
                  </label>
                  {materialText && (
                    <span className="text-[11px] text-slate-400">
                      {materialText.length} caracteres extraídos
                    </span>
                  )}
                </div>

                <textarea
                  id="material-text"
                  rows={6}
                  value={materialText}
                  onChange={(e) => setMaterialText(e.target.value)}
                  placeholder={
                    inputMode === 'PDF'
                      ? 'Envie um arquivo PDF acima ou selecione um dos exemplos para que o texto dos slides seja carregado automaticamente...'
                      : 'Cole aqui o conteúdo que você deseja que a IA transforme em tópicos de estudo e atividades de fixação para os alunos...'
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm font-mono leading-relaxed"
                />
              </div>

              {/* Settings: Question count & Submit Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-300">Questões a Gerar:</span>
                  <div className="flex items-center gap-1.5">
                    {[2, 3, 4].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuestionCount(count)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          questionCount === count
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {count} Questões
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || (!materialText.trim() && !subjectTitle.trim())}
                  className="duo-btn-purple px-6 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-950/60 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Gerando com IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{uploadedPdf ? 'Gerar Atividades com Base no PDF' : 'Gerar Trilha & Atividades com IA'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Live Progress Feedback while generating */}
            {isGenerating && (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-3 animate-in fade-in">
                <div className="w-6 h-6 rounded-full bg-purple-600/30 border-2 border-purple-400 border-t-transparent animate-spin shrink-0" />
                <div className="text-xs text-purple-200 font-medium">{generationStep}</div>
              </div>
            )}

            {/* Success Feedback */}
            {successMessage && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          {/* List of Published Modules in the Trail */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Módulos Atuais na Trilha dos Alunos
              </h3>
              <span className="text-xs text-slate-400">
                {modules.length} módulos estruturados
              </span>
            </div>

            <div className="space-y-3">
              {modules.map((mod, idx) => (
                <div
                  key={mod.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white">{mod.title}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {mod.unitTitle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 pl-8">
                      {mod.studySummary}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 pl-8 pt-1">
                      <span className="flex items-center gap-1 text-slate-400">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                        {mod.studyTopics.length} tópicos teóricos
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                        {mod.quizQuestions.length} questões de fixação
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 sm:self-center">
                    <button
                      type="button"
                      onClick={() => onPreviewModule(mod)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      Visualizar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteModule(mod.id)}
                      className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 transition-colors cursor-pointer"
                      title="Excluir módulo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Class Progress & Analytics Panel */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Métricas da Turma
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Alunos Matriculados na Trilha</span>
                <p className="text-2xl font-black text-indigo-400 mt-1">42 Estudantes</p>
                <span className="text-[11px] text-slate-500">Engajamento semanal: 91%</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Taxa Geral de Aprovação nos Quizzes</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">84.2%</p>
                <span className="text-[11px] text-emerald-500">Nota de corte: 70%</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Tempo Médio por Módulo</span>
                <p className="text-2xl font-black text-amber-400 mt-1">38 minutos</p>
                <span className="text-[11px] text-slate-500">Com base nos registros no RDS</span>
              </div>
            </div>
          </div>

          {/* Prompt Architecture Details */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Processamento de PDFs e Slides pela IA
            </h4>
            <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <p>
                • <strong>Ingestão de Arquivos:</strong> O professor pode enviar arquivos `.pdf` contendo slides ou livros. O leitor extrai textos de lâminas e tópicos.
              </p>
              <p>
                • <strong>Geração Estruturada:</strong> A IA identifica conceitos-chave, segmenta os tópicos para leitura do estudante e gera quizzes com 4 alternativas, distratores e justificativa pedagógica.
              </p>
              <p>
                • <strong>Disponibilização:</strong> O arquivo PDF original fica vinculado na lista de materiais de apoio para consulta direta do aluno no módulo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
