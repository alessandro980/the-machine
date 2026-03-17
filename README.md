# The Machine - Person of Interest Surveillance System

A sophisticated web application inspired by **Person of Interest** TV series, featuring real-time face detection, AI-powered threat assessment, and a cinematic surveillance interface. Built with React, TypeScript, and face-api.js.

![The Machine](https://machinedb-f2aeebrh.manus.space)

## 🎯 Features

### Core Surveillance System
- **Real-time Face Detection**: Live webcam stream with face-api.js neural networks
- **HUD Interface**: Cinematic heads-up display with targeting reticles, grid overlay, and data streams
- **Classification System**: Automatic subject classification (Relevant, Irrelevant, Threat, Admin)
- **Threat Assessment**: Dynamic threat level calculation (0-100%)

### Person Database
- **Subject Management**: Add, edit, and track individuals
- **Public Information**: Occupation, employer, contact details, notes
- **Sensitive Data**: Encrypted storage with privacy masking (SSN, credit cards, etc.)
- **Activity Timeline**: Chronological log of all surveillance events
- **Position Tracking**: Last known location with timestamp

### Advanced Features
- **Position Tracking Map**: Google Maps integration with dark surveillance styling
- **Activity Timeline**: Comprehensive event logging with filtering
- **Boot Sequence**: Cinematic system initialization animation
- **Sound Effects**: Synthesized audio cues using Web Audio API
- **Dark Theme**: Surveillance-inspired dark UI with cyan/amber/red color scheme

## 🚀 Live Demo

**[The Machine - Live App](https://machinedb-f2aeebrh.manus.space)**

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + OKLCH colors
- **Face Detection**: face-api.js (TensorFlow.js)
- **Maps**: Google Maps API with dark styling
- **State Management**: React Context API
- **Storage**: localStorage for persistence
- **Audio**: Web Audio API for synthesized effects
- **Build**: Vite + esbuild

## 📋 Requirements

- Modern browser with WebGL support
- Webcam access (for face detection)
- JavaScript enabled
- 4GB+ RAM recommended for face detection models

## 🎮 Usage

### 1. Boot Sequence
The app starts with a cinematic boot animation showing system initialization:
```
INITIALIZING SYSTEM...
NORTHERN LIGHTS PROTOCOL: ACTIVE
LOADING NEURAL NETWORK CORES...
CORE 1: FACIAL RECOGNITION ............ OK
...
SYSTEM ONLINE.
```

### 2. Surveillance View
- Click **ACTIVATE CAMERA** to start webcam feed
- Face detection automatically identifies subjects
- Targeting reticles appear around detected faces
- Color-coded classification: 🟡 Relevant, ⚪ Irrelevant, 🔴 Threat

### 3. Database Management
- Navigate to **DATABASE** tab
- Add new subjects with personal information
- Search and filter by classification
- View threat levels and activity history
- Mask sensitive data for privacy

### 4. Position Tracking
- **TRACKING** tab shows subjects on Google Maps
- Dark surveillance-style map styling
- Click markers to view subject details
- Zoom and pan to explore coverage areas

### 5. Activity Timeline
- **TIMELINE** tab displays chronological events
- Filter by activity type (sighting, alert, transaction, etc.)
- View timestamps and location data
- Track subject movements and interactions

## 🎨 Design Philosophy

**"Samaritan" Cinematic Surveillance HUD**
- Deep navy/black backgrounds with subtle blue gradients
- Cyan (#00d4ff) for system elements and data
- Amber (#f5a623) for relevant subjects
- Red (#e74c3c) for threats
- Monospace typography (IBM Plex Mono, Rajdhani)
- Layered information architecture with depth

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/alessandro980/the-machine.git
cd the-machine

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 🔧 Configuration

### Environment Variables
No external API keys required for core functionality. Google Maps uses Manus proxy authentication.

### Face Detection Models
Models are automatically downloaded from CDN on first load:
- Tiny Face Detector (fast, lightweight)
- Face Landmarks (68-point detection)
- Face Recognition (descriptor extraction)
- Face Expression (emotion detection)

## 📊 Data Structure

### Person Object
```typescript
interface Person {
  id: string;
  firstName: string;
  lastName: string;
  alias?: string;
  photoUrl?: string;
  classification: 'relevant' | 'irrelevant' | 'threat' | 'admin' | 'unknown';
  threatLevel: number; // 0-100
  position?: { lat: number; lng: number; label?: string; timestamp: number };
  publicInfo: { occupation?: string; employer?: string; email?: string; ... };
  sensitiveData?: { ssn?: string; creditCard?: string; ... };
  activities: Activity[];
  firstSeen: number;
  lastSeen: number;
}
```

### Activity Object
```typescript
interface Activity {
  id: string;
  personId: string;
  type: 'sighting' | 'communication' | 'transaction' | 'movement' | 'alert' | 'note';
  description: string;
  timestamp: number;
  location?: { lat: number; lng: number; label?: string };
}
```

## 🎬 Key Components

| Component | Purpose |
|-----------|---------|
| `HUDOverlay` | Main surveillance interface with grid, scanlines, status bars |
| `SurveillanceView` | Webcam feed with face detection overlay |
| `FaceBox` | Individual targeting reticle for detected faces |
| `DatabaseView` | Person management and search interface |
| `MapTrackingView` | Google Maps with subject markers |
| `TimelineView` | Chronological activity log |
| `NavigationSidebar` | Main navigation with system status |
| `BootSequence` | Cinematic initialization animation |

## 🎵 Sound Effects

The app includes synthesized sound effects (Web Audio API):
- **Beep**: System notification
- **Face Detected**: Ascending tone (400-800Hz)
- **Threat Alert**: Low pulsing tone (200Hz)
- **Classification**: Double beep
- **Scan**: Sweeping frequency (300-1500Hz)
- **Boot**: Layered startup sequence

Toggle sound with the speaker icon in the top-right corner.

## 🔐 Privacy & Security

- **No Cloud Storage**: All data stored locally in browser localStorage
- **Sensitive Data Masking**: Credit cards, SSNs masked as `****-****-****-1234`
- **No External Tracking**: No analytics or telemetry
- **Face Descriptors**: Stored locally, never sent to servers
- **Open Source**: Full code transparency

## 🤝 Contributing

Contributions welcome! Areas for enhancement:
- Additional face detection models (age, gender, emotion)
- Persistent backend database
- Multi-user collaboration
- Advanced threat prediction algorithms
- Custom surveillance zones
- Integration with real CCTV feeds

## 📝 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

**Alessandro Covre** - [@alessandro980](https://github.com/alessandro980)

## 🎓 Inspiration

This project is inspired by the TV series **Person of Interest** and the concept of "The Machine" - an AI surveillance system that can identify threats before they occur.

## ⚠️ Disclaimer

This is a **fictional entertainment application** for educational purposes. It demonstrates:
- Face detection technology
- Web application architecture
- UI/UX design principles
- Real-time data processing

**Not intended for actual surveillance or any illegal purposes.**

## 🐛 Known Limitations

- Face detection accuracy depends on lighting and angle
- Models require ~50MB initial download
- Works best in modern browsers (Chrome, Firefox, Safari, Edge)
- Webcam access required for surveillance features
- Google Maps requires internet connection

## 🚀 Future Enhancements

- [ ] Backend API for persistent storage
- [ ] Multi-user authentication
- [ ] Real-time collaboration
- [ ] Advanced threat prediction
- [ ] Custom model training
- [ ] Mobile app version
- [ ] Integration with public databases
- [ ] Automated alert system

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review the design philosophy in `ideas.md`

---

**"You are being watched. The government has a secret system..."** 🎬

*The Machine is now online.*
