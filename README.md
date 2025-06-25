# Rideverse App

A modern ride-booking application built with React Native and Expo.

## Features

- User authentication with Clerk
- Real-time ride booking and tracking
- Secure payment processing
- Cross-platform support (iOS, Android, Web)

## Tech Stack

- React Native
- Expo
- Clerk Authentication
- Supabase
- TypeScript

## Prerequisites

- Node.js (LTS version)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Installation

1. Clone the repository

```bash
git clone [repository-url]
cd Rideverse-app
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the development server

```bash
npm start
# or
yarn start
```

## Development Mode Testing Credentials

### Phone Verification

- Test Phone Number: +19735550197
- For new accounts: Use the same number but replace the last 2 digits
- OTP Code: 424242

### Email Verification

- Use any email address
- OTP will be sent to the provided email

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run on web browser

## Project Structure

```
├── src/
│   ├── components/     # Reusable components
│   ├── config/         # Configuration files
│   ├── navigation/     # Navigation setup
│   ├── screens/        # Application screens
│   └── types/          # TypeScript type definitions
├── assets/            # Static assets
└── App.tsx           # Application entry point
```
