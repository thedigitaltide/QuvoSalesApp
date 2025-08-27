# Quvo Sales App

A React Native mobile application for sales teams to monitor stockpile volumes and bay availability across Quvo facilities.

## Features

- **Auto-login** with Alan's credentials
- **Real-time bay monitoring** with volume, capacity, and status
- **Multi-facility support** (mrf, ewf, Ladybank)
- **Sales-focused UI** - clean, simple, no technical LiDAR details
- **Pull-to-refresh** for latest data
- **Cross-platform** - iOS and Android

## Key Screens

### Dashboard
- **Overview stats**: Total bays, volume, avg utilization
- **Bay cards**: Volume, capacity, material, last update
- **Status indicators**: Nearly Full, High, Available, Low Stock
- **Project switcher**: Switch between facilities

### Bay Status Colors
- 🔴 **Nearly Full** (90%+): Urgent attention needed
- 🟠 **High** (70-89%): Monitor closely  
- 🟢 **Available** (30-69%): Good stock levels
- ⚪ **Low Stock** (<30%): May need restocking

## Setup Instructions

### Prerequisites
- Node.js 18+
- React Native CLI
- Xcode (iOS development)
- Android Studio (Android development)

### Installation

1. **Clone and install dependencies:**
```bash
cd QuvoSalesApp
npm install
```

2. **iOS Setup:**
```bash
cd ios && pod install && cd ..
```

3. **Run the app:**
```bash
# iOS
npx react-native run-ios

# Android  
npx react-native run-android
```

## API Integration

The app connects to the Quvo API at:
- **Base URL**: `https://cireco.sachtlebentechnology.com/api/v1`
- **Authentication**: Auto-login with Alan's credentials
- **Main endpoints**:
  - `/auth/login` - Authentication
  - `/projects` - Facility list
  - `/dashboard/initial-fetch` - Bay data

## App Structure

```
src/
├── components/
│   ├── BayCard.js          # Individual bay status card
│   └── ProjectSwitcher.js  # Facility selector modal
├── context/
│   └── AuthContext.js      # Authentication state management
├── screens/
│   ├── LoginScreen.js      # Auto-login with credentials
│   └── DashboardScreen.js  # Main bay monitoring view
└── services/
    └── api.js              # API client with auto-auth
```

## Key Components

### BayCard
Shows critical sales information:
- Current volume vs capacity
- Visual progress bar with status colors
- Material type
- Last updated time
- Mass (if available)

### Dashboard Stats
- **Active Bays**: Total number of monitored bays
- **Total Volume**: Sum of all bay volumes  
- **Avg Utilization**: Average capacity percentage

## Sales Team Benefits

1. **Quick Stock Assessment**: See all bay levels at a glance
2. **Capacity Planning**: Visual indicators for space availability
3. **Material Tracking**: Know what's in each bay
4. **Multi-Site Monitoring**: Switch between facilities easily
5. **Real-Time Data**: Always current information
6. **Mobile Access**: Check status anywhere, anytime

## Troubleshooting

### Login Issues
- Check internet connection
- Verify API base URL is accessible
- Alan's credentials are hardcoded for auto-login

### Data Loading Issues  
- Pull down to refresh dashboard
- Check API connectivity
- Ensure facilities have active sensors

### Performance
- App caches data for offline viewing
- Pull-to-refresh updates all information
- Auto-retry on network errors

## Development Notes

- Built with React Native 0.81
- Uses React Navigation for screen management
- AsyncStorage for credential persistence
- Fetch API for network requests
- No complex state management needed - focus on simplicity

## Future Enhancements

- Push notifications for critical bay levels
- Historical trend charts
- Export functionality for reports
- Offline mode improvements
- User preferences/settings