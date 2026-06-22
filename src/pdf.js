import { jsPDF } from 'jspdf'

const G  = [45, 94, 65]    // verde
const GD = [30, 69, 48]    // verde escuro
const GL = [232, 242, 236] // verde claro
const AM = [192, 122, 26]  // amber
const WH = [255, 255, 255] // branco
const TX = [26, 42, 32]    // texto
const MU = [90, 110, 97]   // muted

function stripMd(t) {
  return t.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').trim()
}

function parseContent(text) {
  const blocks = []
  const lines = text.split('\n')
  let cur = null

  for (const raw of lines) {
    const line = raw.trimEnd()
    const bold = line.match(/^\*\*(.+?)\*\*$/)
    if (bold) {
      if (cur) blocks.push(cur)
      cur = { heading: bold[1], body: [] }
    } else if (line.trim() === '') {
      if (cur && cur.body.length) { blocks.push(cur); cur = null }
    } else {
      if (!cur) cur = { heading: null, body: [] }
      cur.body.push(line)
    }
  }
  if (cur) blocks.push(cur)
  return blocks
}

export async function generatePDF(sections, email, date) {
  const doc   = new jsPDF({ unit: 'mm', format: 'a4' })
  const PW    = 210
  const PH    = 297
  const ML    = 18
  const MR    = 18
  const CW    = PW - ML - MR
  let y       = 0

  // ── helpers ──────────────────────────────────────────────
  function addPage() {
    doc.addPage()
    y = 0
    // header strip
    doc.setFillColor(...G)
    doc.rect(0, 0, PW, 10, 'F')
    doc.setFontSize(7.5)
    doc.setTextColor(...WH)
    doc.setFont('helvetica', 'normal')
    doc.text('Diagnóstico de Reconversão de Carreira · HR Next Level Academy', ML, 6.8)
    doc.text(date, PW - MR, 6.8, { align: 'right' })
    y = 18
  }

  function need(h) { if (y + h > PH - 16) addPage() }

  function txt(t, opts = {}) {
    const {
      size = 10, color = TX, bold = false,
      lh = 5.8, indent = 0, maxW = CW
    } = opts
    doc.setFontSize(size)
    doc.setTextColor(...color)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    const lines = doc.splitTextToSize(stripMd(t), maxW - indent)
    for (const l of lines) {
      need(lh + 1)
      doc.text(l, ML + indent, y)
      y += lh
    }
  }

  // ── CAPA ─────────────────────────────────────────────────
  doc.setFillColor(...G)
  doc.rect(0, 0, PW, 72, 'F')
  doc.setFillColor(...AM)
  doc.rect(0, 70, PW, 3.5, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WH)
  doc.text('HR NEXT LEVEL ACADEMY', ML, 22)

  doc.setFontSize(22)
  doc.text('Diagnóstico de', ML, 38)
  doc.text('Reconversão de Carreira', ML, 50)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(210, 235, 220)
  doc.text(`Gerado em ${date}`, ML, 62)
  if (email) doc.text(`Para: ${email}`, ML, 67.5)

  y = 86

  // disclaimer
  doc.setFontSize(8.5)
  doc.setTextColor(...MU)
  doc.setFont('helvetica', 'italic')
  const disc = 'Este relatório foi gerado por inteligência artificial com base nas informações fornecidas. Tem carácter orientador e não substitui aconselhamento profissional de carreira individualizado.'
  const dl = doc.splitTextToSize(disc, CW)
  for (const l of dl) { doc.text(l, ML, y); y += 4.8 }

  y += 6
  doc.setDrawColor(...G)
  doc.setLineWidth(0.4)
  doc.line(ML, y, PW - MR, y)
  y += 10

  // índice
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GD)
  doc.text('Índice', ML, y)
  y += 8

  for (const s of sections) {
    need(7)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TX)
    doc.text('·  ' + s.title, ML + 4, y)
    y += 6
  }
  y += 6

  // ── SECÇÕES ───────────────────────────────────────────────
  for (const sec of sections) {
    addPage()

    // título da secção
    doc.setFillColor(...G)
    doc.roundedRect(ML, y - 3, CW, 14, 2.5, 2.5, 'F')
    doc.setFontSize(11.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...WH)
    doc.text(sec.title, ML + 6, y + 6.5)
    y += 18

    // blocos de conteúdo
    const blocks = parseContent(sec.content)

    for (const block of blocks) {
      if (block.heading) {
        need(16)
        y += 3
        doc.setFillColor(...GL)
        doc.roundedRect(ML, y - 3, CW, 9, 2, 2, 'F')
        doc.setFontSize(9.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...GD)
        doc.text(block.heading, ML + 4, y + 3.5)
        y += 12

        for (const line of block.body) {
          const t = line.trim()
          if (!t) continue
          const isBullet = /^[—\-•]/.test(t)
          if (isBullet) {
            const clean = t.replace(/^[—\-•]\s*/, '')
            need(9)
            doc.setFillColor(...AM)
            doc.circle(ML + 4, y - 1, 1.3, 'F')
            txt(clean, { size: 9.5, color: TX, lh: 5.5, indent: 9, maxW: CW })
          } else {
            txt(t, { size: 9.5, color: TX, lh: 5.5, indent: 4 })
          }
        }
        y += 3

      } else {
        for (const line of block.body) {
          const t = line.trim()
          if (!t) continue
          const isBullet = /^[—\-•]/.test(t)
          if (isBullet) {
            const clean = t.replace(/^[—\-•]\s*/, '')
            need(9)
            doc.setFillColor(...AM)
            doc.circle(ML + 4, y - 1, 1.3, 'F')
            txt(clean, { size: 9.5, color: TX, lh: 5.5, indent: 9 })
          } else {
            txt(t, { size: 9.5, color: TX, lh: 5.5, indent: 4 })
          }
        }
        y += 3
      }
    }
  }

  // ── RODAPÉ FINAL ─────────────────────────────────────────
  need(28)
  y += 6
  doc.setDrawColor(...G)
  doc.setLineWidth(0.4)
  doc.line(ML, y, PW - MR, y)
  y += 8

  doc.setFillColor(...G)
  doc.roundedRect(ML, y, CW, 18, 3, 3, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WH)
  doc.text('HR Next Level Academy', ML + 6, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.text('hr.nextlevel.academy@gmail.com', ML + 6, y + 13)
  doc.text('© 2026 · Uso pessoal · Proibida revenda', PW - MR, y + 13, { align: 'right' })

  doc.save('Relatorio_Reconversao_Carreira.pdf')
}
