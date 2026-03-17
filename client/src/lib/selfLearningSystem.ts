/**
 * Self-Learning System
 * Automatically improves recognition accuracy and algorithm parameters over time
 * Tracks performance metrics and optimizes thresholds
 */

export interface PerformanceMetrics {
  totalDetections: number;
  correctIdentifications: number;
  incorrectIdentifications: number;
  unidentifiedFaces: number;
  accuracy: number; // 0-1
  precision: number; // 0-1
  recall: number; // 0-1
  f1Score: number; // 0-1
  averageConfidence: number; // 0-1
  lastUpdated: number;
}

export interface AlgorithmParameters {
  faceMatchThreshold: number; // 0-1, default 0.6
  instagramSearchThreshold: number; // 0-1, default 0.5
  confidenceThreshold: number; // 0-1, default 0.5
  learningRate: number; // 0-1, default 0.01
  version: number;
  lastOptimized: number;
}

export interface LearningEvent {
  id: string;
  type: 'identification' | 'mismatch' | 'improvement' | 'optimization';
  timestamp: number;
  personId?: string;
  accuracy?: number;
  parameterChange?: { name: string; oldValue: number; newValue: number };
  description: string;
}

const METRICS_KEY = 'machine_performance_metrics';
const PARAMETERS_KEY = 'machine_algorithm_parameters';
const LEARNING_LOG_KEY = 'machine_learning_events';

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  try {
    const data = localStorage.getItem(METRICS_KEY);
    if (!data) {
      return getDefaultMetrics();
    }
    return JSON.parse(data) as PerformanceMetrics;
  } catch (e) {
    console.error('Failed to load performance metrics:', e);
    return getDefaultMetrics();
  }
}

/**
 * Get default metrics
 */
function getDefaultMetrics(): PerformanceMetrics {
  return {
    totalDetections: 0,
    correctIdentifications: 0,
    incorrectIdentifications: 0,
    unidentifiedFaces: 0,
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1Score: 0,
    averageConfidence: 0,
    lastUpdated: Date.now(),
  };
}

/**
 * Save performance metrics
 */
function savePerformanceMetrics(metrics: PerformanceMetrics): void {
  try {
    metrics.lastUpdated = Date.now();
    localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
  } catch (e) {
    console.error('Failed to save performance metrics:', e);
  }
}

/**
 * Get current algorithm parameters
 */
export function getAlgorithmParameters(): AlgorithmParameters {
  try {
    const data = localStorage.getItem(PARAMETERS_KEY);
    if (!data) {
      return getDefaultParameters();
    }
    return JSON.parse(data) as AlgorithmParameters;
  } catch (e) {
    console.error('Failed to load algorithm parameters:', e);
    return getDefaultParameters();
  }
}

/**
 * Get default algorithm parameters
 */
function getDefaultParameters(): AlgorithmParameters {
  return {
    faceMatchThreshold: 0.6,
    instagramSearchThreshold: 0.5,
    confidenceThreshold: 0.5,
    learningRate: 0.01,
    version: 1,
    lastOptimized: Date.now(),
  };
}

/**
 * Save algorithm parameters
 */
function saveAlgorithmParameters(params: AlgorithmParameters): void {
  try {
    localStorage.setItem(PARAMETERS_KEY, JSON.stringify(params));
  } catch (e) {
    console.error('Failed to save algorithm parameters:', e);
  }
}

/**
 * Record an identification event
 */
export function recordIdentificationEvent(
  personId: string,
  wasCorrect: boolean,
  confidence: number
): void {
  const metrics = getPerformanceMetrics();

  metrics.totalDetections++;
  if (wasCorrect) {
    metrics.correctIdentifications++;
  } else {
    metrics.incorrectIdentifications++;
  }

  // Update accuracy
  if (metrics.totalDetections > 0) {
    metrics.accuracy = metrics.correctIdentifications / metrics.totalDetections;
  }

  // Update average confidence
  metrics.averageConfidence =
    (metrics.averageConfidence * (metrics.totalDetections - 1) + confidence) / metrics.totalDetections;

  savePerformanceMetrics(metrics);

  // Record learning event
  recordLearningEvent({
    type: 'identification',
    personId,
    accuracy: metrics.accuracy,
    description: `${wasCorrect ? 'Correct' : 'Incorrect'} identification with ${(confidence * 100).toFixed(0)}% confidence`,
  });

  // Check if optimization is needed
  checkAndOptimize();
}

/**
 * Record unidentified face
 */
export function recordUnidentifiedFace(): void {
  const metrics = getPerformanceMetrics();
  metrics.totalDetections++;
  metrics.unidentifiedFaces++;

  // Update recall (unidentified faces reduce recall)
  if (metrics.totalDetections > 0) {
    metrics.recall = metrics.correctIdentifications / (metrics.correctIdentifications + metrics.unidentifiedFaces);
  }

  savePerformanceMetrics(metrics);

  recordLearningEvent({
    type: 'identification',
    accuracy: metrics.accuracy,
    description: 'Face detected but not identified',
  });
}

/**
 * Check if optimization is needed and perform it
 */
function checkAndOptimize(): void {
  const metrics = getPerformanceMetrics();
  const params = getAlgorithmParameters();

  // Optimize every 50 detections or if accuracy drops
  if (metrics.totalDetections % 50 === 0 && metrics.totalDetections > 0) {
    optimizeParameters(metrics, params);
  }
}

/**
 * Optimize algorithm parameters based on performance
 */
