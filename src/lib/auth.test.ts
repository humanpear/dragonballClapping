import { describe, expect, it, vi } from 'vitest';
import { createGoogleAuthUrl, createKakaoAuthUrl, redirectToOAuthLogin } from './auth';

describe('auth url 생성', () => {
  it('카카오 oauth url을 생성한다', () => {
    const url = createKakaoAuthUrl({
      clientId: 'kakao-client-id',
      redirectUri: 'http://localhost:5173/auth/kakao/callback'
    });

    expect(url).toContain('https://kauth.kakao.com/oauth/authorize');
    expect(url).toContain('client_id=kakao-client-id');
    expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fauth%2Fkakao%2Fcallback');
  });

  it('구글 oauth url을 생성한다', () => {
    const url = createGoogleAuthUrl({
      clientId: 'google-client-id',
      redirectUri: 'http://localhost:5173/auth/google/callback'
    });

    expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(url).toContain('client_id=google-client-id');
    expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fauth%2Fgoogle%2Fcallback');
  });
});

describe('redirectToOAuthLogin', () => {
  it('url 생성 성공 시 해당 주소로 이동한다', () => {
    const assign = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { assign }
    });

    redirectToOAuthLogin({
      createUrl: () => 'https://example.com/oauth',
      fallbackMessage: 'not used'
    });

    expect(assign).toHaveBeenCalledWith('https://example.com/oauth');
  });

  it('설정 누락 시 안내 메시지를 보여준다', () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    redirectToOAuthLogin({
      createUrl: () => {
        throw new Error('missing');
      },
      fallbackMessage: 'OAuth 설정이 필요합니다.'
    });

    expect(alert).toHaveBeenCalledWith('OAuth 설정이 필요합니다.');
    alert.mockRestore();
  });
});
