'use client'

import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="section-padding">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="relative overflow-hidden rounded-4xl p-12 md:p-20 text-center"
          style={{ background: 'linear-gradient(135deg, #7FB3FF 0%, #4FD1C5 50%, #C7B6FF 100%)' }}
        >
          {/* Decorative blobs inside */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <span className="eyebrow bg-white/20 text-white border border-white/30 mb-6 inline-flex">
              <Sparkles className="w-3 h-3" />
              Начните прямо сейчас
            </span>

            <h2 className="font-heading font-bold text-white text-balance leading-tight"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              Готовы найти работу<br />или лучшего сотрудника?
            </h2>
            <p className="text-white/80 text-lg mt-4 max-w-lg mx-auto">
              Присоединяйтесь к тысячам компаний и соискателей на платформе №1 Таджикистана.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-medium text-ink bg-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                Найти работу
                <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
              <Link
                href="/post-job"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-medium text-white bg-white/20 border border-white/40 hover:bg-white/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                Разместить вакансию
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
