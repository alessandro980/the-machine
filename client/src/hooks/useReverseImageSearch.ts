/**
 * useReverseImageSearch Hook
 * Integrates reverse image search with face detection
 */
import { useState, useCallback } from 'react';
import { performReverseImageSearch, canvasToBase64, searchWithCache } from '@/lib/reverseImageSearchService';
import { lookupInstagramProfile } from '@/lib/instagramLookupService';
import type { ReverseSearchResult } from '@/lib/reverseImageSearchService';

export interface SearchState {
  isSearching: boolean;
  result: ReverseSearchResult | null;
  instagramUsername: string | null;
  error: string | null;
}

export function useReverseImageSearch() {
  const [state, setState] = useState<SearchState>({
    isSearching: false,
    result: null,
    instagramUsername: null,
    error: null,
  });

  /**
   * Search for person identity from face image
   */
  const searchFaceIdentity = useCallback(async (canvas: HTMLCanvasElement) => {
    try {
      setState(prev => ({ ...prev, isSearching: true, error: null }));

      // Convert canvas to base64
      const imageBase64 = canvasToBase64(canvas);

      // Perform reverse image search
      const result = await searchWithCache(imageBase64);

      if (result.success && result.fullName) {
        // Search for Instagram profile
        let instagramUsername: string | null = null;
        try {
          const igResult = await lookupInstagramProfile(result.personName || '', result.personCognome || '');
          if (igResult.success && igResult.profile) {
            instagramUsername = igResult.profile.username;
          }
        } catch (error) {
          console.error('Instagram search error:', error);
        }

        setState(prev => ({
          ...prev,
          isSearching: false,
          result,
          instagramUsername,
        }));

        return {
          ...result,
          instagramUsername,
        };
      } else {
        setState(prev => ({
          ...prev,
          isSearching: false,
          error: result.error || 'Could not identify person',
        }));

        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isSearching: false,
        error: errorMessage,
      }));

      return null;
    }
  }, []);

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setState({
      isSearching: false,
      result: null,
      instagramUsername: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    searchFaceIdentity,
    clearResults,
  };
}
