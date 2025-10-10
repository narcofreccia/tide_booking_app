📱 Multi-Restaurant Booking App (React Native + Expo)
A cross-platform (Android/iOS) mobile app for customers and restaurant managers to:

🔑 Log in via FastAPI backend auth
🏨 Select a restaurant from a list of available restaurants
👤 View their profile
📅 Create new bookings
📋 List and manage bookings for the selected restaurant
🍽 View available tables and time slots
Built using React Native with Expo for rapid cross-platform development.
Powered by a FastAPI backend providing REST APIs for authentication, bookings, and restaurant management.

🚀 Getting Started

## Prerequisites
- Node.js >= 18 (currently using v20.16.0)
- npm or yarn
- Expo Go app on your mobile device (for testing)

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/multi-restaurant-booking-app.git
cd tide_booking_app
```

## 🗺️ Bookings Map Screen

The app includes an interactive map view of tables with live booking overlays and management features.

- **Location**: Bottom nav → Map tab (MaterialCommunityIcons `map-outline`)
- **File**: `screens/BookingsMapScreen.js`
- **Core components**:
  - `components/booking_manager/BookingsCanvas.js`
  - `components/booking_manager/TablesMapReadOnly.js` (SVG-based)
  - `components/booking_manager/SectionIntervalBar.js` (Section + Interval pickers for Map)
  - `components/booking_manager/IntervalSelector.js` (Interval-only picker for Bookings)
  - `components/booking_manager/BookingSummaryBar.js` (Reservation/guest count display)
  - `components/booking_manager/BookingDetailsModal.js`
  - `components/booking_manager/SwitchBookingPositionDrawer.js`
  - `components/booking_manager/WalkInModal.js`

### Features
- **Interactive Table Map**: Fetches floor, tables, and bookings via React Query
- **Performant SVG Rendering**: Scaled to screen width with smooth interactions
- **Pinch-to-Zoom**: Native iOS pinch gesture support (0.5x - 3x zoom)
  - Smooth, organic zoom with ScrollView's built-in capabilities
  - Full 2D scrolling with visible scrollbars
  - Zoom persists during navigation
- **Booking Details**: Tap on a table to open bottom-sheet with full booking information
- **Walk-In Bookings**: Create walk-in reservations directly from the table map
  - Quick access from empty tables or tables with existing bookings
  - Simple form with PAX and notes
  - Instant map refresh after creation
- **Table Switching**: Move bookings between tables with visual feedback
  - Tap "Sposta" button to enter switching mode
  - Select target table on map (highlighted in orange)
  - Confirm to move/swap bookings
- **Quick Status Changes**: Update booking status directly from map
  - Tap "Stato" button to open status selector
  - Translated status labels (pending, confirmed, seated, completed, etc.)
  - Instant map refresh with new status color
- **Edit Bookings**: Full booking edit functionality from table details
  - Modal-based editing with form validation
  - Phone number with country code enforcement
  - International phone format validation
- **Clickable Phone Numbers**: Tap phone numbers in booking list to call
  - Direct dialer integration with `tel:` links
  - Visual indication (underline + primary color)
- **Color-Coded Overlays**: Visual status indicators (see `constants/bookingStatusColors.js`)
- **Multi-Booking Support**: Diagonal split overlay for tables with multiple bookings
- **Compact Controls**: Section and Interval pickers as themed chips
- **Booking Summary**: Real-time reservation and guest counts
  - Shows total reservations and pax for selected date/interval
  - Compact icon-only pills for minimal space usage
  - Inline with search bar in BookingsScreen
- **Smart Customer Name Display**: Combines surname and name intelligently on table labels
- **Time Interval Filtering**: Filter bookings by service time (lunch, dinner, etc.)
- **Timezone-Safe Date Handling**: Local timezone formatting prevents date shift bugs

### Navigation changes
- Bottom tabs: `Bookings | Map | Create | Calendar | Settings`.
- Calendar moved to the fourth tab.
- Customers moved into Settings under "Restaurant Details" as a dedicated entry.

### Implementation notes
- Uses `react-native-svg` (no native rebuild required; works in Expo Go)
- **Pinch-to-zoom** implemented with ScrollView's native `minimumZoomScale` and `maximumZoomScale` props (iOS)
- Nested ScrollViews for 2D panning with visible scrollbars
- **SafeAreaView** from `react-native-safe-area-context` with `SafeAreaProvider` wrapper
- **Modal management**: Sequential modal transitions prevent crashes
  - Child modals (WalkIn, Edit, Status) don't auto-close parent modal
  - Prevents double-close race conditions on mobile
- **Interval state management**: Proper handling of time ranges across date changes
  - `BookingsMapScreen` resets interval selection when date changes
  - `SectionIntervalBar` auto-resets interval to null when no time ranges available
  - `BookingsCanvas` closes modal and resets state on date/interval changes
  - `BookingDetailsModal` conditionally shows action buttons only when valid interval exists
  - Prevents stale interval state from persisting across days with/without time ranges
- **Phone validation**: International format with country code enforcement
  - Minimum 7 digits, maximum 15 digits (E.164 standard)
  - Auto-formats with `+` prefix and spaces allowed
- **Date handling**: Local timezone formatting with `getFullYear()`, `getMonth()`, `getDate()`
  - Avoids `toISOString()` UTC conversion bugs
  - Consistent dates across screen navigation
- Smart query invalidation ensures instant UI updates after changes
- Minimal drawer design (~80-90px height) to maximize map visibility
- Table highlighting with orange border (#ff6b35) for visual feedback
- We evaluated `@shopify/react-native-skia` for even higher performance but it currently requires React 18. This project uses React 19, so Skia is not installed to avoid dependency conflicts.

### Theming & typography
- Map labels use the platform `System` font with increased sizes for legibility
  - Table number/pax: 12px, semibold
  - Time: 11px, medium
  - Customer name: 10px, regular
- Pickers are compact chips, primary-colored when active
- Action buttons: 36x36px with subtle shadows for modern appearance

### API Integration
- `POST /booking/switch_table_position` - Move/swap bookings between tables
- Automatic query invalidation for `bookings-by-date` and `tables-by-restaurant`
- See `TABLE_SWITCHING_IMPLEMENTATION.md` for detailed documentation

## 🌍 Multilingual Support (i18n)

The app supports multiple languages with a complete internationalization system:

### Supported Languages
- **Italian (it)** - Primary language (source translations)
- **English (en)** - Auto-translated
- **Spanish (es)** - Auto-translated

### Features
- **Language Selector**: Professional dropdown in Settings screen
- **Persistent Preference**: Language choice saved to AsyncStorage
- **Automatic Date Localization**: Dates formatted according to selected language
- **Translation Coverage**: All screens, components, and UI elements translated
- **Auto-Translation Script**: `npm run translate` to auto-translate missing keys using OpenAI

### File Structure
```
translations/
├── it.json          # Italian (source)
├── en.json          # English (auto-translated)
└── es.json          # Spanish (auto-translated)

