# Guia Passo-a-Passo: Deploy no Vercel

## Passo 1: Criar repositório no GitHub

### 1.1 Abra o GitHub
- Vá para https://github.com
- Faça login (ou crie conta)

### 1.2 Criar novo repositório
- Clique em "+" (canto superior direito) → "New repository"
- Campo "Repository name": Digite `nexus-vision-pro`
- Deixe como "Public" (opcional, pode ser Private)
- Clique "Create repository"

### 1.3 Copiar a URL do repositório
- Na tela do repositório, clique em "Code" (botão verde)
- Copie a URL HTTPS (ex: `https://github.com/seu-usuario/nexus-vision-pro.git`)

---

## Passo 2: Fazer push do código para GitHub

No terminal, na pasta do projeto:

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/nexus-vision-pro.git
git push -u origin main
```

(Substitua `seu-usuario` pelo seu login do GitHub)

---

## Passo 3: Conectar Vercel ao GitHub

### 3.1 Abra o Vercel
- Vá para https://vercel.com
- Faça login (pode usar conta GitHub)

### 3.2 Importar projeto
- Clique em "Add New..." → "Project"
- Clique em "Import Git Repository"
- Procure por `nexus-vision-pro` e selecione
- Clique "Import"

### 3.3 Preencher Environment Variables
Na tela de configuração, procure por **"Environment Variables"** e adicione:

**Nome:** `OPENROUTER_API_KEY`
**Valor:** (mude em `.env.local`)
```
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
```

**Nome:** `MP_ACCESS_TOKEN`
**Valor:**
```
TEST-4914533983643702-020612-dc7210c0e6dbbc67cdc0118e864e38ff-2538478070
```

**Nome:** `OPENROUTER_MODEL` (opcional)
**Valor:**
```
gpt-4o-mini
```

Deixe o Scope como "Production" e "Preview" (ambos devem estar selecionados).

### 3.4 Deploy
- Clique "Deploy"
- Espere a build terminar (vai levar uns 2-3 minutos)

Pronto! Você terá uma URL como: `https://nexus-vision-pro-xyz123.vercel.app`

---

## Passo 4: Depois, testar localmente com `vercel dev`

Quando terminar o deployment acima, rode localmente:

```powershell
vercel dev
```

(Agora vai funcionar porque o projeto já está linkado ao Vercel)

---

**Dúvidas em algum passo?** Avisa qual é! 👍
