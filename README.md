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

2. **Install dependencies**
```bash
npm install
```

3. **Configure Environment Variables**

The app uses `app.json` for environment configuration. Update the `extra` section in `app.json`:

```json
"extra": {
  "environment": "development",
  "devServerUrl": "http://localhost:8000",
  "prodServerUrl": "https://api.yourdomain.com"
}
```

For production builds, change `"environment"` to `"production"`.

Alternatively, you can create a `.env` file (copy from `.env.example`):
```env
DEV_SERVER_URL=http://localhost:8000
PROD_SERVER_URL=https://api.yourdomain.com
NODE_ENV=development
PUBLIC_KEY=your_public_key_here
```

## Running the App

Start the Expo development server:
```bash
npm start
```

This opens the Expo Developer Tools in your browser.

- Press `a` to run on Android (emulator or connected device with Expo Go)
- Press `i` to run on iOS (simulator or physical device with Expo Go)
- Scan the QR code with the Expo Go app for instant testing

## Current Implementation Status

✅ **Completed**
- Project initialization with Expo SDK 54
- Core dependencies installed (React Native, React Navigation, TanStack Query, Axios)
- Form validation with React Hook Form + Yup
- Environment configuration (DEV_SERVER_URL, PROD_SERVER_URL)
- Babel configuration with react-native-reanimated plugin
- **API Service** (`services/api.js`)
  - Axios client with request/response interceptors
  - Login endpoint with OAuth2PasswordRequestForm support
  - All CRUD endpoints for restaurants, bookings, tables, availability
- **Storage Utilities** (`utils/storage.js`)
  - Secure token storage (SecureStore on native, AsyncStorage on web)
  - User data persistence
  - Restaurant ID and public key management
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
  - **BookingsScreen**: View and manage restaurant bookings
  - **CalendarScreen**: Calendar view with booking indicators
  - **CreateBookingScreen**: Form to create new bookings
  - **CustomersScreen**: Customer database with search
  - **SettingsScreen**: Restaurant selection, user profile with features/business ID, app settings
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
│   └── env.js             # Environment configuration handler
├── components/
│   ├── Notification.js    # Animated alert notifications
│   ├── ConfirmDialog.js   # Confirmation dialog modal
│   ├── Loading.js         # Global loading overlay
│   ├── LoadingState.js    # Animated loading dots
│   └── SelectRestaurant.js # Restaurant selection dropdown
├── context/
│   ├── ContextProvider.js # Global state provider with React Context
│   └── reducer.js         # Reducer for global state management
├── hooks/
│   └── useAuth.js         # Authentication hooks (login, logout, currentUser)
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
│   └── bookingApi.js      # Booking & availability endpoints
├── utils/
│   └── storage.js         # Auth & data persistence utilities
├── screens/
│   ├── LoginScreen.js         # Login with form validation
│   ├── HomeScreen.js          # Main app with bottom navigation
│   ├── BookingsScreen.js      # Bookings list and management
│   ├── CalendarScreen.js      # Calendar view
│   ├── CreateBookingScreen.js # Create new booking form
│   ├── CustomersScreen.js     # Customer database
│   └── SettingsScreen.js      # Settings and profile
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
│   └── SelectRestaurant.js # ✅ Restaurant dropdown
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
- **Login**: Sets `currentUser` with user data from the API
- **Logout**: Resets `currentUser` to `null`

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

The HomeScreen features a bottom navigation bar with 5 tabs:

1. **Bookings** (📋) - View and manage all restaurant bookings
2. **Calendar** (📅) - Calendar view with booking indicators
3. **Create** (+) - Center floating action button to create new bookings
4. **Customers** (👥) - Customer database with search functionality
5. **Settings** (⚙️) - App settings, profile, and logout

All screens are fully themed and include mock data for demonstration.

## 🎨 Theme System

The app uses a centralized theme system for consistent styling across all components.

### Usage

```javascript
import { useTheme } from '../theme';

function MyComponent() {
  const theme = useTheme();

  return (
    <View style={{ backgroundColor: theme.palette.background.paper }}>
      <Text style={{ color: theme.palette.text.primary }}>
        Themed Text
      </Text>
    </View>
  );
}
```

### Theme Features

- **Colors**: Primary, secondary, error, warning, info, success palettes
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, xxl)
- **Border Radius**: Predefined border radius values
- **Shadows**: Platform-specific shadow configurations
- **Component Styles**: Pre-configured styles for buttons, inputs, cards

### Customization

Edit `/theme/darkTheme.js` to customize the theme. See `/theme/README.md` for detailed documentation.

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