hooks/
└── useTranslation.js # Translation hook

utils/
└── localeUtils.js    # Centralized locale mapping

scripts/
└── translate-missing.mjs # Auto-translation script
```

### Usage
```javascript
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <Text>{t('bookings.title')}</Text>
    <Text>{t('bookings.bookingCount', { count: 5 })}</Text>
  );
}
```

### Adding New Translations
1. Add keys to `translations/it.json` (Italian source)
2. Run `npm run translate` to auto-translate to other languages
3. Review and adjust auto-translations if needed

### Locale Utilities
Centralized locale mapping in `utils/localeUtils.js`:
- `getLocale(language)` - Get locale string (e.g., 'it-IT')
- `formatDateWithLocale(date, language, options)` - Format dates with locale support

## 🎤 Voice Recording & Transcription

The app includes a sophisticated voice booking feature with on-device speech-to-text transcription, multi-language support, and **full backend integration with AI-powered booking creation**.

### Features
- **Push-to-Talk Interface**: Press and hold to record, release to stop
- **Optimized Speech Recognition**: ⚡ **Instant Start** - Pre-initialized recognition captures first words
  - Speech recognition starts in ~50ms (previously ~500ms)
  - Pre-initialization on permission grant eliminates startup delay
  - Parallel execution of audio recording and transcription
  - No missed words at recording start
- **Real-Time Transcription**: On-device speech-to-text with partial results
- **Audio Visualization**: Animated 5-bar visualizer showing audio levels
- **Compact Fixed Timer**: Recording duration badge positioned top-right (no layout shift)
- **Confidence Scoring**: Intelligent quality assessment (typically 85-100%)
- **Backend Integration**: ✅ **PRODUCTION READY** - Complete AI-powered booking flow
  - Submits transcript to backend API (`POST /voice-intents/`)
  - AI extracts booking information (GPT-4o-mini)
  - Creates PENDING booking automatically
  - Shows confirmation modal for staff review
  - **Edit Before Confirm**: Staff can edit name, phone, email, adults, children
  - **Confirm Booking**: Updates status to CONFIRMED via `PATCH /booking/{id}/status`
  - **Cancel Booking**: Deletes booking via `DELETE /booking/{id}`
  - **Query Invalidation**: Auto-refreshes bookings list, calendar, and map after confirm/cancel
- **Multi-Language Detection**: Automatically detects Italian, English, and Spanish
  - Supports number words (due/two/dos, quattro/four/cuatro, etc.)
  - Context-aware party size extraction ("per 2", "for four", "para 6")
  - Time detection in all languages ("alle 20:00", "at 8 PM", "a las 20:00")
  - Smart name filtering (excludes common words like "Voglio", "Prenotazione", "Table")
- **Smart Token Extraction**: Extracts party size, time, and customer names
- **Quality Heuristics**: Flags low-confidence recordings for server verification
- **Language-Agnostic**: Detects all supported languages regardless of app language setting
- **Booking Confirmation Modal**: Full-featured modal with edit capabilities
  - Edit customer information (name, surname, phone, email)
  - Edit booking details (adults, children)
  - View booking date, time, and notes
  - Confirm or cancel with loading states
- **Streamlined No-Scroll UI**: Optimized layout that fits entire interface without scrolling
  - Fixed-position timer badge (top-right) prevents layout shifts
  - Flex-based layout adapts to all screen sizes
  - Compact component spacing for efficient screen usage
- **Privacy-Focused**: On-device processing with optional server fallback
- **Demo Mode**: Works in Expo Go with realistic multi-language test transcripts
- **Full Internationalization**: All UI text translated to Italian, English, and Spanish
- **Context Integration**: Uses global alert and loading system for consistent UX
- **Accessible from Multiple Screens**: Microphone button in both BookingsScreen and BookingsMapScreen headers
  - Consistent spacing and alignment across all screens
  - Same distance from logo for visual consistency

### Components
```
components/recorder/
├── VoiceRecorder.js                    # Main component with full UI
├── RecordingButton.js                  # Push-to-talk button with animations
├── TranscriptDisplay.js                # Real-time transcript viewer
├── AudioVisualizer.js                  # Audio level visualization
├── VoiceBookingConfirmationModal.js    # Booking review & confirmation modal
└── useVoiceRecording.js                # Custom hook for recording logic

