exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY não configurada.' }) }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Payload inválido.' }) }
  }

  const { prompt, email, isFirst, newsletter, logOnly } = body

  if (isFirst && email) {
    const consent = newsletter ? 'newsletter=SIM' : 'newsletter=NAO'
    console.log(`[LEAD] ${new Date().toISOString()} | email=${email} | ${consent}`)
  }

  if (logOnly) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: '' }) }
  }

  try {
    const messages = [{ role: 'user', content: prompt }]

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1200, messages })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const errMsg = err.error?.message || `Erro Anthropic ${res.status}`
      console.error(`[API ERROR] ${res.status}: ${errMsg}`)
      return { statusCode: res.status, body: JSON.stringify({ error: errMsg }) }
    }

    const data = await res.json()
    const text = data.content?.[0]?.text || ''

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }
  } catch (e) {
    console.error(`[FUNCTION ERROR] ${e.message}`)
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro de ligação: ' + e.message }) }
  }
}
