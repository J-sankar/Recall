import { Braces, FileText, Link2 } from 'lucide-react'

export function KnowledgeGraphic() {
  return (
    <div className="knowledge-graphic relative" aria-hidden="true">
      <svg className="h-auto w-full" viewBox="0 0 480 420" fill="none">
        <g stroke="var(--line)" strokeWidth="1">
          <path d="M40 60H440M40 360H440M80 30V390M400 30V390" strokeDasharray="2 6" />
          <circle cx="240" cy="210" r="148" />
          <circle cx="240" cy="210" r="109" strokeDasharray="2 8" />
          <path d="M20 40V20H40M440 20H460V40M460 380V400H440M40 400H20V380" />
        </g>
        <g stroke="var(--accent-line)" strokeWidth="1.5">
          <path d="M140 115H190L240 165M350 156H300L265 185M153 310H198L240 255" />
        </g>
        <g className="signal-path" stroke="var(--accent)" strokeWidth="1.5">
          <path d="M140 115H190L240 165M350 156H300L265 185M153 310H198L240 255" />
        </g>
        <path d="M240 149 293 179v62l-53 30-53-30v-62Z" fill="var(--panel)" stroke="var(--accent-line)" />
        <path d="M240 159 284 184v52l-44 25-44-25v-52Z" stroke="var(--line)" />
        <path d="M226 230V190h18a12 12 0 0 1 0 24h-18m18 0 15 16" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
        <rect x="210" y="207" width="6" height="6" fill="var(--accent)" />
        <g>
          <rect x="54" y="87" width="112" height="56" rx="7" fill="var(--panel)" stroke="var(--line)" />
          <Link2 x="68" y="105" width="20" height="20" stroke="var(--ink)" strokeWidth="1.5" />
          <text x="99" y="119" fill="var(--ink)" fontSize="12" fontFamily="Inter, sans-serif">Links</text>
          <rect x="312" y="128" width="122" height="56" rx="7" fill="var(--panel)" stroke="var(--line)" />
          <Braces x="326" y="146" width="20" height="20" stroke="var(--ink)" strokeWidth="1.5" />
          <text x="357" y="160" fill="var(--ink)" fontSize="12" fontFamily="Inter, sans-serif">Snippets</text>
          <rect x="69" y="282" width="112" height="56" rx="7" fill="var(--panel)" stroke="var(--line)" />
          <FileText x="83" y="300" width="20" height="20" stroke="var(--ink)" strokeWidth="1.5" />
          <text x="114" y="314" fill="var(--ink)" fontSize="12" fontFamily="Inter, sans-serif">Notes</text>
        </g>
        <g fill="var(--accent)">
          <rect x="238" y="60" width="4" height="4" />
          <rect x="386" y="208" width="4" height="4" />
          <rect x="238" y="356" width="4" height="4" />
        </g>
        <g fill="var(--muted)" fontFamily="monospace" fontSize="9" letterSpacing="1.5">
          <text x="35" y="44">RECALL / KNOWLEDGE SYSTEM</text>
          <text x="285" y="376">CAPTURE / CONNECT / REVISIT</text>
        </g>
      </svg>
    </div>
  )
}