components/settings/
└── VoiceRecordingSettings.js           # Settings UI for voice feature

services/
└── voiceApi.js                         # API service for voice intents

utils/
├── audioUtils.js                       # Audio processing & quality heuristics
└── permissionUtils.js                  # Permission handling
```

### Usage
```javascript
import { VoiceRecorder } from '../components/recorder/VoiceRecorder';

function BookingScreen() {
  return (
    <VoiceRecorder
      locale="it-IT"
      onTranscriptComplete={(result) => {
        // Optional: Handle transcript locally
        console.log('Transcript:', result.transcript);
        console.log('Confidence:', result.confidenceScore);
        // Note: Backend submission happens automatically!
      }}
      onError={(error) => console.error(error)}
    />
  );
}
```

**Note**: The component now **automatically submits to backend** after recording. When successful, a confirmation modal appears for staff to review and confirm the booking.

### Settings Configuration
Access via **Settings → Voice Recording**:
- **Enable/Disable**: Toggle voice booking feature
- **Permissions**: View and request microphone/speech recognition access
- **Default Language**: Select speech recognition locale (auto-syncs with app language)
  - 🇺🇸 English (US), 🇬🇧 English (UK)
  - 🇮🇹 Italiano (Italia)
  - 🇪🇸 Español (España), 🇲🇽 Español (México)
- **Confidence Threshold**: Adjust sensitivity (60%, 70%, 80%)

### Permissions Required
- **iOS**: `NSMicrophoneUsageDescription`, `NSSpeechRecognitionUsageDescription`
- **Android**: `RECORD_AUDIO`, `INTERNET`

### Quality Heuristics
The system evaluates transcription quality based on:
- Recording duration (optimal: 0.8-15 seconds)
- Word count (minimum: 2 words, optimal: 4-40 words)
- Presence of numbers in any language (party size indicators)
- Time references in any language (booking time)
- Real names (excludes 40+ common words across languages)
- Transcript length and completeness

**Typical confidence scores**: 85-100% for good recordings. Transcripts below the threshold are flagged for server verification with audio upload.

### Platform Support
- **Web**: Uses Web Speech API (Chrome, Edge) - **Production Ready**
- **iOS/Android (Expo Go)**: Demo mode with realistic multi-language transcripts
- **iOS/Android (Production)**: Requires `@react-native-voice/voice` and custom development build
  - iOS: Native Speech Framework
  - Android: Google Speech Recognition
  - See `VOICE_RECORDING_DEPLOYMENT.md` for deployment guide

### Backend Integration Flow
1. **Staff speaks** → "Tavolo per 4 alle 20:00 per Mario Rossi"
2. **Recording stops** → Client processes transcript
3. **Auto-submits** → `POST /voice-intents/` to backend
4. **AI extracts** → Party size, time, date, name (GPT-4o-mini)
5. **Booking created** → Status: PENDING, table auto-assigned
6. **Modal appears** → Staff reviews booking details
7. **Staff edits** (optional) → `PUT /booking/{id}` → Updates fields
8. **Staff confirms** → `PATCH /booking/{id}/status` → Status: CONFIRMED
9. **Queries invalidated** → Bookings list, calendar, and map refresh automatically
10. **Success!** → Booking complete and visible everywhere

**Alternative Flow - Cancel:**
- **Staff cancels** → `DELETE /booking/{id}` → Booking deleted
- **Queries invalidated** → UI refreshes automatically

### Demo Mode
When running in Expo Go, the feature generates realistic test transcripts in random languages:
- Italian: "Tavolo per 4 alle 20:00 per Mario Rossi"
- English: "Table for 2 at 19:30 for Emma Davis"
- Spanish: "Mesa para 6 a las 21:00 para Carlos García"

Perfect for testing UI/UX without needing a production build!

### API Documentation
For complete API integration details, see:
- `components/recorder/FRONTEND_INTEGRATION.md` - Full API documentation
- `components/recorder/INTEGRATION_COMPLETE.md` - Testing guide
- `components/recorder/FRONTEND_HANDOFF.md` - Quick start guide

## 🔧 Icon Mapping

All icons are centrally declared in `config/icons.js`. The Map tab uses:

```js
map: 'map-outline'
```

Use `getIcon(key)` and `getIconSize(sizeKey)` helpers to keep icons consistent across the app.

### Available Icon Categories
- **Booking related**: time, guests, table, email, phone, notes
- **Actions**: edit, delete, move, status, add, close
- **Navigation**: bookings, calendar, settings, home, back, map
- **Arrows/Pagination**: arrowLeft, arrowRight, chevronLeft, chevronRight, chevronUp, chevronDown
- **Status indicators**: confirmed, pending, cancelled, arrived, seated, completed
- **Accessibility**: wheelchair, highchair
- **General**: search, filter, sort, info, warning, error, success

2. **Install dependencies**
```bash
npm install
```

3. **Configure Environment Variables**

The app uses `app.config.js` for environment configuration. Update the `extra` section:

```js
"extra": {
  "environment": "development",
  "devServerUrl": "http://localhost:8000",
  "devServerUrlExpoGo": "http://192.168.10.102:8000", // For Expo Go on physical devices
  "prodServerUrl": "https://api.yourdomain.com"
}
```

**Important for Expo Go (Physical Devices):**
- `devServerUrl` is used for simulators/emulators (localhost)
- `devServerUrlExpoGo` is used when running in Expo Go on a physical device
- Set `devServerUrlExpoGo` to your computer's LAN IP address (e.g., `http://192.168.x.x:8000`)
- Ensure your backend is listening on `0.0.0.0:8000` (not just `127.0.0.1`)
- Both your phone and computer must be on the same WiFi network

