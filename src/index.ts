import { app, BrowserWindow, Tray, screen, shell, dialog, webContents, ipcMain, Menu, session } from 'electron';
import { AuthCallback } from './models/auth-callback.model';
import { deletePassword, getPassword, setPassword } from 'keytar';
import path from 'path';

declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

const gotTheLock = app.requestSingleInstanceLock();


let mainWindow: BrowserWindow = null;
let appIcon: Tray;

const createTray = (): void => {
  const nativeImage = require('electron').nativeImage;
  const iconPath = path.join(__dirname, '../icons/tray.ico');
  const image = nativeImage.createFromPath(iconPath);

  appIcon = new Tray(image);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'AnisonFm',
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit AnisonFm',
      role: 'quit'
    }
  ]);

  appIcon.on('double-click', (e) => {
    if (mainWindow.isMinimized()) {
      mainWindow.show();
    } else {
      mainWindow.minimize();
    }
  });

  appIcon.setContextMenu(contextMenu);
}

const createWindow = (): void => {
  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       ...details.responseHeaders,
  //       'Content-Security-Policy': ['default-src \'none\'']
  //     }
  //   })
  // });

  // Create the browser window.
  const display = screen.getPrimaryDisplay();
  const displayWidth = display.workArea.width;
  const displayWeight = display.workArea.height;

  const width = app.isPackaged ? 230 : 1000;
  const height = app.isPackaged ? 360 : 700;
  const yOffset = app.isPackaged ? 10 : 200;
  const xOffset = app.isPackaged ? 10 : 500;

  mainWindow = new BrowserWindow({
    //height,
    //width,
    x: displayWidth - width - xOffset,
    y: displayWeight - height - yOffset,
    frame: !app.isPackaged,
    alwaysOnTop: app.isPackaged,
    resizable: !app.isPackaged,
    transparent: app.isPackaged,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: app.isPackaged
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()

    shell.openExternal(url);
  });

  const filter = {
    urls: ['https://anison.fm/status.php'],
  };
  
  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders['Referer'] = 'https://anison.fm';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
};

if (gotTheLock) {
  app.on('second-instance', (e, argv) => {
    if (process.platform == 'win32') {
      const deeplinkingUrl = argv.slice(1)[1];
      mainWindow.webContents.send('auth-callback', { response: deeplinkingUrl } as AuthCallback);
    }
  });

  ipcMain.on('get-reshesh-token', async (event) => {
    const refreshToken = await getPassword('anison', 'main');
    event.reply('get-reshesh-token-reply', refreshToken);
  });

  ipcMain.on('save-reshesh-token', async (_, resheshToken: string) => {
    if (resheshToken && resheshToken.length > 0) {
      await setPassword('anison', 'main', resheshToken);
    } else {
      await deletePassword('anison', 'main');
    }
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    createWindow();
    createTray();
  });

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  if (app.isPackaged && !app.isDefaultProtocolClient('anisonfm')) {
    app.setAsDefaultProtocolClient('anisonfm');
  }
  
} else {
  app.quit();
}

