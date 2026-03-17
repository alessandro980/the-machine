/**
 * The Machine - Person of Interest Surveillance System
 * Type definitions
 */

export type Classification = 'relevant' | 'irrelevant' | 'threat' | 'admin' | 'unknown';

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  alias?: string;
  photoUrl?: string;
  photoDescriptor?: Float32Array;
  classification: Classification;
  threatLevel: number; // 0-100
  position?: {
    lat: number;
    lng: number;
    label?: string;
    timestamp: number;
  };
  publicInfo: {
    occupation?: string;
    employer?: string;
    email?: string;
    phone?: string;
    address?: string;
    socialMedia?: Record<string, string>;
    notes?: string;
  };
  sensitiveData?: {
    ssn?: string;
    creditCard?: string;
    bankAccount?: string;
    passport?: string;
  };
  activities: Activity[];
  connections: string[]; // IDs of connected persons
  firstSeen: number;
  lastSeen: number;
  isActive: boolean;
}

export interface Activity {
  id: string;
  personId: string;
  type: 'sighting' | 'communication' | 'transaction' | 'movement' | 'alert' | 'note';
  description: string;
  timestamp: number;
  location?: {
    lat: number;
    lng: number;
    label?: string;
  };
  metadata?: Record<string, string>;
}

export interface DetectedFace {
  id: string;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  matchedPerson?: Person;
  confidence: number;
  classification: Classification;
  descriptor?: Float32Array;
  expression?: string;
  timestamp: number;
}

export interface SystemStatus {
  isOnline: boolean;
  camerasActive: number;
  subjectsTracked: number;
  threatsDetected: number;
  lastUpdate: number;
  modelsLoaded: boolean;
  cpuUsage?: number;
}

export interface MapMarker {
  id: string;
  personId: string;
  lat: number;
  lng: number;
  label: string;
  classification: Classification;
  timestamp: number;
}

export const CLASSIFICATION_COLORS: Record<Classification, string> = {
  relevant: '#f5a623',
  irrelevant: '#8899aa',
  threat: '#e74c3c',
  admin: '#00d4ff',
  unknown: '#555555',
};

export const CLASSIFICATION_LABELS: Record<Classification, string> = {
  relevant: 'RELEVANT',
  irrelevant: 'IRRELEVANT',
  threat: 'THREAT',
  admin: 'ADMIN',
  unknown: 'UNKNOWN',
};

export const MODEL_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/88155598/f2aeEBrHmnEYtg9Rr4GzsQ';