For production builds, change `"environment"` to `"production"`.

Alternatively, you can create a `.env` file (copy from `.env.example`):
```env
APP_ENV=development
DEV_SERVER_URL=http://localhost:8000
DEV_SERVER_EXPO_URL=http://192.168.x.x:8000
PROD_SERVER_URL=https://api.yourdomain.com
PUBLIC_KEY=your_public_key_here
```

**Finding your LAN IP:**
```bash
# macOS/Linux
ipconfig getifaddr en0
# or
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

## Running the App

Start the Expo development server:
```bash
npm start
```


- Press `a` to run on Android (emulator or connected device with Expo Go)
- Press `i` to run on iOS (simulator or physical device with Expo Go)
- Scan the QR code with the Expo Go app for instant testing

## Current Implementation## ✨ Features

✅ **Completed**
- **Modern theme system** with Dark and Light modes
  - Dark Theme ("Nocturne Neo") - Elegant dark mode
  - Light Theme ("Aurora Daylight") - Fresh light mode
  - Theme toggle in Settings screen
  - Persistent theme preference across sessions
- **Proper SafeAreaView implementation** for iOS notch/rounded corners on all screens
- Global state management with React Context + useReducer
- **Authentication flow** with login/logout and silent token refresh
- **Refresh token support** for mobile with automatic token rotation
- **Multilingual support** with i18n system (Italian, English, Spanish)
  - Language selector in Settings screen
  - Persistent language preference across sessions
  - Automatic date/time localization based on selected language
  - Translation script for auto-translating missing keys
  - Centralized locale utilities for consistent formatting
- Form validation with React Hook Form + Yup
- API integration with Axios and TanStack Query
- Reusable UI components (Notification, ConfirmDialog, Loading, LoadingState, SelectRestaurant, DateSelector, Pagination, OrderingList, TideLogo, LanguageSelector)
- Bottom tab navigation with professional MaterialCommunityIcons
- Persistent auth storage with AsyncStorage
- **Swipeable booking rows** with gesture-based actions (Edit, Delete, Update Status, Move)
- **Role-based permissions** (Delete only for Admin/Owner)
- **Booking management**: Create, Edit, Delete, Change Status
- **Booking Source Indicators**: Visual icons show booking origin
  - 🎤 **Microphone icon** - Voice bookings (when `restaurant_notes` contains `[AI]`)
  - 🌐 **Web icon** - Online bookings (when `temp_id` is not null)
  - Icons appear next to customer name for instant recognition
- Real-time bookings list with date selector, search, and pagination
- **Time interval filtering** on BookingsScreen - Filter by lunch, dinner, or all times
- **Inline booking summary** - Reservation and guest counts next to search bar
- **Quick access to Customers** - Icon button in BookingsScreen header for easy navigation
- **Persistent booking date selection** across app sessions
- Full booking creation form with validation and API integration
- Available times fetched from backend calendar rules
- Tide logo displayed in all screen headers
- **Centralized icon configuration** (`config/icons.js`) for consistent UI
- **Professional MaterialCommunityIcons** throughout the app (no emojis)
- Icon mapping with semantic keys (e.g., `'user'`, `'table'`, `'email'`)
- Standardized icon sizes via `getIconSize()` helper
- **Status change modal** with visual status selection
- **Edit booking modal** reusing CreateBookingScreen component
- **Map view of tables (Bookings Map)** with real-time booking overlays
- **Monthly calendar view** with real-time booking data from backend API
- **Calendar components**: 
  - MonthSelector with previous/next navigation
  - Simplified DayCard showing only total bookings and guests
  - DayDetailsModal with full interval breakdown
- **Clean calendar grid** with consistent card heights and 7-day week layout
- **Interactive day cards** - tap to view detailed time intervals and statistics
- **Visual indicators**: Today's date highlighted, closed days grayed out
- **Daily booking statistics** with booking counts and total guests per day
- **Time interval details** in modal showing breakdown by service periods
- **Customer management** with real-time data from backend API
- **Customer components**:
  - **OrderingList** - Reusable sorting component (moved to `/components`)
  - CustomerRow showing detailed customer statistics
- **Customer statistics**: Total bookings, no-shows, cancellations, last booking date
- **Search functionality** for customers by name, email, or phone
- **Sortable customer list** by bookings, no-shows, cancellations, or last booking
- **Paginated customer list** with 20 customers per page
- **Password Change** - Secure password update with validation
  - React Hook Form with Yup validation
  - Password strength requirements (8+ chars, uppercase, lowercase, number)
  - Show/hide password toggle
  - Confirm password matching
  - Real-time validation feedback
  - Success/error notifications
- **Support Modal** - Help and support information
  - Configurable support page URL via environment variable
  - Support hours and response time information
  - Direct link to open support page
- **Streamlined Settings Screen**
  - Removed clutter: Restaurant Details, Table Management, Email Notifications, Team Members, Billing, Terms & Privacy
  - Role-based visibility for Operating Hours (Admin/Owner/Manager only)
  - Focus on essential settings: Language, Theme, Voice Recording, Password, Support
- **Voice Recording & Transcription** - Push-to-talk voice booking feature
  - On-device speech-to-text transcription
  - Real-time partial transcript display
  - Audio level visualization with animated bars
  - Confidence scoring and quality heuristics
  - Automatic detection of party size, time, and customer name
  - Low-confidence flagging for server verification
  - Configurable settings (locale, confidence threshold)
  - Platform-specific permissions (iOS/Android)
  - Privacy-focused with temporary audio storage
  - Haptic feedback for recording start/stop
  - Visual recording indicator with pulse animation
- **Pull-to-refresh** on data screens (Bookings, Calendar, Customers) using native RefreshControl integrated with React Query `refetch()`
- **API Service** (`services/api.js`)
  - Axios client with request/response interceptors
  - Login endpoint with OAuth2PasswordRequestForm support
  - All CRUD endpoints for restaurants, bookings, tables, availability
- **Storage Utilities** (`utils/storage.js`)
  - Secure token storage (SecureStore on native, AsyncStorage on web)
  - **Refresh token storage** for silent token refresh
  - User data persistence
  - Restaurant ID and public key management
- **Token Refresh System**
  - Automatic silent token refresh on 401 errors
  - Request queuing during token refresh
  - Token rotation with new refresh tokens
  - Secure storage of refresh tokens
- **Global Context** (`context/`)
  - ContextProvider with useReducer for global state management
  - Reducer with currentUser, alert, dialog, and loading state
  - Integrated with login/logout flow
  - Auto-persists currentUser to AsyncStorage
  - Custom hooks: `useStateContext()` and `useDispatchContext()`
- **Theme System** (`theme/`)
  - ThemeProvider for centralized styling
  - Modern dark theme with comprehensive design tokens
  - Includes colors, typography, spacing, shadows, and component styles
  - Custom hook: `useTheme()`
  - Easily customizable and extendable
- **UI Components** (`components/`)
  - Notification component with animated alerts (success, error, warning, info)
  - ConfirmDialog component for confirmation dialogs
  - Loading component with animated dots for global loading state
  - LoadingState component with pulse animations
  - SelectRestaurant component for restaurant selection dropdown
  - DateSelector component for date navigation with arrows
  - Pagination component for paginated data (reusable)
  - All integrated with global context
- **API Services** (`services/`)
  - Organized by domain for separation of concerns
  - **apiClient.js**: Axios configuration with interceptors
  - **authApi.js**: Login and user profile endpoints
  - **restaurantApi.js**: Restaurant data and selection
  - **bookingApi.js**: Bookings, tables, and availability
  - Centralized error handling and token management
- **Screens** (`screens/`)
  - **LoginScreen**: Email/password validation with Yup, themed UI
  - **HomeScreen**: Main app screen with bottom navigation
  - **BookingsScreen**: Real-time bookings with date selector, search, pagination, and status indicators
  - **BookingsMapScreen**: Read-only floor map with tables and booking overlays
  - **CalendarScreen**: Calendar view with booking indicators
  - **CreateBookingScreen**: Full booking form with validation, date/time selection, guest management, accessibility options
  - **CustomersScreen**: Customer database with search
  - **SettingsScreen**: Restaurant selection, user profile with features/business ID, app settings
  - **PasswordChangeScreen**: Secure password update with validation and requirements display
  - All screens use theme system for consistent styling

🚧 **In Progress / TODO**
- Backend integration for all screens
- Real-time booking updates
- Restaurant selection flow
- Advanced filtering and search
📦 Project Structure

**Current Structure:**
```
.
├── App.js                 # Entry point with ContextProvider & QueryClientProvider
├── app.json               # Expo configuration with env variables
├── babel.config.js        # Babel config with reanimated plugin
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── assets/                # Static images, icons
├── config/
│   ├── env.js             # Environment configuration handler with Expo Go detection
│   └── icons.js           # Centralized icon mapping (MaterialCommunityIcons)
├── components/
│   ├── Notification.js    # Animated alert notifications
│   ├── ConfirmDialog.js   # Confirmation dialog modal
│   ├── Loading.js         # Global loading overlay
│   ├── LoadingState.js    # Animated loading dots
│   ├── SelectRestaurant.js # Restaurant selection dropdown
│   ├── LanguageSelector.js # Language selection dropdown
│   ├── ThemeToggle.js     # Dark/Light theme toggle
│   ├── DateSelector.js    # Date navigation with arrows
│   ├── Pagination.js      # Reusable pagination controls
│   ├── SimpleField.js     # Reusable form input field
│   ├── TideLogo.js        # Tide logo component
│   ├── bookings/          # Bookings components
│   │   ├── BookingRow.js  # Swipeable booking card
│   │   ├── BookingRowActions.js # Swipe actions (Move, Update Status, Edit, Delete)
│   │   ├── ChangeBookingStatus.js # Status change modal
│   │   └── EditBookingModal.js # Edit booking modal wrapper
│   ├── new_booking/       # Booking form components
│   │   ├── NewBookingDatePicker.js
│   │   ├── AvailableTimes.js
│   │   ├── SimplePhoneField.js
│   │   ├── BookingStatus.js
│   │   ├── AccessibilityOptions.js
│   │   └── Pax.js
│   ├── booking_manager/   # Map view components
│   │   ├── BookingsCanvas.js
│   │   ├── TablesMapReadOnly.js
│   │   ├── SectionIntervalBar.js # Section + Interval selectors (Map)
│   │   ├── IntervalSelector.js   # Interval-only selector (Bookings)
│   │   ├── BookingSummaryBar.js  # Reservation/guest count display
│   │   ├── BookingDetailsModal.js
│   │   ├── SwitchBookingPositionDrawer.js
│   │   └── WalkInModal.js
│   ├── password_change/   # Password change components
│   │   └── PasswordField.js      # Password input with show/hide toggle
│   ├── settings/          # Settings components
│   │   ├── SupportModal.js       # Support information modal
│   │   └── VoiceRecordingSettings.js # Voice recording configuration
│   ├── recorder/          # Voice recording components
│   │   ├── VoiceRecorder.js      # Main voice recording component
│   │   ├── RecordingButton.js    # Push-to-talk button
│   │   ├── TranscriptDisplay.js  # Transcript viewer
│   │   ├── AudioVisualizer.js    # Audio level visualization
│   │   └── useVoiceRecording.js  # Recording hook
│   └── calendar/          # Calendar components
│       ├── MonthSelector.js
│       ├── DayCard.js
│       └── DayDetailsModal.js
├── context/
│   ├── ContextProvider.js # Global state provider with React Context
│   └── reducer.js         # Reducer for global state management
├── hooks/
│   ├── useAuth.js         # Authentication hooks (login, logout, currentUser)
│   └── useTranslation.js  # Translation hook for i18n
├── theme/
│   ├── ThemeProvider.js   # Theme provider component
│   ├── darkTheme.js       # Dark theme configuration
│   ├── index.js           # Theme exports
│   └── README.md          # Theme documentation
├── services/
│   ├── api.js             # Central API exports
│   ├── apiClient.js       # Axios client configuration
│   ├── authApi.js         # Authentication endpoints
│   ├── restaurantApi.js   # Restaurant endpoints
│   ├── bookingApi.js      # Booking & availability endpoints
│   ├── userApi.js         # User management endpoints (password update)
│   └── getUserRole.js     # User role utilities (isAdmin, isOwner, etc.)
├── utils/
│   ├── storage.js         # Auth & data persistence utilities
│   ├── localeUtils.js     # Centralized locale mapping and formatting
│   ├── audioUtils.js      # Audio processing & quality heuristics
│   └── permissionUtils.js # Permission handling utilities
├── translations/
│   ├── it.json            # Italian translations (source)
│   ├── en.json            # English translations (auto-translated)
│   └── es.json            # Spanish translations (auto-translated)
├── scripts/
│   └── translate-missing.mjs # Auto-translation script using OpenAI
├── validation/
│   ├── bookingValidation.js # Booking form validation schema
│   └── passwordValidation.js # Password change validation schema
├── screens/
│   ├── LoginScreen.js         # Login with form validation
│   ├── HomeScreen.js          # Main app with bottom navigation
│   ├── BookingsScreen.js      # Bookings list and management
│   ├── BookingsMapScreen.js   # Interactive table map view
│   ├── CalendarScreen.js      # Calendar view
│   ├── CreateBookingScreen.js # Create new booking form
│   ├── CustomersScreen.js     # Customer database
│   ├── SettingsScreen.js      # Settings and profile
│   └── PasswordChangeScreen.js # Password change form
└── README.md              # This file
```

**Planned Structure:**
```
.
├── App.js                 # Entry point with ContextProvider & QueryClientProvider
├── components/            # ✅ Reusable UI components
│   ├── Notification.js    # ✅ Alert notifications
│   ├── ConfirmDialog.js   # ✅ Confirmation dialogs
│   ├── Loading.js         # ✅ Global loading overlay
│   ├── LoadingState.js    # ✅ Animated loading dots
│   ├── SelectRestaurant.js # ✅ Restaurant dropdown
│   ├── DateSelector.js    # ✅ Date navigation
│   └── Pagination.js      # ✅ Pagination controls
├── context/               # ✅ Global state management with React Context
│   ├── ContextProvider.js # ✅ Context provider
│   └── reducer.js         # ✅ State reducer
├── hooks/                 # ✅ Custom React hooks
│   └── useAuth.js         # ✅ Authentication hooks
├── theme/                 # ✅ Theme system
│   ├── ThemeProvider.js   # ✅ Theme provider
│   ├── darkTheme.js       # ✅ Dark theme config
│   └── index.js           # ✅ Theme exports
├── navigation/            # React Navigation setup
│   ├── RootNavigator.js
│   ├── AuthNavigator.js
│   └── AppNavigator.js
├── screens/               # Application Screens
│   ├── LoginScreen.js         # ✅ Completed
│   ├── HomeScreen.js          # ✅ Completed
│   ├── BookingsScreen.js      # ✅ Completed
│   ├── CalendarScreen.js      # ✅ Completed
│   ├── CreateBookingScreen.js # ✅ Completed
│   ├── CustomersScreen.js     # ✅ Completed
│   └── SettingsScreen.js      # ✅ Completed
├── services/              # ✅ API layer (organized by domain)
│   ├── api.js             # ✅ Central exports
│   ├── apiClient.js       # ✅ Axios configuration
│   ├── authApi.js         # ✅ Auth endpoints
│   ├── restaurantApi.js   # ✅ Restaurant endpoints
│   └── bookingApi.js      # ✅ Booking endpoints
└── utils/                 
    └── storage.js         # ✅ Auth & restaurant storage helpers
