const { app, BrowserWindow } = require('electron');

let win;

app.whenReady().then(() => {
  const { screen } = require('electron');
  const { width: screenW } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: 520,
    height: 700,
    x: screenW - 540,
    y: 20,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const profileArg = process.argv.find(a => a.startsWith('--profile='));
  const profile = profileArg ? profileArg.split('=')[1] : '';
  win.loadFile('index.html', { hash: profile });
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setAlwaysOnTop(true, 'floating', 1);
});

app.on('window-all-closed', () => app.quit());
