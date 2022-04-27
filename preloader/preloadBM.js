const { contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld(
    'BMWindow',
    {
        refresh: () => ipcRenderer.invoke('refreshBM'),
        receive: (channel, func) => {
            let validChannels = ["BMLog"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender`
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
)