```
🌐 Global Context (State Management)

The app uses React Context API with `useReducer` for global state management.

### Usage

**Accessing State:**
```javascript
import { useStateContext } from '../context/ContextProvider';

function MyComponent() {
  const { currentUser } = useStateContext();
  
  return <Text>Welcome, {currentUser?.name}</Text>;
}
```

**Dispatching Actions:**
```javascript
import { useDispatchContext } from '../context/ContextProvider';

function MyComponent() {
  const dispatch = useDispatchContext();
  
  // Update current user
  dispatch({ 
    type: 'UPDATE_CURRENT_USER', 
    payload: { id: 1, name: 'John', email: 'john@example.com' } 
  });
  
  // Reset current user (on logout)
  dispatch({ type: 'RESET_CURRENT_USER' });
}
```

### Available Actions

**User Management:**
- **`UPDATE_CURRENT_USER`** - Set the current logged-in user
  - Payload: User object `{ id, business_id, name, email, role, features }`
- **`RESET_CURRENT_USER`** - Clear the current user (logout)
  - Payload: None

**Notifications:**
- **`UPDATE_ALERT`** - Show/hide alert notification
  - Payload: `{ open: boolean, severity: 'success'|'error'|'warning'|'info', message: string }`

**Dialogs:**
- **`OPEN_DIALOG`** - Open confirmation dialog
  - Payload: `{ title: string, message: string, onSubmit: function }`
- **`CLOSE_DIALOG`** - Close confirmation dialog
  - Payload: None

**Loading:**
- **`START_LOADING`** - Show global loading overlay
  - Payload: None
- **`END_LOADING`** - Hide global loading overlay
  - Payload: None

**Restaurant Selection:**
- **`UPDATE_SELECTED_RESTAURANT`** - Set the selected restaurant
  - Payload: `{ id: number, name: string, public_key: string }`
- **`RESET_SELECTED_RESTAURANT`** - Clear the selected restaurant
  - Payload: None

### State Structure

```javascript
{
  currentUser: null | {
    id: number,
    business_id: number,
    restaurant_id: number,
    name: string,
    email: string,
    role: string,
    features: string[]
  },
  alert: {
    open: boolean,
    severity: 'success' | 'error' | 'warning' | 'info',
    message: string
  },
  dialog: {
    open: boolean,
    close: boolean,
    title: string,
    message: string,
    onSubmit: function | undefined
  },
  loading: boolean,
  selectedRestaurant: {
    id: number | null,
    name: string | null,
    public_key: string | null
  }
}
```

### Integration with Authentication

The context is automatically updated by the `useLogin` and `useLogout` hooks:
- **Login**: Sets `currentUser` with user data from the API and automatically sets `selectedRestaurant` if user has a restaurant_id
- **Logout**: Resets `currentUser` to `null` and clears `selectedRestaurant`

### UI Components

**Notification Component:**
```javascript
// Show success notification
dispatch({ 
  type: 'UPDATE_ALERT', 
  payload: { 
    open: true, 
    severity: 'success', 
    message: 'Operation completed successfully!' 
  } 
});
```

**ConfirmDialog Component:**
```javascript
// Show confirmation dialog
dispatch({
  type: 'OPEN_DIALOG',
  payload: {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onSubmit: () => {
      // Execute action when user confirms
      performAction();
    }
  }
});
```

**Loading Component:**
```javascript
// Show global loading
dispatch({ type: 'START_LOADING' });

