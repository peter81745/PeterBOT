'use strict'

// Imports
const mineflayer = require('mineflayer');
const navigatePlugin = require('mineflayer-navigate-promise')(mineflayer);
const vec3 = require('vec3');
var socks  = require("socks").SocksClient;
const fs = require('fs');
const Sleep = require('./sleep.js');
const MacroEngine = require('./macro.js');
const ProxyAgent = require('proxy-agent');


class Bot {

    constructor(name, password, version, auth, ip, port, proxy, macro, authserver) {
        this.name = name;
		this.password = password;
		this.version = version;
		this.auth = auth;
		this.ip = ip;
		this.port = port;
		this.proxy = proxy;
		this.macro = macro;
        this.authserver = authserver;
        this.log = "";
        this.log += "Bot[" + this.name + "] ready\n";
        this.mineflayer_instance = undefined;
    }
    
    async connect() {
        // log
        this.log += "Bot[" + this.name + "] trying to connect to "+this.ip+":"+this.port+"\n";

        let connectVar = undefined
        if (this.proxy != false) {
            let proxybot = this;
            let proxyOptions = {
                proxy: {
                    host: proxybot.proxy.getHost(),
                    port: proxybot.proxy.getPort(),
                    type: proxybot.proxy.getType()
                },
                command: 'connect',
                timeout: 5000,
                destination: {
                    host: proxybot.ip,
                    port: parseInt(proxybot.port)
                }
            }
            connectVar = async client => {
                await socks.createConnection(proxyOptions, (err, info) => {
                  if (err) {
                    proxybot.log += "Bot["+proxybot.name+"] Proxy error => " + err + "\n";
                    return
                  }
            
                  client.setSocket(info.socket)
                  client.emit('connect')
                })
            }
        }

        let agentVar = undefined;
        if (this.proxy != false) {
            agentVar = new ProxyAgent({ protocol: 'socks'+this.proxy.getType()+':', host: this.proxy.getHost(), port: this.proxy.getPort() });
        }

        let bot = this;

        // Create mineflayer instance and connect to server
        try {
            this.mineflayer_instance = mineflayer.createBot({
                connect: connectVar,
                host: this.ip,
                username: this.name,
                password: this.password,
                port: this.port,     
                version: this.version,
                agent: agentVar,
                auth: this.auth,
                authServer: this.authserver
            });
        } catch (e) {
            bot.log += "Bot[" + bot.name + "] just had an massive Error, which ain't good :(  | Error: "+e+"\n";
        } finally {


        // some event handling
        this.mineflayer_instance.on('error', function (err) {
            bot.log += "Bot[" + bot.name + "] an Error occured, " + err + "\n";
        });
        this.mineflayer_instance.on('login', function () {
            bot.log += "Bot[" + bot.name + "] loggin in...\n";
        });
        this.mineflayer_instance.once('spawn', function () {
            bot.log += "Bot[" + bot.name + "] successfully connected!\n";
            if (bot.macro !== false) {
                navigatePlugin(bot.mineflayer_instance);
                new MacroEngine(bot);
            }
        });
        this.mineflayer_instance.on('disconnect', function () {
            bot.log += "Bot[" + bot.name + "] disconnected from Server!\n";
        });
        this.mineflayer_instance.on('kicked', function (msg) {
            bot.log += "Bot[" + bot.name + "] kicked from Server! Kick Message: " + msg + "\n";
        });
        this.mineflayer_instance.on('death', function () {
            bot.log += "Bot[" + bot.name + "] died.\n";
        });
        this.mineflayer_instance.on('end', function () {
            bot.log += "Bot[" + bot.name + "] connection closed.\n";
        });
    }
    }

    disconnect() {
        this.mineflayer_instance.quit();
        this.mineflayer_instance.end();
        this.log += "Bot[" + this.name + "] disconnected from Server!\n";
    }

    getName() {
        return this.name;
    }

    addLog(message) {
        this.log += message + "\n";
    }

    printLog() {
        console.log(this.log);
    }

    getLog() {
        return this.log;
    }

    getPing() {
        return this.mineflayer_instance.player["ping"]+"ms";
    }

    getFoodLevel() {
        return this.mineflayer_instance.food;
    }

    getHealth() {
        return this.mineflayer_instance.health;
    }
}

module.exports = Bot;