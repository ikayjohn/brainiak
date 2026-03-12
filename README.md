# Brainiak Web Panel

React + Vite control panel for Brainiak's Firebase-backed multi-device Spotify control flow.

## Environment

Create `web-panel/.env` with:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/
```

Add the same redirect URI to your Spotify app configuration.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Runtime Model

- Reads device state from Firebase Realtime Database at `devices/`
- Pushes commands to `devices/{deviceId}/commands`
- Uses Spotify Authorization Code with PKCE for web-side search
- Sends selected track URIs to Android devices through Firebase
