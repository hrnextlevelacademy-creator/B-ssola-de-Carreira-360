export const SECCOES = [
  {
    key: 's1',
    title: '1. Perfil Actual',
    sub: 'Competências, percurso e padrão de carreira',
    prompt: (cv, li, q1, q2) => `Analisa este CV e perfil profissional. Responde SEMPRE em português europeu (PT-PT). Nunca uses PT-BR ("engajamento"→"envolvimento"; "habilidades"→"competências"; "time"→"equipa").

CV:
${cv}

LinkedIn: ${li}
O que procura: ${q1}
Áreas de interesse: ${q2}

Gera a secção "PERFIL ACTUAL" com exactamente estas 4 partes. Usa **negrito** para os títulos:

**Síntese do percurso**
3-4 frases descrevendo o percurso, sectores e progressão.

**Competências identificadas**
Lista com 3 técnicas, 3 transversais, e 2 de liderança se aplicável — baseadas no CV real.

**Padrão de carreira**
1 parágrafo: especialista, generalista, híbrido ou em transição — com justificação concreta.

**O que o CV não diz mas devia dizer**
2-3 pontos específicos de lacunas que prejudicam a visibilidade no mercado.

Sê honesto e específico. Sem linguagem genérica. PT-PT sempre.`
  },
  {
    key: 's2',
    title: '2. Diagnóstico de Mercado',
    sub: 'Relevância, transferibilidade e gaps',
    prompt: (cv, li, q1, q2) => `Com base no CV abaixo, gera a secção "DIAGNÓSTICO DE MERCADO" em PT-PT.

CV:
${cv}

O que procura: ${q1}
Áreas de interesse: ${q2}

Inclui exactamente estas 4 partes. Usa **negrito** para os títulos:

**Posicionamento actual**
1 parágrafo sobre a relevância do perfil no mercado português e europeu em 2026.

**Transferibilidade de competências**
3 áreas/funções para onde o perfil migra naturalmente — com justificação para cada uma.

**Gap de mercado**
O que falta para as 2 funções-alvo mais prováveis — específico, não genérico.

**Índice de reconversão**
Baixo / Médio / Alto com explicação de 2-3 frases. Sem score numérico.

PT-PT sempre.`
  },
  {
    key: 's3',
    title: '3. Cenário A — 3 Anos',
    sub: 'Evolução mais provável e caminho',
    prompt: (cv, li, q1, q2) => `Com base no CV abaixo, gera a secção "CENÁRIO A — EVOLUÇÃO A 3 ANOS" em PT-PT.

CV:
${cv}

O que procura: ${q1}
Áreas de interesse: ${q2}

Inclui exactamente estas 4 partes. Usa **negrito** para os títulos:

**Função-alvo**
Título em linguagem de mercado actual + 1 frase de descrição.

**Caminho mais provável**
3-4 movimentos sequenciais concretos para chegar à função-alvo.

**Competências a desenvolver**
Top 3, com sugestão específica de como desenvolver cada uma.

**Risco principal**
1 risco real e como mitigá-lo de forma concreta.

Realista e específico para o mercado português. PT-PT sempre.`
  },
  {
    key: 's4',
    title: '4. Cenário B — 5 Anos',
    sub: 'Transformação mais ambiciosa',
    prompt: (cv, li, q1, q2) => `Com base no CV abaixo, gera a secção "CENÁRIO B — TRANSFORMAÇÃO A 5 ANOS" em PT-PT.

CV:
${cv}

O que procura: ${q1}
Áreas de interesse: ${q2}

Inclui exactamente estas 4 partes. Usa **negrito** para os títulos:

**Função-alvo de ruptura**
O salto mais ambicioso que o perfil suporta — com justificação de porquê é credível.

**O que precisa de acontecer nos primeiros 18 meses**
3-4 acções críticas e sequenciais, ordenadas por prioridade.

**Competências críticas que ainda não existem**
Top 3 — honesto sobre o que falta realmente.

**Uma pergunta para reflexão**
1 pergunta aberta genuína e específica ao perfil — que a IA não responde mas que a pessoa precisa de se fazer.

Ambicioso mas credível. PT-PT sempre.`
  },
  {
    key: 's5',
    title: '5. Plano de Acção — 90 Dias',
    sub: 'Acções concretas e datáveis',
    prompt: (cv, _li, q1, _q2) => `Com base no CV abaixo, gera a secção "PLANO DE ACÇÃO — 90 DIAS" em PT-PT.

CV:
${cv}

O que procura: ${q1}

Inclui exactamente estas 3 partes. Usa **negrito** para os títulos:

**3 acções de visibilidade**
LinkedIn, rede, eventos — cada uma com prazo concreto em dias (ex: "Dias 1-7: ...").

**3 acções de desenvolvimento**
Formação, certificação ou projecto — com recurso específico e custo estimado.

**1 conversa a ter**
Com quem exactamente, sobre o quê, e como pedir — com linguagem sugerida.

Accionável esta semana. Sem conselhos vagos. PT-PT sempre.`
  },
  {
    key: 's6',
    title: '6. CV e LinkedIn — Ajustes',
    sub: 'Melhorias prioritárias com antes/depois',
    prompt: (cv, li, _q1, _q2) => `Com base no CV abaixo, gera a secção "CV E LINKEDIN — AJUSTES PRIORITÁRIOS" em PT-PT.

CV:
${cv}

LinkedIn: ${li}

Inclui exactamente estas 3 partes. Usa **negrito** para os títulos:

**Top 3 ajustes no CV**
Cada um com linha "Antes:" e linha "Depois:" — usando palavras exactas do CV.

**Top 3 ajustes no LinkedIn**
Headline, Sobre e experiência — com texto concreto sugerido para cada um.

**O que remover**
2-3 elementos específicos que prejudicam o posicionamento — com justificação.

Exemplos reais do CV. Nunca genérico. PT-PT sempre.`
  }
]
