import type { Module, Trilha } from '../types/trilha'


export const INITIAL_MODULES: Module[] = [
  {
    id: 1,
    order: 1,
    unitNumber: 1,
    unitTitle: 'Unidade 1: Fundamentos da Nuvem',
    title: 'Introdução à Computação em Nuvem & AWS Global',
    shortTitle: 'Fundamentos AWS',
    description: 'Entenda os modelos essenciais de serviço em nuvem (IaaS, PaaS, SaaS) e a infraestrutura mundial da AWS.',
    duration: '35 min',
    icon: 'cloud',
    completed: false,
    unlocked: true,
    studySummary:
      'A computação em nuvem revolucionou a engenharia de software ao substituir data centers locais caros por capacidade computacional sob demanda via Internet, com precificação no modelo pay-as-you-go.',
    studyTopics: [
      {
        title: '1. Modelos de Serviço em Nuvem (IaaS vs PaaS vs SaaS)',
        content:
          'Na computação em nuvem, a responsabilidade é compartilhada entre o provedor e o cliente:\n• IaaS (Infraestrutura como Serviço): Provedor cuida de hardware e virtualização; você gerencia SO, rede e apps (Ex: Amazon EC2).\n• PaaS (Plataforma como Serviço): Provedor gerencia SO e runtime; você só foca no código (Ex: AWS Elastic Beanstalk, Heroku).\n• SaaS (Software como Serviço): Aplicação final gerenciada inteiramente pelo provedor (Ex: Google Workspace, Microsoft 365).',
        keyTakeaway: 'Lembre-se: no EC2 você gerencia as atualizações do SO; no Lambda ou Amplify, você só foca na aplicação.',
        codeSnippet: `// Exemplo de sizing básico no EC2:
InstanceType: "t3.micro" (2 vCPUs, 1 GiB RAM)
Model: IaaS (Acesso SSH direto, controle do SO Ubuntu/Amazon Linux)`,
      },
      {
        title: '2. Infraestrutura Global AWS: Regiões e AZs',
        content:
          'Uma Região AWS é um local físico no mundo (ex: us-east-1 no Norte da Virgínia, sa-east-1 em São Paulo) contendo múltiplos Data Centers agrupados.\nCada Região possui no mínimo 3 Zonas de Disponibilidade (AZs), fisicamente isoladas entre si, com energia e conexão redundantes para alta disponibilidade e tolerância a falhas.',
        keyTakeaway: 'Para alta tolerância a falhas, distribua instâncias entre pelo menos 2 Zonas de Disponibilidade distintas.',
      },
      {
        title: '3. Modelo de Responsabilidade Compartilhada',
        content:
          'A AWS é responsável pela "Segurança DA nuvem" (hardware físico, cabos, data centers, hypervisors).\nO cliente é responsável pela "Segurança NA nuvem" (dados de clientes, controle de acesso IAM, regras de firewall/Security Groups e criptografia).',
        keyTakeaway: 'Vazamentos por senhas fracas ou buckets públicos são de inteira responsabilidade do cliente!',
      },
    ],
    resources: [
      { label: 'Documentação Oficial: Infraestrutura Global AWS', url: 'https://aws.amazon.com/about-aws/global-infrastructure/', type: 'doc' },
      { label: 'Visão Geral do Modelo IaaS vs PaaS', url: 'https://aws.amazon.com/types-of-cloud-computing/', type: 'article' },
    ],
    quizQuestions: [
      {
        id: 101,
        question: 'Qual dos seguintes serviços da AWS é classificado primariamente como IaaS (Infraestrutura como Serviço)?',
        options: ['AWS Lambda', 'Amazon EC2 (Elastic Compute Cloud)', 'AWS Amplify', 'Amazon DynamoDB'],
        correctAnswer: 1,
        explanation: 'O Amazon EC2 aluga instâncias de computação virtual onde o usuário possui controle sobre o Sistema Operacional e configurações de rede.',
      },
      {
        id: 102,
        question: 'No modelo de infraestrutura da AWS, o que representa uma Zona de Disponibilidade (AZ)?',
        options: [
          'Um país inteiro com jurisdição legal própria',
          'Um ou mais data centers discretos com energia, rede e conectividade redundantes',
          'Um cache de borda (Edge Location) exclusivo para arquivos estáticos',
          'Uma ferramenta de faturamento unificado para contas filhas',
        ],
        correctAnswer: 1,
        explanation: 'AZs são data centers fisicamente separados dentro de uma Região geográfica, interconectados por fibra óptica de latência ultrabaixa.',
      },
      {
        id: 103,
        question: 'Segundo o Modelo de Responsabilidade Compartilhada da AWS, quem é responsável pela segurança física dos data centers?',
        options: ['O cliente final', 'O desenvolvedor da aplicação web', 'A própria AWS (Segurança DA nuvem)', 'A ANATEL / Agência reguladora'],
        correctAnswer: 2,
        explanation: 'A AWS garante a segurança física das instalações, geradores, proteção patrimonial e camadas de virtualização.',
      },
    ],
  },
  {
    id: 2,
    order: 2,
    unitNumber: 1,
    unitTitle: 'Unidade 1: Fundamentos da Nuvem',
    title: 'Arquitetura Web & Deploy com AWS Amplify + S3',
    shortTitle: 'Deploy Web & CI/CD',
    description: 'Aprenda a publicar Single Page Applications (React/Vite) com pipeline automatizado de CI/CD integrado ao GitHub.',
    duration: '45 min',
    icon: 'zap',
    completed: false,
    unlocked: false,
    studySummary:
      'O AWS Amplify automatiza a jornada de hospedagem de frontends modernos com deploy contínuo (CI/CD), certificados SSL gratuitos automáticos e distribuição global via CloudFront CDN.',
    studyTopics: [
      {
        title: '1. O que é o AWS Amplify Hosting?',
        content:
          'Amplify Hosting é um serviço totalmente gerenciado para hospedar aplicações estáticas (HTML/CSS/JS) e SPAs (React, Vue, Vite, Next.js).\nEle se integra diretamente ao GitHub: a cada comando "git push", o Amplify inicia um runner em contêiner, executa os scripts de compilação e publica a nova versão em minutos.',
        keyTakeaway: 'Zero configuração manual de Nginx ou servidores web para hospedar seu frontend!',
        codeSnippet: `# Exemplo de amplify.yml na raiz:
version: 1
frontend:
  phases:
    build:
      commands:
        - npm ci
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'`,
      },
      {
        title: '2. Integração com Amazon S3 & CloudFront',
        content:
          'Por baixo dos panos, o build compilado (pasta dist/) é armazenado em um bucket Amazon S3 de alta durabilidade (99.999999999%) e distribuído por mais de 400 Edge Locations do Amazon CloudFront em todo o planeta, reduzindo a latência para os alunos.',
        keyTakeaway: 'O CloudFront armazena os assets estáticos em cache próximo do usuário final, garantindo carregamento instantâneo.',
      },
      {
        title: '3. Variáveis de Ambiente e Domínios Customizados',
        content:
          'No console do Amplify é possível configurar variáveis de ambiente (como VITE_API_URL ou chaves de API) de forma segura por branch (ex: main, staging, dev), sem expor segredos no repositório público do GitHub.',
        keyTakeaway: 'Nunca versione chaves de produção dentro do código ou no git commit!',
      },
    ],
    resources: [
      { label: 'Guia de Deploy Contínuo com AWS Amplify', url: 'https://docs.aws.amazon.com/amplify/', type: 'doc' },
      { label: 'Distribuição Global com Amazon CloudFront', url: 'https://aws.amazon.com/cloudfront/', type: 'article' },
    ],
    quizQuestions: [
      {
        id: 201,
        question: 'No fluxo de CI/CD do AWS Amplify conectado ao repositório GitHub, quando ocorre o build automático?',
        options: [
          'Apenas ao reiniciar a máquina virtual EC2',
          'A cada novo commit ou push na branch configurada',
          'Uma vez por semana às 00:00 via cron job',
          'Somente quando o aluno abre a página no navegador',
        ],
        correctAnswer: 1,
        explanation: 'O AWS Amplify escuta eventos de webhooks do GitHub e dispara o pipeline de build e deploy automaticamente a cada push.',
      },
      {
        id: 202,
        question: 'Qual arquivo de configuração na raiz do repositório define os comandos de compilação e o diretório de saída do Amplify?',
        options: ['docker-compose.yml', 'amplify.yml', 'nginx.conf', 'package.lock'],
        correctAnswer: 1,
        explanation: 'O arquivo amplify.yml padroniza as fases de pré-build, build e o diretório de artefatos (geralmente dist ou build).',
      },
      {
        id: 203,
        question: 'Qual serviço da AWS trabalha em conjunto com o S3 para prover cache em borda (CDN) de latência ultrabaixa para o frontend?',
        options: ['Amazon CloudFront', 'AWS Glue', 'Amazon Redshift', 'AWS IAM'],
        correctAnswer: 0,
        explanation: 'O Amazon CloudFront é a rede de entrega de conteúdo (CDN) global da AWS que distribui dados e mídias de forma segura e rápida.',
      },
    ],
  },
  {
    id: 3,
    order: 3,
    unitNumber: 2,
    unitTitle: 'Unidade 2: Inteligência Artificial & Microsserviços',
    title: 'Geração Automatizada com Google Gemini & LLMs',
    shortTitle: 'Geração por IA (LLMs)',
    description: 'Como integrar modelos generativos via API REST para produzir roteiros pedagógicos e questões em JSON estruturado.',
    duration: '50 min',
    icon: 'sparkles',
    completed: false,
    unlocked: false,
    studySummary:
      'Integrar Modelos de Linguagem de Grande Porte (LLMs) permite aos professores transformar apostilas densas em trilhas interativas instantâneas com esquemas de dados estritos.',
    studyTopics: [
      {
        title: '1. Arquitetura da Chamada de IA na EC2',
        content:
          'O fluxo seguro de IA segue a seguinte sequência:\n1. O docente cola o material no Frontend React.\n2. O Frontend envia a requisição HTTP com token JWT para o Backend na EC2.\n3. O Backend monta um prompt pedagógico com regras rígidas e chama a API da Google Gemini.\n4. A LLM retorna a resposta no formato JSON estruturado.\n5. O Backend valida os tipos e persiste no PostgreSQL antes de responder ao cliente.',
        keyTakeaway: 'A chave de API da IA NUNCA fica no frontend do navegador do aluno; ela reside protegida nas variáveis de ambiente do backend!',
        codeSnippet: `// Estrutura de prompt com JSON Schema estrito:
{
  "moduleTitle": "string",
  "studySummary": "string",
  "quiz": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "string"
    }
  ]
}`,
      },
      {
        title: '2. Engenharia de Prompt para Educação',
        content:
          'Para garantir questões de alta qualidade pedagógica, o prompt deve especificar o perfil do público (ex: estudantes universitários de computação), o nível de dificuldade, a exigência de 4 alternativas e justificativas didáticas tanto para a resposta correta quanto para os distratores.',
        keyTakeaway: 'Instruções como "responda APENAS em JSON sem marcações extras" garantem que o parser do servidor não quebre.',
      },
    ],
    resources: [
      { label: 'Google AI Studio & Gemini API Reference', url: 'https://ai.google.dev/', type: 'doc' },
      { label: 'Structured Outputs & JSON Mode in LLMs', url: 'https://ai.google.dev/gemini-api/docs/structured-output', type: 'article' },
    ],
    quizQuestions: [
      {
        id: 301,
        question: 'Para garantir que a LLM retorne questões prontas para inserção no banco de dados relacional, que formato de saída é recomendado?',
        options: [
          'Texto livre com abreviações informais',
          'JSON com esquema estrito validado',
          'PDF binário compilado em base64',
          'Tabela formatada apenas em HTML',
        ],
        correctAnswer: 1,
        explanation: 'O formato JSON estruturado com esquema garante tipagem previsível e serialização direta para o backend e PostgreSQL.',
      },
      {
        id: 302,
        question: 'Por que a chamada para a API da IA deve ser intermediada pelo servidor backend (AWS EC2) em vez de ser feita diretamente pelo navegador?',
        options: [
          'Porque navegadores são incapazes de realizar requisições HTTPS',
          'Para proteger a chave secreta da API (API Key) e aplicar controle de acesso RBAC',
          'Porque a Google Gemini API só aceita conexões de computadores Linux',
          'Apenas para diminuir o consumo de memória RAM do aluno',
        ],
        correctAnswer: 1,
        explanation: 'Manter a chave no backend impede que usuários mal-intencionados inspecionem o código-fonte e roubem a cota da API da instituição.',
      },
    ],
  },
  {
    id: 4,
    order: 4,
    unitNumber: 2,
    unitTitle: 'Unidade 2: Inteligência Artificial & Microsserviços',
    title: 'Persistência com AWS RDS PostgreSQL & Segurança RBAC',
    shortTitle: 'Banco RDS & RBAC',
    description: 'Armazenamento persistente em banco relacional, segurança com hashing de senhas e papéis de usuário (Docente e Discente).',
    duration: '55 min',
    icon: 'database',
    completed: false,
    unlocked: false,
    studySummary:
      'O Amazon RDS gerencia backups automáticos, replicação Multi-AZ e atualizações de segurança para o banco relacional PostgreSQL, onde armazenamos usuários, progresso e notas dos quizzes.',
    studyTopics: [
      {
        title: '1. Modelo de Dados Relacional',
        content:
          'O sistema possui tabelas essenciais:\n• Usuarios: id, nome, email, matricula, role (DOCENTE/DISCENTE), senha_hash (bcrypt).\n• Trilhas & Modulos: id, titulo, descricao, ordem, duracao.\n• Quizzes & Questoes: id_modulo, enunciado, alternativas_json, resposta_correta, explicacao.\n• Progresso_Aluno: id_aluno, id_modulo, concluido (bool), pontuacao, data_conclusao.',
        keyTakeaway: 'A chave primária e chaves estrangeiras garantem integridade referencial: um quiz sempre pertence a um módulo existente!',
      },
      {
        title: '2. Controle de Acesso Baseado em Papéis (RBAC)',
        content:
          'O RBAC assegura que apenas usuários com a role DOCENTE tenham permissão para disparar endpoints POST/DELETE de criação de trilhas e módulos. Discentes possuem permissão restrita para leitura de conteúdos e submissão de respostas de quizzes.',
        keyTakeaway: 'Tokens JWT (JSON Web Tokens) assinados com segredo HMAC garantem que a sessão não seja forjada.',
      },
    ],
    resources: [
      { label: 'Amazon RDS para PostgreSQL', url: 'https://aws.amazon.com/rds/postgresql/', type: 'doc' },
      { label: 'Boas Práticas de RBAC e Autenticação JWT', url: 'https://jwt.io/introduction', type: 'article' },
    ],
    quizQuestions: [
      {
        id: 401,
        question: 'Qual vantagem principal o Amazon RDS oferece em comparação com instalar manualmente o PostgreSQL dentro de uma máquina EC2 comum?',
        options: [
          'O RDS é totalmente gratuito para qualquer volume de dados indefinidamente',
          'Automação de backups contínuos, patches de segurança do SO e failover Multi-AZ gerenciado',
          'O RDS dispensa a necessidade de modelar tabelas e chaves primárias',
          'O RDS só pode ser acessado via terminal sem conexões TCP/IP',
        ],
        correctAnswer: 1,
        explanation: 'O RDS é um serviço de banco gerenciado que reduz significativamente o trabalho operacional de administração e alta disponibilidade.',
      },
      {
        id: 402,
        question: 'Em uma arquitetura segura com RBAC, onde deve ocorrer a validação se o usuário tem perfil de DOCENTE para criar trilhas?',
        options: [
          'Apenas no visual do botão pelo CSS (display: none)',
          'No Backend via middleware de validação do token JWT assinado',
          'No arquivo index.html do cliente',
          'No navegador através de um cookie sem criptografia',
        ],
        correctAnswer: 1,
        explanation: 'A segurança corporativa exige validação rigorosa no servidor; proteções puramente visuais no frontend podem ser contornadas.',
      },
    ],
  },
]

