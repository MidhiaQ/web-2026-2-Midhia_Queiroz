# Sistema de Trilhas de Estudo com Quiz Gerado por IA 🎓⚡

Projeto desenvolvido com **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4** e hospedagem contínua (CI/CD) via **AWS Amplify** integrado ao **GitHub**.

---

## 🚀 Tecnologias Utilizadas

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) com `@tailwindcss/vite`
- **Controle de Versão**: Git & GitHub (`MidhiaQ/web-2026-2-Midhia_Queiroz`)
- **Deploy & Hospedagem**: AWS Amplify Hosting (CI/CD automático a cada commit na branch `main`)
- **Backend & Banco (Planejados)**: AWS EC2 (Node.js/Python REST API) + AWS RDS (PostgreSQL) + Google Gemini API

---

## 🛠️ Como Executar Localmente

### 1. Clonar o repositório (caso ainda não tenha clonado):
```bash
git clone https://github.com/MidhiaQ/web-2026-2-Midhia_Queiroz.git
cd web-2026-2-Midhia_Queiroz
```

### 2. Instalar as dependências:
```bash
npm install
```

### 3. Rodar o servidor de desenvolvimento:
```bash
npm run dev
```
Acesse a URL exibida no terminal (normalmente `http://localhost:5173`).

### 4. Compilar para produção (Build):
```bash
npm run build
```
Os arquivos estáticos otimizados serão gerados na pasta `dist/`.

---

## 🎨 Instalação e Configuração do Tailwind CSS v4

O Tailwind CSS v4 utiliza a arquitetura moderna com o plugin oficial do Vite:

1. **Pacotes instalados**:
   ```bash
   npm install tailwindcss @tailwindcss/vite
   ```

2. **Configuração no `vite.config.ts`**:
   ```ts
   import react from '@vitejs/plugin-react'
   import tailwindcss from '@tailwindcss/vite'
   import { defineConfig } from 'vite'

   export default defineConfig({
     plugins: [react(), tailwindcss()],
   })
   ```

3. **Importação no `src/index.css`**:
   ```css
   @import "tailwindcss";
   ```

*(Nota: Na versão 4 do Tailwind, não é necessário criar `tailwind.config.js` nem `postcss.config.js`)*

---

## ☁️ Como Conectar o Projeto na AWS Amplify com GitHub

1. Faça o commit e envie o código para o GitHub:
   ```bash
   git add .
   git commit -m "feat: inicializacao do projeto com React, Vite, TypeScript e Tailwind v4"
   git branch -M main
   git push -u origin main
   ```

2. Acesse o **Console AWS** (https://console.aws.amazon.com) e pesquise por **AWS Amplify**.
3. Clique em **"Deploy an app"** ou **"Host web app"**.
4. Selecione **GitHub** como provedor de código e clique em **Next**.
5. Autorize a AWS na sua conta GitHub (`MidhiaQ`) e selecione o repositório `web-2026-2-Midhia_Queiroz` e a branch `main`.
6. O Amplify detectará o arquivo `amplify.yml` pré-configurado:
   - Base directory: `dist`
   - Build command: `npm run build`
7. Clique em **Save and Deploy**.
8. Em poucos minutos, a AWS fornecerá uma URL pública com certificado SSL (HTTPS) automático! A cada novo `git push`, o deploy será realizado automaticamente.