// Perform async operation
await someAsyncOperation();

// Hide loading
dispatch({ type: 'END_LOADING' });
```

## 📱 Bottom Navigation

The HomeScreen features a bottom navigation bar with 5 tabs using professional Ionicons:

1. **Bookings** - View and manage all restaurant bookings
2. **Calendar** - Calendar view with booking indicators
3. **Create** - Center floating action button to create new bookings
4. **Customers** - Customer database with search functionality
5. **Settings** - App settings, profile, and logout

Icons are provided by `@expo/vector-icons` (Ionicons) for a professional, native look. All screens are fully themed.

## 🔄 Pull-to-Refresh

- **Where**: `BookingsScreen`, `CalendarScreen`, `CustomersScreen`.
- **How it works**: Uses React Native `RefreshControl` attached to each screen's `ScrollView` and wired to TanStack Query's `refetch()`.
- **Behavior**: Pulling down triggers a fresh fetch from the backend and shows a native spinner. Query caches are respected; manual refresh always fetches new data.

## 🌐 Environment Configuration

The app automatically detects the runtime environment and uses the appropriate API URL:

**`config/env.js`** intelligently selects the API URL based on:
- **Expo Go** (`Constants.appOwnership === 'expo'`): Uses `devServerUrlExpoGo` for physical device testing over LAN
- **Simulator/Emulator**: Uses `devServerUrl` (localhost)
- **Production builds**: Uses `prodServerUrl`

**Configuration in `app.config.js`:**
```js
extra: {
  tideSupportPage: process.env.TIDE_SUPPORT_URL || 'https://tideexperience.com/support',
  environment: process.env.APP_ENV || 'development',
  devServerUrl: process.env.DEV_SERVER_URL || "http://localhost:8000",
  devServerUrlExpoGo: process.env.DEV_SERVER_EXPO_URL || 'http://192.168.x.x:8000',
  prodServerUrl: process.env.PROD_SERVER_URL || "https://your-api.com"
}
```
**Debug logging**: The app logs the active configuration on startup to help verify which URL is being used.

## 🎨 Theme System

The app features a comprehensive theme system with **Dark** and **Light** modes that users can toggle.

{{ ... }}
- **Dark Theme** ("Nocturne Neo") - Elegant dark mode with deep blue-gray backgrounds
- **Light Theme** ("Aurora Daylight") - Fresh, clean light mode with cool-neutral tones
- **Theme Toggle** - Switch between modes in Settings screen
- **Persistent Preference** - Theme choice saved to AsyncStorage

### Usage

```javascript
import { useTheme, useThemeMode } from '../theme';

