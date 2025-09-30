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
1. Clone the repository
bash
Copy
git clone https://github.com/your-org/multi-restaurant-booking-app.git
cd multi-restaurant-booking-app
2. Install dependencies
Ensure you have Node.js (>=18) and npm or yarn installed.

bash
Copy
npm install
# or
yarn install
3. Install Expo CLI (if not installed)
bash
Copy
npm install -g expo-cli
4. Configure Environment Variables
Create a .env file in the project root with your backend API URL:

env
Copy
API_URL=https://your-fastapi-backend.com/api
▶️ Running the App
Start the Expo development server:

bash
Copy
npm start
# or
yarn start
This opens the Expo Developer Tools in your browser.

Press a to run on Android (emulator or connected device with Expo Go).
Press i to run on iOS (simulator or physical device with Expo Go).
Scan the QR code with the Expo Go app for instant testing.
📦 Project Structure
text
Copy
.
├── App.js                 # Entry point
├── assets/                # Static images, icons
├── components/            # Reusable UI components
├── navigation/            # React Navigation setup
├── screens/               # Application Screens
│   ├── LoginScreen.js
│   ├── RestaurantSelectorScreen.js   # <— NEW: pick restaurant after login
│   ├── ProfileScreen.js
│   ├── BookingsScreen.js
│   └── CreateBookingScreen.js
├── services/              
│   └── api.js             # API client for FastAPI endpoints
├── utils/                 
│   └── storage.js         # Auth & restaurant storage helpers
├── package.json
└── README.md
🔗 Backend Endpoints
The app interacts with the following FastAPI endpoints:

Auth & Profile
POST /auth/login → Authenticate user and return JWT token
GET /users/me → Fetch logged-in user profile
Restaurants
GET /restaurants → Fetch list of restaurants available to the user
GET /restaurants/{restaurant_id} → Get details of a specific restaurant
Bookings
GET /restaurants/{restaurant_id}/bookings → List bookings for a restaurant
POST /restaurants/{restaurant_id}/bookings → Create a new booking
DELETE /restaurants/{restaurant_id}/bookings/{booking_id} → Cancel a booking
Tables & Availability
GET /restaurants/{restaurant_id}/tables → Get available tables
GET /restaurants/{restaurant_id}/availability → Get booking availability slots
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
React Native → cross-platform mobile framework
Expo → development & build tooling
React Navigation → app navigation
Axios → HTTP client
AsyncStorage → persistent storage for auth & restaurant ID
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