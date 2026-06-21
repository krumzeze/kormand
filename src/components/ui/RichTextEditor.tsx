'use client'

import { useRef } from 'react'
import { Bold, List, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  rows?: number
  placeholder?: string
}

export default function RichTextEditor({ label, value, onChange, error, rows = 8, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const apply = (next: string, selStart: number, selEnd: number) => {
    onChange(next)
    requestAnimationFrame(() => {
      const el = ref.current
      if (el) { el.focus(); el.setSelectionRange(selStart, selEnd) }
    })
  }

  const wrapBold = () => {
    const el = ref.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const selected = value.slice(s, e) || 'текст'
    const next = value.slice(0, s) + `**${selected}**` + value.slice(e)
    apply(next, s + 2, s + 2 + selected.length)
  }

  // Помечает каждую строку выделения маркером (список / нумерация).
  const prefixLines = (marker: (i: number) => string) => {
    const el = ref.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const lineStart = value.lastIndexOf('\n', s - 1) + 1
    const nl = value.indexOf('\n', e)
    const lineEnd = nl === -1 ? value.length : nl
    const block = value.slice(lineStart, lineEnd)
    const newBlock = block.split('\n').map((ln, i) => marker(i) + ln).join('\n')
    const next = value.slice(0, lineStart) + newBlock + value.slice(lineEnd)
    apply(next, lineStart, lineStart + newBlock.length)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-ink/70">{label}</label>}
      <div className={cn(
        'rounded-2xl border bg-white transition-all duration-300',
        'focus-within:border-sky-blue/50 focus-within:ring-2 focus-within:ring-sky-blue/20',
        error ? 'border-red-400' : 'border-black/10'
      )}>
        <div className="flex items-center gap-1 border-b border-black/5 px-2 py-1.5">
          <ToolbarBtn onClick={wrapBold} title="Жирный"><Bold className="w-4 h-4" /></ToolbarBtn>
          <ToolbarBtn onClick={() => prefixLines(() => '- ')} title="Маркированный список"><List className="w-4 h-4" /></ToolbarBtn>
          <ToolbarBtn onClick={() => prefixLines(i => `${i + 1}. `)} title="Нумерованный список"><ListOrdered className="w-4 h-4" /></ToolbarBtn>
        </div>
        <textarea
          ref={ref}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full bg-transparent px-4 py-3 text-sm text-ink placeholder:text-muted outline-none resize-none"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

function ToolbarBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-black/5 transition-colors"
    >
      {children}
    </button>
  )
}