function optimizeParameters(metrics: PerformanceMetrics, params: AlgorithmParameters): void {
  const oldParams = { ...params };

  // Adjust face match threshold based on accuracy
  if (metrics.accuracy > 0.85) {
    // High accuracy - can be more strict
    params.faceMatchThreshold = Math.max(0.5, params.faceMatchThreshold - params.learningRate);
  } else if (metrics.accuracy < 0.6) {
    // Low accuracy - be more lenient
    params.faceMatchThreshold = Math.min(0.8, params.faceMatchThreshold + params.learningRate);
  }

  // Adjust confidence threshold based on precision
  if (metrics.precision > 0.9) {
    params.confidenceThreshold = Math.max(0.3, params.confidenceThreshold - params.learningRate * 0.5);
  } else if (metrics.precision < 0.7) {
    params.confidenceThreshold = Math.min(0.8, params.confidenceThreshold + params.learningRate * 0.5);
  }

  // Increase learning rate slightly if improving
  if (metrics.accuracy > 0.8) {
    params.learningRate = Math.min(0.05, params.learningRate * 1.1);
  } else if (metrics.accuracy < 0.5) {
    params.learningRate = Math.max(0.001, params.learningRate * 0.9);
  }

  // Increment version
  params.version++;
  params.lastOptimized = Date.now();

  saveAlgorithmParameters(params);

  // Record optimization event
  recordLearningEvent({
    type: 'optimization',
    accuracy: metrics.accuracy,
    parameterChange: {
      name: 'faceMatchThreshold',
      oldValue: oldParams.faceMatchThreshold,
      newValue: params.faceMatchThreshold,
    },
    description: `Algorithm optimized to v${params.version}. Accuracy: ${(metrics.accuracy * 100).toFixed(1)}%`,
  });
}

/**
 * Record a learning event
 */
function recordLearningEvent(event: Omit<LearningEvent, 'id' | 'timestamp'>): void {
  try {
    const log = getLearningLog();

    const learningEvent: LearningEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...event,
    };

    log.push(learningEvent);

    // Keep only last 1000 events
    if (log.length > 1000) {
      log.splice(0, log.length - 1000);
    }

    localStorage.setItem(LEARNING_LOG_KEY, JSON.stringify(log));
  } catch (e) {
    console.error('Failed to record learning event:', e);
  }
}

/**
 * Get learning log
 */
export function getLearningLog(): LearningEvent[] {
  try {
    const data = localStorage.getItem(LEARNING_LOG_KEY);
    if (!data) return [];
    return JSON.parse(data) as LearningEvent[];
  } catch (e) {
    console.error('Failed to load learning log:', e);
    return [];
  }
}

/**
 * Get learning statistics
 */
export function getLearningStats() {
  const metrics = getPerformanceMetrics();
  const params = getAlgorithmParameters();
  const log = getLearningLog();

  const recentEvents = log.slice(-100);
  const optimizationCount = recentEvents.filter(e => e.type === 'optimization').length;

  return {
    metrics,
    parameters: params,
    recentEvents,
    optimizationCount,
    improvementTrend: calculateImprovementTrend(log),
  };
}

/**
 * Calculate improvement trend
 */
function calculateImprovementTrend(log: LearningEvent[]): number {
  if (log.length < 2) return 0;

  const recent = log.slice(-50);
  let improving = 0;
  let declining = 0;

  for (let i = 1; i < recent.length; i++) {
    const prev = recent[i - 1];
    const curr = recent[i];

    if (prev.accuracy && curr.accuracy) {
      if (curr.accuracy > prev.accuracy) {
        improving++;
      } else if (curr.accuracy < prev.accuracy) {
        declining++;
      }
    }
  }

  return (improving - declining) / (improving + declining || 1);
}

/**
 * Export learning data for GitHub
 */
export function exportLearningData(): string {
  const stats = getLearningStats();

  const report = {
    timestamp: new Date().toISOString(),
    metrics: stats.metrics,
    parameters: stats.parameters,
    improvementTrend: stats.improvementTrend,
    recentEvents: stats.recentEvents.slice(-20),
  };

  return JSON.stringify(report, null, 2);
}

/**
 * Generate changelog entry
 */
export function generateChangelogEntry(): string {
  const stats = getLearningStats();
  const { metrics, parameters } = stats;

  const entry = `
## v${parameters.version} - ${new Date().toISOString().split('T')[0]}

### Performance Metrics
- **Accuracy**: ${(metrics.accuracy * 100).toFixed(1)}%
- **Precision**: ${(metrics.precision * 100).toFixed(1)}%
- **Recall**: ${(metrics.recall * 100).toFixed(1)}%
- **F1 Score**: ${(metrics.f1Score * 100).toFixed(1)}%
- **Total Detections**: ${metrics.totalDetections}
- **Correct Identifications**: ${metrics.correctIdentifications}

### Algorithm Improvements
- **Face Match Threshold**: ${parameters.faceMatchThreshold.toFixed(3)}
- **Confidence Threshold**: ${parameters.confidenceThreshold.toFixed(3)}
- **Learning Rate**: ${parameters.learningRate.toFixed(4)}
- **Improvement Trend**: ${(stats.improvementTrend * 100).toFixed(1)}%

### Recent Optimizations
- ${stats.recentEvents.filter(e => e.type === 'optimization').slice(-3).map(e => `${e.description}`).join('\n- ')}
`;

  return entry.trim();
}

/**
 * Reset learning system (for testing)
 */
export function resetLearningSystem(): void {
  localStorage.removeItem(METRICS_KEY);
  localStorage.removeItem(PARAMETERS_KEY);
  localStorage.removeItem(LEARNING_LOG_KEY);
}
