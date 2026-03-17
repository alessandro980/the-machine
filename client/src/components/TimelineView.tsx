/**
 * TimelineView Component
 * Displays a chronological timeline of all activities across all persons
 * with filtering and visual classification indicators
 */
import { useMemo, useState } from 'react';
import { useMachine } from '@/contexts/MachineContext';
import type { Activity, Classification } from '@/lib/types';
import { CLASSIFICATION_COLORS } from '@/lib/types';
import {
  Clock, Eye, MessageSquare, CreditCard, Navigation,
  AlertTriangle, FileText, Filter, User
} from 'lucide-react';

const ACTIVITY_ICONS: Record<Activity['type'], typeof Clock> = {
  sighting: Eye,
  communication: MessageSquare,
  transaction: CreditCard,
  movement: Navigation,
  alert: AlertTriangle,
  note: FileText,
};

const ACTIVITY_COLORS: Record<Activity['type'], string> = {
  sighting: '#00d4ff',
  communication: '#8899aa',
  transaction: '#f5a623',
  movement: '#00d4ff',
  alert: '#e74c3c',
  note: '#555555',
};

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'JUST NOW';
  if (minutes < 60) return `${minutes}m AGO`;
  if (hours < 24) return `${hours}h AGO`;
  if (days < 30) return `${days}d AGO`;
  return new Date(timestamp).toLocaleDateString();
}

export default function TimelineView() {
  const { persons, setSelectedPerson, setActiveView } = useMachine();
  const [typeFilter, setTypeFilter] = useState<Activity['type'] | 'all'>('all');

  // Collect all activities with person info
  const allActivities = useMemo(() => {
    const activities: (Activity & { person: typeof persons[0] })[] = [];
    for (const person of persons) {
      for (const act of person.activities) {
        activities.push({ ...act, personId: person.id, person });
      }
    }
    return activities
      .filter(a => typeFilter === 'all' || a.type === typeFilter)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [persons, typeFilter]);

  // Group by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, typeof allActivities> = {};
    for (const act of allActivities) {
      const date = new Date(act.timestamp).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(act);
    }
    return groups;
  }, [allActivities]);

  const handlePersonClick = (personId: string) => {
    const person = persons.find(p => p.id === personId);
    if (person) {
      setSelectedPerson(person);
      setActiveView('database');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-machine-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm font-bold tracking-[0.15em] text-machine-cyan uppercase">
              Activity Timeline
            </h2>
            <p className="font-mono text-[10px] text-machine-white/30 mt-1">
              {allActivities.length} EVENTS RECORDED
            </p>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-machine-white/20 mr-1" />
            {(['all', 'sighting', 'communication', 'transaction', 'movement', 'alert', 'note'] as const).map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider border transition-all ${
                  typeFilter === type
                    ? 'border-machine-cyan/40 bg-machine-cyan/10 text-machine-cyan'
                    : 'border-machine-white/10 text-machine-white/30 hover:text-machine-white/50'
                }`}
              >
                {type === 'all' ? 'ALL' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(groupedActivities).map(([date, activities]) => (
          <div key={date} className="mb-6">
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-machine-cyan/40" />
              <span className="font-display text-xs font-bold tracking-[0.1em] text-machine-white/40 uppercase">
                {date}
              </span>
              <div className="flex-1 h-[1px] bg-machine-white/5" />
            </div>

            {/* Activities */}
            <div className="ml-4 border-l border-machine-white/5 pl-6 space-y-3">
              {activities.map(act => {
                const Icon = ACTIVITY_ICONS[act.type];
                const actColor = ACTIVITY_COLORS[act.type];
                const personColor = CLASSIFICATION_COLORS[act.person.classification];

                return (
                  <div key={act.id} className="relative group">
                    {/* Timeline dot */}
                    <div
                      className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full border-2"
                      style={{ borderColor: actColor, background: `${actColor}30` }}
                    />

                    <div className="p-3 bg-machine-panel/20 border border-machine-white/5 hover:border-machine-white/10 transition-all">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0"
                          style={{ background: `${actColor}15` }}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color: actColor }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <button
                              onClick={() => handlePersonClick(act.personId)}
                              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                            >
                              <User className="w-3 h-3" style={{ color: personColor }} />
                              <span className="font-display text-xs font-bold" style={{ color: personColor }}>
                                {act.person.firstName} {act.person.lastName}
                              </span>
                            </button>
                            <span
                              className="font-mono text-[9px] px-1.5 py-0.5 uppercase tracking-wider"
                              style={{ color: actColor, background: `${actColor}10` }}
                            >
                              {act.type}
                            </span>
                          </div>

                          <p className="font-mono text-[11px] text-machine-white/50 leading-relaxed">
                            {act.description}
                          </p>

                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="font-mono text-[9px] text-machine-white/20">
                              {new Date(act.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="font-mono text-[9px] text-machine-white/15">
                              {formatRelativeTime(act.timestamp)}
                            </span>
                            {act.location && (
                              <span className="font-mono text-[9px] text-machine-green/40">
                                {act.location.label || `${act.location.lat.toFixed(4)}, ${act.location.lng.toFixed(4)}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {allActivities.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Clock className="w-12 h-12 text-machine-white/10 mb-4" />
            <p className="font-display text-sm text-machine-white/30 tracking-wider uppercase">
              No activities recorded
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
