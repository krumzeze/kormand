import React from 'react'

// Описание вакансии храним как обычный текст с лёгкой markdown-разметкой
// (**жирный**, списки `- ` / `1. `, подзаголовки `### `) и рендерим из
// React-узлов — без dangerouslySetInnerHTML, поэтому XSS невозможен.
function renderInline(text: string, keyPrefix: string) {
  return text.split(/(\*\*.+?\*\*)/g).map((part, i) =>
    part.length > 4 && part.startsWith('**') && part.endsWith('**')
      ? <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
      : <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>
  )
}

export function renderDescription(text: string) {
  const blocks: React.ReactNode[] = []
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null
  let key = 0

  const flush = () => {
    if (!list) return
    const items = list.items.map((it, i) => <li key={i}>{renderInline(it, `li-${key}-${i}`)}</li>)
    blocks.push(
      list.type === 'ul'
        ? <ul key={key++} className="list-disc pl-5 my-2 space-y-1">{items}</ul>
        : <ol key={key++} className="list-decimal pl-5 my-2 space-y-1">{items}</ol>
    )
    list = null
  }

  for (const raw of text.split('\n')) {
    const line = raw.trimEnd()
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line)
    const ordered = /^\s*\d+\.\s+(.*)$/.exec(line)
    const heading = /^\s*#{1,3}\s+(.*)$/.exec(line)

    if (bullet) {
      if (list && list.type !== 'ul') flush()
      if (!list) list = { type: 'ul', items: [] }
      list.items.push(bullet[1])
    } else if (ordered) {
      if (list && list.type !== 'ol') flush()
      if (!list) list = { type: 'ol', items: [] }
      list.items.push(ordered[1])
    } else {
      flush()
      if (heading) {
        blocks.push(<p key={key++} className="font-semibold text-ink mt-3 mb-1">{renderInline(heading[1], `h-${key}`)}</p>)
      } else if (line.trim() === '') {
        blocks.push(<div key={key++} className="h-2" />)
      } else {
        blocks.push(<p key={key++}>{renderInline(line, `p-${key}`)}</p>)
      }
    }
  }
  flush()
  return blocks
}
