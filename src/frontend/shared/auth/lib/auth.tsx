import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

const clientId = '';
const clientSecret = '';
const authorizeUrl = 'https://shikimori.one/oauth/authorize';
const tokenUrl = 'https://shikimori.one/oauth/token';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string
}

export const AuthContext = createContext<{
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  getAccessToken: () => Promise<string>;
  handleCallback: (url: string) => Promise<void>;
} | undefined>(undefined);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [refreshToken, setRefreshToken] = useState<string | undefined>(undefined);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    ipcRenderer.send('get-reshesh-token');

    ipcRenderer.once('get-reshesh-token-reply', (event, token: string) => {
      if (token && token.length > 0) {
        setRefreshToken(token);
        setIsAuthenticated(true);
      }
      setIsLoaded(true);
    });

    return () => {
      ipcRenderer.removeAllListeners('get-reshesh-token-reply');
    };
  }, []);

  const login = useCallback(() => {
    const completedAuthorizeUrl = authorizeUrl
      + `?response_type=code`
      + `&client_id=${clientId}`
      + `&state=YOUR_STATE`
      + `&redirect_uri=anisonfm://redirect`;

    window.open(completedAuthorizeUrl, 'Login');
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    ipcRenderer.send('save-reshesh-token', '');
  }, []);

  const getAccessToken = useCallback(async () => {
    if (accessToken) {
      return accessToken;
    } else {
      try {
        const formData = new FormData();
        formData.append('client_id', clientId);
        formData.append('grant_type', 'refresh_token');
        formData.append('refresh_token', refreshToken);
        formData.append('client_secret', clientSecret);

        const response = await fetch(tokenUrl, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const model = await response.json() as TokenResponse;

        setAccessToken(model.access_token);
        setRefreshToken(model.refresh_token);

        ipcRenderer.send('save-reshesh-token', model.refresh_token);

        return model.access_token;
      } catch (error) {
        console.error(error);

        return '';
      }
    }
  }, [refreshToken]);

  const handleCallback = useCallback(async (url: string) => {
    try {
      const path = url.split('://')[1];
      if (path?.startsWith('redirect')) {
        const parameters = path.split('redirect/?')[1]?.split('&').reduce<Record<string, string>>((acc, current) => {
          const [key, value] = current.split('=');

          acc[key] = value;

          return acc;
        }, {});

        const formData = new FormData();
        formData.append('client_id', clientId);
        formData.append('grant_type', 'authorization_code');
        formData.append('code', parameters['code']);
        formData.append('redirect_uri', 'anisonfm://redirect');
        formData.append('client_secret', clientSecret);

        const response = await fetch(tokenUrl, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const model = await response.json() as TokenResponse;

        setAccessToken(model.access_token);
        setRefreshToken(model.refresh_token);

        ipcRenderer.send('save-reshesh-token', model.refresh_token);

        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error(error);
    }

  }, []);

  return (
    <AuthContext.Provider value={
      {
        isAuthenticated,
        login,
        logout,
        getAccessToken,
        handleCallback
      }}
    >
      { isLoaded && children }
    </AuthContext.Provider>
  )
}
