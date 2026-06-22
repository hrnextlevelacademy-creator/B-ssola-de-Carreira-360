# Ferramenta de Reconversão de Carreira
**HR Next Level Academy**

---

## O que é

Página web que analisa um CV + perfil LinkedIn com IA (Anthropic Claude) e gera um relatório PDF personalizado com:
- Perfil actual e diagnóstico de mercado
- Cenário A (3 anos) e Cenário B (5 anos)
- Plano de acção — 90 dias
- Ajustes prioritários ao CV e LinkedIn

Os e-mails dos utilizadores ficam registados nos logs da Netlify para captação de leads para o Substack.

---

## Deploy no Netlify (passo a passo)

### 1. Criar repositório no GitHub
1. Crie uma conta em github.com (se ainda não tiver)
2. Clique em **New repository** → dê o nome `reconversao-carreira`
3. Faça upload de todos os ficheiros desta pasta (drag-and-drop na interface do GitHub)

### 2. Ligar ao Netlify
1. Aceda a app.netlify.com e faça login
2. Clique em **Add new site → Import an existing project**
3. Escolha **Deploy with GitHub** e seleccione o repositório `reconversao-carreira`
4. Configurações de build (devem ser preenchidas automaticamente):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Clique em **Deploy site**

### 3. Configurar a variável de ambiente (OBRIGATÓRIO)
1. Na dashboard do Netlify, vá a **Site configuration → Environment variables**
2. Clique em **Add a variable**
3. Key: `ANTHROPIC_API_KEY`
4. Value: a sua chave da API Anthropic (obtida em console.anthropic.com)
5. Clique em **Save**
6. Vá a **Deploys → Trigger deploy → Deploy site** para aplicar a variável

### 4. Testar
1. Aceda ao URL fornecido pelo Netlify (ex: `reconversao-carreira.netlify.app`)
2. Teste com um CV real
3. Verifique se o PDF é gerado correctamente

---

## Como ver os leads (e-mails dos utilizadores)

1. No Netlify: **Functions → generate → Logs**
2. Procure linhas com `[LEAD]` — aparecem com data/hora e e-mail
3. Exporte manualmente para o Substack quando quiser

Exemplo de linha nos logs:
```
[LEAD] 2026-06-20T14:32:11.000Z | email=utilizador@email.pt
```

---

## Custos estimados

| Serviço | Plano | Custo |
|---|---|---|
| Netlify | Gratuito | €0/mês |
| Anthropic API | Pay-per-use | ~€0.10–0.20 por relatório |

Com um preço de venda de €29–49 por relatório, a margem é praticamente 100%.

---

## Estrutura do projecto

```
reconversao-carreira/
├── netlify/
│   └── functions/
│       └── generate.js     ← chama a API Anthropic + loga o lead
├── src/
│   ├── App.jsx             ← interface principal (3 passos)
│   ├── App.module.css      ← estilos
│   ├── prompts.js          ← os 6 prompts de análise
│   ├── pdf.js              ← geração do PDF com jsPDF
│   ├── main.jsx
│   └── index.css
├── public/
│   └── favicon.svg
├── index.html
├── netlify.toml            ← configuração Netlify
├── vite.config.js
├── package.json
└── .env.example            ← variáveis de ambiente necessárias
```

---

## Suporte

Dúvidas técnicas: hr.nextlevel.academy@gmail.com
