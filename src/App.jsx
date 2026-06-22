import { useState, useCallback, useRef } from 'react'
import styles from './App.module.css'
import { SECCOES } from './prompts.js'
import { generatePDF } from './pdf.js'

// ── Extrai texto de PDF no browser via FileReader + API Anthropic vision ──
async function extractTextFromPDF(file) {
  if (!window.pdfjsLib) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  }

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => item.str).join(' ')
    fullText += pageText + '\n'
  }

  if (!fullText.trim()) {
    throw new Error('Não foi possível extrair texto do PDF. Certifique-se de que o PDF não é uma imagem digitalizada.')
  }

  return fullText.trim()
}
// ── Sub-components ────────────────────────────────────────

function StepBar({ current }) {
  return (
    <div className={styles.stepBar}>
      {['Dados', 'Análise', 'Relatório'].map((label, i) => {
        const n = i + 1
        const cls = [
          styles.stepItem,
          current === n ? styles.stepActive : '',
          current > n   ? styles.stepDone   : ''
        ].filter(Boolean).join(' ')
        return (
          <div key={n} className={cls}>
            <div className={styles.stepNum}>{current > n ? '✓' : n}</div>
            <span>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

function UploadZone({ file, onFile }) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef()

  const handle = (f) => {
    if (f && f.type === 'application/pdf') onFile(f)
    else alert('Por favor seleccione um ficheiro PDF.')
  }

  return (
    <div
      className={[
        styles.uploadArea,
        drag ? styles.uploadAreaActive : '',
        file ? styles.uploadSuccess : ''
      ].filter(Boolean).join(' ')}
      onClick={() => inputRef.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]) }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && inputRef.current.click()}
      aria-label="Área de upload do CV"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className={styles.uploadInput}
        onChange={e => handle(e.target.files[0])}
        onClick={e => e.stopPropagation()}
      />
      {file ? (
        <>
          <span className={styles.uploadIcon}>✓</span>
          <div className={styles.uploadSuccessText}>{file.name}</div>
          <div className={styles.uploadChange}>Clique para alterar</div>
        </>
      ) : (
        <>
          <span className={styles.uploadIcon}>📄</span>
          <div className={styles.uploadTitle}>Arraste o PDF aqui ou clique para seleccionar</div>
          <div className={styles.uploadSub}>Ficheiro PDF · máximo 10 MB</div>
        </>
      )}
    </div>
  )
}

function ProgItem({ sec, status }) {
  const icons = { wait: '○', running: '◌', done: '✓', error: '✕' }
  const cls   = {
    wait: styles.progWait, running: styles.progRunning,
    done: styles.progDone, error: styles.progError
  }
  return (
    <li className={`${styles.progItem} ${cls[status] || ''}`}>
      <div className={styles.progIcon}>{icons[status]}</div>
      <div>
        <div className={styles.progTitle}>{sec.title}</div>
        <div className={styles.progSub}>{sec.sub}</div>
      </div>
      {status === 'running' && <span className={styles.spinner} aria-hidden="true" />}
    </li>
  )
}

function ReportSec({ title, content }) {
  const html = content
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />')
  return (
    <div className={styles.reportSection}>
      <div className={styles.reportHead}>{title}</div>
      <div className={styles.reportBody} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────

export default function App() {
  const [step, setStep]         = useState(1)
  const [cvFile, setCvFile]     = useState(null)
  const [form, setForm]         = useState({ linkedin: '', q1: '', q2: '', email: '', newsletter: false })
  const [errors, setErrors]     = useState({})
  const [progress, setProgress] = useState({})
  const [statusMsg, setStatus]  = useState('')
  const [sections, setSections] = useState([])
  const [globalErr, setGlobalErr] = useState('')
  const [pdfBusy, setPdfBusy]   = useState(false)

  const set = useCallback((k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }, [])

  // ── validation ──
  const validate = () => {
    const e = {}
    if (!cvFile) e.cv = 'Faça upload do seu CV em PDF.'
    if (!form.linkedin.trim()) e.linkedin = 'Introduza o URL do seu perfil LinkedIn.'
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Introduza um e-mail válido.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── analysis ──
  const runAnalysis = async () => {
    if (!validate()) return
    setStep(2)
    setGlobalErr('')
    setSections([])

    // init progress
    const init = {}
    SECCOES.forEach(s => { init[s.key] = 'wait' })
    setProgress(init)

    // extract PDF text via base64 → send to Anthropic as document
  setStatus('A extrair texto do CV…')
    let cvText = ''
    try {
      cvText = await extractTextFromPDF(cvFile)
      await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'ok',
          email: form.email,
          newsletter: form.newsletter,
          isFirst: true,
          logOnly: true
        })
      })
    } catch (e) {
      setGlobalErr('Erro ao ler o PDF: ' + e.message)
      setStatus('Erro.')
      return
    }

    // generate 6 sections
    const results = []
    for (let i = 0; i < SECCOES.length; i++) {
      const sec = SECCOES[i]
      setProgress(p => ({ ...p, [sec.key]: 'running' }))
      setStatus(`A gerar: ${sec.title}…`)

      try {
        const prompt = sec.prompt(cvText, form.linkedin, form.q1, form.q2)
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, isFirst: false })
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || `Erro ${res.status}`)
        }
        const data = await res.json()
        results.push({ title: sec.title, content: data.text })
        setProgress(p => ({ ...p, [sec.key]: 'done' }))
      } catch (e) {
        setProgress(p => ({ ...p, [sec.key]: 'error' }))
        setGlobalErr(`Erro na secção "${sec.title}": ${e.message}`)
        setStatus('Análise interrompida.')
        return
      }
    }

    setSections(results)
    setStatus('✓ Relatório completo!')
    setTimeout(() => setStep(3), 600)
  }

  // ── PDF ──
  const downloadPDF = async () => {
    setPdfBusy(true)
    try {
      await generatePDF(sections, form.email, new Date().toLocaleDateString('pt-PT'))
    } catch (e) {
      alert('Erro ao gerar PDF: ' + e.message)
    } finally {
      setPdfBusy(false)
    }
  }

  // ── restart ──
  const restart = () => {
    setStep(1); setCvFile(null)
    setForm({ linkedin: '', q1: '', q2: '', email: '', newsletter: false })
    setErrors({}); setProgress({})
    setStatus(''); setSections([]); setGlobalErr('')
  }

  // ── render ──
  return (
    <div className={styles.app}>

      <header className={styles.hero}>
        <div className={styles.badge}>HR NEXT LEVEL ACADEMY</div>
        <h1 className={styles.heroTitle}>Diagnóstico de Reconversão de Carreira</h1>
        <p className={styles.heroSub}>
          Faça upload do seu CV e indique o seu LinkedIn. A IA analisa o seu perfil e gera
          um relatório personalizado com cenários a 3 e 5 anos.
        </p>
        <StepBar current={step} />
      </header>

      <main className={styles.main}>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className={styles.section}>
            <div className={styles.infoBox}>
              <strong>Como funciona</strong>
              Faça upload do CV em PDF, indique o LinkedIn e responda a 2 perguntas rápidas.
              A análise demora 60–90 segundos e gera um relatório PDF para descarregar.
            </div>

            <div className={styles.field}>
              <label className={styles.label}>CV em PDF</label>
              <UploadZone file={cvFile} onFile={setCvFile} />
              {errors.cv && <div className={styles.errMsg}>{errors.cv}</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="li">URL do perfil LinkedIn</label>
              <input
                id="li" type="url"
                className={`${styles.input} ${errors.linkedin ? styles.fieldErr : ''}`}
                value={form.linkedin}
                onChange={e => set('linkedin', e.target.value)}
                placeholder="https://www.linkedin.com/in/seuperfil"
              />
              <div className={styles.hint}>Não é necessário acesso à conta — apenas o URL.</div>
              {errors.linkedin && <div className={styles.errMsg}>{errors.linkedin}</div>}
            </div>

            <hr className={styles.divider} />

            <div className={styles.field}>
              <label className={styles.label} htmlFor="q1">O que procura nesta reconversão?</label>
              <textarea
                id="q1" className={styles.textarea} rows={3}
                value={form.q1} onChange={e => set('q1', e.target.value)}
                placeholder="Ex: Quero sair da área técnica e entrar em gestão de pessoas. Ou: Quero perceber quais as minhas opções reais nos próximos anos."
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="q2">
                Há alguma área que o atrai, mesmo sem experiência directa?
              </label>
              <textarea
                id="q2" className={styles.textarea} rows={3}
                value={form.q2} onChange={e => set('q2', e.target.value)}
                placeholder="Ex: Tenho interesse em RH e formação. Ou: Ainda não sei — é parte do que quero perceber."
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">O seu e-mail</label>
              <input
                id="email" type="email"
                className={`${styles.input} ${errors.email ? styles.fieldErr : ''}`}
                value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="nome@email.pt"
              />
              <div className={styles.hint}>Consta no cabeçalho do relatório.</div>
              {errors.email && <div className={styles.errMsg}>{errors.email}</div>}
            </div>

            <div className={styles.checkField}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={form.newsletter || false}
                  onChange={e => set('newsletter', e.target.checked)}
                />
                <span>
                  Aceito receber a newsletter <strong>HR Next Level Academy</strong> com
                  conteúdos sobre RH, carreiras e novas ferramentas. Pode cancelar a qualquer momento.
                </span>
              </label>
            </div>

            <button className={styles.btnPrimary} onClick={runAnalysis}>
              Analisar o meu perfil →
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className={styles.section}>
            <p className={styles.statusMsg}>{statusMsg}</p>
            <ul className={styles.progList}>
              {SECCOES.map(s => (
                <ProgItem key={s.key} sec={s} status={progress[s.key] || 'wait'} />
              ))}
            </ul>
            {globalErr && (
              <>
                <div className={styles.globalErr}>{globalErr}</div>
                <button
                  className={styles.btnOutline}
                  onClick={restart}
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  ← Recomeçar
                </button>
              </>
            )}
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className={styles.section}>
            <div className={styles.infoBox}>
              <strong>Relatório gerado</strong>
              Leia o diagnóstico abaixo e descarregue-o em PDF.
            </div>
            {sections.map((s, i) => (
              <ReportSec key={i} title={s.title} content={s.content} />
            ))}
            <div className={styles.actions}>
              <button className={styles.btnAmber} onClick={downloadPDF} disabled={pdfBusy}>
                {pdfBusy ? 'A gerar PDF…' : '↓ Descarregar PDF'}
              </button>
              <button className={styles.btnOutline} onClick={restart}>
                ← Nova análise
              </button>
            </div>
          </div>
        )}

      </main>

      <footer className={styles.footer}>
        <p>© 2026 HR Next Level Academy · <a href="mailto:hr.nextlevel.academy@gmail.com">hr.nextlevel.academy@gmail.com</a></p>
        <p>Relatório gerado por IA com base nas informações fornecidas. Carácter orientador — não substitui aconselhamento profissional de carreira.</p>
        <p style={{marginTop:'0.5rem'}}>
          <a href="/privacidade.html">Política de Privacidade</a>
          {' · '}
          Ao utilizar esta ferramenta, aceita o tratamento dos seus dados nos termos descritos.
        </p>
      </footer>
    </div>
  )
}
