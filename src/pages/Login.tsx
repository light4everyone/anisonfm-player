import React, { useCallback, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { AuthCallback } from '../models/auth-callback.model';
import { useAuth } from '../lib/auth';

export const Login = () => {
  const auth = useAuth();

  const login = () => {
    auth.login();
  };

  const callbackHandler = useCallback((event: Electron.IpcRendererEvent, message: AuthCallback) => {
    auth.handleCallback(message.response);
  }, [auth.handleCallback]);

  useEffect(() => {
    ipcRenderer.on('auth-callback', callbackHandler);
  
    return () => {
      ipcRenderer.removeListener('auth-callback', callbackHandler);
    };
  }, [callbackHandler]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      auth.getAccessToken().then((token) => {
        console.log(token);
        if (token === '') {
          auth.logout();
        }
      });
    }
  }, [auth.isAuthenticated, auth.getAccessToken, auth.logout]);

  return (
    <div>
      <p>{`${auth.isAuthenticated}`}</p>
      <button onClick={login}>Login</button>
    </div>
  )
}
