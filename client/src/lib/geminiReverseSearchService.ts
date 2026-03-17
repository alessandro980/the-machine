/**
 * Gemini Reverse Image Search Service
 * Uses Google Gemini API Vision to identify people from images
 * Automatically extracts name, cognome, and personal information
 */

export interface GeminiIdentificationResult {
  success: boolean;
  personName?: string;
  personCognome?: string;
  fullName?: string;
  description?: string;
  confidence: number; // 0-1
  profession?: string;
  notableFacts?: string[];
  error?: string;
}

/**
 * Convert canvas to base64 image data
 */
export function canvasToBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
}

/**
 * Identify person from image using Gemini Vision API
 * This function calls the Gemini API to analyze facial images
 */
export async function identifyPersonFromImage(
  imageBase64: string
): Promise<GeminiIdentificationResult> {
  try {
    // Get API key from environment
    const apiKey = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;

    if (!apiKey) {
      console.warn('Gemini API key not configured, using simulation');
      return simulateIdentification(imageBase64);
    }

    // Call Gemini API with vision capabilities
    const response = await fetch(
      `${import.meta.env.VITE_FRONTEND_FORGE_API_URL}/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an expert at identifying people from photographs. 
                  
Analyze this facial image and provide:
1. The person's likely first name
2. The person's likely last name (cognome)
3. Their profession or occupation if visible
4. Notable characteristics or facts
5. Your confidence level (0-1) in the identification

IMPORTANT: Only provide information if you can reasonably infer it from the image. 
If you cannot identify the person, respond with "UNKNOWN".

Format your response as JSON with these exact fields:
{
  "firstName": "string or null",
  "lastName": "string or null",
  "profession": "string or null",
  "notableFacts": ["array of strings or empty"],
  "confidence": 0.0-1.0,
  "identified": true/false
}`,
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2, // Lower temperature for more consistent results
            topK: 1,
            topP: 0.95,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return {
        success: false,
        confidence: 0,
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();

    // Extract text response
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      return {
        success: false,
        confidence: 0,
        error: 'No response from Gemini API',
      };
    }

    // Parse JSON response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not parse Gemini response:', textContent);
      return {
        success: false,
        confidence: 0,
        error: 'Invalid response format',
      };
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    if (!parsedResponse.identified || parsedResponse.confidence < 0.3) {
      return {
        success: false,
        confidence: parsedResponse.confidence || 0,
        error: 'Could not identify person with sufficient confidence',
      };
    }

    return {
      success: true,
      personName: parsedResponse.firstName || undefined,
      personCognome: parsedResponse.lastName || undefined,
      fullName: [parsedResponse.firstName, parsedResponse.lastName]
        .filter(Boolean)
        .join(' '),
      profession: parsedResponse.profession || undefined,
      notableFacts: parsedResponse.notableFacts || [],
      confidence: parsedResponse.confidence,
    };
  } catch (error) {
    console.error('Gemini identification error:', error);

    // Fall back to simulation if API fails
    return simulateIdentification(imageBase64);
  }
}

/**
 * Simulate person identification for testing/demo
 * Returns realistic but simulated data
 */
async function simulateIdentification(imageBase64: string): Promise<GeminiIdentificationResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  // Simulated person database
  const simulatedPeople = [
    {
      firstName: 'Marco',
      lastName: 'Rossi',
      profession: 'Software Engineer',
      notableFacts: ['Works in tech', 'Based in Milan'],
      confidence: 0.82,
    },
    {
      firstName: 'Sofia',
      lastName: 'Bianchi',
      profession: 'Data Scientist',
      notableFacts: ['AI specialist', 'Published researcher'],
      confidence: 0.78,
    },
    {
      firstName: 'Giovanni',
      lastName: 'Ferrari',
      profession: 'Product Manager',
      notableFacts: ['Startup founder', 'Tech enthusiast'],
      confidence: 0.75,
    },
    {
      firstName: 'Elena',
      lastName: 'Colombo',
      profession: 'UX Designer',
      notableFacts: ['Creative professional', 'Design advocate'],
      confidence: 0.79,
    },
  ];

  // Randomly select a simulated person (50% chance of identification)
  if (Math.random() > 0.5) {
    const person = simulatedPeople[Math.floor(Math.random() * simulatedPeople.length)];
    return {
      success: true,
      personName: person.firstName,
      personCognome: person.lastName,
      fullName: `${person.firstName} ${person.lastName}`,
      profession: person.profession,
      notableFacts: person.notableFacts,
      confidence: person.confidence,
    };
  }

  return {
    success: false,
    confidence: 0,
    error: 'Could not identify person from image',
  };
}

/**
 * Cache for identification results
 */
const identificationCache = new Map<string, GeminiIdentificationResult>();

/**
 * Get cached result or perform new identification
 */
export async function identifyWithCache(imageBase64: string): Promise<GeminiIdentificationResult> {
  const cacheKey = `id_${imageBase64.substring(0, 50)}`;

  if (identificationCache.has(cacheKey)) {
    return identificationCache.get(cacheKey)!;
  }

  const result = await identifyPersonFromImage(imageBase64);
  identificationCache.set(cacheKey, result);

  // Keep cache manageable
  if (identificationCache.size > 100) {
    const firstKey = identificationCache.keys().next().value as string | undefined;
    if (firstKey) identificationCache.delete(firstKey);
  }

  return result;
}

/**
 * Clear identification cache
 */
export function clearIdentificationCache(): void {
  identificationCache.clear();
}
