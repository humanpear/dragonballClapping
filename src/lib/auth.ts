const DEFAULT_SCOPE = 'profile email';

interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scope?: string;
}

function validateConfig(providerName: string, config: OAuthConfig) {
  if (!config.clientId || !config.redirectUri) {
    throw new Error(`${providerName} OAuth 설정이 필요합니다.`);
  }
}

export function createKakaoAuthUrl(config: OAuthConfig) {
  validateConfig('카카오', config);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope ?? DEFAULT_SCOPE
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}

export function createGoogleAuthUrl(config: OAuthConfig) {
  validateConfig('구글', config);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope ?? DEFAULT_SCOPE,
    access_type: 'online',
    include_granted_scopes: 'true'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

interface LoginOptions {
  createUrl: () => string;
  fallbackMessage: string;
}

export function redirectToOAuthLogin({ createUrl, fallbackMessage }: LoginOptions) {
  try {
    const url = createUrl();
    window.location.assign(url);
  } catch {
    window.alert(fallbackMessage);
  }
}
