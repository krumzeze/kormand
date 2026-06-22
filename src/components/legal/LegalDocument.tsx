import type { LegalDoc } from '@/content/legal'

export default function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
      <header className="mb-10">
        <h1 className="font-heading font-bold text-ink text-3xl md:text-4xl">{doc.title}</h1>
        <p className="text-sm text-muted mt-3">{doc.updated}</p>
      </header>

      <div className="flex flex-col gap-4 mb-12">
        {doc.intro.map((p, i) => (
          <p key={i} className="text-ink/80 leading-relaxed">{p}</p>
        ))}
      </div>

      <div className="flex flex-col gap-10">
        {doc.sections.map((section, i) => (
          <section key={i}>
            <h2 className="font-heading font-semibold text-ink text-xl mb-3">{section.heading}</h2>
            {section.paragraphs?.map((p, j) => (
              <p key={j} className="text-ink/80 leading-relaxed mb-3">{p}</p>
            ))}
            {section.list && (
              <ul className="flex flex-col gap-2 mt-1 pl-1">
                {section.list.map((item, j) => (
                  <li key={j} className="flex gap-3 text-ink/80 leading-relaxed">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-sky-blue shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
