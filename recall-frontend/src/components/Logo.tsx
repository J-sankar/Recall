export function Logo({ markOnly = false, className = '' }: { markOnly?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg aria-hidden="true" className="h-8 w-8 text-ink" viewBox="0 0 40 40" fill="none">
        <path d="M7 13V7h6M27 7h6v6M33 27v6h-6M13 33H7v-6" stroke="currentColor" strokeWidth="1.5" opacity=".45" />
        <path d="M14 28V12h8a5 5 0 0 1 0 10h-8m8 0 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="5" y="18" width="4" height="4" rx=".5" className="fill-accent" />
      </svg>
      {!markOnly && <span className="font-display text-[23px] font-semibold tracking-[-.035em] text-ink">Recall</span>}
    </span>
  )
}
