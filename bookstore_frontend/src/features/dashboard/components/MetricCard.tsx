import type { LucideIcon } from 'lucide-react';

type MetricTone = 'amber' | 'blue' | 'emerald' | 'violet' | 'rose' | 'cyan';

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: MetricTone;
  isLoading?: boolean;
  isError?: boolean;
}

const toneClasses: Record<MetricTone, { icon: string; glow: string; value: string }> = {
  amber: {
    icon: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    glow: 'from-amber-400/10',
    value: 'text-amber-300',
  },
  blue: {
    icon: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
    glow: 'from-blue-400/10',
    value: 'text-blue-300',
  },
  emerald: {
    icon: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    glow: 'from-emerald-400/10',
    value: 'text-emerald-300',
  },
  violet: {
    icon: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
    glow: 'from-violet-400/10',
    value: 'text-violet-300',
  },
  rose: {
    icon: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
    glow: 'from-rose-400/10',
    value: 'text-rose-300',
  },
  cyan: {
    icon: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
    glow: 'from-cyan-400/10',
    value: 'text-cyan-300',
  },
};

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'amber',
  isLoading = false,
  isError = false,
}: MetricCardProps) {
  const classes = toneClasses[tone];

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_45px_rgba(2,6,23,0.24)] transition hover:-translate-y-0.5 hover:border-slate-700">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${classes.glow} via-transparent to-transparent opacity-70`} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
          {isLoading ? (
            <div className="mt-3 h-8 w-28 animate-pulse rounded-lg bg-slate-800" />
          ) : isError ? (
            <p className="mt-3 text-sm font-semibold text-rose-300">Không thể tải dữ liệu</p>
          ) : (
            <p className={`mt-2 truncate text-2xl font-bold tracking-tight ${classes.value}`} title={value}>
              {value}
            </p>
          )}
          <p className="mt-2 text-xs leading-5 text-slate-500">{helper}</p>
        </div>
        <div className={`shrink-0 rounded-xl border p-2.5 ${classes.icon}`}>
          <Icon size={19} strokeWidth={1.8} />
        </div>
      </div>
    </article>
  );
}
