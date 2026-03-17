/**
 * DatabaseView Component
 * Person database management with search, add/edit, and detail views
 * Sensitive data is masked for privacy
 */
import { useState, useMemo } from 'react';
import { useMachine } from '@/contexts/MachineContext';
import type { Person, Classification } from '@/lib/types';
import { CLASSIFICATION_COLORS, CLASSIFICATION_LABELS } from '@/lib/types';
import {
  Search, Plus, User, Shield, MapPin, Clock,
  ChevronRight, X, Eye, EyeOff, Edit2, Trash2, Save
} from 'lucide-react';

function maskSensitive(value: string | undefined): string {
  if (!value) return '---';
  if (value.startsWith('***')) return value;
  if (value.length <= 4) return '****';
  return '****' + value.slice(-4);
}

function ThreatBar({ level }: { level: number }) {
  const color = level > 70 ? '#e74c3c' : level > 40 ? '#f5a623' : '#00d4ff';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-machine-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${level}%`, background: color }}
        />
      </div>
      <span className="font-mono text-[10px]" style={{ color }}>{level}%</span>
    </div>
  );
}

function ClassificationBadge({ classification }: { classification: Classification }) {
  const color = CLASSIFICATION_COLORS[classification];
  const label = CLASSIFICATION_LABELS[classification];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 font-display text-[10px] font-bold tracking-[0.15em] uppercase border"
      style={{ color, borderColor: `${color}40`, background: `${color}10` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function PersonCard({ person, onClick, isSelected }: { person: Person; onClick: () => void; isSelected: boolean }) {
  const color = CLASSIFICATION_COLORS[person.classification];
  return (
    <div
      onClick={onClick}
      className={`relative p-3 border cursor-pointer transition-all duration-300 hover:bg-machine-white/[0.03] ${
        isSelected ? 'bg-machine-white/[0.05]' : ''
      }`}
      style={{ borderColor: isSelected ? `${color}60` : 'rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-sm flex items-center justify-center border"
          style={{ borderColor: `${color}40`, background: `${color}10` }}
        >
          {person.photoUrl ? (
            <img src={person.photoUrl} alt="" className="w-full h-full object-cover rounded-sm" />
          ) : (
            <User className="w-5 h-5" style={{ color }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold text-machine-white truncate">
              {person.firstName} {person.lastName}
            </span>
            {person.alias && (
              <span className="font-mono text-[9px] text-machine-white/40">
                "{person.alias}"
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <ClassificationBadge classification={person.classification} />
            <ThreatBar level={person.threatLevel} />
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-machine-white/20 mt-1" />
      </div>
    </div>
  );
}

function AddPersonForm({ onClose, onAdd }: { onClose: () => void; onAdd: (p: Partial<Person>) => void }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    alias: '',
    classification: 'unknown' as Classification,
    threatLevel: 0,
    occupation: '',
    employer: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    lat: '',
    lng: '',
    locationLabel: '',
    ssn: '',
    creditCard: '',
  });

  const handleSubmit = () => {
    if (!form.firstName) return;
    const now = Date.now();
    onAdd({
      firstName: form.firstName,
      lastName: form.lastName,
      alias: form.alias || undefined,
      classification: form.classification,
      threatLevel: form.threatLevel,
      position: form.lat && form.lng ? {
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        label: form.locationLabel,
        timestamp: now,
      } : undefined,
      publicInfo: {
        occupation: form.occupation || undefined,
        employer: form.employer || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        notes: form.notes || undefined,
      },
      sensitiveData: (form.ssn || form.creditCard) ? {
        ssn: form.ssn || undefined,
        creditCard: form.creditCard || undefined,
      } : undefined,
    });
    onClose();
  };

  return (
    <div className="p-4 border border-machine-cyan/20 bg-machine-panel/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-bold tracking-[0.15em] text-machine-cyan uppercase">
          ADD NEW SUBJECT
        </h3>
        <button onClick={onClose} className="text-machine-white/40 hover:text-machine-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="First Name *"
          value={form.firstName}
          onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
          className="col-span-1 px-3 py-2 bg-machine-bg/80 border border-machine-white/10 font-mono text-xs text-machine-white placeholder:text-machine-white/20 focus:border-machine-cyan/40 focus:outline-none"
        />
        <input
          placeholder="Last Name"
          value={form.lastName}
          onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
          className="col-span-1 px-3 py-2 bg-machine-bg/80 border border-machine-white/10 font-mono text-xs text-machine-white placeholder:text-machine-white/20 focus:border-machine-cyan/40 focus:outline-none"
        />
        <input
          placeholder="Alias"
          value={form.alias}
          onChange={e => setForm(f => ({ ...f, alias: e.target.value }))}
          className="col-span-1 px-3 py-2 bg-machine-bg/80 border border-machine-white/10 font-mono text-xs text-machine-white placeholder:text-machine-white/20 focus:border-machine-cyan/40 focus:outline-none"
        />
        <select
          value={form.classification}
          onChange={e => setForm(f => ({ ...f, classification: e.target.value as Classification }))}
          className="col-span-1 px-3 py-2 bg-machine-bg/80 border border-machine-white/10 font-mono text-xs text-machine-white focus:border-machine-cyan/40 focus:outline-none"
        >
          <option value="unknown">Unknown</option>
          <option value="relevant">Relevant</option>
          <option value="irrelevant">Irrelevant</option>
          <option value="threat">Threat</option>
          <option value="admin">Admin</option>
        </select>

        <div className="col-span-2 flex items-center gap-3">
          <span className="font-mono text-[10px] text-machine-white/40 w-20">THREAT LVL:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={form.threatLevel}
            onChange={e => setForm(f => ({ ...f, threatLevel: parseInt(e.target.value) }))}
            className="flex-1 accent-machine-cyan"
          />
          <span className="font-mono text-xs text-machine-cyan w-8">{form.threatLevel}</span>
        </div>

        <input
          placeholder="Occupation"
          value={form.occupation}
          onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))}
          className="col-span-1 px-3 py-2 bg-machine-bg/80 border border-machine-white/10 font-mono text-xs text-machine-white placeholder:text-machine-white/20 focus:border-machine-cyan/40 focus:outline-none"
        />
        <input
          placeholder="Employer"
          value={form.employer}
          onChange={e => setForm(f => ({ ...f, employer: e.target.value }))}
          className="col-span-1 px-3 py-2 bg-machine-bg/80 border border-machine-white/10 font-mono text-xs text-machine-white placeholder:text-machine-white/20 focus:border-machine-cyan/40 focus:outline-none"
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="col-span-1 px-3 py-2 bg-machine-bg/80 border border-machine-white/10 font-mono text-xs text-machine-white placeholder:text-machine-white/20 focus:border-machine-cyan/40 focus:outline-none"
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          className="col-span-1 px-3 py-2 bg-machine-bg/80 border border-machine-white/10 font-mono text-xs text-machine-white placeholder:text-machine-white/20 focus:border-machine-cyan/40 focus:outline-none"
        />

        <div className="col-span-2 border-t border-machine-white/5 pt-3 mt-1">
          <span className="font-mono text-[10px] text-machine-white/30 block mb-2">LOCATION (OPTIONAL)</span>
          <div className="grid grid-cols-3 gap-2">
            <input
              placeholder="Latitude"
              value={form.lat}
              onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
              className="px-3 py-2 bg-machine-bg/80 border border-machine-white/10 font-mono text-xs text-machine-white placeholder:text-machine-white/20 focus:border-machine-cyan/40 focus:outline-none"
            />
            <input
              placeholder="Longitude"
              value={form.lng}
              onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
              className="px-3 py-2 bg-machine-bg/80 border border-machine-white/10 font-mono text-xs text-machine-white placeholder:text-machine-white/20 focus:border-machine-cyan/40 focus:outline-none"
            />
            <input
              placeholder="Label"
              value={form.locationLabel}
              onChange={e => setForm(f => ({ ...f, locationLabel: e.target.value }))}
              className="px-3 py-2 bg-machine-bg/80 border border-machine-white/10 font-mono text-xs text-machine-white placeholder:text-machine-white/20 focus:border-machine-cyan/40 focus:outline-none"
            />
          </div>
        </div>

        <div className="col-span-2 border-t border-machine-white/5 pt-3 mt-1">
          <span className="font-mono text-[10px] text-machine-red/50 block mb-2">SENSITIVE DATA (ENCRYPTED)</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="SSN"
              value={form.ssn}
              onChange={e => setForm(f => ({ ...f, ssn: e.target.value }))}
              className="px-3 py-2 bg-machine-bg/80 border border-machine-red/10 font-mono text-xs text-machine-white placeholder:text-machine-white/20 focus:border-machine-red/30 focus:outline-none"
            />
            <input
              placeholder="Credit Card"
              value={form.creditCard}
              onChange={e => setForm(f => ({ ...f, creditCard: e.target.value }))}
              className="px-3 py-2 bg-machine-bg/80 border border-machine-red/10 font-mono text-xs text-machine-white placeholder:text-machine-white/20 focus:border-machine-red/30 focus:outline-none"
            />
          </div>
        </div>

        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={2}
          className="col-span-2 px-3 py-2 bg-machine-bg/80 border border-machine-white/10 font-mono text-xs text-machine-white placeholder:text-machine-white/20 focus:border-machine-cyan/40 focus:outline-none resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!form.firstName}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-machine-cyan/10 border border-machine-cyan/40 text-machine-cyan font-display text-xs font-bold tracking-[0.15em] uppercase hover:bg-machine-cyan/20 transition-all disabled:opacity-30"
      >
        <Save className="w-4 h-4" />
        ADD TO DATABASE
      </button>
    </div>
  );
}

function PersonDetail({ person, onClose }: { person: Person; onClose: () => void }) {
  const { deletePerson, updatePerson } = useMachine();
  const [showSensitive, setShowSensitive] = useState(false);
  const color = CLASSIFICATION_COLORS[person.classification];

  return (
    <div className="p-4 border bg-machine-panel/30" style={{ borderColor: `${color}30` }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-sm flex items-center justify-center border"
            style={{ borderColor: `${color}40`, background: `${color}10` }}
          >
            {person.photoUrl ? (
              <img src={person.photoUrl} alt="" className="w-full h-full object-cover rounded-sm" />
            ) : (
              <User className="w-7 h-7" style={{ color }} />
            )}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-machine-white">
              {person.firstName} {person.lastName}
            </h3>
            {person.alias && (
              <span className="font-mono text-[10px] text-machine-white/40">AKA: "{person.alias}"</span>
            )}
            <div className="mt-1">
              <ClassificationBadge classification={person.classification} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => deletePerson(person.id)}
            className="p-1.5 text-machine-red/50 hover:text-machine-red hover:bg-machine-red/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1.5 text-machine-white/40 hover:text-machine-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Threat Level */}
      <div className="mb-4 p-3 bg-machine-bg/50 border border-machine-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display text-[11px] font-bold tracking-[0.15em] text-machine-white/60 uppercase">Threat Assessment</span>
          <span className="font-mono text-xs" style={{ color: person.threatLevel > 70 ? '#e74c3c' : person.threatLevel > 40 ? '#f5a623' : '#00d4ff' }}>
            {person.threatLevel}%
          </span>
        </div>
        <div className="w-full h-2 bg-machine-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${person.threatLevel}%`,
              background: `linear-gradient(90deg, #00d4ff, ${person.threatLevel > 40 ? '#f5a623' : '#00d4ff'}, ${person.threatLevel > 70 ? '#e74c3c' : '#f5a623'})`,
            }}
          />
        </div>
      </div>

      {/* Public Info */}
      <div className="mb-4">
        <h4 className="font-display text-[11px] font-bold tracking-[0.15em] text-machine-cyan/60 uppercase mb-2">Public Information</h4>
        <div className="space-y-1.5 font-mono text-xs">
          {person.publicInfo.occupation && (
            <div className="flex"><span className="text-machine-white/30 w-24">OCCUPATION:</span><span className="text-machine-white/70">{person.publicInfo.occupation}</span></div>
          )}
          {person.publicInfo.employer && (
            <div className="flex"><span className="text-machine-white/30 w-24">EMPLOYER:</span><span className="text-machine-white/70">{person.publicInfo.employer}</span></div>
          )}
          {person.publicInfo.email && (
            <div className="flex"><span className="text-machine-white/30 w-24">EMAIL:</span><span className="text-machine-white/70">{person.publicInfo.email}</span></div>
          )}
          {person.publicInfo.phone && (
            <div className="flex"><span className="text-machine-white/30 w-24">PHONE:</span><span className="text-machine-white/70">{person.publicInfo.phone}</span></div>
          )}
          {person.publicInfo.address && (
            <div className="flex"><span className="text-machine-white/30 w-24">ADDRESS:</span><span className="text-machine-white/70">{person.publicInfo.address}</span></div>
          )}
          {person.publicInfo.notes && (
            <div className="mt-2 p-2 bg-machine-bg/50 border border-machine-white/5 text-machine-white/50 text-[11px] leading-relaxed">
              {person.publicInfo.notes}
            </div>
          )}
        </div>
      </div>

      {/* Sensitive Data */}
      {person.sensitiveData && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-display text-[11px] font-bold tracking-[0.15em] text-machine-red/60 uppercase">Sensitive Data</h4>
            <button
              onClick={() => setShowSensitive(!showSensitive)}
              className="flex items-center gap-1 text-machine-white/30 hover:text-machine-white/60 transition-colors"
            >
              {showSensitive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span className="font-mono text-[9px]">{showSensitive ? 'HIDE' : 'REVEAL'}</span>
            </button>
          </div>
          <div className="space-y-1.5 font-mono text-xs p-2 bg-machine-red/5 border border-machine-red/10">
            {person.sensitiveData.ssn && (
              <div className="flex"><span className="text-machine-red/30 w-24">SSN:</span><span className="text-machine-white/50">{showSensitive ? person.sensitiveData.ssn : maskSensitive(person.sensitiveData.ssn)}</span></div>
            )}
            {person.sensitiveData.creditCard && (
              <div className="flex"><span className="text-machine-red/30 w-24">CREDIT CARD:</span><span className="text-machine-white/50">{showSensitive ? person.sensitiveData.creditCard : maskSensitive(person.sensitiveData.creditCard)}</span></div>
            )}
            {person.sensitiveData.bankAccount && (
              <div className="flex"><span className="text-machine-red/30 w-24">BANK ACCT:</span><span className="text-machine-white/50">{showSensitive ? person.sensitiveData.bankAccount : maskSensitive(person.sensitiveData.bankAccount)}</span></div>
            )}
            {person.sensitiveData.passport && (
              <div className="flex"><span className="text-machine-red/30 w-24">PASSPORT:</span><span className="text-machine-white/50">{showSensitive ? person.sensitiveData.passport : maskSensitive(person.sensitiveData.passport)}</span></div>
            )}
          </div>
        </div>
      )}

      {/* Position */}
      {person.position && (
        <div className="mb-4">
          <h4 className="font-display text-[11px] font-bold tracking-[0.15em] text-machine-green/60 uppercase mb-2">Last Known Position</h4>
          <div className="flex items-center gap-2 font-mono text-xs text-machine-white/50">
            <MapPin className="w-3.5 h-3.5 text-machine-green/60" />
            <span>{person.position.label || `${person.position.lat.toFixed(4)}, ${person.position.lng.toFixed(4)}`}</span>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {person.activities.length > 0 && (
        <div>
          <h4 className="font-display text-[11px] font-bold tracking-[0.15em] text-machine-white/40 uppercase mb-2">Recent Activity</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {person.activities.slice(-5).reverse().map(act => (
              <div key={act.id} className="flex items-start gap-2 font-mono text-[10px]">
                <Clock className="w-3 h-3 text-machine-white/20 mt-0.5 shrink-0" />
                <div>
                  <span className="text-machine-white/30">{new Date(act.timestamp).toLocaleString()}</span>
                  <span className="text-machine-white/50 ml-2">{act.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="mt-4 pt-3 border-t border-machine-white/5 flex justify-between font-mono text-[9px] text-machine-white/20">
        <span>FIRST SEEN: {new Date(person.firstSeen).toLocaleDateString()}</span>
        <span>LAST SEEN: {new Date(person.lastSeen).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export default function DatabaseView() {
  const { persons, selectedPerson, setSelectedPerson, addPerson } = useMachine();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterClassification, setFilterClassification] = useState<Classification | 'all'>('all');

  const filteredPersons = useMemo(() => {
    let result = persons;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        (p.alias && p.alias.toLowerCase().includes(q))
      );
    }
    if (filterClassification !== 'all') {
      result = result.filter(p => p.classification === filterClassification);
    }
    return result.sort((a, b) => b.threatLevel - a.threatLevel);
  }, [persons, searchQuery, filterClassification]);

  const handleAdd = (data: Partial<Person>) => {
    addPerson(data as any);
  };

  return (
    <div className="h-full flex">
      {/* Left panel - list */}
      <div className="w-80 border-r border-machine-white/5 flex flex-col">
        {/* Search */}
        <div className="p-3 border-b border-machine-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-machine-white/30" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-machine-bg/80 border border-machine-white/10 font-mono text-xs text-machine-white placeholder:text-machine-white/20 focus:border-machine-cyan/40 focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {(['all', 'relevant', 'irrelevant', 'threat', 'admin', 'unknown'] as const).map(cls => (
              <button
                key={cls}
                onClick={() => setFilterClassification(cls)}
                className={`px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider border transition-all ${
                  filterClassification === cls
                    ? 'border-machine-cyan/40 bg-machine-cyan/10 text-machine-cyan'
                    : 'border-machine-white/10 text-machine-white/30 hover:text-machine-white/50'
                }`}
              >
                {cls === 'all' ? 'ALL' : CLASSIFICATION_LABELS[cls]}
              </button>
            ))}
          </div>
        </div>

        {/* Add button */}
        <div className="p-2 border-b border-machine-white/5">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-machine-cyan/30 text-machine-cyan/60 font-display text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-machine-cyan/5 hover:border-machine-cyan/50 transition-all"
          >
            <Plus className="w-4 h-4" />
            ADD SUBJECT
          </button>
        </div>

        {/* Person list */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-1 font-mono text-[9px] text-machine-white/20 px-3 py-1.5">
            {filteredPersons.length} SUBJECTS IN DATABASE
          </div>
          {filteredPersons.map(person => (
            <PersonCard
              key={person.id}
              person={person}
              isSelected={selectedPerson?.id === person.id}
              onClick={() => setSelectedPerson(person)}
            />
          ))}
        </div>
      </div>

      {/* Right panel - detail / add form */}
      <div className="flex-1 overflow-y-auto p-4">
        {showAddForm ? (
          <AddPersonForm onClose={() => setShowAddForm(false)} onAdd={handleAdd} />
        ) : selectedPerson ? (
          <PersonDetail person={selectedPerson} onClose={() => setSelectedPerson(null)} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Shield className="w-12 h-12 text-machine-white/10 mb-4" />
            <p className="font-display text-sm text-machine-white/30 tracking-wider uppercase">
              Select a subject to view details
            </p>
            <p className="font-mono text-[10px] text-machine-white/15 mt-2">
              OR ADD A NEW SUBJECT TO THE DATABASE
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
