# Dang Bazaar Mobile (Expo)

## Prerequisites
- Node 18+
- npm 9+ (or pnpm/yarn if you prefer)
- Expo CLI (`npm i -g expo` optional; `npx expo` works without global install)

## Install deps
```bash
cd mobile
npm install
```

## Run in development
- Start Metro: `npm start`
- Android: press `a` (device/emulator)
- iOS: press `i` (simulator on macOS)
- Web: press `w`

## Environment
Create `.env` in `mobile/` (or use `app.config.js`) with:
```
EXPO_PUBLIC_BASE44_API=https://api.base44.io
```

## Production build (EAS)
- Install EAS: `npm i -g eas-cli`
- Configure: `eas build:configure`
- Android: `eas build -p android --profile preview`
- iOS: `eas build -p ios --profile preview`

## Notes
- Auth tokens are stored in SecureStore.
- Language toggle supports English/Nepali; add strings in `src/translations.ts`.
- Base API client lives in `src/api/base44Client.ts`; set the public API base URL via env.
