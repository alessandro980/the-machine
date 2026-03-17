import { AlertTriangle } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-machine-bg flex flex-col items-center justify-center text-center px-4 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative z-10">
        <AlertTriangle className="w-16 h-16 text-machine-amber/40 mx-auto mb-6" />
        <h1 className="font-display text-6xl font-bold tracking-[0.2em] text-machine-red/60 mb-2">404</h1>
        <h2 className="font-display text-xl font-bold tracking-[0.15em] text-machine-white/40 uppercase mb-4">
          SUBJECT NOT FOUND
        </h2>
        <p className="font-mono text-xs text-machine-white/20 max-w-md mb-8">
          THE REQUESTED RESOURCE DOES NOT EXIST IN THE SURVEILLANCE DATABASE.
        </p>
        <Link href="/">
          <span className="inline-flex items-center gap-2 px-6 py-3 bg-machine-cyan/10 border border-machine-cyan/40 text-machine-cyan font-display text-sm font-bold tracking-[0.15em] uppercase hover:bg-machine-cyan/20 transition-all cursor-pointer">
            RETURN TO SYSTEM
          </span>
        </Link>
      </div>
    </div>
  );
}
