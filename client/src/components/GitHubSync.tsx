/**
 * GitHubSync Component
 * Displays GitHub sync status and commit history
 */
import { useState, useEffect } from 'react';
import { Github, GitBranch, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import {
  getGitHubConfig,
  getCommitStats,
  exportCommitLog,
} from '@/lib/githubAutoUpdateService';

export default function GitHubSync() {
  const [config, setConfig] = useState(getGitHubConfig());
  const [stats, setStats] = useState(getCommitStats());
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getCommitStats());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleExportLog = () => {
    const log = exportCommitLog();
    const blob = new Blob([log], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commit-log-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 bg-machine-panel/30 border border-machine-white/5 rounded-sm space-y-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Github className="w-4 h-4 text-machine-cyan" />
          <span className="font-display text-xs font-bold tracking-[0.15em] text-machine-cyan uppercase">
            GitHub Auto-Sync
          </span>
        </div>
        {config.autoCommitEnabled ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-machine-green" />
        ) : (
          <AlertCircle className="w-3.5 h-3.5 text-machine-amber" />
        )}
      </div>

      {/* Repository info */}
      <div className="p-2 bg-machine-white/[0.02] border border-machine-white/5 space-y-1">
        <div className="flex items-center gap-2 mb-1.5">
          <GitBranch className="w-3 h-3 text-machine-cyan" />
          <span className="font-mono text-[8px] text-machine-white/40 uppercase">REPOSITORY</span>
        </div>
        <div className="space-y-1 text-[8px]">
          <div className="flex justify-between">
            <span className="text-machine-white/40">Owner:</span>
            <span className="font-mono text-machine-white/60">{config.owner}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-machine-white/40">Repository:</span>
            <span className="font-mono text-machine-white/60">{config.repo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-machine-white/40">Branch:</span>
            <span className="font-mono text-machine-white/60">{config.branch}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-machine-white/40">Auto-Commit:</span>
            <span className={`font-mono ${config.autoCommitEnabled ? 'text-machine-green' : 'text-machine-red'}`}>
              {config.autoCommitEnabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
        </div>
      </div>

      {/* Commit statistics */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        <div className="p-2 bg-machine-white/[0.02] border border-machine-white/5">
          <div className="font-mono text-[8px] text-machine-white/40 mb-1">TOTAL COMMITS</div>
          <div className="font-display text-lg font-bold text-machine-cyan">{stats.totalCommits}</div>
        </div>
        <div className="p-2 bg-machine-white/[0.02] border border-machine-white/5">
          <div className="font-mono text-[8px] text-machine-white/40 mb-1">OPTIMIZATIONS</div>
          <div className="font-display text-lg font-bold text-machine-green">{stats.optimizations}</div>
        </div>
        <div className="p-2 bg-machine-white/[0.02] border border-machine-white/5">
          <div className="font-mono text-[8px] text-machine-white/40 mb-1">IMPROVEMENTS</div>
          <div className="font-display text-lg font-bold text-machine-amber">{stats.improvements}</div>
        </div>
        <div className="p-2 bg-machine-white/[0.02] border border-machine-white/5">
          <div className="font-mono text-[8px] text-machine-white/40 mb-1">FEATURES</div>
          <div className="font-display text-lg font-bold text-machine-white/60">{stats.features}</div>
        </div>
      </div>

      {/* Last commit info */}
      {stats.lastCommit && (
        <div className="p-2 bg-machine-white/[0.02] border border-machine-white/5">
          <div className="font-mono text-[8px] text-machine-white/40 mb-1">LAST COMMIT</div>
          <div className="font-mono text-[9px] text-machine-white/60">
            {new Date(stats.lastCommit).toLocaleString()}
          </div>
        </div>
      )}

      {/* Status indicator */}
      <div className="p-2 bg-machine-white/[0.02] border border-machine-white/5">
        <div className="flex items-center gap-2">
          <Upload className="w-3 h-3 text-machine-cyan animate-pulse" />
          <span className="font-mono text-[8px] text-machine-white/60">
            {config.autoCommitEnabled ? 'Auto-sync active' : 'Auto-sync disabled'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0 pt-2 border-t border-machine-white/5">
        <button
          onClick={() => setShowLog(!showLog)}
          className="flex-1 px-2 py-1.5 bg-machine-cyan/10 border border-machine-cyan/40 text-machine-cyan font-mono text-[9px] font-bold uppercase hover:bg-machine-cyan/20 transition-all"
        >
          {showLog ? 'HIDE' : 'SHOW'} LOG
        </button>
        <button
          onClick={handleExportLog}
          className="flex-1 px-2 py-1.5 bg-machine-white/5 border border-machine-white/10 text-machine-white/60 font-mono text-[9px] font-bold uppercase hover:bg-machine-white/10 transition-all"
        >
          EXPORT
        </button>
      </div>

      {/* Commit log */}
      {showLog && (
        <div className="p-2 bg-machine-white/[0.02] border border-machine-white/5 rounded-sm overflow-y-auto max-h-40">
          <pre className="font-mono text-[7px] text-machine-white/50 whitespace-pre-wrap break-words">
            {exportCommitLog()}
          </pre>
        </div>
      )}
    </div>
  );
}
