/**
 * useGeminiIdentification Hook
 * Integrates Gemini Vision API for person identification from facial images
 */
import { useState, useCallback } from 'react';
import { identifyWithCache, canvasToBase64 } from '@/lib/geminiReverseSearchService';
import { lookupInstagramProfile } from '@/lib/instagramLookupService';
import type { GeminiIdentificationResult } from '@/lib/geminiReverseSearchService';

export interface IdentificationState {
  isIdentifying: boolean;
  result: GeminiIdentificationResult | null;
  instagramUsername: string | null;
  error: string | null;
}

export function useGeminiIdentification() {
  const [state, setState] = useState<IdentificationState>({
    isIdentifying: false,
    result: null,
    instagramUsername: null,
    error: null,
  });

  /**
   * Identify person from face image using Gemini Vision API
   */
  const identifyFace = useCallback(async (canvas: HTMLCanvasElement) => {
    try {
      setState(prev => ({ ...prev, isIdentifying: true, error: null }));

      // Convert canvas to base64
      const imageBase64 = canvasToBase64(canvas);

      // Perform identification with Gemini API
      const result = await identifyWithCache(imageBase64);

      if (result.success && result.fullName) {
        // Search for Instagram profile
        let instagramUsername: string | null = null;
        try {
          const igResult = await lookupInstagramProfile(
            result.personName || '',
            result.personCognome || ''
          );
          if (igResult.success && igResult.profile) {
            instagramUsername = igResult.profile.username;
          }
        } catch (error) {
          console.error('Instagram search error:', error);
        }

        setState(prev => ({
          ...prev,
          isIdentifying: false,
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
          isIdentifying: false,
          error: result.error || 'Could not identify person',
        }));

        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isIdentifying: false,
        error: errorMessage,
      }));

      return null;
    }
  }, []);

  /**
   * Clear identification results
   */
  const clearResults = useCallback(() => {
    setState({
      isIdentifying: false,
      result: null,
      instagramUsername: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    identifyFace,
    clearResults,
  };
}
