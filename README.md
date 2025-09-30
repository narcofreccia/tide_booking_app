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
- **LoginScreen** (`screens/LoginScreen.js`)
  - Email/password validation with Yup
  - Optional public key field for restaurant-specific login
  - Error handling for backend responses
  - Loading states and accessibility

🚧 **In Progress / TODO**
- Navigation structure (Auth stack, Restaurant selector, App tabs)
- Additional screen components (Profile, Bookings, Create Booking)
- Restaurant selection flow
- Auth context/state management
- Logout functionality
📦 Project Structure

**Current Structure:**
```
.
├── App.js                 # Entry point with QueryClientProvider
├── app.json               # Expo configuration with env variables
├── babel.config.js        # Babel config with reanimated plugin
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── assets/                # Static images, icons
├── config/
│   └── env.js             # Environment configuration handler
├── services/
│   └── api.js             # Axios client + all API endpoints
├── utils/
│   └── storage.js         # Auth & data persistence utilities
├── screens/
│   └── LoginScreen.js     # Login with form validation
└── README.md              # This file
```

**Planned Structure:**
```
.
├── App.js                 # Entry point with QueryClientProvider
├── components/            # Reusable UI components
├── navigation/            # React Navigation setup
│   ├── RootNavigator.js
│   ├── AuthNavigator.js
│   └── AppNavigator.js
├── screens/               # Application Screens
│   ├── LoginScreen.js
│   ├── RestaurantSelectorScreen.js
│   ├── ProfileScreen.js
│   ├── BookingsScreen.js
│   └── CreateBookingScreen.js
├── services/              
│   └── api.js             # Axios client for FastAPI endpoints
├── utils/                 
│   └── storage.js         # Auth & restaurant storage helpers
└── context/               # React Context for global state (optional)
```
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