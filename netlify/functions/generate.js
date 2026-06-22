exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY não configurada. Vá a Netlify → Site configuration → Environment variables e adicione a chave.' })
    }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Payload inválido.' }) }
  }

  const { prompt, pdfBase64, extractOnly, email, isFirst, newsletter } = body

  // Log do lead (visível em Netlify → Functions → generate → Logs)
  if (isFirst && email) {
    const consent = newsletter ? 'newsletter=SIM' : 'newsletter=NAO'
    console.log(`[LEAD] ${new Date().toISOString()} | email=${email} | ${consent}`)
  }

  try {
    let messages

    if (extractOnly && pdfBase64) {
      // Modo extracção: lê o PDF e devolve o texto
      messages = [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBase64
            }
          },
          {
            type: 'text',
            text: 'Extrai todo o texto deste CV em formato limpo e estruturado. Mantém toda a informação: experiência profissional, formação, competências, conquistas, datas e empresas. Não resumas nem omitas nada. Responde apenas com o texto extraído, sem comentários adicionais.'
          }
        ]
      }]
    } else {
      // Modo geração de secção
      messages = [{ role: 'user', content: prompt }]
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: extractOnly ? 2000 : 1200,
        messages
      })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: err.error?.message || `Erro Anthropic ${res.status}` })
      }
    }

    const data = await res.json()
    const text = data.content?.[0]?.text || ''

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro de ligação: ' + e.message })
    }
  }
}
