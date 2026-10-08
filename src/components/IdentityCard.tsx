import { forwardRef } from "react";

interface Props { name: string; tagline: string; tags: string[]; motif: string; handle?: string }

function Motif({ kind }: { kind: string }) {
  const stroke = "currentColor";
  if (kind === "arch")
    return (<svg viewBox="0 0 100 100" className="h-full w-full"><path d="M15 100 V50 a35 35 0 0 1 70 0 V100" fill="none" stroke={stroke} strokeWidth="0.8"/><path d="M28 100 V52 a22 22 0 0 1 44 0 V100" fill="none" stroke={stroke} strokeWidth="0.8"/></svg>);
  if (kind === "lines")
    return (<svg viewBox="0 0 100 100" className="h-full w-full">{Array.from({ length: 14 }).map((_, i) => <line key={i} x1="0" x2="100" y1={i * 7 + 4} y2={i * 7 + 4} stroke={stroke} strokeWidth="0.5" />)}</svg>);
  if (kind === "grid")
    return (<svg viewBox="0 0 100 100" className="h-full w-full">{Array.from({ length: 36 }).map((_, i) => <circle key={i} cx={(i % 6) * 16 + 10} cy={Math.floor(i / 6) * 16 + 10} r={i % 7 === 0 ? 4 : 1.2} fill={stroke} />)}</svg>);
  return (<svg viewBox="0 0 100 100" className="h-full w-full"><circle cx="50" cy="50" r="40" fill="none" stroke={stroke} strokeWidth="0.8"/><circle cx="50" cy="50" r="26" fill="none" stroke={stroke} strokeWidth="0.8"/><circle cx="50" cy="50" r="5" fill={stroke}/></svg>);
}

export const IdentityCard = forwardRef<HTMLDivElement, Props>(function IdentityCard({ name, tagline, tags, motif, handle }, ref) {
  return (
    <div ref={ref} className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-wine p-7 text-ivory sm:p-9">
      <div className="absolute -right-10 -top-10 h-56 w-56 text-ivory/25"><Motif kind={motif} /></div>
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="kicker text-ivory/70">OffScript · Identity No. 01</span>
        </div>
        <div>
          <h3 className="font-display text-5xl leading-[0.95] sm:text-6xl">{name}</h3>
          <p className="mt-4 max-w-[85%] font-display text-xl italic leading-snug text-ivory/90">{tagline}</p>
        </div>
        <div>
          <div className="mb-4 h-px bg-ivory/30" />
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="rounded-full border border-ivory/40 px-3 py-1 text-xs">{t}</span>
            ))}
          </div>
          {handle && <p className="mt-4 text-xs tracking-wider text-ivory/70">{handle}</p>}
        </div>
      </div>
    </div>
  );
});