function MyComponent() {
  const theme = useTheme();
  const { themeMode, toggleTheme } = useThemeMode();

  return (
    <View style={{ backgroundColor: theme.palette.background.paper }}>
      <Text style={{ color: theme.palette.text.primary }}>
        Current theme: {themeMode}
      </Text>
      <Button onPress={toggleTheme}>Toggle Theme</Button>
    </View>
  );
}
```

### Theme Features

- **Colors**: Primary (Fresh teal-mint), secondary (Bright blue), error, warning, info, success palettes
- **Typography**: Font families, sizes, weights, line heights, letter spacing
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, xxl)
- **Border Radius**: Predefined border radius values (sm, md, lg, xl, full)
- **Shadows**: Platform-specific shadow configurations with proper elevation
- **Component Styles**: Pre-configured styles for buttons, inputs, cards, tabs, chips, tooltips, modals
- **Motion**: Duration and easing configurations for animations
- **Z-Index**: Layering system for drawers, modals, snackbars, tooltips

### Theme Files
- `/theme/darkTheme.js` - Dark theme configuration
- `/theme/lightTheme.js` - Light theme configuration
- `/theme/ThemeProvider.js` - Theme provider with mode switching
- `/components/ThemeToggle.js` - Theme toggle component

### Customization

Edit `/theme/darkTheme.js` or `/theme/lightTheme.js` to customize themes. The theme system automatically handles persistence and switching.

🔗 Backend Endpoints

The app interacts with the following FastAPI endpoints:

### Auth & Profile
- **POST /login** → Authenticate user and return JWT token
  - Body: `OAuth2PasswordRequestForm` (username, password)
  - Query params: `public_key` (optional)
  - Returns: `Token` object with user data, access token, and features
- **GET /users/me** → Fetch logged-in user profile

### Restaurants
- **GET /restaurants** → Fetch list of restaurants available to the user
- **GET /restaurants/{restaurant_id}** → Get details of a specific restaurant

### Bookings
- **GET /restaurants/{restaurant_id}/bookings** → List bookings for a restaurant
- **POST /restaurants/{restaurant_id}/bookings** → Create a new booking
- **DELETE /restaurants/{restaurant_id}/bookings/{booking_id}** → Cancel a booking

### Tables & Availability
- **GET /restaurants/{restaurant_id}/tables** → Get available tables
- **GET /restaurants/{restaurant_id}/availability** → Get booking availability slots

### Login Response Schema
```javascript
{
  id: number,
  business_id: number | null,
  name: string,
  email: string,
  role: string,
  accessToken: string,
  token_type: "bearer",
  features: string[]
}
```
🔄 User Flow
Login
User authenticates with /auth/login.
Restaurant Selection
App fetches /restaurants.
User selects from the list.
Selected restaurant_id is stored in app state.
Profile & Bookings
/users/me retrieves profile data.
/restaurants/{restaurant_id}/bookings lists bookings.
Create Booking
User selects table/slot → POST /restaurants/{restaurant_id}/bookings.
Manage Booking
Cancel bookings via DELETE /restaurants/{restaurant_id}/bookings/{id}.
Switching restaurants reloads the selection and associated data.
🛡 Authentication & Multi-Tenant Handling
JWT tokens are stored securely (AsyncStorage or SecureStore).
Active restaurant_id is stored in global app state and in persistent storage.
All API calls include:
Authorization: Bearer <token>
Scoped URL with restaurant_id.
⚡️ Tech Stack
**Frontend**
- React Native 0.81 → cross-platform mobile framework
- Expo SDK 54 → development & build tooling
- React Navigation 7 → app navigation (native-stack, bottom-tabs)
- React Native Reanimated → animations
- React Native Gesture Handler → touch interactions

**Data & Networking**
- Axios → HTTP client for FastAPI REST endpoints
- TanStack Query (React Query) → server state management, caching, and data fetching
- AsyncStorage → persistent storage for auth tokens
- Expo SecureStore → secure storage for sensitive data (JWT)
- Expo Constants → environment configuration

**Form Validation**
- React Hook Form → performant form state management
- Yup → schema validation for forms
- @hookform/resolvers → integration between React Hook Form and Yup

**Development**
- JavaScript (ES6+)
- Babel → transpilation with react-native-reanimated plugin
- Metro → React Native bundler
📱 Deployment
Android
Build APK or AAB with Expo EAS:

bash
Copy
eas build -p android --profile production
iOS
Requires Apple Developer account. Build IPA with Expo EAS:

bash
Copy
eas build -p ios --profile production
Private Distribution
Android: Share .apk directly (sideloading).
iOS: Use TestFlight or Enterprise Distribution.
🤝 Contributing
Fork the repo
Create a feature branch: git checkout -b feature/my-feature
Commit changes: git commit -m 'Add my feature'
Push branch: git push origin feature/my-feature
Open a Pull Request
📄 License
MIT

✅ Now you’ve got a production-ready README.md scaffold for your multi-restaurant booking app.

👉 Do you also want me to add a starter api.js service file (with login, fetchRestaurants, fetchBookings, etc.) so you can kickstart coding immediately?