export const TEACHER_PROMPT_TEMPLATES = [
  {
    title: 'Arquitetura de Microsserviços e Docker',
    subject: 'Containers, Dockerfiles, Docker Compose e Kubernetes',
    material: `Ementa do Módulo:
1. O que são Containers vs Máquinas Virtuais (Hypervisors vs Kernel namespaces e cgroups).
2. Estrutura de um Dockerfile: FROM, WORKDIR, COPY, RUN, EXPOSE e CMD.
3. Orquestração com Docker Compose: definição de múltiplos serviços (frontend, backend e banco PostgreSQL na mesma rede bridge).
4. Boas práticas: imagens multi-stage builds para reduzir o tamanho final em produção.
Exercícios cobram sintaxe de comandos docker e princípios de isolamento de processos.`,
  },
  {
    title: 'Segurança da Informação e Criptografia em Nuvem',
    subject: 'Criptografia Simétrica, Assimétrica, Hashing e AWS KMS',
    material: `Ementa de Segurança:
1. Diferença fundamental entre Criptografia Simétrica (AES-256 mesma chave) e Assimétrica (RSA par de chaves pública e privada).
2. Hashing criptográfico: SHA-256 e Bcrypt com salt para senhas de usuários. Hashes são funções unidirecionais irreversíveis.
3. Gerenciamento de chaves com AWS KMS (Key Management Service) e rotação automática anual.
4. Políticas de privilégio mínimo no AWS IAM (Identity and Access Management).`,
  },
  {
    title: 'Bancos de Dados NoSQL e DynamoDB',
    subject: 'Chaves de Partição, Ordenação e Escalar sem Servidor',
    material: `Ementa NoSQL:
1. Paradigma relacional ACID vs NoSQL BASE e Teorema CAP.
2. Amazon DynamoDB: chave primária simples (Partition Key) vs chave primária composta (Partition Key + Sort Key).
3. Padrão Single-Table Design para consultas eficientes em milissegundos de um dígito.
4. Índices Secundários Globais (GSI) e Streams do DynamoDB integrados ao AWS Lambda.`,
  },
]

export const INITIAL_TRILHA: Trilha = {
  id: 'aws-cloud-2026',
  title: 'Arquitetura em Nuvem AWS & Inteligência Artificial',
  description: 'Trilha universitária interativa com roteiros de estudo gerados por IA e atividades com desbloqueio sequencial.',
  teacherName: 'Prof. Coordenador de Sistemas para Internet',
  modules: INITIAL_MODULES,
}
