const electron = require('electron')
const {app, BrowserWindow, Menu, ipcMain} = electron
var fs = require('fs')
const path = require('path')
const url = require('url')
const mc = require('minecraft-protocol')
const dialog = electron.dialog;

var FileLoader = require('./fileloader.js');
var Bot = require('./bot.js');
var Sleep = require('./sleep.js');
var Proxy = require('./proxy.js');

function random(max) {
  return Math.floor(Math.random() * max);
}
dialog.showErrorBox = function(title, content) {
    console.log(`${title}\n${content}`);
};

//
let botMap = new Map();
let mainWindow;

// Template for the Menu
menuTemplate = [
  {
    label: 'Info',
    submenu: [
      {
        label: 'About me',
        click: () => {
          openAboutWindow()
        }
      }
    ]
  }
]

function createWindow () {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 650,
    icon: path.join(__dirname, 'assets/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preloader/preloadMain.js")
    }
  })

  // Load the index.html file
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Set up the menu
  var menu = Menu.buildFromTemplate(menuTemplate)
  mainWindow.setMenu(menu)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  //devtools = new BrowserWindow()
  //mainWindow.webContents.setDevToolsWebContents(devtools.webContents)
  //mainWindow.webContents.openDevTools({ mode: 'detach' })
}

ipcMain.handle('startBots', async (e, ip, port, alts, proxy, version, macro, onlinemode, count, delay) => {
  let altArray = new FileLoader(alts).toArray();
  let proxyArray = null;
  if (proxy != false) {
    proxyArray = new FileLoader(proxy).toArray();
  }
  for (let i = 0; i < count; i++) {
    let bName = altArray[i].split(":")[0];
    let bPassword = altArray[i].split(":")[1];
    console.log(bName);
    if (proxy != false) {
      let rndProxy = await random(proxyArray.length);
      proxy = new Proxy(4,proxyArray[rndProxy].split(":")[0],parseInt(proxyArray[rndProxy].split(":")[1]));
    }
    switch (onlinemode) {
      case "cracked":
        botMap.set(bName,new Bot(bName,undefined,version,false,ip,port,proxy,macro,undefined));
        botMap.get(bName).connect();
        break;
      case "mojang":
        botMap.set(bName,new Bot(bName,bPassword,version,"mojang",ip,port,proxy,macro,"https://authserver.mojang.com/"));
        botMap.get(bName).connect();
        break;
      case "microsoft":
        botMap.set(bName,new Bot(bName,bPassword,version,"microsoft",ip,port,proxy,macro,undefined));
        botMap.get(bName).connect();
        break;
      case "thealtening":
        botMap.set(bName,new Bot(bName,"anything",version,"mojang",ip,port,proxy,macro,"http://authserver.thealtening.com"));
        botMap.get(bName).connect();
        break;
      default:
        break;
    }
    await new Sleep(delay);
  }
  /*while (true) {
    botMap.forEach((values,keys) => {
      console.log("Printing log of " + keys);
      values.printLog();
    });
    await new Sleep(2000);
  }*/
  e.sender.send("botsConnected");
});

ipcMain.handle('openBM', async (e) => {
  openBotManager();
});

ipcMain.handle('refreshBM', async (e) => {
  let log = "";
  botMap.forEach((values,keys) => {
    log += "--- Bot[" + keys + "] ---\n";
    log += values.getLog() + "\n\n\n";
  });
  e.sender.send("BMLog", log);
});

ipcMain.handle('stopBots', async (e) => {
  botMap.forEach((values,keys) => {
    values.disconnect();
    //values.printLog();
    values = null;
    values = 0;
    values = undefined;
  });
  botMap.clear();
  botMap = null;
  botMap = new Map();
});

// Opens the about window
function openAboutWindow() {

  let aboutWindow = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    show: false,
    width: 500,
    height: 415,
    icon: path.join(__dirname, 'assets/icon.ico'),
  })
  aboutWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'about.html'),
    protocol: 'file:',
    slashes: true
  }))
  aboutWindow.setMenu(null)
  aboutWindow.once('ready-to-show', () => {
    aboutWindow.show()
  })
}

function openBotManager() {

  let BotManagerWindow = new BrowserWindow({
    parent: mainWindow,
    width: 750,
    height: 580,
    icon: path.join(__dirname, 'assets/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preloader/preloadBM.js")
    }
  })
  BotManagerWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'bm.html'),
    protocol: 'file:',
    slashes: true
  }))
  BotManagerWindow.setMenu(null)
  BotManagerWindow.once('ready-to-show', () => {
    BotManagerWindow.show()
  })
}

// Create the window then the app is ready
app.on('ready', () => {
  createWindow()
  electron.powerMonitor.on('on-ac', () => {
    mainWindow.restore()
  })
  electron.powerMonitor.on('on-battery', () => {
    mainWindow.minimize()
  })
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Reopen the app on macOS
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
