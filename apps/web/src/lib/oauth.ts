import type { AuthProvider } from '@dragonball/shared';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (error: unknown) => void;
          }) => { requestAccessToken: (overrides?: { prompt?: string }) => void };
        };
      };
    };
    Kakao?: {
      isInitialized: () => boolean;
      init: (appKey: string) => void;
      Auth: {
        login: (config: {
          scope?: string;
          success: (response: { access_token: string }) => void;
          fail: (error: unknown) => void;
        }) => void;
      };
    };
  }
}

const GOOGLE_SDK_URL = 'https://accounts.google.com/gsi/client';
const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load SDK script: ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load SDK script: ${src}`));
    document.head.appendChild(script);
  });
}

export async function loginWithGoogle(): Promise<{ provider: AuthProvider; accessToken: string }> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      'VITE_GOOGLE_CLIENT_ID is not configured. Set apps/web/.env (or .env.local) and restart the dev server.'
    );
  }

  await loadScript(GOOGLE_SDK_URL);

  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google OAuth SDK is unavailable.');
  }

  return new Promise((resolve, reject) => {
    const tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid profile email',
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error ?? 'Google login failed.'));
          return;
        }
        resolve({ provider: 'google', accessToken: response.access_token });
      },
      error_callback: (error) => reject(new Error(`Google login popup failed: ${JSON.stringify(error)}`))
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export async function loginWithKakao(): Promise<{ provider: AuthProvider; accessToken: string }> {
  const appKey = import.meta.env.VITE_KAKAO_JS_KEY;
  if (!appKey) {
    throw new Error(
      'VITE_KAKAO_JS_KEY is not configured. Set apps/web/.env (or .env.local) and restart the dev server.'
    );
  }

  await loadScript(KAKAO_SDK_URL);

  if (!window.Kakao?.Auth) {
    throw new Error('Kakao SDK is unavailable.');
  }

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(appKey);
  }

  return new Promise((resolve, reject) => {
    window.Kakao!.Auth.login({
      scope: 'profile_nickname,account_email',
      success: (response) => resolve({ provider: 'kakao', accessToken: response.access_token }),
      fail: (error) => reject(new Error(`Kakao login failed: ${JSON.stringify(error)}`))
    });
  });
}
