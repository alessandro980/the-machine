# The Machine - Reverse Image Search System

## Overview

The Machine now includes a **real reverse image search system** that automatically identifies people from facial images captured via webcam.

## How It Works

### 1. Face Detection & Capture
- Webcam continuously monitors for faces
- When a face is detected, the system captures a high-quality image
- Face is extracted and prepared for reverse image search

### 2. Reverse Image Search
- Image is sent to reverse image search service (SerpAPI, Google Images, etc.)
- System searches the internet for matching images
- Results are analyzed to extract person information

### 3. Name & Identity Extraction
- Search results are parsed to find person name and cognome
- Multiple patterns are used to extract names from titles and descriptions
- Confidence score is calculated based on result quality

### 4. Instagram Profile Lookup
- Once name is identified, system searches for Instagram profile
- Multiple username patterns are tried (firstname.lastname, firstname_lastname, etc.)
- If profile found, username is saved to database

### 5. Database Storage
- All identified information is saved to localStorage
- Includes: name, cognome, Instagram username, search confidence, timestamp
- Data persists across sessions

## Privacy & Legal Considerations

⚠️ **IMPORTANT**: This system has serious privacy and legal implications:

### Privacy Concerns
- Identifies individuals without their knowledge or consent
- Collects personal information (name, Instagram profile, etc.)
- Could be used for stalking, harassment, or doxxing
- Violates privacy laws in many jurisdictions (GDPR, CCPA, etc.)

### Legal Responsibilities
Users are responsible for:
- Obtaining consent from all individuals being monitored
- Complying with local privacy and surveillance laws
- Securing collected data appropriately
- Preventing misuse of the system
- Respecting individuals' right to privacy

### Prohibited Uses
- Unauthorized surveillance
- Stalking or harassment
- Discrimination or profiling
- Illegal activities

## Configuration

### API Keys
To use real reverse image search APIs:

1. **SerpAPI** (Recommended)
   - Sign up at https://serpapi.com
   - Get API key from dashboard
   - Set `REACT_APP_SERPAPI_KEY` environment variable

2. **Google Lens API**
   - Requires Google Cloud setup
   - More complex authentication

### Environment Variables
```bash
REACT_APP_SERPAPI_KEY=your_api_key_here
```

## Technical Implementation

### Key Files
- `client/src/lib/reverseImageSearchService.ts` - Core reverse image search logic
- `client/src/hooks/useReverseImageSearch.ts` - React hook for integration
- `client/src/components/PrivacyDisclaimerModal.tsx` - Privacy warning modal
- `client/src/lib/instagramLookupService.ts` - Instagram profile search

### Main Functions

#### `performReverseImageSearch(imageBase64: string)`
Performs reverse image search on a base64-encoded image.

```typescript
const result = await performReverseImageSearch(imageBase64);
// Returns: { success, personName, personCognome, confidence, sourceUrl }
```

#### `extractNameFromResults(results: Array)`
Extracts name and cognome from search results.

```typescript
const name = extractNameFromResults(searchResults);
// Returns: { firstName, lastName }
```

#### `lookupInstagramProfile(firstName: string, lastName: string)`
Searches for Instagram profile by name.

```typescript
const igProfile = await lookupInstagramProfile('John', 'Smith');
// Returns: { success, profile: { username, fullName, ... } }
```

## Workflow

```
Webcam Feed
    ↓
Face Detection
    ↓
Face Capture & Crop
    ↓
Reverse Image Search (SerpAPI/Google)
    ↓
Name Extraction
    ↓
Instagram Profile Lookup
    ↓
Database Storage (localStorage)
    ↓
HUD Display
```

## Disclaimer

**This system is provided for educational and personal use only.** Users assume all responsibility for their use of this application. The developers are not responsible for:

- Privacy violations
- Legal violations
- Misuse of the system
- Harm caused by unauthorized surveillance
- Data breaches or security issues

**By using this system, you acknowledge that you understand the legal and ethical implications and accept full responsibility for your actions.**

## Future Enhancements

- Backend database for persistent storage
- Real-time alerts for identified threats
- Facial recognition model improvement
- Multi-face tracking
- Behavioral analysis
- Advanced threat assessment
