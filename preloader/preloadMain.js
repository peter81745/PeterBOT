const { contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld(
    'mainWindow',
    {
        startBots: (ip, port, alts, proxy, version, macro, onlinemode, count, delay) => ipcRenderer.invoke('startBots', ip, port, alts, proxy, version, macro, onlinemode, count, delay),
        stopBots: () => ipcRenderer.invoke('stopBots'),
        openBM: () => ipcRenderer.invoke('openBM'),
        receive: (channel, func) => {
            let validChannels = ["botsConnected"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender`
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
)