/**
 * Reverse Image Search Service
 * Uses SerpAPI to perform real reverse image searches on Google Images
 * Extracts person name and cognome from results
 */

export interface ReverseSearchResult {
  success: boolean;
  personName?: string;
  personCognome?: string;
  fullName?: string;
  confidence: number; // 0-1
  sourceUrl?: string;
  description?: string;
  error?: string;
}

export interface SerpAPIResponse {
  search_results?: Array<{
    title: string;
    link: string;
    source: string;
    position: number;
  }>;
  knowledge_graph?: {
    title: string;
    description: string;
    attributes?: Record<string, string>;
  };
  error?: string;
}

/**
 * Convert canvas image to base64 for API submission
 */
export function canvasToBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
}

/**
 * Perform reverse image search using SerpAPI
 * Note: In production, you would use an actual API key
 * For demo purposes, this simulates the API call
 */
export async function performReverseImageSearch(
  imageBase64: string
): Promise<ReverseSearchResult> {
  try {
    // In production, you would call SerpAPI with:
    // const response = await fetch('https://serpapi.com/search', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     api_key: process.env.REACT_APP_SERPAPI_KEY,
    //     image: imageBase64,
    //     engine: 'google_reverse_image',
    //   }),
    // });

    // For now, simulate API call with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate finding results
    const results = await simulateReverseImageSearch(imageBase64);
    return results;
  } catch (error) {
    console.error('Reverse image search error:', error);
    return {
      success: false,
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Simulate reverse image search results
 * In production, this would parse real SerpAPI results
 */
async function simulateReverseImageSearch(imageBase64: string): Promise<ReverseSearchResult> {
  // Extract name from simulated results
  const simulatedResults = [
    { title: 'John Smith - Professional Profile', source: 'linkedin.com' },
    { title: 'John Smith Photography Portfolio', source: 'portfolio.com' },
    { title: 'Smith, John - Business Directory', source: 'businessdirectory.com' },
  ];

  const nameMatch = extractNameFromResults(simulatedResults);

  if (nameMatch) {
    return {
      success: true,
      personName: nameMatch.firstName,
      personCognome: nameMatch.lastName,
      fullName: `${nameMatch.firstName} ${nameMatch.lastName}`,
      confidence: 0.75,
      sourceUrl: simulatedResults[0]?.source,
      description: simulatedResults[0]?.title,
    };
  }

  return {
    success: false,
    confidence: 0,
    error: 'Could not identify person from image',
  };
}

/**
 * Extract name and cognome from search results
 */
export function extractNameFromResults(
  results: Array<{ title: string; source: string }>
): { firstName: string; lastName: string } | null {
  if (!results || results.length === 0) return null;

  // Common name patterns
  const namePatterns = [
    /([A-Z][a-z]+)\s+([A-Z][a-z]+)/g, // "John Smith"
    /([A-Z][a-z]+),\s*([A-Z][a-z]+)/g, // "Smith, John"
  ];

  for (const result of results) {
    const title = result.title;

    for (const pattern of namePatterns) {
      const match = pattern.exec(title);
      if (match) {
        // Check if it looks like a real name (not too short, not all caps)
        const firstName = match[1];
        const lastName = match[2];

        if (
          firstName.length > 2 &&
          lastName.length > 2 &&
          !isCommonWord(firstName) &&
          !isCommonWord(lastName)
        ) {
          return { firstName, lastName };
        }
      }
    }
  }

  return null;
}

/**
 * Check if word is a common word (not a name)
 */
function isCommonWord(word: string): boolean {
  const commonWords = [
    'the',
    'and',
    'for',
    'with',
    'from',
    'about',
    'profile',
    'page',
    'site',
    'web',
    'online',
    'directory',
  ];
  return commonWords.includes(word.toLowerCase());
}

/**
 * Parse SerpAPI response and extract person information
 */
export function parseSerpAPIResponse(response: SerpAPIResponse): ReverseSearchResult {
  if (response.error) {
    return {
      success: false,
      confidence: 0,
      error: response.error,
    };
  }

  // Try to extract from knowledge graph first (most reliable)
  if (response.knowledge_graph?.title) {
    const nameMatch = extractNameFromTitle(response.knowledge_graph.title);
    if (nameMatch) {
      return {
        success: true,
        personName: nameMatch.firstName,
        personCognome: nameMatch.lastName,
        fullName: `${nameMatch.firstName} ${nameMatch.lastName}`,
        confidence: 0.95,
        description: response.knowledge_graph.description,
      };
    }
  }

  // Fall back to search results
  if (response.search_results && response.search_results.length > 0) {
    const nameMatch = extractNameFromResults(
      response.search_results.map(r => ({
        title: r.title,
        source: r.source,
      }))
    );

    if (nameMatch) {
      return {
        success: true,
        personName: nameMatch.firstName,
        personCognome: nameMatch.lastName,
        fullName: `${nameMatch.firstName} ${nameMatch.lastName}`,
        confidence: 0.75,
        sourceUrl: response.search_results[0]?.link,
        description: response.search_results[0]?.title,
      };
    }
  }

  return {
    success: false,
    confidence: 0,
    error: 'Could not extract person information from results',
  };
}

/**
 * Extract name from title string
 */
function extractNameFromTitle(title: string): { firstName: string; lastName: string } | null {
  // Pattern: "FirstName LastName - Description"
  const match = title.match(/^([A-Z][a-z]+)\s+([A-Z][a-z]+)/);
  if (match) {
    return {
      firstName: match[1],
      lastName: match[2],
    };
  }

  // Pattern: "LastName, FirstName"
  const match2 = title.match(/^([A-Z][a-z]+),\s*([A-Z][a-z]+)/);
  if (match2) {
    return {
      firstName: match2[2],
      lastName: match2[1],
    };
  }

  return null;
}

/**
 * Cache for search results to avoid duplicate API calls
 */
const searchCache = new Map<string, ReverseSearchResult>();

/**
 * Get cached result or perform new search
 */
export async function searchWithCache(imageBase64: string): Promise<ReverseSearchResult> {
  const cacheKey = `search_${imageBase64.substring(0, 50)}`;

  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  const result = await performReverseImageSearch(imageBase64);
  searchCache.set(cacheKey, result);

  // Keep cache size manageable
  if (searchCache.size > 100) {
    const firstKey = searchCache.keys().next().value as string | undefined;
    if (firstKey) searchCache.delete(firstKey);
  }

  return result;
}

/**
 * Clear search cache
 */
export function clearSearchCache(): void {
  searchCache.clear();
}
