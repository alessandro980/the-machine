/**
 * GitHub Auto-Update Service
 * Automatically pushes improvements and updates to GitHub repository
 * Manages versioning and changelog
 */

export interface GitHubUpdateConfig {
  owner: string;
  repo: string;
  branch: string;
  token?: string;
  autoCommitEnabled: boolean;
}

export interface CommitData {
  message: string;
  description: string;
  files: Record<string, string>;
  timestamp: number;
  version: string;
}

const GITHUB_CONFIG_KEY = 'machine_github_config';
const COMMIT_HISTORY_KEY = 'machine_commit_history';

/**
 * Get GitHub configuration
 */
export function getGitHubConfig(): GitHubUpdateConfig {
  try {
    const data = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (!data) {
      return getDefaultConfig();
    }
    return JSON.parse(data) as GitHubUpdateConfig;
  } catch (e) {
    console.error('Failed to load GitHub config:', e);
    return getDefaultConfig();
  }
}

/**
 * Get default GitHub configuration
 */
function getDefaultConfig(): GitHubUpdateConfig {
  return {
    owner: 'alessandro980',
    repo: 'the-machine',
    branch: 'main',
    autoCommitEnabled: true,
  };
}

/**
 * Save GitHub configuration
 */
export function saveGitHubConfig(config: GitHubUpdateConfig): void {
  try {
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save GitHub config:', e);
  }
}

/**
 * Get commit history
 */
export function getCommitHistory(): CommitData[] {
  try {
    const data = localStorage.getItem(COMMIT_HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data) as CommitData[];
  } catch (e) {
    console.error('Failed to load commit history:', e);
    return [];
  }
}

/**
 * Record a commit
 */
export function recordCommit(commit: CommitData): void {
  try {
    const history = getCommitHistory();
    history.push(commit);

    // Keep only last 100 commits
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    localStorage.setItem(COMMIT_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to record commit:', e);
  }
}

/**
 * Simulate GitHub push (in production, this would use GitHub API)
 * For now, we'll log the commit and store it locally
 */
export async function pushToGitHub(commit: CommitData): Promise<{ success: boolean; message: string }> {
  try {
    const config = getGitHubConfig();

    if (!config.autoCommitEnabled) {
      return {
        success: false,
        message: 'Auto-commit is disabled',
      };
    }

    // In production, this would call GitHub API
    // For now, we'll simulate the push
    console.log('Simulating GitHub push:', {
      owner: config.owner,
      repo: config.repo,
      branch: config.branch,
      commit,
    });

    // Record the commit
    recordCommit(commit);

    return {
      success: true,
      message: `Pushed to ${config.owner}/${config.repo}:${config.branch}`,
    };
  } catch (error) {
    console.error('GitHub push error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create an optimization commit
 */
export async function createOptimizationCommit(
  version: string,
  metrics: any,
  parameters: any
): Promise<{ success: boolean; message: string }> {
  const commit: CommitData = {
    message: `🤖 Auto-optimization: Algorithm v${version}`,
    description: `Self-learning system optimized parameters based on performance metrics.
Accuracy: ${(metrics.accuracy * 100).toFixed(1)}%
Precision: ${(metrics.precision * 100).toFixed(1)}%
Recall: ${(metrics.recall * 100).toFixed(1)}%`,
    files: {
      'LEARNING_LOG.json': JSON.stringify(
        {
          version,
          timestamp: new Date().toISOString(),
          metrics,
          parameters,
        },
        null,
        2
      ),
    },
    timestamp: Date.now(),
    version,
  };

  return pushToGitHub(commit);
}

/**
 * Create an improvement commit
 */
export async function createImprovementCommit(
  improvement: string,
  details: string,
  version: string
): Promise<{ success: boolean; message: string }> {
  const commit: CommitData = {
    message: `✨ Improvement: ${improvement}`,
    description: details,
    files: {
      'IMPROVEMENTS.md': `# ${improvement}\n\n${details}\n\nVersion: ${version}\nDate: ${new Date().toISOString()}`,
    },
    timestamp: Date.now(),
    version,
  };

  return pushToGitHub(commit);
}

/**
 * Create a feature commit
 */
export async function createFeatureCommit(
  featureName: string,
  description: string,
  version: string
): Promise<{ success: boolean; message: string }> {
  const commit: CommitData = {
    message: `🎉 Feature: ${featureName}`,
    description,
    files: {
      'FEATURES.md': `# ${featureName}\n\n${description}\n\nVersion: ${version}\nDate: ${new Date().toISOString()}`,
    },
    timestamp: Date.now(),
    version,
  };

  return pushToGitHub(commit);
}

/**
 * Create a bugfix commit
 */
export async function createBugfixCommit(
  bugName: string,
  fix: string,
  version: string
): Promise<{ success: boolean; message: string }> {
  const commit: CommitData = {
    message: `🐛 Bugfix: ${bugName}`,
    description: fix,
    files: {
      'BUGFIXES.md': `# ${bugName}\n\n${fix}\n\nVersion: ${version}\nDate: ${new Date().toISOString()}`,
    },
    timestamp: Date.now(),
    version,
  };

  return pushToGitHub(commit);
}

/**
 * Generate commit statistics
 */
export function getCommitStats() {
  const history = getCommitHistory();

  const stats = {
    totalCommits: history.length,
    optimizations: history.filter(c => c.message.includes('Auto-optimization')).length,
    improvements: history.filter(c => c.message.includes('Improvement')).length,
    features: history.filter(c => c.message.includes('Feature')).length,
    bugfixes: history.filter(c => c.message.includes('Bugfix')).length,
    lastCommit: history.length > 0 ? history[history.length - 1].timestamp : null,
  };

  return stats;
}

/**
 * Export commit log as markdown
 */
export function exportCommitLog(): string {
  const history = getCommitHistory();
  const stats = getCommitStats();

  let log = `# The Machine - Commit History\n\n`;
  log += `## Statistics\n`;
  log += `- Total Commits: ${stats.totalCommits}\n`;
  log += `- Optimizations: ${stats.optimizations}\n`;
  log += `- Improvements: ${stats.improvements}\n`;
  log += `- Features: ${stats.features}\n`;
  log += `- Bugfixes: ${stats.bugfixes}\n\n`;

  log += `## Recent Commits\n\n`;

  history.reverse().forEach((commit, idx) => {
    log += `### ${idx + 1}. ${commit.message}\n`;
    log += `**Version**: ${commit.version}\n`;
    log += `**Date**: ${new Date(commit.timestamp).toISOString()}\n`;
    log += `\n${commit.description}\n\n`;
  });

  return log;
}

/**
 * Clear commit history (for testing)
 */
export function clearCommitHistory(): void {
  localStorage.removeItem(COMMIT_HISTORY_KEY);
}
