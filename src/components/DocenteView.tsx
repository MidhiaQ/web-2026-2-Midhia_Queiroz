import React, { useState, useRef, useEffect } from 'react'
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
  Edit3,
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
  const [questionCount, setQuestionCount] = useState<number>(3)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [generationStep, setGenerationStep] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [formErrors, setFormErrors] = useState<{
    subjectTitle?: string
    materialText?: string
    general?: string
  }>({})

  // Dynamic Units & Renaming States com persistência real
  const [unitsList, setUnitsList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('trilhas_units_list_v2')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // ignore
    }
    const fromModules = Array.from(new Set(modules.map((m) => m.unitTitle).filter(Boolean)))
    if (fromModules.length > 0) {
      return fromModules
    }
    return [
      'Unidade 1: Fundamentos da Nuvem',
      'Unidade 2: Inteligência Artificial & Microsserviços',
      'Unidade 3: Infraestrutura Avançada & DevOps',
    ]
  })

  // Sincroniza unitsList com o localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trilhas_units_list_v2', JSON.stringify(unitsList))
    } catch {
      // ignore
    }
  }, [unitsList])

  const existingUnits = unitsList
  const [selectedUnit, setSelectedUnit] = useState<string>(() => unitsList[0] || 'Unidade 1: Fundamentos da Nuvem')
  const [isCustomUnit, setIsCustomUnit] = useState(false)
  const [customUnitName, setCustomUnitName] = useState('')
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [unitToRename, setUnitToRename] = useState(existingUnits[0] || 'Unidade 1: Fundamentos da Nuvem')
  const [targetNewName, setTargetNewName] = useState(existingUnits[0] || 'Unidade 1: Fundamentos da Nuvem')

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

  // Handle AI generation of modules and activities with form validation
  const handleGenerateWithAI = (e: React.FormEvent) => {
    e.preventDefault()

    const errors: { subjectTitle?: string; materialText?: string; general?: string } = {}

    // Validação de Título
    if (!subjectTitle.trim()) {
      errors.subjectTitle = 'O título do módulo é obrigatório.'
    } else if (subjectTitle.trim().length < 4) {
      errors.subjectTitle = 'O título deve conter no mínimo 4 caracteres.'
    }

    // Validação de Conteúdo Didático
    if (inputMode === 'PDF' && !uploadedPdf && !materialText.trim()) {
      errors.materialText = 'Por favor, anexe um arquivo PDF válido ou escolha uma das amostras para extrair o conteúdo.'
    } else if (!materialText.trim()) {
      errors.materialText = 'O conteúdo didático é obrigatório para que a IA processe o módulo.'
    } else if (materialText.trim().length < 30) {
      errors.materialText = 'O texto didático deve conter pelo menos 30 caracteres para que a IA gere uma síntese pedagógica e exercícios consistentes.'
    }

    if (Object.keys(errors).length > 0) {
      errors.general = 'Corrija os campos destacados em vermelho abaixo antes de gerar a trilha com IA.'
      setFormErrors(errors)
      playSound('wrong', soundEnabled)
      return
    }

    setFormErrors({})
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
      const finalUnitTitle = isCustomUnit && customUnitName.trim() ? customUnitName.trim() : selectedUnit

      if (isCustomUnit && customUnitName.trim()) {
        setUnitsList((prev) => (prev.includes(finalUnitTitle) ? prev : [...prev, finalUnitTitle]))
        setIsCustomUnit(false)
        setCustomUnitName('')
        setSelectedUnit(finalUnitTitle)
      }

      const newModule: Module = {
        id: newModuleId,
        order: newOrder,
        unitNumber: 3,
        unitTitle: finalUnitTitle,
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
          const isVpc =
            (uploadedPdf && uploadedPdf.fileName.toLowerCase().includes('vpc')) ||
            materialText.toLowerCase().includes('vpc') ||
            sampleTitle.toLowerCase().includes('vpc')

          const isSqs =
            (uploadedPdf && uploadedPdf.fileName.toLowerCase().includes('sqs')) ||
            materialText.toLowerCase().includes('sqs') ||
            materialText.toLowerCase().includes('fila') ||
            sampleTitle.toLowerCase().includes('sqs')

          // 1. Banco expandido de questões para Redes / VPC
          if (isVpc) {
            const vpcQuestions = [
              {
                q: 'Qual é a diferença fundamental entre Security Groups e Network ACLs (NACLs) na AWS VPC?',
                options: [
                  'Security Groups são Stateful (no nível de instância); NACLs são Stateless (no nível de sub-rede)',
                  'Security Groups atuam apenas em servidores Windows; NACLs apenas em Linux',
                  'NACLs nunca podem ter regras de negação (Deny)',
                  'Não há diferença técnica, são sinônimos para o mesmo componente de firewall',
                ],
                c: 0,
                exp: 'Security Groups são stateful: se o tráfego de entrada for permitido, a resposta sai automaticamente. As NACLs são stateless e avaliam cada pacote nas bordas da sub-rede separadamente.',
              },
              {
                q: 'Para que serve um NAT Gateway posicionado em uma Subnet Pública?',
                options: [
                  'Permitir que instâncias em subnets privadas naveguem para a Internet para baixar patches sem receber conexões externas não solicitadas',
                  'Substituir o banco de dados relacional RDS por armazenamento local temporário',
                  'Expor a porta de banco de dados diretamente na Internet pública sem senha',
                  'Diminuir a velocidade de processamento das instâncias para economizar custos',
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
              {
                q: 'Qual componente gerenciado pela AWS é indispensável para habilitar comunicação bidirecional entre uma VPC e a Internet pública?',
                options: [
                  'AWS Glue',
                  'Internet Gateway (IGW)',
                  'Amazon Athena',
                  'AWS CodeCommit',
                ],
                c: 1,
                exp: 'O Internet Gateway (IGW) é o componente redundante e de alta disponibilidade da AWS que conecta os recursos da VPC à rede mundial.',
              },
              {
                q: 'Qual é o papel de um Bastion Host (ou Jump Server) em uma arquitetura de rede em nuvem?',
                options: [
                  'Prover um ponto de entrada seguro e auditável na subnet pública para administradores acessarem instâncias privadas via SSH/RDP',
                  'Armazenar backups de arquivos estáticos em fita magnética',
                  'Substituir o roteador físico da operadora de telecomunicações',
                  'Executar mineradores de criptomoedas nos horários de pico',
                ],
                c: 0,
                exp: 'O Bastion Host reside na rede pública e aceita conexões administrativas restritas (apenas IPs autorizados) para que engenheiros saltem com segurança para as instâncias privadas.',
              },
              {
                q: 'Qual serviço permite interconectar duas VPCs diretamente como se fizessem parte da mesma rede, sem usar a Internet pública?',
                options: [
                  'VPC Peering Connection',
                  'Envio diário de e-mails entre servidores',
                  'Download de arquivos via torrent',
                  'Protocolo FTP anônimo',
                ],
                c: 0,
                exp: 'O VPC Peering cria uma ponte de comunicação direta ponto-a-ponto entre redes virtuais utilizando o backbone privado da AWS com latência ultrabaixa.',
              },
              {
                q: 'Em uma Tabela de Roteamento (Route Table), qual notação CIDR representa a rota padrão para a Internet (Default Route)?',
                options: [
                  '0.0.0.0/0',
                  '127.0.0.1/32',
                  '192.168.1.1/24',
                  '10.0.0.0/8',
                ],
                c: 0,
                exp: 'A notação 0.0.0.0/0 indica todo o tráfego IPv4 que não possui uma rota mais específica definida na tabela de roteamento.',
              },
              {
                q: 'Para acessar o Amazon S3 a partir de instâncias em subnets privadas sem custos de tráfego de NAT Gateway, o que deve ser provisionado?',
                options: [
                  'VPC Gateway Endpoint para Amazon S3',
                  'Uma placa de rede USB externa',
                  'Abertura total da porta 80 para a Internet',
                  'Compartilhamento de pasta via Bluetooth',
                ],
                c: 0,
                exp: 'Os VPC Gateway Endpoints direcionam o tráfego de subnets privadas para o S3 e DynamoDB diretamente através da rede interna da AWS de forma gratuita e segura.',
              },
              {
                q: 'Qual das seguintes faixas de endereçamento IP é reservada pela RFC 1918 para redes privadas em VPCs?',
                options: [
                  '10.0.0.0/16 (ou 172.16.0.0/12 e 192.168.0.0/16)',
                  '8.8.8.0/24',
                  '1.1.1.0/24',
                  '200.150.0.0/16',
                ],
                c: 0,
                exp: 'Os blocos 10.0.0.0/8, 172.16.0.0/12 e 192.168.0.0/16 são designados internacionalmente como endereços não roteáveis na Internet pública para uso privativo.',
              },
              {
                q: 'O que caracteriza um endereço Elastic IP (EIP) na AWS?',
                options: [
                  'Um endereço IPv4 público estático alocado à sua conta que pode ser reassociado dinamicamente para mascarar falhas de instâncias',
                  'Um endereço que muda a cada 5 segundos aleatoriamente',
                  'Uma chave de criptografia de uso único',
                  'Um cabo de fibra óptica de borracha flexível',
                ],
                c: 0,
                exp: 'O Elastic IP é um endereço IP público fixo associado à conta AWS que permite redirecionar o tráfego rapidamente de uma instância com falha para outra saudável.',
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

          // 2. Banco expandido de questões para Mensageria / SQS
          if (isSqs) {
            const sqsQuestions = [
              {
                q: 'Qual é a principal diferença entre uma Fila Padrão (Standard) e uma Fila FIFO no Amazon SQS?',
                options: [
                  'Filas FIFO garantem ordenação estrita e entrega exatamente uma vez; Filas Padrão oferecem vazão quase ilimitada com melhor esforço de ordenação',
                  'Filas FIFO só operam nos fins de semana para economia de energia',
                  'Filas Padrão não aceitam mensagens em texto JSON',
                  'Filas FIFO deletam todas as mensagens automaticamente a cada 10 minutos',
                ],
                c: 0,
                exp: 'Filas FIFO (First-In, First-Out) preservam a ordem cronológica exata e impedem duplicatas, essenciais para transações financeiras e reservas.',
              },
              {
                q: 'Para que serve o padrão Dead Letter Queue (DLQ) associado ao Amazon SQS?',
                options: [
                  'Isolar mensagens que falharam repetidamente após um número configurado de tentativas para análise posterior sem travar a fila principal',
                  'Apagar permanentemente o banco de dados em caso de falha de conexão',
                  'Disparar e-mails de cobrança para os usuários',
                  'Reiniciar a máquina virtual a cada erro capturado',
                ],
                c: 0,
                exp: 'A DLQ captura mensagens malformadas que geram exceções persistentes no consumidor (poison pills), permitindo depuração sem reter o fluxo de trabalho dos outros itens.',
              },
              {
                q: 'O que representa o parâmetro "Visibility Timeout" no Amazon SQS?',
                options: [
                  'O intervalo em que uma mensagem fica oculta para outros consumidores enquanto está sendo processada pelo primeiro receptor',
                  'O tempo que a tela do computador fica ligada',
                  'O prazo de validade do contrato anual do cliente com a AWS',
                  'A velocidade de rotação dos coolers da CPU',
                ],
                c: 0,
                exp: 'Durante o Visibility Timeout, o SQS impede que outros nós processem a mesma mensagem. Se o nó falhar antes de excluí-la, ela reaparece na fila automaticamente.',
              },
              {
                q: 'Por que o recurso de "Long Polling" no Amazon SQS é uma boa prática em relação ao Short Polling?',
                options: [
                  'Reduz drasticamente os custos e elimina respostas HTTP vazias esperando a chegada de mensagens antes de responder ao cliente',
                  'Aumenta em 100 vezes o faturamento da conta',
                  'Obriga o cliente a utilizar conexões discadas antigas',
                  'Desativa a criptografia de dados em trânsito',
                ],
                c: 0,
                exp: 'O Long Polling aguarda até 20 segundos por uma mensagem antes de responder, eliminando chamadas de polling frequentes e vazias.',
              },
              {
                q: 'Qual é o tamanho máximo de payload suportado nativamente para uma mensagem individual no Amazon SQS?',
                options: [
                  '256 KB',
                  '10 GB',
                  '500 MB',
                  '5 MB',
                ],
                c: 0,
                exp: 'O SQS suporta payloads de até 256 KB. Para arquivos maiores, recomenda-se o padrão Claim Check armazenando o corpo no S3 e passando a referência no SQS.',
              },
              {
                q: 'Qual é a principal vantagem de desacoplar serviços web utilizando filas assíncronas SQS?',
                options: [
                  'Permite que o serviço produtor continue operando normalmente mesmo se o consumidor estiver sofrendo picos de carga ou em manutenção',
                  'Garante que nunca mais será necessário escrever testes unitários',
                  'Diminui a capacidade computacional da aplicação para 1 única tarefa',
                  'Torna o código-fonte incompatível com navegadores modernos',
                ],
                c: 0,
                exp: 'Filas atuam como buffers elásticos, absorvendo picos de tráfego repentinos e evitando efeito cascata de sobrecarga entre microsserviços.',
              },
              {
                q: 'No contexto de microsserviços distribuídos, o que é um consumidor "Idempotente"?',
                options: [
                  'Um serviço capaz de processar a mesma mensagem múltiplas vezes gerando exatamente o mesmo efeito final sem inconsistências',
                  'Um sistema que só executa operações matemáticas de adição',
                  'Um banco de dados que não aceita gravações',
                  'Um algoritmo que trava quando encontra números pares',
                ],
                c: 0,
                exp: 'Em mensageria com entrega ao menos uma vez (at-least-once), a idempotência evita débitos duplicados ou gravações repetidas quando mensagens reaparecem.',
              },
              {
                q: 'Qual serviço da AWS combina com o SQS para fornecer o padrão de Fan-out (publicação em broadcast para múltiplas filas)?',
                options: [
                  'Amazon SNS (Simple Notification Service)',
                  'Amazon QuickSight',
                  'AWS Snowball',
                  'Amazon Polly',
                ],
                c: 0,
                exp: 'No padrão Fan-out, uma única mensagem publicada no SNS é replicada automaticamente para múltiplas filas SQS inscritas de forma paralela.',
              },
            ]
            const picked = sqsQuestions[qIdx % sqsQuestions.length]
            return {
              id: newModuleId + qIdx + 10,
              question: picked.q,
              options: picked.options,
              correctAnswer: picked.c,
              explanation: picked.exp,
            }
          }

          // 3. Banco de questões pedagógicas e dinâmicas para qualquer tópico/material
          const genericQuestions = [
            {
              q: `No contexto de "${sampleTitle}", qual princípio de arquitetura em nuvem garante maior resiliência e alta disponibilidade?`,
              options: [
                'Distribuição redundante em múltiplas Zonas de Disponibilidade (Multi-AZ) e desacoplamento de camadas',
                'Hospedagem em servidor físico único sem rotinas de backup',
                'Armazenamento de senhas de produção no código-fonte do cliente',
                'Desativação de monitoramento e logs de auditoria para economizar memória',
              ],
              c: 0,
              exp: 'Alta disponibilidade exige redundância geográfica entre Zonas de Disponibilidade e ausência de pontos únicos de falha na arquitetura.',
            },
            {
              q: `Segundo as boas práticas de segurança em "${sampleTitle}", qual política de controle de acesso deve ser rigorosamente aplicada?`,
              options: [
                'Concessão irrestrita de permissões de Administrador para todos os colaboradores',
                'Princípio do Menor Privilégio (Least Privilege) com regras RBAC e autenticação forte',
                'Compartilhamento da mesma senha mestra entre toda a equipe de desenvolvimento',
                'Desativação de autenticação multifator (MFA)',
              ],
              c: 1,
              exp: 'O princípio do menor privilégio garante que cada serviço e usuário possua estritamente as permissões indispensáveis para sua atribuição.',
            },
            {
              q: `Durante a implementação técnica de "${sampleTitle}", como deve ser tratada a persistência e durabilidade dos dados?`,
              options: [
                'Utilizando bancos gerenciados (como AWS RDS) com backups contínuos e failover automatizado',
                'Salvando registros em arquivos temporários .txt na máquina virtual',
                'Reiniciando o banco de dados a cada nova requisição do usuário',
                'Impedindo qualquer tipo de indexação nas tabelas relacionais',
              ],
              c: 0,
              exp: 'Bancos relacionais gerenciados tratam backups, réplicas e atualizações de segurança de forma automatizada e transparente.',
            },
            {
              q: `Qual estratégia de observabilidade é recomendada para diagnosticar falhas no módulo de "${sampleTitle}" em produção?`,
              options: [
                'Centralização de métricas de telemetria, alarmes e logs com ferramentas como Amazon CloudWatch',
                'Aguardar o aluno relatar erros sem registrar logs de depuração no servidor',
                'Desligar o servidor assim que ocorrer a primeira exceção não tratada',
                'Bloquear o tráfego de rede para todos os usuários temporariamente',
              ],
              c: 0,
              exp: 'Monitoramento contínuo de latência, taxas de erro 5xx e consumo de CPU permite identificar gargalos antes que impactem a experiência do estudante.',
            },
            {
              q: `Em ambientes de nuvem modernos para "${sampleTitle}", qual é a principal vantagem da Infraestrutura como Código (IaC)?`,
              options: [
                'Provisionamento reproduzível, auditável e versionável de recursos sem configurações manuais propensas a erro humano',
                'Obrigatoriedade de comprar novos servidores físicos a cada trimestre',
                'Proibição de usar computadores conectados à Internet',
                'Aumento drástico no tempo de inicialização de novas instâncias',
              ],
              c: 0,
              exp: 'IaC (como Terraform e AWS CloudFormation) permite recriar ambientes inteiros de teste e produção de maneira idêntica e documentada em repositório.',
            },
            {
              q: `Qual é o impacto da automação de testes e pipelines CI/CD na entrega do sistema de "${sampleTitle}"?`,
              options: [
                'Detecção precoce de bugs, deploys seguros e entrega contínua de melhorias com menor risco de regressão',
                'Atraso obrigatório de várias semanas a cada alteração de código',
                'Aumento de falhas de segurança conhecidas em produção',
                'Impedir que novos desenvolvedores façam commits no repositório',
              ],
              c: 0,
              exp: 'Pipelines automatizados de CI/CD executam testes de lint, compilação e deploy a cada commit na branch principal com confiabilidade.',
            },
            {
              q: `Para otimizar custos operacionais em "${sampleTitle}", qual prática da nuvem é mais recomendada?`,
              options: [
                'Dimensionamento correto (Right-Sizing) e uso de Auto Scaling para acompanhar a oscilação da demanda real',
                'Alocar sempre instâncias com capacidades 10 vezes maiores do que o necessário',
                'Manter servidores ligados sem uso durante a madrugada e finais de semana',
                'Desativar caches e CDN para transferir dados brutos repetidamente',
              ],
              c: 0,
              exp: 'O Right-Sizing e o Auto Scaling ajustam os recursos sob demanda, pagando apenas pelo que a aplicação consome (pay-as-you-go).',
            },
            {
              q: `Em arquiteturas de microsserviços voltadas para "${sampleTitle}", o que é recomendado para comunicação entre serviços heterogêneos?`,
              options: [
                'APIs RESTful com serialização em JSON padronizado e documentação clara (OpenAPI/Swagger)',
                'Acesso direto e compartilhado ao mesmo arquivo de banco de dados SQLite local',
                'Comunicação exclusivamente por portas seriais físicas',
                'Troca manual de arquivos por pendrive entre servidores virtuais',
              ],
              c: 0,
              exp: 'Contratos claros via APIs RESTful com JSON garantem interoperabilidade entre serviços escritos em diferentes linguagens e frameworks.',
            },
          ]
          const picked = genericQuestions[qIdx % genericQuestions.length]
          return {
            id: newModuleId + qIdx + 10,
            question: picked.q,
            options: picked.options,
            correctAnswer: picked.c,
            explanation: picked.exp,
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

  // Handle renaming of units across all modules
  const handleRenameUnit = (e: React.FormEvent) => {
    e.preventDefault()
    const oldName = unitToRename.trim()
    const newName = targetNewName.trim()

    if (!newName || newName === oldName) {
      setIsRenameModalOpen(false)
      return
    }

    // 1. Atualiza todos os módulos que pertencem a essa unidade
    setModules((prev) =>
      prev.map((m) => (m.unitTitle === oldName ? { ...m, unitTitle: newName } : m))
    )

    // 2. Substitui EXATAMENTE o nome antigo pelo novo na lista de unidades
    setUnitsList((prev) => {
      const updated = prev.map((u) => (u === oldName ? newName : u))
      return Array.from(new Set(updated))
    })

    // 3. Atualiza a unidade selecionada caso seja a mesma
    if (selectedUnit === oldName) {
      setSelectedUnit(newName)
    }

    setSuccessMessage(`Unidade "${oldName}" foi substituída por "${newName}" com sucesso!`)
    playSound('correct', soundEnabled)
    setIsRenameModalOpen(false)
    setTimeout(() => setSuccessMessage(''), 5000)
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
            <form onSubmit={handleGenerateWithAI} noValidate className="space-y-4 pt-2">
              {/* General Form Error Alert */}
              {formErrors.general && (
                <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formErrors.general}</span>
                </div>
              )}

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
                    onChange={(e) => {
                      setSubjectTitle(e.target.value)
                      if (formErrors.subjectTitle) {
                        setFormErrors((prev) => ({ ...prev, subjectTitle: undefined, general: undefined }))
                      }
                    }}
                    placeholder="Ex: Redes Virtuais AWS VPC & Subnets"
                    className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all outline-none border ${
                      formErrors.subjectTitle
                        ? 'border-red-500 bg-red-500/10 text-red-100 placeholder-red-300/40 focus:ring-2 focus:ring-red-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500'
                    }`}
                  />
                  {formErrors.subjectTitle && (
                    <p className="text-xs text-red-400 font-semibold flex items-center gap-1.5 mt-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                      <span>{formErrors.subjectTitle}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="unit-select"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-300"
                    >
                      Unidade da Trilha
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const current = selectedUnit || existingUnits[0]
                        setUnitToRename(current)
                        setTargetNewName(current)
                        setIsRenameModalOpen(true)
                      }}
                      className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Renomear uma unidade existente em toda a trilha"
                    >
                      <Edit3 className="w-3 h-3" />
                      Renomear Unidades
                    </button>
                  </div>

                  <select
                    id="unit-select"
                    value={isCustomUnit ? '__CUSTOM__' : selectedUnit}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setIsCustomUnit(true)
                      } else {
                        setIsCustomUnit(false)
                        setSelectedUnit(e.target.value)
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm font-medium"
                  >
                    {existingUnits.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                    <option value="__CUSTOM__">➕ Criar Nova Unidade Personalizada...</option>
                  </select>

                  {/* Input condicional para criação de nova unidade */}
                  {isCustomUnit && (
                    <div className="mt-2 animate-in fade-in space-y-1">
                      <input
                        type="text"
                        value={customUnitName}
                        onChange={(e) => setCustomUnitName(e.target.value)}
                        placeholder="Ex: Unidade 4: Serverless e Arquiteturas Orientadas a Eventos"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-500/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-medium"
                        autoFocus
                      />
                      <span className="text-[10px] text-purple-300 block">
                        Esta nova unidade será criada e vinculada a este novo módulo.
                      </span>
                    </div>
                  )}
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
                  onChange={(e) => {
                    setMaterialText(e.target.value)
                    if (formErrors.materialText) {
                      setFormErrors((prev) => ({ ...prev, materialText: undefined, general: undefined }))
                    }
                  }}
                  placeholder={
                    inputMode === 'PDF'
                      ? 'Envie um arquivo PDF acima ou selecione um dos exemplos para que o texto dos slides seja carregado automaticamente...'
                      : 'Cole aqui o conteúdo que você deseja que a IA transforme em tópicos de estudo e atividades de fixação para os alunos...'
                  }
                  className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-mono leading-relaxed transition-all outline-none border ${
                    formErrors.materialText
                      ? 'border-red-500 bg-red-500/10 text-red-100 placeholder-red-300/40 focus:ring-2 focus:ring-red-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500'
                  }`}
                />
                {formErrors.materialText && (
                  <p className="text-xs text-red-400 font-semibold flex items-center gap-1.5 mt-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                    <span>{formErrors.materialText}</span>
                  </p>
                )}
              </div>

              {/* Settings: Question count & Submit Button */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-slate-800/80 mt-2">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-slate-200">
                      Tamanho do Quiz: <span className="text-purple-400 font-black">{questionCount} {questionCount === 1 ? 'questão' : 'questões'}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Presets Rápidos */}
                    <div className="flex items-center gap-1">
                      {[3, 5, 8, 10, 15].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setQuestionCount(count)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            questionCount === count
                              ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30 ring-1 ring-purple-400'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>

                    {/* Stepper com Input Numérico */}
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => setQuestionCount((prev) => Math.max(1, prev - 1))}
                        disabled={questionCount <= 1}
                        className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm cursor-pointer"
                        title="Diminuir uma questão"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={questionCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10)
                          if (!isNaN(val)) {
                            setQuestionCount(Math.min(15, Math.max(1, val)))
                          }
                        }}
                        className="w-10 text-center bg-transparent text-xs font-black text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuestionCount((prev) => Math.min(15, prev + 1))}
                        disabled={questionCount >= 15}
                        className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm cursor-pointer"
                        title="Aumentar uma questão"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      (Escolha de 1 a 15 questões para a atividade)
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="duo-btn-purple px-6 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-950/60 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
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

      {/* Modal para Renomear Unidades */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Edit3 className="w-5 h-5 text-purple-400" />
                <span>Renomear Unidade da Trilha</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRenameModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Ao alterar o nome de uma unidade, todos os módulos vinculados a ela serão atualizados automaticamente na trilha dos alunos e no cabeçalho das lições.
            </p>

            <form onSubmit={handleRenameUnit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Selecione a Unidade a ser Alterada:
                </label>
                <select
                  value={unitToRename}
                  onChange={(e) => {
                    setUnitToRename(e.target.value)
                    setTargetNewName(e.target.value)
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  {existingUnits.map((u) => (
                    <option key={u} value={u}>
                      {u} ({modules.filter((m) => m.unitTitle === u).length} {modules.filter((m) => m.unitTitle === u).length === 1 ? 'módulo' : 'módulos'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Novo Nome da Unidade:
                </label>
                <input
                  type="text"
                  value={targetNewName}
                  onChange={(e) => setTargetNewName(e.target.value)}
                  placeholder="Ex: Unidade 1: Arquitetura em Nuvem e Redes"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!targetNewName.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md shadow-purple-600/30 cursor-pointer disabled:opacity-40"
                >
                  Salvar Alteração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
