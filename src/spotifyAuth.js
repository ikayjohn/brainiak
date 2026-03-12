const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SESSION_KEY = 'spotify_session';
const CODE_VERIFIER_KEY = 'spotify_code_verifier';
const DEFAULT_SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
];

function getRedirectUri() {
  return import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/`;
}

function getClientId() {
  return import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'ba98e7ee5bcf4b0eb5448b06e9fd741f';
}

function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(values, (value) => charset[value % charset.length]).join('');
}

async function sha256(plain) {
  const data = new TextEncoder().encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

function base64UrlEncode(input) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function createCodeChallenge(verifier) {
  const digest = await sha256(verifier);
  return base64UrlEncode(digest);
}

function loadSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(CODE_VERIFIER_KEY);
}

async function requestToken(params) {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: getClientId(),
      ...params,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || data.error || 'Spotify token request failed');
  }

  const currentSession = loadSession();
  const nextSession = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || currentSession?.refreshToken || null,
    expiresAt: Date.now() + (data.expires_in * 1000),
    scope: data.scope || currentSession?.scope || DEFAULT_SCOPES.join(' '),
    tokenType: data.token_type || 'Bearer',
  };

  saveSession(nextSession);
  return nextSession;
}

export function getSpotifySession() {
  return loadSession();
}

export function isSpotifyConfigured() {
  return Boolean(getClientId());
}

export async function beginSpotifyLogin() {
  const verifier = generateRandomString(64);
  const challenge = await createCodeChallenge(verifier);

  localStorage.setItem(CODE_VERIFIER_KEY, verifier);

  const authUrl = new URL(SPOTIFY_AUTHORIZE_URL);
  authUrl.searchParams.set('client_id', getClientId());
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', getRedirectUri());
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('scope', DEFAULT_SCOPES.join(' '));

  window.location.assign(authUrl.toString());
}

export async function handleSpotifyRedirect() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    clearSession();
    url.searchParams.delete('error');
    window.history.replaceState({}, document.title, url.pathname);
    throw new Error(`Spotify authorization failed: ${error}`);
  }

  if (!code) {
    return loadSession();
  }

  const verifier = localStorage.getItem(CODE_VERIFIER_KEY);
  if (!verifier) {
    throw new Error('Missing Spotify PKCE verifier. Start sign-in again.');
  }

  const session = await requestToken({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    code_verifier: verifier,
  });

  localStorage.removeItem(CODE_VERIFIER_KEY);
  window.history.replaceState({}, document.title, url.pathname);
  return session;
}

export async function getValidSpotifyAccessToken() {
  const session = loadSession();
  if (!session?.accessToken) {
    return null;
  }

  if (session.expiresAt > Date.now() + 60_000) {
    return session.accessToken;
  }

  if (!session.refreshToken) {
    clearSession();
    return null;
  }

  const refreshed = await requestToken({
    grant_type: 'refresh_token',
    refresh_token: session.refreshToken,
  });

  return refreshed.accessToken;
}

export function disconnectSpotify() {
  clearSession();
}
