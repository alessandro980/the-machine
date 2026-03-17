/**
 * LearningDashboard Component
 * Displays self-learning metrics and algorithm optimization progress
 */
import { useState, useEffect } from 'react';
import { TrendingUp, Brain, Zap, BarChart3 } from 'lucide-react';
import {
  getLearningStats,
  generateChangelogEntry,
} from '@/lib/selfLearningSystem';

export default function LearningDashboard() {
  const [stats, setStats] = useState(getLearningStats());
  const [showChangelog, setShowChangelog] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getLearningStats());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { metrics, parameters, improvementTrend } = stats;
  const trendColor = improvementTrend > 0.2 ? '#00ff88' : improvementTrend > -0.2 ? '#f5a623' : '#e74c3c';

  return (
    <div className="p-4 bg-machine-panel/30 border border-machine-white/5 rounded-sm space-y-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-machine-cyan" />
          <span className="font-display text-xs font-bold tracking-[0.15em] text-machine-cyan uppercase">
            Self-Learning System
          </span>
        </div>
        <span className="font-mono text-[8px] text-machine-white/40">v{parameters.version}</span>
      </div>

      {/* Main metrics grid */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        <div className="p-2 bg-machine-white/[0.02] border border-machine-white/5">
          <div className="font-mono text-[8px] text-machine-white/40 mb-1">ACCURACY</div>
          <div className="font-display text-lg font-bold text-machine-cyan">
            {(metrics.accuracy * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-2 bg-machine-white/[0.02] border border-machine-white/5">
          <div className="font-mono text-[8px] text-machine-white/40 mb-1">PRECISION</div>
          <div className="font-display text-lg font-bold text-machine-green">
            {(metrics.precision * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-2 bg-machine-white/[0.02] border border-machine-white/5">
          <div className="font-mono text-[8px] text-machine-white/40 mb-1">RECALL</div>
          <div className="font-display text-lg font-bold text-machine-amber">
            {(metrics.recall * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-2 bg-machine-white/[0.02] border border-machine-white/5">
          <div className="font-mono text-[8px] text-machine-white/40 mb-1">F1 SCORE</div>
          <div className="font-display text-lg font-bold text-machine-white/60">
            {(metrics.f1Score * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Improvement trend */}
      <div className="p-2 bg-machine-white/[0.02] border border-machine-white/5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3" style={{ color: trendColor }} />
            <span className="font-mono text-[8px] text-machine-white/40">IMPROVEMENT TREND</span>
          </div>
          <span className="font-display text-sm font-bold" style={{ color: trendColor }}>
            {(improvementTrend * 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-machine-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.max(0, Math.min(100, 50 + improvementTrend * 50))}%`,
              background: trendColor,
            }}
          />
        </div>
      </div>

      {/* Algorithm parameters */}
      <div className="p-2 bg-machine-white/[0.02] border border-machine-white/5 space-y-1">
        <div className="flex items-center gap-2 mb-1.5">
          <Zap className="w-3 h-3 text-machine-cyan" />
          <span className="font-mono text-[8px] text-machine-white/40 uppercase">ALGORITHM PARAMS</span>
        </div>
        <div className="space-y-1 text-[8px]">
          <div className="flex justify-between">
            <span className="text-machine-white/40">Face Match Threshold:</span>
            <span className="font-mono text-machine-cyan">{parameters.faceMatchThreshold.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-machine-white/40">Confidence Threshold:</span>
            <span className="font-mono text-machine-cyan">{parameters.confidenceThreshold.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-machine-white/40">Learning Rate:</span>
            <span className="font-mono text-machine-cyan">{parameters.learningRate.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* Detection stats */}
      <div className="p-2 bg-machine-white/[0.02] border border-machine-white/5 space-y-1">
        <div className="flex items-center gap-2 mb-1.5">
          <BarChart3 className="w-3 h-3 text-machine-cyan" />
          <span className="font-mono text-[8px] text-machine-white/40 uppercase">DETECTION STATS</span>
        </div>
        <div className="space-y-1 text-[8px]">
          <div className="flex justify-between">
            <span className="text-machine-white/40">Total Detections:</span>
            <span className="font-mono text-machine-white/60">{metrics.totalDetections}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-machine-white/40">Correct:</span>
            <span className="font-mono text-machine-green">{metrics.correctIdentifications}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-machine-white/40">Incorrect:</span>
            <span className="font-mono text-machine-red">{metrics.incorrectIdentifications}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-machine-white/40">Unidentified:</span>
            <span className="font-mono text-machine-amber">{metrics.unidentifiedFaces}</span>
          </div>
        </div>
      </div>

      {/* Changelog button */}
      <button
        onClick={() => setShowChangelog(!showChangelog)}
        className="w-full px-2 py-1.5 bg-machine-white/5 border border-machine-white/10 text-machine-white/60 font-mono text-[8px] font-bold uppercase hover:bg-machine-white/10 transition-all"
      >
        {showChangelog ? 'HIDE' : 'SHOW'} CHANGELOG
      </button>

      {/* Changelog */}
      {showChangelog && (
        <div className="p-2 bg-machine-white/[0.02] border border-machine-white/5 rounded-sm overflow-y-auto max-h-40">
          <pre className="font-mono text-[7px] text-machine-white/50 whitespace-pre-wrap break-words">
            {generateChangelogEntry()}
          </pre>
        </div>
      )}
    </div>
  );
}
