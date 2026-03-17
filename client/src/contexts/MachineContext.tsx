/**
 * The Machine - Global State Context
 * Manages persons database, detected faces, system status
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { nanoid } from 'nanoid';
import type { Person, DetectedFace, SystemStatus, Activity, Classification } from '@/lib/types';

interface MachineContextType {
  persons: Person[];
  detectedFaces: DetectedFace[];
  systemStatus: SystemStatus;
  selectedPerson: Person | null;
  activeView: 'surveillance' | 'database' | 'map' | 'timeline';
  addPerson: (person: Omit<Person, 'id' | 'activities' | 'connections' | 'firstSeen' | 'lastSeen' | 'isActive'>) => Person;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  setDetectedFaces: (faces: DetectedFace[]) => void;
  setSelectedPerson: (person: Person | null) => void;
  setActiveView: (view: 'surveillance' | 'database' | 'map' | 'timeline') => void;
  addActivity: (personId: string, activity: Omit<Activity, 'id' | 'personId'>) => void;
  updateSystemStatus: (status: Partial<SystemStatus>) => void;
  getPersonById: (id: string) => Person | undefined;
  searchPersons: (query: string) => Person[];
}

const MachineContext = createContext<MachineContextType | null>(null);

const STORAGE_KEY = 'the-machine-persons';

function loadPersonsFromStorage(): Person[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((p: Person) => ({
        ...p,
        activities: p.activities || [],
        connections: p.connections || [],
      }));
    }
  } catch (e) {
    console.error('Failed to load persons from storage:', e);
  }
  return getDefaultPersons();
}

function savePersonsToStorage(persons: Person[]) {
  try {
    const toStore = persons.map(p => ({
      ...p,
      photoDescriptor: undefined,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (e) {
    console.error('Failed to save persons to storage:', e);
  }
}

function getDefaultPersons(): Person[] {
  const now = Date.now();
  return [
    {
      id: nanoid(),
      firstName: 'Harold',
      lastName: 'Finch',
      alias: 'Admin',
      classification: 'admin',
      threatLevel: 0,
      position: { lat: 40.7128, lng: -74.0060, label: 'New York City', timestamp: now },
      publicInfo: {
        occupation: 'Software Engineer',
        employer: 'IFT (Ingram Federated Technologies)',
        notes: 'Creator of The Machine. Reclusive billionaire. Uses multiple aliases.',
      },
      activities: [
        { id: nanoid(), personId: '', type: 'note', description: 'System creator identified', timestamp: now - 86400000 * 30 },
        { id: nanoid(), personId: '', type: 'sighting', description: 'Observed at IFT headquarters', timestamp: now - 86400000 * 7 },
      ],
      connections: [],
      firstSeen: now - 86400000 * 365,
      lastSeen: now,
      isActive: true,
    },
    {
      id: nanoid(),
      firstName: 'John',
      lastName: 'Reese',
      alias: 'Man in the Suit',
      classification: 'relevant',
      threatLevel: 35,
      position: { lat: 40.7580, lng: -73.9855, label: 'Midtown Manhattan', timestamp: now },
      publicInfo: {
        occupation: 'Former CIA Operative',
        notes: 'Highly trained operative. Works with Admin to prevent crimes.',
      },
      activities: [
        { id: nanoid(), personId: '', type: 'sighting', description: 'Subject spotted in Midtown', timestamp: now - 86400000 * 2 },
        { id: nanoid(), personId: '', type: 'alert', description: 'Engaged hostile targets near 8th precinct', timestamp: now - 86400000 },
      ],
      connections: [],
      firstSeen: now - 86400000 * 300,
      lastSeen: now - 3600000,
      isActive: true,
    },
    {
      id: nanoid(),
      firstName: 'Sameen',
      lastName: 'Shaw',
      classification: 'relevant',
      threatLevel: 45,
      position: { lat: 40.7484, lng: -73.9967, label: 'Chelsea, Manhattan', timestamp: now },
      publicInfo: {
        occupation: 'Former ISA Operative',
        notes: 'Personality disorder. Extremely capable in combat. Allied with Admin.',
      },
      activities: [
        { id: nanoid(), personId: '', type: 'movement', description: 'Tracked moving through Chelsea', timestamp: now - 3600000 * 5 },
      ],
      connections: [],
      firstSeen: now - 86400000 * 200,
      lastSeen: now - 7200000,
      isActive: true,
    },
    {
      id: nanoid(),
      firstName: 'Root',
      lastName: '',
      alias: 'Analog Interface',
      classification: 'relevant',
      threatLevel: 50,
      position: { lat: 40.7282, lng: -73.7949, label: 'Queens, NY', timestamp: now },
      publicInfo: {
        occupation: 'Hacker / Analog Interface',
        notes: 'Direct interface with The Machine. Highly dangerous. Former threat, now allied.',
      },
      activities: [
        { id: nanoid(), personId: '', type: 'communication', description: 'Intercepted encrypted communication', timestamp: now - 86400000 * 3 },
      ],
      connections: [],
      firstSeen: now - 86400000 * 250,
      lastSeen: now - 86400000,
      isActive: true,
    },
    {
      id: nanoid(),
      firstName: 'Carl',
      lastName: 'Elias',
      classification: 'threat',
      threatLevel: 85,
      position: { lat: 40.6892, lng: -74.0445, label: 'Brooklyn, NY', timestamp: now },
      publicInfo: {
        occupation: 'Crime Boss',
        notes: 'Head of organized crime in NYC. Extremely intelligent and dangerous.',
      },
      sensitiveData: {
        ssn: '***-**-4521',
      },
      activities: [
        { id: nanoid(), personId: '', type: 'alert', description: 'THREAT: Known criminal organization activity detected', timestamp: now - 86400000 * 5 },
        { id: nanoid(), personId: '', type: 'transaction', description: 'Suspicious financial transaction flagged', timestamp: now - 86400000 * 2 },
      ],
      connections: [],
      firstSeen: now - 86400000 * 400,
      lastSeen: now - 86400000 * 2,
      isActive: true,
    },
    {
      id: nanoid(),
      firstName: 'Lionel',
      lastName: 'Fusco',
      classification: 'irrelevant',
      threatLevel: 10,
      position: { lat: 40.7527, lng: -73.9772, label: 'NYPD 8th Precinct', timestamp: now },
      publicInfo: {
        occupation: 'NYPD Detective',
        employer: 'NYPD',
        notes: 'Homicide detective. Reluctant ally. Former corrupt cop turned asset.',
      },
      activities: [
        { id: nanoid(), personId: '', type: 'sighting', description: 'On duty at 8th Precinct', timestamp: now - 3600000 * 2 },
      ],
      connections: [],
      firstSeen: now - 86400000 * 350,
      lastSeen: now - 3600000 * 2,
      isActive: true,
    },
  ];
}

export function MachineProvider({ children }: { children: ReactNode }) {
  const [persons, setPersons] = useState<Person[]>(() => loadPersonsFromStorage());
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [activeView, setActiveView] = useState<'surveillance' | 'database' | 'map' | 'timeline'>('surveillance');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isOnline: true,
    camerasActive: 0,
    subjectsTracked: 0,
    threatsDetected: 0,
    lastUpdate: Date.now(),
    modelsLoaded: false,
  });

  useEffect(() => {
    savePersonsToStorage(persons);
  }, [persons]);

  const addPerson = useCallback((personData: Omit<Person, 'id' | 'activities' | 'connections' | 'firstSeen' | 'lastSeen' | 'isActive'>) => {
    const now = Date.now();
    const newPerson: Person = {
      ...personData,
      id: nanoid(),
      activities: [],
      connections: [],
      firstSeen: now,
      lastSeen: now,
      isActive: true,
    };
    setPersons(prev => [...prev, newPerson]);
    return newPerson;
  }, []);

  const updatePerson = useCallback((id: string, updates: Partial<Person>) => {
    setPersons(prev => prev.map(p => p.id === id ? { ...p, ...updates, lastSeen: Date.now() } : p));
  }, []);

  const deletePerson = useCallback((id: string) => {
    setPersons(prev => prev.filter(p => p.id !== id));
    if (selectedPerson?.id === id) setSelectedPerson(null);
  }, [selectedPerson]);

  const addActivity = useCallback((personId: string, activity: Omit<Activity, 'id' | 'personId'>) => {
    const newActivity: Activity = {
      ...activity,
      id: nanoid(),
      personId,
    };
    setPersons(prev => prev.map(p =>
      p.id === personId
        ? { ...p, activities: [...p.activities, newActivity], lastSeen: Date.now() }
        : p
    ));
  }, []);

  const updateSystemStatus = useCallback((status: Partial<SystemStatus>) => {
    setSystemStatus(prev => ({ ...prev, ...status, lastUpdate: Date.now() }));
  }, []);

  const getPersonById = useCallback((id: string) => {
    return persons.find(p => p.id === id);
  }, [persons]);

  const searchPersons = useCallback((query: string) => {
    const q = query.toLowerCase();
    return persons.filter(p =>
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      (p.alias && p.alias.toLowerCase().includes(q)) ||
      (p.publicInfo.occupation && p.publicInfo.occupation.toLowerCase().includes(q))
    );
  }, [persons]);

  return (
    <MachineContext.Provider value={{
      persons,
      detectedFaces,
      systemStatus,
      selectedPerson,
      activeView,
      addPerson,
      updatePerson,
      deletePerson,
      setDetectedFaces,
      setSelectedPerson,
      setActiveView,
      addActivity,
      updateSystemStatus,
      getPersonById,
      searchPersons,
    }}>
      {children}
    </MachineContext.Provider>
  );
}

export function useMachine() {
  const ctx = useContext(MachineContext);
  if (!ctx) throw new Error('useMachine must be used within MachineProvider');
  return ctx;
}
